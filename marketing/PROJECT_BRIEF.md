# Project brief

Research date: 2026-08-29

## One-sentence product

For repository teams that need a separate business or release acknowledgement,
Signlight shows whether an authorized GitHub user signed the current PR HEAD SHA
without an external approval service.

## Buyer and trigger

- Buyer: small software, operations, release, and documentation teams.
- End user: a repository maintainer or named business owner.
- Trigger: a PR is ready for an explicit non-code-owner sign-off.
- Existing workaround: approval comments, labels, required reviews, environment
  approvals, or external workflow tools.
- Marketplace advantage: GitHub identity, immutable commit SHAs, branch checks,
  Actions distribution, and no separate account.

## Marketplace choice

- Platform fixed by user: GitHub Marketplace.
- Selected shape: a free JavaScript Action in a public single-action repository.
- Native hosting/storage/identity/licensing/billing: Actions runtime, event actor,
  commit statuses, and PR comment storage; no paid billing in v1.
- Hard gates: public single-action repo and Marketplace Developer Agreement for
  the personal repository owner; a future paid GitHub App also needs an
  organization, verified publisher status, and 100 installs.
- Runner-up: GitHub App after traction, if customers need centralized policy or
  paid plans enough to justify a hosted webhook service.

## MVP

- Core action: `/signlight sign` and signer-only `/signlight revoke`.
- Native surface: commit status plus one progressively disclosed PR comment.
- States: red unsigned, green current HEAD signed, yellow new HEAD, red revoked.
- Permission: explicit allowlist or minimum repository permission; signer-only
  revoke.
- Entity state: exact 40-character pull-request HEAD commit SHA.

## Explicit non-goals

- Replacing GitHub reviews, CODEOWNERS, branch protection, or environment rules.
- Legal e-signature, regulated approval, compliance certification, or immutable
  evidence against a malicious repository administrator.
- External backend, dashboard, account, notification service, or paid plan in v1.

## Validation hypothesis

- Installation target: 25 repositories and at least 10 active PR sign-offs.
- Activation: first PR reaches green and later demonstrates a yellow stale state.
- Interviews: five teams separating business/release sign-off from code review.
- Willingness-to-pay signal: requests for centralized policy, audit export, or
  organization-wide required signers after 100 free installs.
- Kill/continue: continue if five repositories use it on 10+ PRs within 60 days;
  otherwise keep free/maintenance-only and do not build the hosted GitHub App.
