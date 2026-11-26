# Handoff report-schema-v5

## Next action

The operator tests the change on the preview, ticks **Ready to merge** on https://github.com/k0d0minio/euro-register/pull/5, then says `release triage/report-schema-v5`.

## How to test

Open `/apercu/rapport` on the preview. Check the headline, « Ce qui marche bien », the three « À faire » cards and « Tes questions », then press « Copier le message pour Claude » and paste: you see the prompt. Press « voir le message », then open « Détails techniques »: the full v4 report is there.

## Acceptance criteria

- Seed check (verify: agent): met. `pnpm seed fixtures --check` accepts the v5 fixture. It refuses a v4 file, an unknown finding id, an order gap, 4 actions, 4 strengths and a title of 71 characters. It also refuses a v5 file with no `simple`.
- Page order and no finding id above « Détails techniques » (verify: operator): checked by the agent on the local dev server (`/apercu/rapport`, HTML). Waits for the operator.
- Copy button and « voir le message » (verify: operator): not checked by the agent (no browser in this session). Waits for the operator.
- « Détails techniques » holds every v4 section, `/equipe` unchanged (verify: operator): the HTML of the closed section has all 11 sections; `/apercu/equipe` answers 200 and its code did not change. A v4 report in the database: the code path is the v4 page, not tested on data. Waits for the operator.
- CI green (verify: CI): met at 6103e81.

## Differences from the spec

- `fixtures/exemple-v3.json` moved to `fixtures/anciennes/`: the seed now refuses it, and the folder check `pnpm seed fixtures --check` reads only the top level. No code read that file.
- The admin view of « Tes questions » keeps the question ids (Q1); the employee form hides them.
- The hero hides « schéma vN » and the source for a v5 report; they show at the top of « Détails techniques ».

## Blockers

- Ready to merge is not ticked.

## Do not touch

- The six report files in `~/euro-register-data/rapports/` (the audit sessions rewrite them).
- The production database: no seed before J's word, after the merge and the six v5 files.
