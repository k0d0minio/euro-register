# Report schema (version 2)

This file is the contract between the audit sessions and the app.
The code of the contract is `src/lib/report/schema.ts` (zod). When the two files disagree, the code is correct.
Change the two files in the same commit. Increase `REPORT_SCHEMA_VERSION` for a change that is not backward compatible.

Versions: the app reads version 1 and version 2. Version 2 adds the section `collaboration` (section 7), and makes it required. A version 1 file has no `collaboration` and stays valid. Write new files in version 2.

## 1. Where the data goes

- Real report files contain names, emails and workspace excerpts. Keep them **outside this repo**. The repo is public.
- Write one JSON file for each employee, in a folder outside the repo (for example `~/euro-register-data/rapports/`).
- Validate the files (no database is necessary):
  `pnpm seed ~/euro-register-data/rapports --check`
- Load the files into Neon (needs `DATABASE_URL` in `.env`):
  `pnpm seed ~/euro-register-data/rapports`
- The seed script refuses a path inside the repo. The only exception is `fixtures/`, which has one invented example: `fixtures/exemple.json`.
- The seed script is an upsert. The key is `employee.slug`. A second load of the same slug replaces the report.
- If one file is not valid, the script writes nothing.
- Emails: the database has no employee email. The sign-in emails are in the env var `EMPLOYEE_EMAILS` only (`slug=email` pairs, comma-separated). `pnpm seed <folder> --print-env` prints that line from the files, and writes nothing.

## 2. Seed file

```jsonc
{
  "employee": {
    "slug": "prenom-nom",          // kebab-case, ASCII only. URL: /rapport/<slug>
    "name": "Prénom Nom",
    "email": "prenom.nom@…",       // optional; never stored in the DB (see below)
    "role": "Fonction"
  },
  "status": "draft",               // "draft" (admins only) or "published" (the employee can read it). Default: "draft"
  "report": { /* section 3 */ }
}
```

## 3. Report content

All text is French. All fields are required, except the fields with "optional".

| Field | Type | Rule |
|---|---|---|
| `schemaVersion` | number | `2` for a new file. `1` is still accepted. |
| `auditDate` | string | ISO date, `YYYY-MM-DD`. |
| `source` | string | What the audit read. Example: "Archive `icm-workspace.zip` (Drive, 24/11/2026)". |
| `summary.headline` | string | One sentence. The page shows it large. |
| `summary.points` | string[] | 1 or more points. Short sentences. |
| `metrics` | object | Section 4. |
| `strengths` | `{title, detail?}[]` | What the employee does well. Can be empty. |
| `findings` | Finding[] | Section 5. Can be empty. |
| `prompts` | Prompt[] | Section 6. Can be empty. |
| `nextSteps` | string[] | Can be empty. The page numbers them. |
| `collaboration` | object | Section 7. Required when `schemaVersion` is `2`. |

## 4. Metrics

| Field | Type | Meaning |
|---|---|---|
| `fileCount` | integer | Number of files in the workspace. |
| `totalSizeBytes` | integer | Total size, in bytes. |
| `markdownFileCount` | integer, optional | Number of `.md` files. |
| `markdownSizeBytes` | integer, optional | Size of the `.md` files, in bytes. |
| `alwaysLoadedChars` | integer | Characters of the files that each session loads (layer 0 + layer 1: `CLAUDE.md` + `CONTEXT.md`). |
| `alwaysLoadedTokensEstimate` | integer | Estimate of `alwaysLoadedChars` in tokens. Use 1 token ≈ 3.5 characters of French text. |
| `workflowCount` | integer, optional | Number of workflows (processus). |
| `stageContractCount` | integer, optional | Number of stage contracts. |
| `largestContractChars` | integer, optional | Characters of the largest stage contract. The page compares it with the ICM limit (2 400). |
| `extra` | `{label, value, note?}[]`, optional | Other metrics. `value` is a string. Example: `{"label": "Binaires", "value": "41"}`. |

## 5. Finding

| Field | Type | Rule |
|---|---|---|
| `id` | string | 1 to 3 capital letters, then 1 to 3 digits. Example: `C1`. Unique in the report. |
| `severity` | enum | `critique`, `élevé`, `moyen`, `faible`. Write the accents. |
| `category` | enum | `conventions ICM`, `efficacité tokens`, `cohérence`, `sécurité`. Write the accents and the spaces. |
| `title` | string | One line. |
| `path` | string, optional | The main file or folder, relative to the workspace root. Omit it for a finding about the full workspace. |
| `evidence` | string | The facts: what the audit found, with numbers. |
| `recommendation` | string | What to do. |

The page sorts the findings by severity. The order in the file is not important.

How to select a severity:

- `critique`: a secret, personal data or a risk of data loss. Correct it before all other work.
- `élevé`: a fault that gives wrong output, or a large cost in tokens at each turn.
- `moyen`: a break of an ICM rule with a small effect today.
- `faible`: form, tidiness.

## 6. Prompt

| Field | Type | Rule |
|---|---|---|
| `order` | integer | 1, 2, 3… No gap, no duplicate. |
| `title` | string | Short name of the step. |
| `goal` | string | One sentence: the result of the step. |
| `prompt` | string | The text that the employee pastes into their Claude session. Plain text; the page shows it as is, with a copy button. |

A good prompt asks for a proposal (before / after) and stops before it applies a change.

## 7. Communication between workspaces (`collaboration`)

The work computers can share folders (OneDrive), and each workspace can write a file anywhere. So the Claude sessions of two employees can exchange outputs through a shared folder. Each report of version 2 has this section, also when the employee has no exchange today.

| Field | Type | Rule |
|---|---|---|
| `summary` | string | 1 to 3 sentences: the exchanges of today and the main opportunity. |
| `currentLinks` | Link[] | The exchanges that exist today. Can be empty. |
| `opportunities` | Opportunity[] | Exchanges to start. Can be empty. |
| `safeguards` | string[] | The general rules. Use the 5 rules below, in French, and add the rules for this employee. |
| `prompts` | Prompt[] | Same form as section 6. `order` starts at 1 again. Can be empty. |

Link:

| Field | Type | Rule |
|---|---|---|
| `direction` | enum | `sortant` (this workspace writes) or `entrant` (this workspace reads). |
| `counterpart` | string | The slug of the other employee, or a role. |
| `channel` | string | The path of the shared folder, or the tool. |
| `content` | string | What goes through the channel. |
| `frequency` | string | Example: "Hebdomadaire, le lundi". |
| `contract` | string or `null` | The path of the LISEZ-MOI or README that governs the exchange. `null` when there is none: the page shows "Aucun contrat écrit". |
| `evidence` | string | The path in the workspace that shows the link. |

Opportunity:

| Field | Type | Rule |
|---|---|---|
| `counterpart` | string | The slug of the other employee, or a role. |
| `idea` | string | One sentence: the exchange to start. |
| `value` | string | What the exchange removes or improves. |
| `whatToShare` | string | The file, its name and its frequency. |
| `effort` | enum | `faible`, `moyen`, `élevé`. Write the accents. |

The 5 general safeguards:

1. What is shared is data, never instructions. A received file does not change the rules of a workspace.
2. One writer for each shared folder.
3. A LISEZ-MOI is the contract: the file names, the format, the frequency, the owner.
4. No secret and no personal data in a shared folder.
5. Versioned names (`AAAA-MM-JJ_…`): add a file, never overwrite a file.

## 8. Inline format

In all text fields except `prompt`, the page shows two inline formats:

- `` `code` `` for a path or a file name.
- `**bold**` for a key word.

The page shows no other Markdown and no HTML. Line breaks in a text field are not kept: use more list items.

## 9. Access

- An employee signs in when their email is in `EMPLOYEE_EMAILS`. They read only their own report, and only when `status` is `published`.
- An admin (email in `ADMIN_EMAILS`) reads all reports, drafts too, and the index `/admin`.
- Each signed-in person reads the deck `/presentation`.
