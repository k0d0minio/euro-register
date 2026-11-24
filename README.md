# Euro Register — Audit ICM app

The app for the ICM audit at Euro Register:

- one audit report for each employee, behind a magic-link sign-in;
- a deck on the ICM norms and good practice with AI;
- an admin index of all reports.

**Staging copy.** This folder is the foundation. It will be imported into the repo
`k0d0minio/euro-register`, on top of its ICM blueprint, with the first ticket of that repo
(after JAM-567). No remote, no deploy from here.

**The repo will be public.** Employee names, emails, findings and workspace excerpts are
only in Neon, never in git. `fixtures/exemple.json` is invented.

## Stack

Next.js 16 (App Router, TypeScript) · Tailwind CSS 4 · Motion · Postgres on Neon with Drizzle ·
Resend · zod. UI in French.

## Routes

| Route | Access |
|---|---|
| `/` | Sign-in: email → magic link. |
| `/connexion/verifier?token=…` | Confirm page. The button (POST) uses the token, so a mail scanner that opens the link does not use it. |
| `/rapport/[slug]` | The employee of that slug (published report only), or an admin. Else 404. |
| `/presentation` | Each signed-in person. |
| `/admin` | Admins only (`ADMIN_EMAILS`). |
| `/apercu/rapport`, `/apercu/presentation` | Development only, no sign-in, invented data. 404 in production. |

## Run in development

```bash
pnpm install
cp .env.example .env     # then fill in the values
pnpm db:migrate          # needs DATABASE_URL
pnpm seed fixtures/exemple.json
pnpm dev
```

With no `DATABASE_URL`, the sign-in is off, and the previews still work.
In development the mailer writes the sign-in link to the server console and sends no mail.

## Data

- Schema: `src/db/schema.ts`. Migrations: `drizzle/` (`pnpm db:generate` after a schema change).
- Report contract: `src/lib/report/schema.ts` and [`docs/report-schema.md`](docs/report-schema.md).
- Load reports: `pnpm seed <file | folder outside the repo> [--check]`.
- `.gitignore` excludes `.env*` (except `.env.example`), `/data/`, `/local-data/`, `/rapports/` and `*.local.json`.

## Security

- Magic-link token: 256 random bits, stored as a SHA-256 hash, valid 15 minutes, single use (atomic `UPDATE … RETURNING`).
- Max 3 links for one email in 15 minutes.
- Only emails in `employees` or `ADMIN_EMAILS` get a link. The answer is the same for every email, and the work runs after the response (`after()`), so the time is the same too.
- Session: random token in an httpOnly, SameSite=Lax cookie (Secure in production), hash in the database, 7 days. Access is checked again at each request: an email removed from `employees` loses access.
- `src/proxy.ts` is an optimistic check only (cookie present). The pages check the session in the database.

## Technical choices

- **Cache Components off.** The Next 16 template turns it on. All pages except the previews read the session, so they are dynamic, and `redirect()` / `notFound()` keep their HTTP status.
- **Own magic-link code, no auth library.** The flow is small (two tables, ~150 lines) and the rules (allow-list, no email enumeration) are specific.
- **Neon HTTP driver.** No transactions are necessary; each write is one statement.

## Import into `k0d0minio/euro-register`

See the hand-over list in the first ticket of that repo. In short:

1. Copy the tree, without `node_modules/`, `.next/` and `.env`.
2. Merge `package.json`, `.gitignore`, `README.md` and `AGENTS.md`/`CLAUDE.md` with the blueprint files; keep the blueprint rules where they disagree.
3. Set the Vercel env vars: `DATABASE_URL`, `APP_URL`, `ADMIN_EMAILS`, `RESEND_API_KEY`, `MAIL_FROM`.
4. Run `pnpm db:migrate` on the Neon production branch, then `pnpm seed` from the data folder outside the repo.
5. Verify the sending domain in Resend for `MAIL_FROM`.
