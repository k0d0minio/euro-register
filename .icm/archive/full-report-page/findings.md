# Findings full-report-page

- The preview `/apercu/rapport` shows only the invented fixture, and only in development
  (`src/app/apercu/layout.tsx`). There is no route `/apercu/rapport/<slug>`. An admin reads
  a draft report at `/rapport/<slug>` (the repo reads drafts for an admin). The check after
  the production seed must use `/rapport/<slug>`.
- The local dev server serves the client scripts only on `localhost`, not on `127.0.0.1`
  (Next.js dev origin check). A page check on `127.0.0.1` shows no interaction.
