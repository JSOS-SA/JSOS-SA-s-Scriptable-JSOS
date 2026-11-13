# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Conventions

- Create: `gh issue create --title "..." --body "..."`
- Read: `gh issue view <number> --json number,title,body,labels,comments`
- List: `gh issue list --state open --json number,title,body,labels,comments`
- Comment: `gh issue comment <number> --body "..."`
- Apply labels: `gh issue edit <number> --add-label "..."`
- Remove labels: `gh issue edit <number> --remove-label "..."`
- Close: explain the resolution in a comment, then run `gh issue close <number>`.

Use GitHub native sub-issues and issue dependencies when supported by the installed `gh` version. Otherwise, record parent and blocker references in the issue body.

Infer the repository from `git remote -v`. Run GitHub CLI commands from inside the repository.

Before creating issues, verify the target with `gh repo view --json nameWithOwner`. Create issues only in the user's repository, never in the upstream skills repository.

## Pull requests

Pull requests are not a feature-request or triage surface by default.

## Publishing

When a skill says to publish to the issue tracker, create a GitHub issue. When it says to fetch a ticket, read the corresponding GitHub issue.

## Wayfinding

Use a parent GitHub issue as the map and child issues as tickets. Use GitHub sub-issues where available. Record blockers using native issue dependencies where supported. Otherwise, document them in the issue body.
