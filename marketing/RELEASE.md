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
- [x] Private GitHub repository pushed
- [ ] Real PR installed flow verified

## Submission

- Linear launch parent: REW-536
- Build issue: REW-548
- Publication issue: REW-549
- Organization action: REW-550
- Actions account action: REW-556
- Review status: private production candidate at commit `07514f1`
- Current blockers: public Marketplace Action must use a public Reware-owned repo;
  no `reware-apps` organization is currently visible to the authenticated account.
  Private PR #1 was dispatched, but GitHub refused to start the runner before any
  step because of an account payment/private-minutes/spending-limit annotation.
- Next action: resolve REW-550/REW-556, rerun PR #1 through red → green → yellow →
  red, then transfer, release and complete the Marketplace agreement gate.

## Credential cleanup

- No new persistent credential created.
- Runtime uses caller-provided ephemeral `GITHUB_TOKEN` only.
- Repository secret scan required before public transfer.
