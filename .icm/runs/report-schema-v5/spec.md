# Spec: Report schema v5: the simple view

- ticket: triage/report-schema-v5
- touches: src/lib/report/schema.ts, docs/report-schema.md, fixtures/exemple.json, scripts/seed.ts, src/components/report/, src/app/rapport/[slug]/, src/app/apercu/rapport/
- complexity: standard

## Problem

The employees of Euro Register are not technical. The v4 report page shows all the
findings, risks, scores, the tree and the prompts at once: J says it is an overload of
information. J chose in chat on 2026-11-26: the employee sees a simple page first, the
full report stays folded under « Détails techniques », 3 actions at most, and each action
is a plain title, one sentence "why" and a button that copies a prompt for Claude.
Source: `~/euro-register-data/schema-v5.md` (outside the repo).

## Proposed change

**Schema version 5.** A new required field `report.simple`:
- `headline`: 1 or 2 sentences, 220 characters at most.
- `strengths`: 1 to 3 items, 120 characters at most each.
- `actions`: 1 to 3 items `{order, title, why, prompt, findingIds}`. `title` 70
  characters at most, `why` 200 characters at most, `prompt` not empty. `order` is 1..n
  with no gap. Each `findingIds` id exists in `findings`.

The seed check (`pnpm seed <folder> --check`) accepts version 5 only. It refuses a file
of version 1 to 4 with a clear message. The app still shows a report of version 1 to 4
that is already in the database: that page has no simple part and shows the v4 page as
today.

**Report page** (employee `/rapport/<slug>` and the admin view of it, and the
development preview `/apercu/rapport`), for a v5 report, top to bottom:
1. The headline, in large type.
2. « Ce qui marche bien »: the strengths as short lines.
3. « À faire »: one card for each action: its number, its title, « Pourquoi : <why> »,
   a button « Copier le message pour Claude » that copies the prompt and shows « Copié »
   for 2 seconds, and a small toggle « voir le message » that shows the prompt text.
4. « Tes questions »: the existing answer form for the `employé` questions. The admin
   sees the existing admin view of the questions.
5. « Détails techniques »: one `<details>`, closed when the page opens. It holds every
   v4 section with no change: summary, scores, strengths, findings, risks, prompts, next
   steps, collaboration, structure, notes.

Large type, generous spacing, no codes or ids (C1, R2) in the simple part.

`docs/report-schema.md` and `fixtures/exemple.json` move to version 5. The team page
`/equipe` does not change.

## Acceptance criteria

- [ ] `pnpm seed fixtures --check` accepts the v5 fixture. It refuses a v4 file, a `simple` block with an unknown finding id, an order gap, 4 actions, 4 strengths and a title of 71 characters. (verify: agent)
- [ ] For a v5 report, the report page shows top to bottom: the headline, « Ce qui marche bien », « À faire » with one card for each action (number, title, « Pourquoi : … »), « Tes questions », and « Détails techniques » closed. No finding id shows above « Détails techniques ». (verify: operator)
- [ ] « Copier le message pour Claude » puts the prompt on the clipboard and the button shows « Copié » for 2 seconds. « voir le message » shows and hides the prompt text. (verify: operator)
- [ ] When opened, « Détails techniques » shows every v4 section. `/equipe` shows the same content as before. A v4 report already in the database still shows. (verify: operator)
- [ ] CI is green: install, migrations from zero, lint, build. (verify: CI)

## Out of scope

- The six report files in `~/euro-register-data/rapports/`: the audit sessions rewrite
  them. This run does not edit them.
- The re-seed to production. It waits for the merge, the six v5 files and J's word.
- A change to `/equipe`, to the sign-in, to the answers table or to the deck.
- A database migration: the report stays one JSON column.

## Open questions

- J checks before the approval: the seed check refuses versions 1 to 4 (not only 4). The
  page still shows an old report that is in the database.
- J checks: the admin sees the same simple page as the employee, with the admin view of
  the questions in place of the form.
