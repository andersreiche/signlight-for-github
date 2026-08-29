import {STATUS, deriveStatus, emptyRecord} from "./domain.js";

const MARKER_PREFIX = "<!-- signlight-state:v1:";
const MARKER_PATTERN = /<!-- signlight-state:v1:([A-Za-z0-9_-]+) -->/;

function encode(record) {
  return Buffer.from(JSON.stringify(record), "utf8").toString("base64url");
}

function decode(value) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
}

export function parseStateComment(body) {
  if (typeof body !== "string") {
    return null;
  }
  const match = body.match(MARKER_PATTERN);
  if (!match) {
    return null;
  }
  try {
    const record = decode(match[1]);
    return record?.schemaVersion === 1 ? record : null;
  } catch {
    return null;
  }
}

export function findStateComment(comments) {
  return [...comments]
    .reverse()
    .find((comment) => {
      const login = comment?.user?.login ?? "";
      return login.endsWith("[bot]") && parseStateComment(comment?.body);
    }) ?? null;
}

export function renderStateComment(recordInput, currentHeadSha) {
  const record = recordInput ?? emptyRecord();
  const status = deriveStatus(record, currentHeadSha);
  const shortHead = status.currentHeadSha.slice(0, 7);
  const marker = `${MARKER_PREFIX}${encode(record)} -->`;

  if (status.state === STATUS.SIGNED) {
    return `${marker}\n## Signlight PR sign-off\n\n🟢 **SIGNED**\n\nSigned by @${status.signerLogin} at ${status.signedAt} for HEAD \`${shortHead}\`.\n\nThe signer can revoke with \`/signlight revoke\`.`;
  }

  if (status.state === STATUS.CHANGED) {
    return `${marker}\n## Signlight PR sign-off\n\n🟡 **PR CHANGED**\n\nThe previous sign-off by @${status.signerLogin} applies to \`${status.signedHeadSha.slice(0, 7)}\`, not the current HEAD \`${shortHead}\`.\n\nAn authorized maintainer can sign the current commit with \`/signlight sign\`.`;
  }

  const revoked = status.revokedAt
    ? `\n\nRevoked by @${status.revokedByLogin} at ${status.revokedAt}.`
    : "";
  return `${marker}\n## Signlight PR sign-off\n\n🔴 **UNSIGNED**${revoked}\n\nAn authorized maintainer can sign HEAD \`${shortHead}\` with \`/signlight sign\`.`;
}
