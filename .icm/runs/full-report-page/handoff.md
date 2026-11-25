# Handoff full-report-page

## Next action

The operator reads `spec.md` and ticks Spec approved on
https://github.com/k0d0minio/euro-register/pull/3. Then the operator says
`build triage/full-report-page`.

## How to test

Open the admin preview of a report on the preview deployment. Use the table of contents
to go to the folder structure, expand and filter the tree, and click a finding link of a
node.

## Blockers

- Spec approved is not ticked.

## Do not touch

- The report files in `~/euro-register-data/rapports`: the audit sessions own them.
