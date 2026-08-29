# GitHub Marketplace research

Research date: 2026-08-29

## Platform fit

- Marketplace: GitHub Marketplace Actions.
- Native surface: commit status on the PR HEAD plus one bot PR comment.
- Required events/APIs: `pull_request_target`, `issue_comment`, pull request read,
  collaborator permission read, issue comment write, commit-status write.
- Hosting/storage: GitHub-hosted Action runner and state inside the repository.
- Billing: Actions have no Marketplace paid plans. A later GitHub App can use
  native Marketplace purchase events; paid apps require verified publisher and
  at least 100 GitHub App installations.
- Publication: public repository with one root `action.yml`, unique action name,
  tagged release, 2FA, and accepted Marketplace Developer Agreement. Qualifying
  Actions publish without review.
- Data egress: none.

## Competitors and native alternatives

| Product | Listing | Job | Price | Gap relative to Signlight |
| --- | --- | --- | --- | --- |
| GitHub required reviews / stale approval dismissal | [GitHub docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) | Code-owner review and merge protection | Included with applicable GitHub plan | Correct for code review, but not a separate compact business/release sign-off |
| Manual Workflow Approval | [Marketplace](https://github.com/marketplace/actions/manual-workflow-approval) | Pause a running workflow until approvers answer in an issue | Free/open source | Holds a runner and targets deployment gates, not a persistent PR HEAD status |
| Required Approvals | [Marketplace](https://github.com/marketplace/actions/required-approvals) | Enforce review count/team approval | Free/open source | Re-expresses GitHub reviews instead of a separate explicit acknowledgement |
| Dismiss stale approvals | [Marketplace](https://github.com/marketplace/actions/dismiss-stale-approvals) | Dismiss review approval after diff changes | Free/open source | Manages review state; no standalone sign/revoke identity or details record |

## Current official sources

- [Publishing Actions in GitHub Marketplace](https://docs.github.com/en/actions/how-tos/create-and-publish-actions/publish-in-github-marketplace) — accessed 2026-08-29.
- [Requirements for Marketplace apps](https://docs.github.com/en/apps/github-marketplace/creating-apps-for-github-marketplace/requirements-for-listing-an-app) — accessed 2026-08-29.
- [Commit statuses REST API](https://docs.github.com/en/rest/commits/statuses) — accessed 2026-08-29.
- [Repository collaborator permissions](https://docs.github.com/en/rest/collaborators/collaborators#get-repository-permissions-for-a-user) — accessed 2026-08-29.
- [Events that trigger workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request_target) — accessed 2026-08-29.

## Decision

- Positioning: commit-bound business/release sign-off, not code review.
- Differentiator: red/green/yellow/revoked state with no long-running workflow and
  no external service.
- Initial price: free; Actions Marketplace cannot express paid plans.
- Launch risk: crowded approval category and strong native reviews. Copy must
  remain narrow and demonstrate the separate sign-off use case.
- Go/no-go: go as a free traction experiment; no hosted/paid App before demand.
