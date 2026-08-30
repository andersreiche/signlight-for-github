# Release and submission record

Version: 1.0.0
Date: 2026-08-30

## Verification

- [x] Domain state and invalid input tests pass
- [x] Signer-only revoke and authorization tests pass
- [x] Replay/idempotency and bounded history tests pass
- [x] Open → sign → changed and unauthorized revoke event fixtures pass
- [x] ncc Marketplace bundle builds
- [x] npm audit reports no known vulnerabilities
- [x] Private GitHub repository pushed
- [x] Full Git history scanned by gitleaks 8.30.1 with no findings
- [x] Repository changed to public after the clean history scan
- [x] Real PR #2 verified red unsigned → green signed → yellow changed →
  green re-signed → red signer-revoked

## Submission

- Linear launch parent: REW-536
- Build evidence: consolidated into REW-549; former REW-548 pruned
- Publication issue: REW-549
- Obsolete organization action: REW-550 deleted after official-source review
- Former private Actions account action: REW-556 pruned as superseded
- Review status: public production release and stable tags published; Marketplace
  attachment awaits GitHub sudo re-authentication
- Marketplace Developer Agreement v2.4 accepted on 2026-08-30 under the user's
  explicit approval. GitHub's current Action rules do not require an
  organization, so the existing personal repository remains the simpler free
  path.
- Release `v1.0.0` and the stable `v1` tag both point to verified commit
  `8035802b47aaa946c032547f7de189191a2c7c83`.
- Current blocker: checking “Publish this Action to the GitHub Marketplace” and
  saving the release triggers GitHub sudo mode. Completion requires the account
  holder's passkey, authenticator code, GitHub Mobile approval, or account email
  code; no credential was requested, stored, or bypassed.
  Private PR #1 was dispatched, but GitHub refused to start the runner before any
  step because of an account payment/private-minutes/spending-limit annotation.
  That route is no longer a launch gate because the Marketplace release must be
  public; the redundant billing issue was pruned.
- Next action: re-authenticate GitHub sudo mode, attach the already-live
  `v1.0.0` release to Marketplace with primary category `Code review` and
  secondary category `Utilities`, then verify the public Marketplace URL.

## Public release

- Release: <https://github.com/andersreiche/signlight-for-github/releases/tag/v1.0.0>
- Stable usage reference: `andersreiche/signlight-for-github@v1`
- Verification rerun before publication: 11/11 tests passed and the ncc
  production bundle rebuilt cleanly.

## Real E2E evidence

- PR: <https://github.com/andersreiche/signlight-for-github/pull/2>
- Initial production run exposed that GitHub requires `pull-requests: write` for
  the bot's PR state comment even when it uses the issues-comments endpoint.
  The workflow and public setup guidance were corrected, rebuilt, and retested.
- GitHub Action run `33302890299` passed the initial red state.
- Issue-comment runs `33302905878`, `33302936270`, and `33302949497` passed the
  sign, re-sign, and signer-revoke transitions; synchronize run `33302922136`
  passed the yellow changed transition.

## Credential cleanup

- No new persistent credential created.
- Runtime uses caller-provided ephemeral `GITHUB_TOKEN` only.
- Full-history secret scan passed before the public visibility change.
