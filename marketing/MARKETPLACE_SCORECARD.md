# GitHub product-shape scorecard

Research date: 2026-08-29

The user selected GitHub. This scorecard compares native distribution shapes
instead of re-ranking marketplaces.

| Shape | Native identity/state | Reware hosting | Native distribution | Native paid path now | Launch friction | Score / 100 | Decision |
| --- | --- | --- | --- | --- | --- | ---: | --- |
| GitHub Marketplace Action | Yes: event actor, SHA, status, PR comment | None | Immediate release-based publication after agreement | No | Low–medium | 86 | Build first |
| GitHub App | Yes: installation identity, Checks, webhooks | Required | Marketplace app listing | After verified publisher and 100 installs | High | 58 | Defer until traction |
| Native required reviews only | Yes | None | Built in | None | None | 63 | Correct for code review, but does not create a distinct business sign-off |
| External approval SaaS | Varies | Required | Marketplace/integration | External or native | High | 41 | Reject for this stair-step |

## Recommendation

Launch a free serverless Action. Its weakness—no paid plan—is preferable to
operating a backend before validation. Convert to a paid GitHub App only after
the published 100-install threshold and concrete demand for organization-wide
policy.
