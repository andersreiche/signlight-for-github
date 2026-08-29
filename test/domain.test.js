import assert from "node:assert/strict";
import test from "node:test";
import {
  STATUS,
  applyRevocation,
  applySignature,
  canSign,
  deriveStatus,
  emptyRecord,
  parseCommand,
} from "../src/domain.js";

const HEAD_A = "a".repeat(40);
const HEAD_B = "b".repeat(40);

test("parses only exact signlight commands", () => {
  assert.equal(parseCommand("/signlight sign"), "sign");
  assert.equal(parseCommand("  /signlight REVOKE  "), "revoke");
  assert.equal(parseCommand("please /signlight sign"), null);
  assert.equal(parseCommand("/approve sign"), null);
});

test("unsigned, signed, changed, and revoked transitions are deterministic", () => {
  const initial = emptyRecord();
  assert.equal(deriveStatus(initial, HEAD_A).state, STATUS.UNSIGNED);

  const signed = applySignature(initial, {
    actor: "owner",
    headSha: HEAD_A,
    at: "2026-08-29T12:00:00.000Z",
    eventId: "comment:1",
  });
  assert.equal(deriveStatus(signed, HEAD_A).state, STATUS.SIGNED);
  assert.equal(deriveStatus(signed, HEAD_B).state, STATUS.CHANGED);

  const revoked = applyRevocation(signed, {
    actor: "OWNER",
    at: "2026-08-29T13:00:00.000Z",
    eventId: "comment:2",
  });
  assert.equal(deriveStatus(revoked, HEAD_A).state, STATUS.UNSIGNED);
  assert.equal(revoked.revokedByLogin, "OWNER");
});

test("only the signer can revoke", () => {
  const signed = applySignature(null, {
    actor: "owner",
    headSha: HEAD_A,
    at: "2026-08-29T12:00:00.000Z",
    eventId: "comment:1",
  });
  assert.throws(() => applyRevocation(signed, {
    actor: "other",
    at: "2026-08-29T13:00:00.000Z",
    eventId: "comment:2",
  }), /Only the signer/);
});

test("replayed events are idempotent and history is bounded", () => {
  let record = applySignature(null, {
    actor: "owner",
    headSha: HEAD_A,
    at: "2026-08-29T12:00:00.000Z",
    eventId: "sign:0",
  });
  assert.equal(applySignature(record, {
    actor: "owner",
    headSha: HEAD_A,
    at: "later",
    eventId: "sign:0",
  }), record);

  for (let index = 0; index < 60; index += 1) {
    record = applyRevocation(record, {actor: "owner", at: `revoke-${index}`, eventId: `revoke:${index}`});
    record = applySignature(record, {actor: "owner", headSha: index % 2 ? HEAD_A : HEAD_B, at: `sign-${index}`, eventId: `sign:${index + 1}`});
  }
  assert.equal(record.history.length, 100);
});

test("authorization uses an allowlist when present, otherwise permission rank", () => {
  assert.equal(canSign({actor: "Alice", allowedSigners: ["alice"], permission: "read"}), true);
  assert.equal(canSign({actor: "Bob", allowedSigners: ["alice"], permission: "admin"}), false);
  assert.equal(canSign({actor: "Bob", permission: "write", minimumPermission: "write"}), true);
  assert.equal(canSign({actor: "Bob", permission: "triage", minimumPermission: "write"}), false);
});
