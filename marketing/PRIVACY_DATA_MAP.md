# Privacy and data map

Research date: 2026-08-29

| Data | Source | Purpose | Storage | Retention | Egress | Deletion |
| --- | --- | --- | --- | --- | --- | --- |
| Repository owner/name and PR number | GitHub event | Address GitHub APIs | Not retained separately | Workflow run retention | None outside GitHub | GitHub repository/run controls |
| GitHub login | Trusted event sender | Authorization, signer and revoker attribution | One PR state comment | Until comment/repository deletion; bounded history 100 | None | Delete comment or repository |
| PR HEAD SHA | GitHub Pull Request API | Bind sign-off and detect changes | PR state comment and commit status | Repository lifetime; bounded history 100 | None | Delete comment/status via repository history controls |
| UTC timestamps and event IDs | Action runtime | Details, idempotency, bounded audit | PR state comment | Bounded to 100 transitions | None | Delete state comment |

## Architecture

- Runtime: GitHub-hosted Actions runner using committed ncc bundle.
- Storage: one bot-authored PR comment plus native commit statuses.
- External services/egress: none.
- Identity: GitHub event sender and repository permission API.
- Billing/licensing: free Action; none.
- Tenant isolation: all API calls are scoped to the event repository and PR.
- Concurrency/replay: comment event ID idempotency; a command re-reads current PR
  HEAD and record before mutation.
- Credentials: caller supplies ephemeral `GITHUB_TOKEN`; Signlight never stores
  or logs it.

## Explicitly not collected

- Source code, diff content, secrets, email addresses, profile names, payment
  data, external analytics, or repository contents.

## Claim boundary

This is a lightweight workflow acknowledgement. Repository administrators can
change workflows and state. It is not a legal e-signature, immutable evidence,
regulated approval, certification, or compliance guarantee.
