# Report schema v4, employee answers and a team page

- complexity: complex
- lane: spine
- source: J's audit standard of 2026-11-26 (`~/euro-register-data/standard.md`, sections 2, 3 and 9, outside the repo), from J's answers to 61 questions. BAXTER item w-20261126-007. Brief from J's orchestrating session, 2026-11-26.

## Problem

J set a new standard for the audit reports on 2026-11-26. The reports must have 3
severity levels, a score for each category, fewer actions, one collaboration opportunity
with the others on a team page, and questions that go to the employee, to J or to the
team. The app reads only versions 1 to 3 and has no place where an employee can answer a
question, and no team page.

## Acceptance criteria

- [ ] `pnpm seed <folder> --check` accepts a version 4 file and still accepts versions 1 to 3. It refuses a v4 file with more than 3 strengths, 5 prompts or 5 next steps, or not exactly 1 collaboration opportunity.
- [ ] The report page shows the severities as `urgent`, `important`, `souhaitable` (old values mapped), and one score from 1 to 5 with its reason for each category. The folder tree stays visible.
- [ ] An employee answers each of their `employé` questions in a short form on their report page. An admin sees the answers. A `J` question shows only in the admin preview.
- [ ] A signed-in employee or admin opens a team page from the report page. It shows the team opportunities of all published reports and the `équipe` questions.
- [ ] CI is green, with the migration for the answers.

## Questions

none
