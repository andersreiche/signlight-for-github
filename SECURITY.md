# Security

Report suspected vulnerabilities privately to `anders.reware@gmail.com`. Do not
open a public issue for a vulnerability that could affect installed workflows.

Signlight runs entirely inside GitHub Actions. It does not operate an external
service or receive repository data. The example workflow grants only read access
to contents plus write access to pull requests, issues, and commit statuses.
GitHub requires pull-request write permission for the bot's state comment even
though it is sent through the issues-comments API.
It intentionally never checks out or executes untrusted pull-request code from
the privileged `pull_request_target` event.

The repository workflow, its administrators, and users with permission to edit
Actions configuration are inside the trust boundary. The state comment is a
lightweight sign-off record, not a legal signature or compliance certification.
