import assert from "node:assert/strict";
import test from "node:test";
import {applySignature, emptyRecord} from "../src/domain.js";
import {findStateComment, parseStateComment, renderStateComment} from "../src/state-comment.js";

const HEAD_A = "a".repeat(40);
const HEAD_B = "b".repeat(40);

test("state comment round-trips without exposing raw JSON", () => {
  const record = applySignature(emptyRecord(), {
    actor: "reviewer",
    headSha: HEAD_A,
    at: "2026-08-29T12:00:00.000Z",
    eventId: "comment:1",
  });
  const body = renderStateComment(record, HEAD_A);
  assert.deepEqual(parseStateComment(body), record);
  assert.match(body, /🟢 \*\*SIGNED\*\*/);
  assert.doesNotMatch(body, /"schemaVersion"/);
  assert.match(renderStateComment(record, HEAD_B), /🟡 \*\*PR CHANGED\*\*/);
});

test("only bot-authored state comments are trusted", () => {
  const body = renderStateComment(emptyRecord(), HEAD_A);
  assert.equal(findStateComment([{id: 1, body, user: {login: "attacker"}}]), null);
  assert.equal(findStateComment([{id: 2, body, user: {login: "github-actions[bot]"}}]).id, 2);
});
