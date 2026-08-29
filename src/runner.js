import {
  COMMAND,
  STATUS,
  applyRevocation,
  applySignature,
  canSign,
  deriveStatus,
  emptyRecord,
  parseCommand,
} from "./domain.js";
import {findStateComment, parseStateComment, renderStateComment} from "./state-comment.js";

function statusPresentation(status) {
  if (status.state === STATUS.SIGNED) {
    return {state: "success", description: `SIGNED by @${status.signerLogin}`};
  }
  if (status.state === STATUS.CHANGED) {
    return {state: "pending", description: "PR CHANGED — current HEAD needs sign-off"};
  }
  return {state: "failure", description: status.revokedAt ? "UNSIGNED — sign-off was revoked" : "UNSIGNED — sign-off required"};
}

async function listComments(octokit, owner, repo, issueNumber) {
  const params = {owner, repo, issue_number: issueNumber, per_page: 100};
  if (typeof octokit.paginate === "function") {
    return octokit.paginate(octokit.rest.issues.listComments, params);
  }
  const response = await octokit.rest.issues.listComments(params);
  return response.data;
}

async function loadRecord(octokit, owner, repo, issueNumber) {
  const comments = await listComments(octokit, owner, repo, issueNumber);
  const comment = findStateComment(comments);
  return {
    comment,
    record: comment ? parseStateComment(comment.body) : emptyRecord(),
  };
}

async function saveRecord(octokit, {owner, repo, issueNumber, comment, record, headSha}) {
  const body = renderStateComment(record, headSha);
  if (comment) {
    return octokit.rest.issues.updateComment({owner, repo, comment_id: comment.id, body});
  }
  return octokit.rest.issues.createComment({owner, repo, issue_number: issueNumber, body});
}

async function setStatus(octokit, {owner, repo, headSha, statusContext, targetUrl, status}) {
  const presentation = statusPresentation(status);
  return octokit.rest.repos.createCommitStatus({
    owner,
    repo,
    sha: headSha,
    context: statusContext,
    target_url: targetUrl,
    ...presentation,
  });
}

function repoCoordinates(payload) {
  const owner = payload.repository?.owner?.login;
  const repo = payload.repository?.name;
  if (!owner || !repo) {
    throw new Error("Signlight requires a repository event payload.");
  }
  return {owner, repo};
}

export async function runEvent({eventName, payload, octokit, inputs, now = () => new Date().toISOString(), logger = console}) {
  const {owner, repo} = repoCoordinates(payload);
  const statusContext = inputs.statusContext || "Signlight / PR sign-off";

  if (eventName === "issue_comment") {
    if (payload.action !== "created" || !payload.issue?.pull_request) {
      return {handled: false, reason: "Not a new pull request comment."};
    }

    const command = parseCommand(payload.comment?.body, inputs.commandPrefix || "/signlight");
    if (!command) {
      return {handled: false, reason: "Not a Signlight command."};
    }

    const issueNumber = payload.issue.number;
    const actor = payload.sender?.login ?? payload.comment?.user?.login;
    const pullResponse = await octokit.rest.pulls.get({owner, repo, pull_number: issueNumber});
    const pull = pullResponse.data;
    const headSha = pull.head.sha;
    const state = await loadRecord(octokit, owner, repo, issueNumber);
    let record = state.record;

    if (command === COMMAND.SIGN) {
      const allowedSigners = String(inputs.allowedSigners ?? "").split(",");
      const hasAllowlist = allowedSigners.some((value) => value.trim().length > 0);
      const permission = hasAllowlist
        ? "none"
        : (await octokit.rest.repos.getCollaboratorPermissionLevel({owner, repo, username: actor})).data.permission;
      if (!canSign({actor, allowedSigners, permission, minimumPermission: inputs.minimumPermission || "write"})) {
        throw new Error(`@${actor} is not authorized to sign this pull request.`);
      }
      record = applySignature(record, {
        actor,
        headSha,
        at: now(),
        eventId: `issue-comment:${payload.comment.id}`,
      });
    } else {
      record = applyRevocation(record, {
        actor,
        at: now(),
        eventId: `issue-comment:${payload.comment.id}`,
      });
    }

    const status = deriveStatus(record, headSha);
    await saveRecord(octokit, {owner, repo, issueNumber, comment: state.comment, record, headSha});
    await setStatus(octokit, {owner, repo, headSha, statusContext, targetUrl: pull.html_url, status});
    logger.info?.(`Signlight handled ${command} for ${owner}/${repo}#${issueNumber}.`);
    return {handled: true, command, status};
  }

  if (eventName === "pull_request_target" || eventName === "pull_request") {
    if (!new Set(["opened", "reopened", "synchronize"]).has(payload.action)) {
      return {handled: false, reason: "Pull request action does not change Signlight state."};
    }

    const pull = payload.pull_request;
    const issueNumber = pull.number;
    const headSha = pull.head.sha;
    const state = await loadRecord(octokit, owner, repo, issueNumber);
    const status = deriveStatus(state.record, headSha);
    await saveRecord(octokit, {owner, repo, issueNumber, comment: state.comment, record: state.record, headSha});
    await setStatus(octokit, {owner, repo, headSha, statusContext, targetUrl: pull.html_url, status});
    return {handled: true, command: null, status};
  }

  return {handled: false, reason: `Unsupported event: ${eventName}`};
}
