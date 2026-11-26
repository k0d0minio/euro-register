# Report schema (version 5)

This file is the contract between the audit sessions and the app.
The code of the contract is `src/lib/report/schema.ts` (zod). When the two files disagree, the code is correct.
Change the two files in the same commit. Increase `REPORT_SCHEMA_VERSION` for a change that is not backward compatible.

Versions: the app reads versions 1 to 5. Write new files in version 5. The seed (`pnpm seed`) accepts only version 5.

- Version 2 adds the section `collaboration` (section 7), and makes it required.
- Version 3 adds `structure` (section 8), `risks` (section 9), `openQuestions` (section 10) and `notes` (section 11). `structure`, `risks` and `openQuestions` are required from version 3. `notes` is optional.
- Version 4 applies J's audit standard of 2026-11-26. It changes the severities to 3 levels (section 5), adds `scores` (section 13), `collaboration.teamOpportunities` (section 7), and limits the actions (section 3). `scores` and `teamOpportunities` are required from version 4.
- Version 5 adds `simple` (section 15), the simple view that the employee reads first (J, 2026-11-26). `simple` is required from version 5.
- The seed refuses a file of version 1 to 4. A report of an earlier version that is already in the database stays valid: the page shows the sections that it has.

## 1. Where the data goes

- Real report files contain names, emails and workspace excerpts. Keep them **outside this repo**. The repo is public.
- Write one JSON file for each employee, in a folder outside the repo (for example `~/euro-register-data/rapports/`).
- Validate the files (no database is necessary):
  `pnpm seed ~/euro-register-data/rapports --check`
- Load the files into Neon (needs `DATABASE_URL` in `.env`):
  `pnpm seed ~/euro-register-data/rapports`
- The seed script refuses a path inside the repo. The only exception is `fixtures/`, which has one invented example: `fixtures/exemple.json` (version 5). `fixtures/anciennes/` keeps a version 3 example, for the page only: the seed refuses it.
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
| `schemaVersion` | number | `4` for a new file. `1`, `2` and `3` are still accepted. |
| `auditDate` | string | ISO date, `YYYY-MM-DD`. |
| `source` | string | What the audit read. Example: "Archive `icm-workspace.zip` (Drive, 24/11/2026)". |
| `summary.headline` | string | One sentence. The page shows it large. |
| `summary.points` | string[] | 1 or more points. Short sentences. |
| `metrics` | object | Section 4. |
| `strengths` | `{title, detail?}[]` | What the employee does well. Can be empty. 3 at most from version 4. |
| `findings` | Finding[] | Section 5. Can be empty. No limit: the list is the record of the audit. |
| `prompts` | Prompt[] | Section 6. Can be empty. 5 at most from version 4, in the order of priority. |
| `nextSteps` | string[] | Can be empty. The page numbers them. 5 at most from version 4. |
| `collaboration` | object | Section 7. Required from `schemaVersion` 2. |
| `structure` | object | Section 8. Required from `schemaVersion` 3. |
| `risks` | Risk[] | Section 9. Required from `schemaVersion` 3. Can be empty. |
| `openQuestions` | Question[] | Section 10. Required from `schemaVersion` 3. Can be empty. |
| `notes` | Note[], optional | Section 11. |
| `scores` | Score[] | Section 13. Required from `schemaVersion` 4. |

The suggestions of a report are in these fields: `findings[].recommendation`, `prompts`, `nextSteps` and `collaboration.opportunities`.

Limits of version 4 (the seed check refuses a file that breaks one): `strengths` 3 at most, `prompts` 5 at most, `nextSteps` 5 at most, `collaboration.opportunities` exactly 1. Drop the extra actions; do not move them to another field.

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
| `severity` | enum | Version 4: `urgent`, `important`, `souhaitable`. Versions 1 to 3: `critique`, `élevé`, `moyen`, `faible` (write the accents). The seed check refuses a value of the other set. |
| `category` | enum | `conventions ICM`, `efficacité tokens`, `cohérence`, `sécurité`. Write the accents and the spaces. |
| `title` | string | One line. |
| `path` | string, optional | The main file or folder, relative to the workspace root. Omit it for a finding about the full workspace. |
| `evidence` | string | The facts: what the audit found, with numbers. |
| `recommendation` | string | What to do. |

The page sorts the findings by severity. The order in the file is not important.

How to select a severity (version 4):

- `urgent`: a secret, personal data that leaves the workspace, or a risk of data loss. Correct it before all other work.
- `important`: a fault that gives wrong output, or a session that already failed because of it.
- `souhaitable`: a break of an ICM rule with a small effect today, form, tidiness. A token-cost finding is `souhaitable`, unless the workspace shows a session that failed because of it (then `important`).

The page shows the severities of versions 1 to 3 with the 3 levels: `critique` → urgent, `élevé` → important, `moyen` and `faible` → souhaitable.

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
| `opportunities` | Opportunity[] | Exchanges to start. Can be empty in versions 2 and 3. Version 4: exactly 1, the best one. |
| `teamOpportunities` | Opportunity[] | Required from version 4. Can be empty. The other opportunities. The report does not show them: the team page `/equipe` shows them. |
| `safeguards` | string[] | The general rules. Use the 5 rules below, in French, and add the rules for this employee. |
| `prompts` | Prompt[] | Same form as section 6. `order` starts at 1 again. Can be empty. Version 4: only the prompts for the 1 opportunity. |

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

## 8. Folder structure (`structure`)

The folder tree of the workspace. The page shows it as a tree that the reader can expand, collapse and filter by path.

| Field | Type | Rule |
|---|---|---|
| `root` | string | The name of the root folder of the archive. Example: `espace-ester`. |
| `summary` | string | 2 to 4 sentences: how the tree is organised, and its main fault. |
| `nodes` | Node[] | 1 or more. |

Node:

| Field | Type | Rule |
|---|---|---|
| `path` | string | Relative to the root, with `/` separators. No `/` at the start or at the end. `""` is the root. Unique in the report. |
| `kind` | enum | `dossier` or `fichier`. |
| `description` | string | What the path holds and what it is for. 1 to 2 sentences. |
| `status` | enum | `ok`, `attention`, `problème`. Write the accent. |
| `findingIds` | string[] | The ids of the findings about this path. Each id must be the id of a finding. Can be empty. |
| `sizeBytes` | integer, optional | Size, in bytes. |
| `chars` | integer, optional | Characters, for a Markdown file. |

Rules for the nodes:

- Give each folder of the workspace one node, to every depth.
- Give a node to each file that has a role: a router (`CLAUDE.md`, `CONTEXT.md`), a stage contract, a reference, a LISEZ-MOI, a prompt, a script, and each file of a finding. Do not give a node to each output file of a run: one node for its folder is enough.
- Skip `.git/`, `node_modules/`, caches and system files (`.DS_Store`, `Thumbs.db`).
- Each parent folder of a node is also a node, with `kind` `dossier`. The seed check refuses a node whose parent has no node.
- Never put the value of a secret in a description. Name the file and the kind of secret.

## 9. Risk

What can go wrong if nothing changes. A finding is a fault seen now. A risk is a consequence.

| Field | Type | Rule |
|---|---|---|
| `id` | string | `R` and 1 to 3 digits. Example: `R1`. Unique in the report. |
| `title` | string | One line. |
| `description` | string | What can occur, and how. |
| `likelihood` | enum | `faible`, `moyen`, `élevé`. |
| `impact` | enum | `faible`, `moyen`, `élevé`. |
| `mitigation` | string | What prevents the risk. |
| `findingIds` | string[] | The ids of the related findings. Each id must be the id of a finding. Can be empty. |

The page shows the risks in a 3 × 3 grid of likelihood × impact, and in a list sorted by likelihood × impact.

## 10. Open question

What the audit could not decide from the workspace alone.

| Field | Type | Rule |
|---|---|---|
| `id` | string | `Q` and 1 to 3 digits. Example: `Q1`. Unique in the report. |
| `question` | string | One sentence. |
| `context` | string | Why it matters, and what the audit saw. |
| `askTo` | enum | `employé`, `J` or `équipe`. Write the accent. |

Who sees a question:

- `employé`: the employee answers it in a short form on their report page (text, 2,000 characters at most). The answers are in the database (table `question_answers`, key: employee and question id). A new seed keeps them. An admin sees the answers on the report page and a count on `/admin`.
- `J`: only an admin sees it, on the report page.
- `équipe`: the team page `/equipe` shows it, for the published reports. The report page of the employee links to it.

Remove each question that J's standard already answers.

## 11. Note (`notes`, optional)

Anything else of note that has no other field: a good idea to share with the team, an odd usage pattern, a tool, a habit.

| Field | Type | Rule |
|---|---|---|
| `title` | string | One line. |
| `detail` | string | The note. |

## 12. Inline format

In all text fields except `prompt`, the page shows two inline formats:

- `` `code` `` for a path or a file name.
- `**bold**` for a key word.

The page shows no other Markdown and no HTML. Line breaks in a text field are not kept: use more list items.

## 13. Score (`scores`, version 4)

One entry for each of the 4 categories of section 5, also a category with no finding. The seed check refuses a missing or a duplicate category.

| Field | Type | Rule |
|---|---|---|
| `category` | enum | One of the 4 categories of section 5. |
| `score` | integer | 1 to 5. 5 = no fault. |
| `reason` | string | One sentence. |

The page shows the scores in the section "Scores", after "Mesures".

## 14. Access

- An employee signs in when their email is in `EMPLOYEE_EMAILS`. They read only their own report, and only when `status` is `published`.
- An admin (email in `ADMIN_EMAILS`) reads all reports, drafts too, and the index `/admin`.
- Each signed-in person reads the deck `/presentation` and the team page `/equipe`. The team page shows only published reports, also to an admin.
- Only the employee of a published report saves answers to its `employé` questions.

## 15. Simple view (`simple`, version 5)

The employees are not technical. The page shows `simple` first, in plain French with no id or code. The full report (sections 3 to 13) is under a closed section « Détails techniques ».

```jsonc
"simple": {
  "headline": "1 or 2 sentences",
  "strengths": ["short line", "..."],
  "actions": [
    { "order": 1, "title": "…", "why": "…", "prompt": "…", "findingIds": ["C1"] }
  ]
}
```

| Field | Type | Rule |
|---|---|---|
| `headline` | string | 1 or 2 sentences. 220 characters at most. |
| `strengths` | string[] | 1 to 3 items. 120 characters at most each. |
| `actions` | Action[] | 1 to 3 items. `order` is 1, 2, 3 with no gap. |
| `actions[].title` | string | What to do, in plain words. 70 characters at most. |
| `actions[].why` | string | One sentence. 200 characters at most. The page shows « Pourquoi : <why> ». |
| `actions[].prompt` | string | The text that the employee pastes into Claude. The button « Copier le message pour Claude » copies it. |
| `actions[].findingIds` | string[] | The findings that the action corrects. Each id must exist in `findings`. The page does not show them. |

The page, top to bottom: the headline, « Ce qui marche bien », « À faire » (one card for each action), « Tes questions » (the `employé` questions), « Détails techniques » (closed).
