const MAX_HISTORY_ENTRIES = 100;

export const STATUS = Object.freeze({
  UNSIGNED: "unsigned",
  SIGNED: "signed",
  CHANGED: "changed",
});

export const COMMAND = Object.freeze({
  SIGN: "sign",
  REVOKE: "revoke",
});

function requireText(value, message) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(message);
  }
  return value.trim();
}

function isSha(value) {
  return typeof value === "string" && /^[a-f0-9]{40}$/i.test(value);
}

function requireSha(value) {
  if (!isSha(value)) {
    throw new Error("A valid pull request HEAD commit SHA is required.");
  }
  return value.toLowerCase();
}

function appendHistory(record, entry) {
  const history = Array.isArray(record?.history) ? record.history : [];
  return [...history, entry].slice(-MAX_HISTORY_ENTRIES);
}

function hasEvent(record, eventId) {
  return Boolean(record?.history?.some((entry) => entry.id === eventId));
}

export function emptyRecord() {
  return {
    schemaVersion: 1,
    active: false,
    signerLogin: null,
    signedAt: null,
    signedHeadSha: null,
    revokedAt: null,
    revokedByLogin: null,
    history: [],
  };
}

export function parseCommand(body, prefix = "/signlight") {
  if (typeof body !== "string") {
    return null;
  }

  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = body.trim().match(new RegExp(`^${escaped}\\s+(sign|revoke)\\s*$`, "i"));
  return match ? match[1].toLowerCase() : null;
}

export function deriveStatus(record, currentHeadSha) {
  const headSha = requireSha(currentHeadSha);

  if (!record || record.active !== true) {
    return {
      state: STATUS.UNSIGNED,
      currentHeadSha: headSha,
      signerLogin: null,
      signedAt: null,
      signedHeadSha: record?.signedHeadSha ?? null,
      revokedAt: record?.revokedAt ?? null,
      revokedByLogin: record?.revokedByLogin ?? null,
    };
  }

  const signedHeadSha = requireSha(record.signedHeadSha);
  return {
    state: signedHeadSha === headSha ? STATUS.SIGNED : STATUS.CHANGED,
    currentHeadSha: headSha,
    signerLogin: requireText(record.signerLogin, "A signer login is required."),
    signedAt: requireText(record.signedAt, "A signature timestamp is required."),
    signedHeadSha,
    revokedAt: null,
    revokedByLogin: null,
  };
}

export function applySignature(record, {actor, headSha, at, eventId}) {
  const signerLogin = requireText(actor, "An authenticated GitHub user is required.");
  const signedHeadSha = requireSha(headSha);
  const signedAt = requireText(at, "A signature timestamp is required.");
  const id = requireText(eventId, "A signature event ID is required.");
  const current = record ?? emptyRecord();

  if (hasEvent(current, id)) {
    return current;
  }

  if (current.active === true && current.signedHeadSha === signedHeadSha) {
    return current;
  }

  return {
    schemaVersion: 1,
    active: true,
    signerLogin,
    signedAt,
    signedHeadSha,
    revokedAt: null,
    revokedByLogin: null,
    history: appendHistory(current, {
      id,
      action: COMMAND.SIGN,
      actor: signerLogin,
      at: signedAt,
      headSha: signedHeadSha,
    }),
  };
}

export function applyRevocation(record, {actor, at, eventId}) {
  const actorLogin = requireText(actor, "An authenticated GitHub user is required.");
  const revokedAt = requireText(at, "A revocation timestamp is required.");
  const id = requireText(eventId, "A revocation event ID is required.");

  if (hasEvent(record, id)) {
    return record;
  }

  if (!record || record.active !== true) {
    throw new Error("There is no active sign-off to revoke.");
  }

  if (record.signerLogin.toLowerCase() !== actorLogin.toLowerCase()) {
    throw new Error("Only the signer can revoke this sign-off.");
  }

  return {
    ...record,
    active: false,
    revokedAt,
    revokedByLogin: actorLogin,
    history: appendHistory(record, {
      id,
      action: COMMAND.REVOKE,
      actor: actorLogin,
      at: revokedAt,
      headSha: requireSha(record.signedHeadSha),
    }),
  };
}

const PERMISSION_RANK = Object.freeze({
  none: 0,
  read: 1,
  pull: 1,
  triage: 2,
  write: 3,
  push: 3,
  maintain: 4,
  admin: 5,
});

export function canSign({actor, allowedSigners = [], permission, minimumPermission = "write"}) {
  const login = requireText(actor, "An authenticated GitHub user is required.").toLowerCase();
  const allowlist = allowedSigners.map((value) => value.trim().toLowerCase()).filter(Boolean);

  if (allowlist.length > 0) {
    return allowlist.includes(login);
  }

  const actualRank = PERMISSION_RANK[String(permission).toLowerCase()] ?? 0;
  const requiredRank = PERMISSION_RANK[String(minimumPermission).toLowerCase()];
  if (requiredRank === undefined) {
    throw new Error("minimum-permission must be read, triage, write, maintain, or admin.");
  }
  return actualRank >= requiredRank;
}
