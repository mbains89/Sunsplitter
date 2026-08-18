# Sunsplitter — Shared AI Operating Contract

This file is the canonical cross-provider operating contract for Sunsplitter. It applies to Grok, GPT/Codex, Claude/Fable, Build, Art, and any later agent. A provider-specific bootstrap may point here but must not restate policy.

## Start here

At the start of every session, fetch these files from the same GitHub `main` revision:

1. `/AGENTS.md`
2. `/artifacts/ROADMAP.md`
3. `/artifacts/PROJECT_STATUS.md`
4. `/artifacts/LOCKS.md`
5. Only the specialist documents required by the declared task.

Raw entry points:

- `https://raw.githubusercontent.com/mbains89/Sunsplitter/main/AGENTS.md`
- `https://raw.githubusercontent.com/mbains89/Sunsplitter/main/artifacts/ROADMAP.md`
- `https://raw.githubusercontent.com/mbains89/Sunsplitter/main/artifacts/PROJECT_STATUS.md`
- `https://raw.githubusercontent.com/mbains89/Sunsplitter/main/artifacts/LOCKS.md`

Do not work from a cached, uploaded, project-knowledge, or conversation copy when the GitHub file is accessible. If an interface cannot read the repository, give it the four raw URLs and require it to report their source revision before proceeding.

Open every deliverable with:

`SOURCE main@<sha7> · RUNTIME <sha7> · TASK <id-or-session-type> · MODE <review|proposal|implementation|verification>`

Also state the acting role, the files read, and whether implementation was explicitly authorized. One session has one role and one concern.

## Authority by domain

| Question | Authority |
|---|---|
| What the checked-out game actually does | Code and assets at the pinned runtime revision |
| Process, roles, precedence, startup, and stop rules | `/AGENTS.md` |
| Whether a decision is ruled, gated, held, deferred, rejected, or superseded | `/artifacts/LOCKS.md`, with the full approved language in the cited roadmap section |
| Approved future scope, order, acceptance gates, and milestone definitions | `/artifacts/ROADMAP.md` |
| Current release, active ticket, blockers, latest evidence, and next action | `/artifacts/PROJECT_STATUS.md` |
| Craft execution | The relevant specialist file, subordinate to every authority above |

Lower-authority documents and one-off tickets may add operational detail but may not override a higher authority. If code contradicts a document about shipped behavior, report the mismatch; code remains observed runtime truth until deliberately corrected. If ROADMAP and STATUS disagree about what comes next, ROADMAP wins. If they disagree about what has shipped or is active, STATUS wins. Never infer that a roadmap gate is closed from implementation alone.

## Roles and change authority

- **Manraj** is owner and final approval authority. Only Manraj approves product, canon, commercial, and unresolved decision gates.
- **Grok / program office** is lock steward. Grok records approved dispositions, sequences work, and dispatches bounded tickets. Grok does not self-approve an unresolved decision.
- **Fable / Claude** proposes narrative design, drafts prose, and performs independent voice, causality, and art-honesty review. Fable does not rule locks or certify its own implementation.
- **Build / GPT-Codex** implements only dispatched scope, validates exact bytes, publishes branches and PRs, and returns evidence. Build does not invent canon, silently widen scope, or close a gate.
- **Art** works only from locked requests and the current art rules. Art output is not wired until identity, framing, content, and roster honesty are verified.

Only Grok, carrying Manraj's explicit decision, may change this contract or the lock ledger's dispositions. Build may land those exact approved document changes through the repository workflow. ROADMAP changes require Manraj approval recorded by Grok. Build may update STATUS during an authorized close-out using verified evidence.

## Baseline and stop rule

`PROJECT_STATUS.md` records a `runtime_baseline_sha`. It must be an ancestor of the session's `main` HEAD.

Proceed when every commit after that runtime baseline changes only documentation (`artifacts/**`, `README.md`, or root Markdown other than `AGENTS.md`), and report the documentation delta in the provenance line.

Stop and report before design, implementation, or art when any of these is true:

- the recorded runtime baseline is not an ancestor of `main`;
- an intervening commit changes `src/**`, `css/**`, `images/**`, `index.html`, `VERSION.md`, `netlify.toml`, `scripts/**`, or `.github/**` without a reconciled STATUS or a ticket explicitly pinned to the newer revision;
- `AGENTS.md`, ROADMAP, LOCKS, a required specialist document, or the task source changed after dispatch and has not been reread;
- the task depends on an unresolved `DECISION_GATE` or contradicts a ruled/held/rejected disposition;
- required source, art, validation evidence, or authority files cannot be fetched from one revision;
- implementation was not explicitly authorized.

A documentation-only HEAD delta is not, by itself, a stop. Name it and continue.

## Permanent execution constraints

ROADMAP §2 contains the full approved product, canon, architecture, state, UI, art, and release locks. The following execution rules are always enforced:

- No new named permanent crew, meters, inventory, crafting, skill tree, HUD dashboard, quest log, backend, account system, framework, or bundler without a new approved lock.
- Scene objects use only the current declarative schema and existing engine helpers. Do not invent scene fields, state namespaces, flags, or choice hooks. Treat `src/state.js` at the pinned runtime revision as the state-key inventory.
- Death writes use the engine's death helper in scene entry with an authored cause. Dead or unrecovered characters never speak, appear, vote, pair, or contribute effects.
- Consequences are never labeled as morality or success scores. Contested lore stays plural. The Commander remains faceless. Adult content is not silently softened.
- Every changed scene declares entry preconditions, state writes, death exposure, dead-speech/appearance checks, and image status. Every rendered choice must remain affordable and every reachable branch must have an exit.

When a specialist document repeats a shared rule, this contract and the roadmap control. Correct the specialist document through an approved documentation ticket; do not work around the conflict.

## Repository workflow

The authority-bootstrap PR defined by ROADMAP is the sole exception to the version-branch sequence and changes documentation only. After it merges:

- create `version/<semver>` from the exact predecessor;
- use one-concern ticket branches and PRs into that version branch;
- merge ticket PRs with merge commits;
- use one consolidated close-out PR from the version branch to `main`;
- never push directly to `main` or use per-file API commits as a publishing workflow;
- never treat a local ZIP, marker-string check, or branch label as proof of deployed bytes.

Verification and release claims must be tied to an exact commit and the evidence required by ROADMAP. If required verifier/simulator tooling is absent, record `NOT_AVAILABLE`; do not manufacture a pass.

## Return contract

Return only the artifact or finding requested, plus:

1. exact source/runtime revisions;
2. files changed or inspected;
3. validation commands and results;
4. unresolved locks and blockers by stable `L-###` id;
5. exactly one next action naming its actor.

Fable deliverables end with `GROK LOCKS REQUESTED`, `BUILD QUESTIONS`, and `ASSUMPTIONS`. Build close-outs include the PR/commit, changed-file list, validation evidence, and any claim that was not verifiable. No agent may hide an assumption inside a completion claim.
