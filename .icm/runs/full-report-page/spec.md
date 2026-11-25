# Spec: Report schema v3 and a full report page

- ticket: triage/full-report-page
- touches: src/lib/report/schema.ts, docs/report-schema.md, fixtures/exemple.json, src/components/report/, src/app/rapport/[slug]/, src/app/apercu/rapport/
- complexity: complex

## Problem

J reviews each audit report in Claude Code today. The report page shows only part of the
report: the reports have no folder structure, no risks and no open questions. J wants to
review the full report of each employee in the app (request of 2026-11-25, BAXTER item
w-20261125-029). The source of the new fields is J's spec
`~/euro-register-data/schema-v3.md` (outside the repo).

## Proposed change

Schema version 3 adds four fields to the report, with the names of J's spec:
`structure` (root, summary, nodes with path, kind, description, status, findingIds,
optional size), `risks` (likelihood × impact, mitigation, findingIds), `openQuestions`
(question, context, askTo) and the optional `notes`. Version 3 keeps each field of
version 2. The app still reads versions 1 and 2. A file of version 3 must have
`structure`, `risks` and `openQuestions`.

The seed check also refuses, for version 3: a `findingIds` value that is not the id of a
finding, two nodes with the same path, a node whose parent folder has no node, and two
risks or two questions with the same id.

The report page (`/rapport/<slug>` and the admin preview `/apercu/rapport`) shows the
full report, in French, in the Motion and Tailwind style of the app:

- a table of contents that stays visible on a wide screen and goes to each section;
- summary and metrics; strengths;
- findings, with a filter on severity and on category;
- suggestions: the recommendations of the findings, the prompts with a copy button, and
  the next steps;
- risks as a 3 × 3 grid of likelihood × impact, and a list below it;
- open questions, grouped by who must answer;
- notes;
- the collaboration section;
- the folder structure: a tree that J can expand and collapse, with "Tout déplier" and
  "Tout replier" and a filter on the path. Each path shows its description, a status
  badge and the number of its findings. A node links to its findings. A finding links to
  its node.

A section with no data is not shown, and it is not in the table of contents. A report of
version 1 or 2 shows the sections that it has.

## Acceptance criteria

- [ ] CI is green: the type check, the lint and the build pass. (verify: CI)
- [ ] `pnpm seed <folder> --check` accepts files of versions 1, 2 and 3, and refuses a version 3 file with no `structure` or with a `findingIds` value that is not a finding id. (verify: agent)
- [ ] The six report files in `~/euro-register-data/rapports` pass `--check`, or the report lists each error per file. (verify: agent)
- [ ] The admin preview shows each section of a version 3 report, and the table of contents goes to each section. (verify: agent)
- [ ] In the folder tree, "Tout déplier", "Tout replier" and the path filter work, and a click on a finding link of a node goes to that finding, and back. (verify: operator)
- [ ] The finding filters on severity and category change the list of findings. (verify: operator)

## Out of scope

- No change to the database or to the seed command, other than the schema check.
- No edit of the report files in `~/euro-register-data/rapports`. The audit sessions own them.
- The seed of the production database is a separate act, after the merge, on J's word.
- No new suggestions field: the suggestions stay in the version 2 fields, as J's spec says.

## Open questions

- none
