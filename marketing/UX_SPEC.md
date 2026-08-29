# Native product UX specification

Date: 2026-08-29
Platform: GitHub pull request checks and issue comments

## User job and surface

- Job: see in seconds whether the current PR HEAD has explicit sign-off.
- Primary surface: `Signlight / PR sign-off` commit status.
- Primary action: exact PR comment `/signlight sign`.
- Progressive details: signer, UTC timestamp, signed SHA, current SHA, revoke
  command, and bounded history encoded in the single state comment.

## State matrix

| State | Commit status | Comment | Primary action |
| --- | --- | --- | --- |
| Unsigned | 🔴 failure | `UNSIGNED` and current short SHA | `/signlight sign` |
| Signed | 🟢 success | signer, timestamp, signed short SHA | signer may revoke |
| Changed | 🟡 pending | previous and current short SHA | authorized signer re-signs |
| Revoked | 🔴 failure | revoker and timestamp | authorized signer signs again |
| Unauthorized | Action failure | no state mutation | ask configured signer/maintainer |
| API error | Action failure | previous record remains | rerun after GitHub recovers |

## Review

- [x] State includes text and does not rely only on color
- [x] Compact status; details live in one comment
- [x] Exact commands avoid accidental activation
- [x] Replay is idempotent and other users cannot revoke
- [x] No PR code checkout in privileged workflow
- [ ] Real English PR screenshots captured without personal data or cursor
- [ ] Light/dark and narrow viewport visually checked in installed E2E
