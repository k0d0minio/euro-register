# Report schema v3 and a full report page

- complexity: complex
- lane: spine

## Problem

J reviews each audit report in Claude Code today. The report page shows only part of the
report, and the reports have no folder structure, risks or open questions. J wants to
review the full report of each employee in the app (request of 2026-11-25, BAXTER item
w-20261125-029).

## Acceptance criteria

- [ ] The app reads report files of schema versions 1, 2 and 3. Version 3 adds
      `structure`, `risks`, `openQuestions` and `notes`.
- [ ] The report page and the admin preview show all sections of the report: summary,
      metrics, strengths, findings, suggestions, risks, open questions, notes,
      collaboration and the folder structure.
- [ ] The folder structure is a tree that J can expand, collapse and filter by path. Each
      path shows its description and its status, and links to its findings.
- [ ] The page has a table of contents that goes to each section.
- [ ] The six report files of the audit pass the seed check.

## Questions

none
