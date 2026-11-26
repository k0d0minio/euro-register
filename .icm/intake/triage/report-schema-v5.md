# Report schema v5: the simple view

- complexity: standard
- lane: spine
- source: J's decision in chat, 2026-11-26: "each report still feels like an overload of information. These guys are not techy at all." Spec of J's orchestrating session: `~/euro-register-data/schema-v5.md` (outside the repo).

## Problem

The employees of Euro Register are not technical. The v4 report page shows all the
findings, risks, scores, the tree and the prompts at once. It is too much information.
J chose on 2026-11-26: a simple page first, the details folded, 3 actions at most, each
action as what, why and a prompt to copy.

## Acceptance criteria

- [ ] `pnpm seed <folder> --check` accepts a valid v5 file. It refuses a v4 file, a `simple` block with a bad finding id, an order gap or more than 3 actions.
- [ ] The report page shows, top to bottom: the headline, « Ce qui marche bien », « À faire » with 1 to 3 action cards, « Tes questions », and a closed « Détails techniques ».
- [ ] « Copier le message pour Claude » copies the prompt and shows « Copié » for 2 s. « voir le message » shows the prompt text.
- [ ] « Détails techniques » holds every v4 section. `/equipe` does not change.

## Questions

none
