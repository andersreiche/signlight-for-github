# Signlight PR Sign-off

Signlight binds an explicit maintainer sign-off to the current pull request HEAD
commit. The GitHub commit status is red before sign-off, green after an
authorized user comments `/signlight sign`, yellow when a new commit makes that
sign-off stale, and red again when the signer comments `/signlight revoke`.

The first release is a free GitHub Marketplace Action. It uses GitHub identity,
commit statuses, and one bot-authored PR comment as its bounded state and audit
record. There is no Reware backend, external database, account, or payment flow.

## Why this is not ordinary code review

GitHub's required reviews remain the right tool for code-owner approval.
Signlight is deliberately narrower: it adds a separate, visible business or
release sign-off that is cryptographically bound to the immutable PR HEAD SHA.
It must not be described as a legal electronic signature or compliance system.

## Usage

Add a workflow on the default branch:

```yaml
name: Signlight

on:
  pull_request_target:
    types: [opened, reopened, synchronize]
  issue_comment:
    types: [created]

permissions:
  contents: read
  issues: write
  pull-requests: read
  statuses: write

jobs:
  signlight:
    if: >-
      github.event_name == 'pull_request_target' ||
      (github.event_name == 'issue_comment' && github.event.issue.pull_request)
    runs-on: ubuntu-latest
    steps:
      - uses: reware-apps/signlight-for-github@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

Do not check out or execute pull-request code in this `pull_request_target`
workflow. Signlight only reads event metadata and calls GitHub APIs.

By default, users with `write`, `maintain`, or `admin` repository permission may
sign. Use `allowed-signers` for a stricter comma-separated allowlist.

## State and permissions

- The trusted actor is the GitHub event sender.
- A sign-off records the actor login, timestamp, and current 40-character HEAD
  SHA in a single bot-authored state comment.
- Only the active signer can revoke.
- A different authorized signer may sign after the PR changes.
- Event IDs make comment-command replay idempotent; history is capped at 100
  transitions.
- Commit statuses use `success`, `pending`, and `failure` for green, yellow, and
  red respectively.

Repository writers can change workflows and therefore remain inside the trust
boundary. Signlight does not defend against a malicious repository administrator.

## Development

```bash
npm install
npm test
npm run build
```

The committed `dist/index.js` is built with `@vercel/ncc`; consumers do not need
`node_modules`. Marketplace publication requires a public, single-action repo.

## Status

- Domain, permission, state-comment, and event runner: implemented
- Unit/integration fixtures: passing
- Marketplace bundle: generated
- Private development repository: next gate
- Public Reware-owned repository, real PR E2E, release, and Marketplace publish:
  pending organization/agreement checks recorded in Linear

Support: `anders.reware@gmail.com`
