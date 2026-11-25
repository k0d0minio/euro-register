# Handoff full-report-page

## Next action

The operator tests the change on the preview, ticks Ready to merge on
https://github.com/k0d0minio/euro-register/pull/3, then says
`release triage/full-report-page`.

## Criteria

- CI green: met (Vercel, workflows; 2026-11-25).
- Seed check accepts versions 1, 2, 3 and refuses a v3 file with no `structure` or an
  unknown `findingIds`: met (agent, files outside the repo).
- The six report files pass `--check`: met at 2026-11-25 (files of 17:24 to 17:26).
- The admin preview shows each section, and the table of contents goes to each section:
  met (agent, local dev server, fixture and two real reports, no console error).
- Tree expand, collapse, filter and the finding ↔ node links: checked by the agent;
  the operator verifies.
- Finding filters on severity and category: checked by the agent; the operator verifies.

## How to test

On the preview, sign in as admin and open a report. In "Arborescence", click "Tout déplier",
then type a path in the filter. Click a finding id beside a path, then the folder link of
that finding, and see the page go to the finding and back to the path.

## Blockers

- Ready to merge is not ticked.

## Do not touch

- The report files in `~/euro-register-data/rapports`: the audit sessions own them.
