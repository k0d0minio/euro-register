# Handoff report-schema-v5

## Next action

The operator reads spec.md and ticks **Spec approved** on https://github.com/k0d0minio/euro-register/pull/5. Then the operator says `build triage/report-schema-v5`.

## How to test

Open a v5 report on the preview. Check the headline, « Ce qui marche bien », the « À faire » cards and « Tes questions ». Press « Copier le message pour Claude », paste it, and open « Détails techniques ».

## Blockers

- Spec approved is not ticked. Build does not start before the tick.

## Do not touch

- The six report files in `~/euro-register-data/rapports/` (the audit sessions rewrite them).
- The production database: no seed before J's word.
