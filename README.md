# Sunsplitter

Sunsplitter is a short, grim narrative-survival browser game about commanding a damaged colonization ark after Earth's sudden cascade. It is a static HTML/CSS/JavaScript project with no build step, backend, account system, framework, or bundler.

## AI collaborators: start here

Read [`AGENTS.md`](AGENTS.md) before doing any work. It points Grok, GPT/Codex, Claude/Fable, Build, Art, and external reviewers to the same GitHub authority set and defines the required source-revision check.

| Document | Authority |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Process, roles, precedence, startup, and stop rules |
| [`artifacts/ROADMAP.md`](artifacts/ROADMAP.md) | Approved future scope, order, and acceptance gates |
| [`artifacts/PROJECT_STATUS.md`](artifacts/PROJECT_STATUS.md) | Current release, active work, blockers, evidence, and next action |
| [`artifacts/LOCKS.md`](artifacts/LOCKS.md) | Stable decision IDs and current dispositions |

Claude-compatible repository clients also load [`CLAUDE.md`](CLAUDE.md), which imports the canonical contract without duplicating it. Chat-only agents should use the raw GitHub URLs in `AGENTS.md`; do not upload duplicate authority files into provider project knowledge.

## Repository layout

- `index.html` — application shell and ordered script loading
- `css/style.css` — interface and responsive presentation
- `src/state.js` — state model and runtime helpers
- `src/engine.js` — scene engine, rendering, and persistence
- `src/scenes-01.js` through `src/scenes-55.js` — numbered scene registry
- `src/validate.js` — in-browser scene validation
- `images/` — runtime image assets
- `artifacts/` — authority, specialist, audit, and release artifacts
- `VERSION.md` — release label surface

The current runtime baseline, release-label integrity, validation evidence, and blockers are recorded in `artifacts/PROJECT_STATUS.md`. Do not infer them from filenames or stale headers.

## Working agreement

The one-time documentation-only authority bootstrap is defined in ROADMAP. After it lands, implementation follows version branches, one-concern ticket PRs, and a consolidated version close-out PR. Direct or per-file API pushes to `main`, ZIP-as-source workflows, and marker-string deployment checks are retired.

Product constants, canon, milestone sequence, acceptance gates, commercial direction, and the 1.0 definition are intentionally maintained in the roadmap rather than repeated here.
