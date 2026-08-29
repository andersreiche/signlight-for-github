# Release and submission record

Version: 0.1.0 candidate
Date: 2026-08-29

## Verification

- [x] Domain state and invalid input tests pass
- [x] Signer-only revoke and authorization tests pass
- [x] Replay/idempotency and bounded history tests pass
- [x] Open → sign → changed and unauthorized revoke event fixtures pass
- [x] ncc Marketplace bundle builds
- [x] npm audit reports no known vulnerabilities
- [ ] Private GitHub repository pushed
- [ ] Real PR installed flow verified

## Submission

- Linear launch parent: REW-536
- Build issue: REW-548
- Publication issue: REW-549
- Organization action: REW-550
- Review status: local production candidate
- Current blocker: public Marketplace Action must use a public Reware-owned repo;
  no `reware-apps` organization is currently visible to the authenticated account.
- Next action: push private candidate, verify a private PR flow, then resolve the
  public organization/agreement gate.

## Credential cleanup

- No new persistent credential created.
- Runtime uses caller-provided ephemeral `GITHUB_TOKEN` only.
- Repository secret scan required before public transfer.
