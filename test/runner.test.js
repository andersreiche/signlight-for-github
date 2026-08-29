import assert from "node:assert/strict";
import test from "node:test";
import {runEvent} from "../src/runner.js";

const HEAD_A = "a".repeat(40);
const HEAD_B = "b".repeat(40);

function harness() {
  const comments = [];
  const statuses = [];
  let permissionChecks = 0;
  const octokit = {
    paginate: async (method, params) => (await method(params)).data,
    rest: {
      pulls: {
        get: async ({pull_number}) => ({data: {number: pull_number, head: {sha: HEAD_A}, html_url: `https://github.com/reware/demo/pull/${pull_number}`}}),
      },
      repos: {
        getCollaboratorPermissionLevel: async () => {
          permissionChecks += 1;
          return {data: {permission: "write"}};
        },
        createCommitStatus: async (value) => { statuses.push(value); return {data: value}; },
      },
      issues: {
        listComments: async () => ({data: comments}),
        createComment: async ({body}) => {
          const comment = {id: comments.length + 1, body, user: {login: "github-actions[bot]"}};
          comments.push(comment);
          return {data: comment};
        },
        updateComment: async ({comment_id, body}) => {
          const comment = comments.find((item) => item.id === comment_id);
          comment.body = body;
          return {data: comment};
        },
      },
    },
  };
  return {octokit, comments, statuses, get permissionChecks() { return permissionChecks; }};
}

function basePayload() {
  return {repository: {name: "demo", owner: {login: "reware"}}};
}

test("opened PR starts red and a writer can sign it green", async () => {
  const h = harness();
  await runEvent({
    eventName: "pull_request_target",
    payload: {...basePayload(), action: "opened", pull_request: {number: 7, head: {sha: HEAD_A}, html_url: "https://github.com/reware/demo/pull/7"}},
    octokit: h.octokit,
    inputs: {},
  });
  assert.equal(h.statuses.at(-1).state, "failure");

  const signed = await runEvent({
    eventName: "issue_comment",
    payload: {...basePayload(), action: "created", issue: {number: 7, pull_request: {}}, comment: {id: 44, body: "/signlight sign", user: {login: "reviewer"}}, sender: {login: "reviewer"}},
    octokit: h.octokit,
    inputs: {},
    now: () => "2026-08-29T12:00:00.000Z",
  });
  assert.equal(signed.status.state, "signed");
  assert.equal(h.statuses.at(-1).state, "success");
  assert.match(h.comments[0].body, /Signed by @reviewer/);
});

test("a new HEAD turns a previous sign-off yellow", async () => {
  const h = harness();
  await runEvent({
    eventName: "issue_comment",
    payload: {...basePayload(), action: "created", issue: {number: 7, pull_request: {}}, comment: {id: 44, body: "/signlight sign", user: {login: "reviewer"}}, sender: {login: "reviewer"}},
    octokit: h.octokit,
    inputs: {},
  });
  const changed = await runEvent({
    eventName: "pull_request_target",
    payload: {...basePayload(), action: "synchronize", pull_request: {number: 7, head: {sha: HEAD_B}, html_url: "https://github.com/reware/demo/pull/7"}},
    octokit: h.octokit,
    inputs: {},
  });
  assert.equal(changed.status.state, "changed");
  assert.equal(h.statuses.at(-1).state, "pending");
  assert.match(h.comments[0].body, /PR CHANGED/);
});

test("a different user cannot revoke", async () => {
  const h = harness();
  await runEvent({
    eventName: "issue_comment",
    payload: {...basePayload(), action: "created", issue: {number: 7, pull_request: {}}, comment: {id: 44, body: "/signlight sign", user: {login: "reviewer"}}, sender: {login: "reviewer"}},
    octokit: h.octokit,
    inputs: {},
  });
  await assert.rejects(() => runEvent({
    eventName: "issue_comment",
    payload: {...basePayload(), action: "created", issue: {number: 7, pull_request: {}}, comment: {id: 45, body: "/signlight revoke", user: {login: "other"}}, sender: {login: "other"}},
    octokit: h.octokit,
    inputs: {},
  }), /Only the signer/);
});

test("an explicit allowlist can authorize an external signer without a collaborator lookup", async () => {
  const h = harness();
  const result = await runEvent({
    eventName: "issue_comment",
    payload: {...basePayload(), action: "created", issue: {number: 7, pull_request: {}}, comment: {id: 44, body: "/signlight sign", user: {login: "business-owner"}}, sender: {login: "business-owner"}},
    octokit: h.octokit,
    inputs: {allowedSigners: "business-owner"},
  });
  assert.equal(result.status.state, "signed");
  assert.equal(h.permissionChecks, 0);
});
