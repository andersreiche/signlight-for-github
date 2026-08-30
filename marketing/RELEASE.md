# Release and submission record

Version: 0.1.0 candidate
Date: 2026-08-30

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
- Build evidence: consolidated into REW-549; former REW-548 pruned
- Publication issue: REW-549
- Obsolete organization action: REW-550 deleted after official-source review
- Former private Actions account action: REW-556 pruned as superseded
- Review status: private production candidate at commit `07514f1`
- Current blockers: a Marketplace Action must use a public repository and the
  repository owner must accept the Marketplace Developer Agreement before the
  release checkbox is enabled. GitHub's current Action rules do not require an
  organization, so the existing personal repository is the simpler free path.
  Private PR #1 was dispatched, but GitHub refused to start the runner before any
  step because of an account payment/private-minutes/spending-limit annotation.
  That route is no longer a launch gate because the Marketplace release must be
  public; the redundant billing issue was pruned.
- Next action: secret-scan and make only this release repository public, rerun
  the real PR flow (public Actions removes the private-minutes dependency), then
  obtain action-time approval for the Marketplace Developer Agreement and
  publish release `v1.0.0`.

## Credential cleanup

- No new persistent credential created.
- Runtime uses caller-provided ephemeral `GITHUB_TOKEN` only.
- Repository secret scan required before public transfer.
