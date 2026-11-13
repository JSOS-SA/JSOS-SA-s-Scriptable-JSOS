# Triage Labels

This repository uses the following canonical labels to make issue readiness and ownership explicit.

| Label | Meaning | Use when |
| --- | --- | --- |
| `needs-triage` | Needs initial triage and classification. | An issue has not yet been assessed for scope, priority, or next action. |
| `needs-info` | Waiting for additional information. | Work cannot be assessed or continued until the reporter or another stakeholder supplies specific information. |
| `ready-for-agent` | Reviewed and ready for an engineering agent to work. | Scope, acceptance criteria, dependencies, and relevant evidence are sufficiently clear for execution. |
| `ready-for-human` | Requires human judgment, action, or decision. | The next step requires an explicit human decision, approval, access, or physical-world action. |
| `wontfix` | Will not be worked on. | The issue has been explicitly declined, with the reason recorded in the issue. |

## Lifecycle guidance

- Apply `needs-triage` to newly filed work until it has been assessed.
- Use `needs-info` when a concrete information gap blocks progress. State what information is missing.
- Apply `ready-for-agent` only after the issue has actionable scope, acceptance criteria, dependencies, and evidence.
- Use `ready-for-human` when the next action cannot safely or legitimately be delegated.
- Use `wontfix` only after recording the decision and rationale.

These labels communicate workflow state. They do not override repository policy, security requirements, branch protection, required checks, or human approval requirements. A label alone is not authorization to merge, deploy, access secrets, or perform a high-risk operation.
