# Sunsplitter — Operating Contract

`contract: v2 · adopted 2026-11-05 by Manraj · replaces the Grok/Build/Art multi-bot contract`

This file is the process authority for Sunsplitter: who decides, who writes, how work lands. It applies to every agent and every chat that touches this repository. Provider bootstraps (`CLAUDE.md` and any other) point here and must not restate policy.

## 1. Who decides and who writes

| Role | Who | Decides | Writes |
|---|---|---|---|
| **Owner** | Manraj | Product, canon, art approval, roadmap changes, lock rulings, this contract, and every publish action (merge to `main`, tag, release, deploy, Netlify pin, certification). | Anything. |
| **Lead** | Claude, in the lead chat of the Sunsplitter project | Sequencing, ticket scope, technical design, code review, and whether a PR is ready. Brings open product, canon and art questions to Manraj with a recommendation. | Code, prose, docs, PRs. **Merges ticket PRs into the work branch** once CI is green and the change has been reviewed. Keeps STATUS current. |
| **Myth** | Claude, a helper chat in the project | Nothing final. Reviews and proposes story wording, voice, continuity, canon consistency, and dead/unrecovered-character honesty. | Prose proposals, review reports, and ticket PRs for wording when the lead assigns one. Does not merge. |
| **Hex** | Claude, a helper chat in the project | Nothing final. Runs simulations and balance analysis; proposes numbers. | Sim reports, balance proposals, and ticket PRs for tuning or test harnesses when assigned. Does not merge. |
| **Muse** | Claude, a helper chat in the project | Nothing final. Audits plates for identity, roster, framing and crop honesty; writes art requests and generation prompts. Cannot generate images. | Audit reports, art requests, and ticket PRs that rewire existing in-tree plates when assigned. Does not merge. |

Rules that bind every role:

- One writer per branch. Helpers never push to a branch another chat is working on.
- Helper output reaches the game only through a lead-reviewed PR. A helper report is a proposal, not a decision.
- Chats do not share memory. Coordination happens through the repository (PRs, PR comments, `docs/TICKET_QUEUE.md`) and through docs saved in the Sunsplitter project. Anything a later session must know goes in one of those places.
- The lead does not rule a lock, approve a new art plate, or change canon alone. It proposes, Manraj rules, the lead records.

The Grok program office, Build/GPT-Codex and Art bot lanes are retired as of this contract. Their tickets, receipts and reports stay in the repository as history. Where ROADMAP §1, ROADMAP §17 or LOCKS name Grok as steward or Build as implementer, read **Lead**; this file controls until those sections are rewritten.

## 2. Sources of truth

Highest first. A lower source may add detail but may not override a higher one.

1. **Code and assets at the commit in question** — what the game actually does. If a document disagrees with shipped behavior, report the mismatch; code stays observed truth until deliberately changed.
2. **`AGENTS.md`** — process and roles.
3. **`artifacts/LOCKS.md`** — whether a decision is locked, held, deferred or rejected, with the full language in the cited ROADMAP section.
4. **`artifacts/ROADMAP.md`** — approved scope, order and acceptance gates. If ROADMAP and STATUS disagree about what comes next, ROADMAP wins.
5. **`artifacts/PROJECT_STATUS.md`** — current work branch, what has landed, blockers, next action. If ROADMAP and STATUS disagree about what has landed, STATUS wins.
6. **Specialist documents** (`artifacts/`, `docs/`) — craft detail, subordinate to everything above.

Never infer that a roadmap gate is closed from implementation alone.

## 3. Starting a session

1. Read `AGENTS.md`, `artifacts/PROJECT_STATUS.md` and `artifacts/LOCKS.md` from the work branch STATUS names, plus the ROADMAP section for the current version and any specialist doc the task needs.
2. Note the commit you are working from. If the work branch has moved past what STATUS records, say so and read what changed before building on it.
3. Stop and ask Manraj, rather than guess, when the task depends on an unresolved decision gate, contradicts a locked or rejected disposition, or would need a publish action.

## 4. Branches, PRs and merging

- **Work branch:** `version/0.30.1-main-reconcile-ci.1` until Manraj approves a close-out to `main` or names a new one. STATUS records the current work branch.
- **One concern per ticket.** Branch `ticket/<short-name>` from the current work-branch tip. Open one PR into the work branch.
- **Merge rules:** CI green on every required workflow (`verify`, `sun-playerflow-tests`, `repo-guards`, `release-policy`, and `sun-stress` where it runs), the PR reviewed by the lead, then a **merge commit**. No squash, no rebase-merge, no direct pushes to the work branch or `main`, no force-push to any shared branch.
- **`main`** changes only through a consolidated close-out PR that Manraj approves.
- **Never without Manraj's explicit go:** merge to `main`, tag, GitHub Release, deploy, Netlify pin or repin, certification, public itch page.
- A stale or superseded PR is closed with a one-line reason and a link to whatever replaced it.

## 5. Permanent game rules

ROADMAP §2 holds the full product, canon, architecture, state, UI, art and release locks. These always apply:

- No new named permanent crew, meters, inventory, crafting, skill tree, HUD dashboard, quest log, backend, account system, framework or bundler without a new approved lock.
- Scene objects use only the current declarative schema and existing engine helpers. Do not invent scene fields, state namespaces, flags or choice hooks. `src/state.js` is the state-key inventory.
- Deaths are written with the engine's death helper in scene entry, with an authored cause. Dead or unrecovered characters never speak, appear (in text or in a plate), vote, pair or contribute effects.
- Consequences are never labeled as morality or success scores. Contested lore stays plural. The Commander stays faceless. Adult content is not silently softened.
- Every rendered choice must be affordable or show why it is not, and every reachable branch must have an exit.
- Art is wired only after identity, framing, content and roster honesty are checked against the official portraits. A plate used as a "people-free" fallback must contain no crew faces.
- Do not mix From the Ashes into this repository.

## 6. What a PR must say

The PR body states, in plain words:

1. **What and why** — the player-visible problem and the fix, with the ticket name.
2. **Base** — the work-branch commit the branch started from.
3. **Scene declaration**, when any scene changed: entry preconditions, state writes, death exposure, dead-speech and dead-appearance checks, image status.
4. **Verification** — the commands run and their results, tied to the PR head commit. If a required tool could not run, write `NOT_AVAILABLE` and why; never claim a pass that did not happen.
5. **Files touched** and the `git diff --stat` summary.
6. **Open questions** for Manraj, if any.

`.github/PULL_REQUEST_TEMPLATE.md` carries this shape.

## 7. Keeping STATUS honest

- `artifacts/PROJECT_STATUS.md` is the live page: work branch and tip, what landed since the last update, what is open, blockers, the single next action.
- Update it **in the same PR** as the change that moves the state, or in the close-out of a batch. Do not open PRs that only move status pointers; the `tip-sync-churn` guard rejects them.
- The release posture stays `NO-PUBLISH / NOT_CERTIFIED`, last certified `0.28.1d`, until Manraj says otherwise. CI binds those lines; change them only on his instruction.
- Player-facing version paint lives in `VERSION.md`; the lane lock line lives in `docs/version-lock.md`. Do not invent a second version source.

## 8. Reporting back

Every deliverable, PR or report ends with:

1. the exact commit(s) it was made from or against;
2. files changed or inspected;
3. checks run and their results;
4. decisions still needed, by `L-###` id where one exists;
5. one next action, naming who does it.

Assumptions are stated, never folded into a completion claim.
