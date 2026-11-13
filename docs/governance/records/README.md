# Governance Records

## Canonical structured data

The JSON files in this directory are the canonical machine-readable records:

- [Decision Register Data](decision-register.json)
- [Compatibility Records](compatibility-records.json)
- [Evidence Records](evidence-records.json)
- [Exception Records](exception-register.json)
- [Violation and Remediation Records](violation-register.json)

Human-readable Markdown pages are explanatory views and schemas:

- [Approved Decision Register](decision-register.md)
- [Compatibility Matrix](../compatibility-matrix.md)
- [Evidence Register](../evidence-register.md)
- [Exception Register](exception-register.md)
- [Violation and Remediation Register](violation-register.md)

CI validates identifiers, references, required fields, lifecycle states, and synchronization between canonical JSON and the human-readable decision/evidence/compatibility views. Do not edit a human-readable view without updating its canonical JSON record.

Sensitive credential values, secret snippets, private vulnerability details, device identifiers, and personal information must remain out of public records. Reference private GitHub Security alerts by evidence ID and record only the minimum non-sensitive metadata needed for auditability.
