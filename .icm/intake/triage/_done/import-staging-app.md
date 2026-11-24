# Import the staging app

- complexity: standard
- lane: chore
- source: J, in chat, 2026-11-24: "I think now is the time to open up a pull request and merge this into main". J chose the chore lane on 2026-11-24.

## Problem

The audit app was built in a local staging folder (`_staging/euro-register-app`), with no
remote. This repo has only the blueprint. The app must come into this repo through one pull
request, with its git history.

## Acceptance criteria

- [ ] The 9 commits of the staging folder are in the history of the run's branch.
- [ ] No real employee name, email, finding or secret is in the history (gitleaks is green).
- [ ] CI is green: install, migrations from zero, lint.
- [ ] The preview shows the sign-in page at `/`.

## Questions

none
