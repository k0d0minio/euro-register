# Handoff report-schema-v4

## Next action

Release: `release triage/report-schema-v4` (J said "merge pr 4" on 2026-11-26). After the
deploy, and only on J's word: re-seed the six v4 files to production as `draft`.

## How to test

Sign in as an employee, open your report, answer a question under "Vos réponses" and save,
then reload. Open "Page équipe" in the header. Sign in as an admin: the answer shows under
the question, and `/admin` shows the count.

## Criteria

- Seed check (verify: agent): met. The v4 fixture, the v3 fixture and the six real v4 files
  pass. Nine invalid v4 variants are refused with the expected message.
- Levels and scores (verify: operator): seen on the dev preview `/apercu/rapport`.
- Answers form and admin view (verify: operator): not tested locally (no database). To test
  on the preview.
- Team page (verify: operator): seen on the dev preview `/apercu/equipe`.
- CI (verify: CI): green on 5e33b27. The Vercel preview build is Ready.

## Blockers

- none

## Do not touch

- `~/euro-register-data/rapports/`: the audit sessions write those files.
