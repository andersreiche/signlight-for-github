# Security

Report suspected vulnerabilities privately to `anders.reware@gmail.com`. Do not
open a public issue for a vulnerability that could affect installed workflows.

Signlight runs entirely inside GitHub Actions. It does not operate an external
service or receive repository data. The example workflow grants only read access
to contents and pull requests plus write access to issues and commit statuses.
It intentionally never checks out or executes untrusted pull-request code from
the privileged `pull_request_target` event.

The repository workflow, its administrators, and users with permission to edit
Actions configuration are inside the trust boundary. The state comment is a
lightweight sign-off record, not a legal signature or compliance certification.
