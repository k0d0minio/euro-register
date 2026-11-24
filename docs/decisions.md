# Decisions of J

Each line: the date, the question, J's answer in chat. Values (emails, keys) are in `.env` only.

- 2026-11-24 — Admin and sender: J gave the admin email and the sender `MAIL_FROM` on the Resend domain that J verified. Both are in `.env`, not in git.
- 2026-11-24 — Each audit session converts its own draft to the report JSON. J: "yes".
- 2026-11-24 — Findings with a plaintext secret, personal data in the wrong place or a risk of data loss get the severity `critique`. J: "yes".
- 2026-11-24 — The real report JSON files are in `~/euro-register-data/rapports/`, outside the repo. J: "yes".
- 2026-11-24 — One current report for each employee. No history of versions. J: "no" (to keeping old versions).
- 2026-11-24 — The deck slides are placeholders. J reviews the text before the presentation. J: "agreed".
- 2026-11-24 — Neon: J told the session to make the dev database itself. Result: refused, because the Kodominio Neon organization is managed by Vercel. The database comes from the Vercel project of the new-customer flow.
