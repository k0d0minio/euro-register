# Findings import-staging-app

The operator files these later. One entry for each finding.

## CLAUDE.md is still the blueprint placeholder

- where: `CLAUDE.md`
- what: The first line says "Write what this repo is". The file does not refer to `AGENTS.md`, which holds the Next.js 16 warning.
- proposed: chore

## The project rules are empty

- where: `.icm/project-rules.md`
- what: The rules of the app (French UI, no real data in git, emails only in `EMPLOYEE_EMAILS`, the report schema contract) are in `README.md` and `docs/` only.
- proposed: chore

## The environments table is empty

- where: `.icm/environments.md`
- what: No production address and no Vercel project name.
- proposed: chore

## No typecheck and no test script

- where: `package.json`
- what: CI runs `lint` only. It runs no `typecheck`, `test` or `db:verify`.
- proposed: chore

## The Vercel environment keys of the app are not set

- where: Vercel project of euro-register
- what: The app reads `APP_URL`, `ADMIN_EMAILS`, `EMPLOYEE_EMAILS`, `RESEND_API_KEY` and `MAIL_FROM`. CI sets only `DATABASE_URL`. Sign-in does not work on a deploy until the operator sets them.
- proposed: question for the ticket
