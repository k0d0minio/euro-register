# Spec: Report schema v4, employee answers and a team page

- ticket: triage/report-schema-v4
- touches: src/lib/report/schema.ts, docs/report-schema.md, fixtures/exemple.json, src/db/schema.ts, drizzle/, src/lib/report/, src/components/report/, src/components/ui/badges.tsx, src/app/rapport/[slug]/, src/app/equipe/, src/app/admin/, src/app/apercu/, src/proxy.ts
- complexity: complex

## Problem

J set a new audit standard on 2026-11-26 (`~/euro-register-data/standard.md`, outside the
repo, sections 2, 3 and 9). The reports must have 3 severity levels, a score for each
category, at most 3 strengths and 5 actions, one collaboration opportunity in the report
with the others on a team page, and questions addressed to the employee, to J or to the
team. The app reads only versions 1 to 3, an employee cannot answer a question, and there
is no team page. BAXTER item w-20261126-007.

## Proposed change

**Schema version 4.** The app reads versions 1, 2, 3 and 4. A new file is version 4.
- `findings[].severity` in v4: `urgent`, `important`, `souhaitable`. Versions 1 to 3 keep
  the old values in the file. The page shows them mapped: critique → urgent,
  élevé → important, moyen and faible → souhaitable. The seed check refuses an old value
  in a v4 file and a new value in a v1–v3 file.
- `scores` (required in v4): one entry for each of the 4 categories, `{category, score
  1–5, reason}`. The check refuses a missing or a duplicate category.
- `collaboration.teamOpportunities` (required in v4, can be empty): same shape as
  `opportunities`.
- Limits in v4: `strengths` 3 at most, `prompts` 5 at most, `nextSteps` 5 at most,
  `collaboration.opportunities` exactly 1.
- `openQuestions[].askTo` stays `employé` | `J` | `équipe`.
- `docs/report-schema.md` and the fixture move to version 4.

**Report page** (`/rapport/<slug>`):
- Badges, filters and sort of the findings use the 3 levels.
- A new section "Scores", after "Mesures": one card for each category, with the score
  (1 to 5) and the reason. Not shown for v1–v3.
- The folder tree stays, for the employee too.
- Questions:
  - The employee sees their `employé` questions as a short form: one text field for
    each question, one button "Enregistrer". They can change the answers later. After a
    save, the page says "Réponses enregistrées".
  - An admin sees all questions, grouped by `askTo`, and the saved answer under each
    `employé` question (or "Pas encore de réponse"). The admin cannot edit an answer.
  - `J` questions show only to an admin. `équipe` questions show only on the team page.
- A link "Page équipe" in the header of the report page.

**Answers in the database.** A new table holds one answer for each employee and question
id (text, 2,000 characters at most, the time of the last save). A migration makes it. A
new seed of the same slug keeps the answers: the key is the question id. Only the
signed-in employee of that report writes their answers, and only on a published report.
The page `/admin` shows, for each report, the number of answered `employé` questions.

**Team page** (`/equipe`, French, the style of the app):
- Open to each signed-in employee and admin. Not signed in: back to the sign-in page.
- Section "Opportunités d'équipe": the `teamOpportunities` of each published report,
  grouped by employee (name), with the same card as in the report.
- Section "Questions pour l'équipe": the `équipe` questions of each published report,
  with the name of the employee.
- An empty state for each section when there is nothing.
- Drafts are not shown, to admins too.

**Development previews** (`/apercu/...`, development only): the fixture preview shows the
admin view of the report, and a new `/apercu/equipe` shows the team page from the fixture.

## Acceptance criteria

- [ ] `pnpm seed <folder> --check` accepts a valid v4 file and the v1–v3 fixtures. It refuses a v4 file with 4 strengths, 6 prompts, 6 next steps, 0 or 2 opportunities, a missing score category or an old severity value. (verify: agent)
- [ ] The report page shows the severities as Urgent, Important, Souhaitable, also for a v3 report, and a Scores section with a score and a reason for each category of a v4 report. The folder tree is visible to the employee. (verify: operator)
- [ ] A signed-in employee types an answer to an `employé` question, saves, reloads the page and sees the answer. An admin sees that answer on the report page and the count on `/admin`. The employee does not see `J` questions. (verify: operator)
- [ ] A signed-in employee opens `/equipe` from their report page and sees the team opportunities and the `équipe` questions of the published reports. Without a session, `/equipe` goes to the sign-in page. (verify: operator)
- [ ] CI is green: install, migrations from zero, lint, build. (verify: CI)

## Out of scope

- The six report files in `~/euro-register-data/rapports/`: the audit sessions write
  them. This run does not edit them.
- The re-seed to production. It is a separate act, after the merge and J's word.
- A mail or a notification when an employee answers.
- Answers to `J` or `équipe` questions in the app.
- A change to the sign-in or to the deck.

## Open questions

- J checks before the approval: the "admin preview" of the brief is the report page
  `/rapport/<slug>` with an admin session. `/apercu/...` stays development only, with the
  fixture.
- J checks: the team page shows published reports only, also to an admin.
- J checks: a v4 file must have a score for each of the 4 categories, also a category
  with no finding (score 5).
