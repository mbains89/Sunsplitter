# Sunsplitter — Roadmap to 1.0: OpenAI and Grok builders

`SOURCE main@8d23109b · RUNTIME 5a17d633 · TASK ASTRA-ROADMAP-SPLIT-SUN-01 · MODE proposal`

**Acting role:** Astra roadmap planner. Manraj's 2026-10-08 Game Dev request explicitly authorizes this roadmap-only rewrite and a draft PR; it does not dispatch the implementation below. **Read:** live lane ROADMAP, AGENTS, PROJECT_STATUS, LOCKS, version lock, ticket queue, progress, relevant runtime and review documents, open PRs, and Grok draft [#436](https://github.com/mbains89/Sunsplitter/pull/436) including its six briefs.

**Pinned sources:** `main@8d23109b63b844e0703fb36643f14b91b8800c90`; write lane `version/0.30.1-main-reconcile-ci.1@5a17d633d799dc54487e7b16127e8049969db5cd`; #436 head `ab18b42203a32455e4778bbc1b374f950dcf1acf`. “Lane” means that existing version branch, not a branch literally named `lane`.

**Unchanged release posture:** `lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 PAINT`. Existing `VERSION.md` paint is 0.36; it is not a PC-readiness pass. No version is minted by this roadmap. No code, tests, status, feeds, or version files change in this proposal. The only companion edit updates the ROADMAP digest in `LOCKS.md`; no lock disposition changes.

## 1. Authority and change-control law

- Manraj remains final product, canon, commercial, and release authority; Grok records owner-approved dispositions. This is a proposal under L-042, not a self-approved lock or implementation dispatch.
- `AGENTS.md` controls process; `LOCKS.md` controls dispositions; this roadmap controls proposed future scope and acceptance; `PROJECT_STATUS.md` records current/shipped state. Exact Git bytes and current PR evidence expose stale activity pointers without silently awarding release credit.
- Every deliverable declares `SOURCE main@<sha7> · RUNTIME <sha7> · TASK <id> · MODE <review|proposal|implementation|verification>`, acting role, files read, and whether implementation is authorized. Stop if required authority or named revisions cannot be read; do not substitute memory.
- Every dispatch rereads the live lane, locks, affected code, and open PRs; pins one SHA; names one writer and a bounded touch list. Historical receipts are evidence, not permission to remint spent tickets.
- Work targets the named version lane. Leave PR 45 and draft PR 46 untouched. No direct `main` writes, close-out, certification, tag, Release, or deployment under this job. **No Netlify actions or planning.** A GitHub Pages playtest build may be proposed only with an owner-named candidate; this document launches none.
- **OBSERVED** means present at a pinned revision. **LANDED ON VERSION LANE** means integrated candidate bytes, not shipped or certified. **SHIPPED** requires `main` plus STATUS; **RELEASED** requires an immutable tag and GitHub Release at an exact commit with an artifact digest; **DEPLOYED** requires a deployment record tied to that released commit and digest. A green check alone proves none of these.
- **LOCKED** means approved scope subject to entry gates; **DECISION GATE** needs the named owner choice; **CANDIDATE** is not promised; **HUNCH** needs reproduction; **HELD/DEFERRED/OUT/REJECTED** retain their ledger meanings.
- Existing jobs keep their owners (§3). Version and step IDs below are roadmap prose, not minted product versions or permission to launch tickets. Any scope beyond the cited roadmap, repo documents, or #436 is **proposal — owner yes** before it enters a dispatch.


## 2. Permanent product, canon, and implementation locks

These rules survive every version unless Manraj explicitly reopens one and Grok records the disposition.

### Product and canon

- Sunsplitter is a short, grim narrative-survival browser game. The player commands a damaged colonization ark after Earth's sudden cascade.
- The ship is a full O'Neill cylinder. Interior art uses rectangular rooms, bays, and straight corridors; no curved-ring interior architecture.
- Named non-player cast is exactly nine: Lena, Elias, Mira, Tomas, Amara, Jiro, Sela, Rourke, and Vess. Rourke dies early; Vess arrives later. No permanent character may be added.
- **Commander identity (L-025, Option B):** player-shaped, second person, faceless, no portrait, gender assignment, or identity system. Reproductive facts are handled deliberately.
- Constants do not drift: `04:19:07`, Tube 3, 214 berths, change orders 4417/4491, 61/19/42 systems, manifest tiers 1–4, nine through the hatch, spoken embryo residue **one hundred forty thousand and six**, and ship name `Sunsplitter`. HUD `embryos` remains a 0–100 pressure meter, not a headcount. Named line remains E-6103 Noor, Jakarta.
- Earth departure remains a colonization mission overtaken by a sudden cascade measured in hours to roughly two days. The official account appears first; contested truths remain plural.
- Fixed event order is an accepted pre-1.0 limitation, not an open replayability defect.

### Causality and consequence truth

- Resources must gate, kill, or produce an authored consequence. No silent clamps, decorative costs, phantom credits, or unpaid advertised costs.
- Every rendered scene leaves at least one legal enabled exit. A resource gate may not hard-softlock the run.
- Dead or unrecovered characters never speak, act, appear as present, vote, pair, contribute effects, or receive present-tense credit.
- Endings and reflections cite only facts from the current run. No counterfactual, score, moral grade, or invented betrayal.
- Full survival after the opening remains possible, though not necessarily easy or common.
- Delayed consequences cite their cause diegetically when they land.
- Immediate advertised costs and unmet requirements may be shown honestly. Future narrative consequences are never labeled as “important” or scored.
- Future versus Living remains the central ideological tension; leadership and ideology remain separable.

### Romance and adult-content locks

- Romanceable women are Lena, Mira, Amara, Sela, and Vess.
- If alive, eligible, and not declined, she initiates; the player must explicitly reject. First offers have no affinity/trust hard gate.
- Acceptance creates relationship debt and scarce private attention through existing state, not a visible system.
- Sela is fully adult, age 20, with legible high-trust boundaries. Vess remains shorter, uses a different currency, stays asymmetric, and retains power.
- Adult and explicit content is permanent. Distribution constraints do not silently soften canon.
- No exclusivity meter, jealousy system, morality bar, romance score, or relationship dashboard.
- A breast-cover/explicit-content toggle is **HELD** and requires a separate canon, asset, continuity, platform, and QA decision.

### Architecture and data shape

- Pure static site: HTML, CSS, and JavaScript; no backend or required build step.
- Scenes remain pure data registered through JavaScript globals. A scene contains only `text | choices | onEnter | image` plus its registration key.
- `onEnter` is the scene-level write hook. Rendering is side-effect-free.
- The engine stays thin. No TypeScript, framework, bundler, component rewrite, or engine/state mechanical split before 1.0.
- No combat loop, mining, inventory, crafting, quest log, skill tree, visible gameplay dashboard, or new management system.
- New state keys require a recorded lock and same-change registry/schema coverage. Never invent keys speculatively.
- Every changed scene declares live preconditions, exhaustive writes, death exposure, dead-speech/appearance checks, and image status.

### UI and save model

- Mobile-first remains the primary composition through 0.35. PC at 0.36 is a second composition of the same build, not a port.
- Art stays pinned while scene text scrolls below or beside it according to active composition.
- Choices remain stacked, legible, and touch/keyboard safe. There is no platform-specific story branch.
- Primary interface is scene text, context, choices, and minimal utilities—not a conventional HUD, dashboard, notification layer, or quest surface.
- Disabled choices disclose an honest reason. They do not disappear in ways that falsify cost or causality.
- Autosave/Continue discloses enough metadata to earn trust without exposing hidden consequence state.
- Saves remain local and account-free through 1.0. Cloud saves are out.

### Art and presentation

- Official character identity is the CURRENT Batch A/tank-top portrait set plus verified locked bytes.
- **L-029:** `images/vess.jpg` is Vess's sole official face; downstream plates must match it. Discarded porcelain/Commander-face plates are not identity-valid.
- **L-030:** Mira has ice-blue irises, dark-brown hair in a messy bun, olive/tan clean skin, and no Amara-style freckles.
- Plate ratio remains 784×1168. No baked names, ship names, production labels, system copy, or ending text.
- Commander depictions are hands, back view, or silhouette only.
- Group plates default roster-ambiguous; at most two identifiable faces unless exact living-roster preconditions make more honest. Unrecovered is treated as dead.
- Lethal plates show the pre-commitment choice; recovery plates carry the cost, not rescue warmth.
- Reuse/rewire is preferred to generation. No art volume before the corresponding scene is written, gated, and version-locked.
- Art is approved in target mobile/desktop composition, not as an isolated full-size image.
- Generation is bounded: one request card and one job per reference; verify references and hashes; generate four bases; triage; allow at most two controlled edits; restart rather than endlessly mutate. Default output budget is six.
- Before wiring, perform identity, lighting, crop, mobile-legibility, roster-honesty, rectangular-interior, and moderation-line QA.
- **ART-R2 remains HELD.** No art-identity audit batch, regen, unwire, or new wiring campaign until Manraj opens that gate.

### Cascade and voice locks

- The cascade background spine and its five contested lanes remain plural forever. Artifacts corroborate; no scene or ending proves or collapses a lane.
- Mira's change orders and Jiro's contingency file are independent projections-lane artifacts and are never presented as mutual confirmation.
- Rourke's missing account remains load-bearing absence. Do not author it after death.
- The Commander's boarding remains unspecified.
- Ensemble reflex ownership remains: Lena—who is hurt; Elias—the threat; Mira—what is broken; Jiro—where are we; Vess—what is out there; Tomas—who pays; Amara—who is owed; Sela—what it means.
- Minted phrase ownership is durable: Sela's “I am the hand-off.” and Elias's “Standing question.” are spent; Tomas's “People were tier four.” remains reserved for a late Living-aligned reckoning or ending unless a later lock says otherwise.

---

## 3. Current state and In flight

At the pinned lane, 0.30.1–0.35 drains are recorded closed and must not be reopened. The current work is to finish evidence for 0.36, then follow 0.37 → 0.38 → 0.39 → 0.40 → 1.0. No sequential certification is claimed; last certified remains 0.28.1d.

`PROJECT_STATUS.md` and `docs/TICKET_QUEUE.md` still point at `e14ca7d2`; the old roadmap mixes `c3626434` and `685d400`; `PROGRESS.md` still says Button States has no PR. These are stale activity snapshots. Live evidence shows Button States **#435 merged**, Gerald II **#442 merged**, and Window Resize **#444 merged** at the current lane. #441 and #439 are closed unmerged; do not recreate them. #435 changed `css/intro-nav.css` and `css/crew-sheet.css`; #444 added `css/pc-viewport.css` and its harness. Their old blanket reservation of `css/style.css` has ended. Integration is evidence to verify, not a milestone exit.

### In flight — preserve the current owners

| Work | Current owner, unchanged | Files/areas reserved and next dependency |
|---|---|---|
| [#437 Crew-plate F07](https://github.com/mbains89/Sunsplitter/pull/437) | Existing builder / Ori; model not recorded | `src/hitl-unshadow.js`, `scripts/hitl-unshadow-checks.mjs`; Escape/class-flip close work beyond #433. Preserve this distinct job despite stale “F07 satisfied” notes; Myth review and existing PR checks remain with its owner. |
| [#438 Bug Hunt](https://github.com/mbains89/Sunsplitter/pull/438) | Existing builder / Ori | `src/engine.js`, `src/scenes-17.js`, `src/scenes-26.js`, `src/scenes-27.js`, `src/scenes-40.js`, `scripts/sun-bughunt-01-checks.mjs`; wait for disposition before overlapping state-truth work. |
| [#440 Repo guards](https://github.com/mbains89/Sunsplitter/pull/440) | Existing builder / Ori | `scripts/guards/**`, `.github/workflows/repo-guards.yml`; no competing guard implementation. |
| [#443 Seeded stress](https://github.com/mbains89/Sunsplitter/pull/443) | Astra Build; separate Sol review; Hex review next | `scripts/sun-stress-run.mjs`, `scripts/sun-stress/**`, `.github/workflows/sun-stress.yml`; draft head `1abe1e5f` incorporates current lane and has a passing `sun-stress` check. Its body still describes the older #442 blockage; do not create a second repair from that stale text. |
| [#436 Roadmap and six briefs](https://github.com/mbains89/Sunsplitter/pull/436) | Existing Grok draft owner | Comparison input only. Its branch, `artifacts/feeds/*`, and `PROGRESS.md` remain untouched. This is a separate alternative proposal, not a takeover of that branch. |
| 0.37 review-build packet | Existing assigned owner; person/model not recorded | Existing `artifacts/SUN_V037_*` and `docs/SUN_V037_EXTERNAL_REVIEW_PLAN_01.md`. #436 reports owner-assigned execution in flight; lane STATUS/queue say PARKED. Confirm that dispatch with its owner, preserve ownership, and do not create a second packet or infer OPEN. |

Open PRs #297, #304, #374, #389, #390, and #407 are not fresh dispatches. Preserve their holds; #297/#407 must not merge, and #304 is not an automatic vehicle for footer cleanup. #437/#438/#440 have version-route policy failures at this snapshot; their owners retain those PRs. “Open” is neither active authority nor permission to reassign.

## 4. Builder roadmap and dependency spine

**OPENAI:** Astra in Codex web, GPT-6 Astra, **Astra High**; PRs cross-reviewed by **GPT-6.1 Sol**. Use for repeated execution, input behavior, save safety, real browser/device checks, simulations, rendered-state tracing, and multi-file engine work with tests.

**GROK:** chats in grok.com projects, **Grok Expert** by default; **Grok Heavy** for a large, fully specified multi-file presentation job. **Never Fast/Auto.** Use for bounded labels, displays from an already-proven data source, docs, approved art wiring, and narrow presentation fixes. A Grok row never grants a new state rule or hidden-data disclosure.

Every potentially existing feature is **verify first → NO_PR if satisfied**. Record the exact SHA and proof; implementation presence, a receipt, or a literal-string harness alone is not behavioral proof. Repair only a reproduced gap in a later bounded dispatch. Existing in-flight work is not counted as a new assignment.

**Gate column:** `Myth` for art/scene changes; `Hex sims` for balance; `none` means neither specialist gate applies, not that tests, dependencies, owner approval, or release holds disappear. Any conditional scene edit adds Myth; any conditional balance edit adds Hex sims and the ±20% cap. If both apply, obtain both. All later milestones remain gated by their entry/exit criteria (§§10–13).

### 0.36 — PC Readiness

| Version / ID | One-line player-facing goal | Builder | Mode | Why | Files / areas | Gate | Depends-on |
|---|---|---|---|---|---|---|---|
| 0.36 / SUN-36-A INPUT | Finish the same story by keyboard without accidental choices or trapped dialogs. | OPENAI | Astra High | Key dispatch, focus, and modal interactions need repeatable full-stack execution. | `src/engine.js`, `src/validate.js`, `src/dialog-keys.js`, `index.html`; existing keyboard/dialog/new-run checks | none | #438 disposition for engine access; #435/#444 landed; verify first → NO_PR if satisfied |
| 0.36 / SUN-36-B SAVE | Cancel New run safely and export/import or resume the intended local run. | OPENAI | Astra High | Destructive confirmation and restore failures require persistence and rejection-path tests. | `src/engine.js`, `src/validate.js`, `index.html`; existing save/new-run/import checks | none | SUN-36-A; #438 disposition; verify first → NO_PR if satisfied |
| 0.36 / SUN-36-C TRUTH | See costs, crew, saved-run details, and ending facts that match this run. | OPENAI | Astra High | Display truth must be traced back to saved/live state, not inferred from labels. | `src/engine.js`, `src/state.js` read contract, existing crew/ending/choice checks; scene edits only if a reproduced finding names them | Myth if scene changes; otherwise none | SUN-36-B; #438 disposition and #443 evidence; verify first → NO_PR if satisfied |
| 0.36 / SUN-36-D ENDING | Skip the ending cinematic safely and leave optional What Remains through truthful actions. | OPENAI | Astra High | Cinematic completion, optional reflection, and restart are different state transitions. | `src/engine.js`, `src/validate.js`, `index.html`; cinematic and What Remains behavior checks | none | SUN-36-C; preserve Muse/HITL ownership of parked ending art; verify first → NO_PR if satisfied |
| 0.36 / SUN-36-E COPY | Understand New run, local saves, ending actions, and existing disabled reasons at a glance. | GROK | Grok Expert | Copy can be narrowly specified after behavior and data sources are proven. | Existing `index.html` labels and exact message literals in `src/engine.js` / `src/validate.js`; no new handlers or overlays by default | none | SUN-36-D supplies approved action/data contract; verify first → NO_PR if satisfied |
| 0.36 / SUN-36-F CHROME | Read clear focus/button states and reachable controls without production clutter. | GROK | Grok Expert | Bounded CSS and labels are presentation work with an explicit target. | `css/style.css`, `css/intro-nav.css`, `css/crew-sheet.css`; existing footer marker contract | none | #435/#444 landed; no #304 remint; retain 48px touch floor; verify first → NO_PR if satisfied |
| 0.36 / SUN-36-G DEVICES | Keep choices reachable through desktop resize, zoom, fullscreen, and phone use. | OPENAI | Astra High | CSS markers do not prove actual geometry, focus, storage, or device behavior. | `css/pc-viewport.css` and other layout files only for reproduced defects; existing browser/viewport checks and evidence report | none | SUN-36-A–F complete or NO_PR; #437 disposition; same-build private package; verify first → NO_PR if satisfied |

**Scope corrections to #436:** The keyboard area includes both `engine.js` and the overriding behavior in `validate.js`; do not promise an isolated new `pc-choice-keys.js` overlay or add arrow navigation by assumption. Preserve the approved number-key and Enter/Space contract and test focused enabled controls, key repeat, text inputs, and modal swallowing. **Ending cinematic Skip goes to the ending screen**; it does not skip the ending facts or What Remains. What Remains currently offers **Return to ending** and **Play Again**; do not invent a new Skip destination. SUN-36-E only labels the behavior proven by SUN-36-D. Export/import already exist, including rejection reasons: SUN-36-B verifies them; SUN-36-E is copy/discoverability only. Existing disabled resource reasons remain truthful; hidden dead/unrecovered options must not become visible spoilers. Existing 48px touch targets must not be reduced to #436's proposed 44px.

**Exit:** a complete keyboard-only run, mouse/touch sanity, visible focus order and distinct states, actual resize/zoom/fullscreen measurements (including 1280×720 and 1920×1080), relevant browser coverage, and phone regression checks at one exact candidate. Record real-device/browser/OS and limitations; headless or string checks do not stand in for a human/device pass. No new PC ruleset, story, settings system, native wrapper, or version paint.

### 0.37 — External Review Pilot

| Version / ID | One-line player-facing goal | Builder | Mode | Why | Files / areas | Gate | Depends-on |
|---|---|---|---|---|---|---|---|
| 0.37 / SUN-37-A CANDIDATE | Give reviewers one reproducible private build that opens, saves, and finishes. | OPENAI | Astra High | Packaging identity and start-to-ending probes need executable proof. | Existing package tooling, verifier/simulator and #443 harness when available; candidate manifest/digest; use current review packet read-only | none | 0.36 exit; existing review-build owner releases any overlapping scope; Manraj names candidate and reviewers |
| 0.37 / SUN-37-B INTAKE | Have each reported problem retain its scene, device, reproduction, and severity. | GROK | Grok Expert | Structured evidence transcription is a bounded documentation task. | Finding report derived from existing `artifacts/SUN_V037_*` templates; no duplicate packet or outreach | none | SUN-37-A; two independent human reports; existing packet owner's handoff |
| 0.37 / SUN-37-C REPAIR | Finish without reported save loss, softlocks, unpaid costs, or false endings. | OPENAI | Astra High | Reproduction and exact-candidate retesting must close each correctness finding. | Only owner-ranked affected files and targeted regression checks; reuse stress/probe tooling | Myth if art/scene changes; Hex sims if balance; otherwise none | SUN-37-B; named repair dispatch; rerun review blockers on repaired candidate |

The builders prepare and verify; they do not impersonate the two independent strangers or send invitations without a named owner dispatch. #443's internal stress evidence is useful but is not outside review. P0 must be fixed and retested before proceeding; no “owner-deferred P0” shortcut. First-run/save P1 remains blocking for 1.0 (§10).

### 0.38 — Player Validation Cohort

| Version / ID | One-line player-facing goal | Builder | Mode | Why | Files / areas | Gate | Depends-on |
|---|---|---|---|---|---|---|---|
| 0.38 / SUN-38-A PROTOCOL | Have player feedback judged against agreed stop/continue rules. | GROK | Grok Expert | Pre-registering an owner-approved protocol is documentation work. | Existing cohort/threshold planning documents; no runtime or telemetry system | none | 0.37 exit; Manraj approves cohort and thresholds before results are read |
| 0.38 / SUN-38-B MATRIX | Play the same frozen build reliably on phone and desktop. | OPENAI | Astra High | Device, accessibility, and performance claims require actual repeated runs. | Existing browser/device harnesses and cohort evidence; same candidate SHA on both platforms | none | SUN-38-A; named human cohort execution; no invented OPEN 0.38 |
| 0.38 / SUN-38-C FINDINGS | Have crashes and access barriers separated from taste and market notes. | GROK | Grok Expert | Classifying sourced reports need not alter story or engine. | Cohort finding report and owner decision record | none | SUN-38-B and human reports; compare with pre-registered thresholds |
| 0.38 / SUN-38-D BALANCE | Keep honest choices and reachable outcomes when evidence warrants a balance repair. | OPENAI | Astra High | Outcome changes require reproducible before/after policy simulations. | Only owner-named existing cost/threshold fields and simulation fixtures; no new system or event shuffle | Hex sims; Myth if scene changes | SUN-38-C identifies a real imbalance; owner opens bounded change; ±20% maximum per tuned value; NO_PR without a finding |

No automatic rebalance: retain full survival after the opening, every-scene enabled exit, paid costs, and truthful consequences. Compare random/cheapest/priciest outcomes and relevant targeted paths before/after; do not chase symmetry or compound small edits to evade the ±20% limit. Larger changes are **proposal — owner yes**, outside this capped program.

### 0.39 — Commercial Readiness

| Version / ID | One-line player-facing goal | Builder | Mode | Why | Files / areas | Gate | Depends-on |
|---|---|---|---|---|---|---|---|
| 0.39 / SUN-39-A RIGHTS | Receive a package with accurate asset, font, code, and license notices. | GROK | Grok Expert | A sourced rights inventory is documentation, with unresolved rights left to owner. | Existing asset/license inventory, notices and commercial records; bytes read-only | none | 0.38 owner go/wait/stay-private decision; verify first → NO_PR if satisfied |
| 0.39 / SUN-39-B DISCLOSURES | Know the adult content, AI use, and current storefront conditions before purchase. | GROK | Grok Expert | Explicit descriptors and current-policy citations can follow an approved copy brief. | Adult/AI/content disclosure and platform-policy documents | none | 0.38 decision; submission-time itch.io policy recheck; owner approves final wording |
| 0.39 / SUN-39-C STORE | Read store, privacy, and support copy that describes the actual candidate. | GROK | Grok Expert | Final copy is bounded by verified features and owner business decisions. | Store/privacy/support drafts; approved build facts, no runtime edits | none | SUN-39-A/B; owner decides price, tax/business setup, support posture and messaging |
| 0.39 / SUN-39-D ART | See only approved, truthful cover/page art in the commercial presentation. | GROK | Grok Heavy | A specified multi-file art-wire job suits Heavy once assets and mapping are approved. | Named existing cover/page assets, presentation mapping and art manifest only; no portrait invention | Myth | SUN-39-C; owner-approved exact assets/spec and named art opening; NO_PR if already satisfied; ART-R2 stays held |

itch.io remains the primary direction, subject to current policy and rights checks. These are readiness drafts, not a public storefront launch. Steam remains post-1.0. Any new scene or portrait concept is **proposal — owner yes** and is not authorized by SUN-39-D.

### 0.40 — Launch Rehearsal / Release Candidate

| Version / ID | One-line player-facing goal | Builder | Mode | Why | Files / areas | Gate | Depends-on |
|---|---|---|---|---|---|---|---|
| 0.40 / SUN-40-A FREEZE | Install the same complete private candidate every time. | OPENAI | Astra High | Repeatable packaging, inventory, digest, and strict checks establish exact bytes. | Existing package scripts/allowlist, release manifest and candidate verifier/simulator | none | 0.39 readiness; candidate freeze; all required art/scene gates cleared |
| 0.40 / SUN-40-B MIGRATION | Resume supported older local saves and reject incompatible files without loss. | OPENAI | Astra High | Restore/migration and failure isolation require multiple save fixtures and browsers. | Existing save/import code only if a defect is proven; save fixtures and targeted checks | none | SUN-40-A exact RC and compatibility contract; verify first → NO_PR if satisfied |
| 0.40 / SUN-40-C RUNBOOK | Get clear known-issue, support, reinstall, and recovery instructions. | GROK | Grok Expert | A runbook can be written from the verified candidate and approved support policy. | Release/rollback/known-issues documents; frozen artifact identity read-only | none | SUN-40-A identity; SUN-39-C copy; final reconciliation after SUN-40-B/D |
| 0.40 / SUN-40-D REHEARSAL | Recover or roll back a private install without losing a valid run. | OPENAI | Astra High | Install, rollback, save, and support instructions must be exercised on exact bytes. | Private package, existing validation tooling, rehearsal evidence; runbook read-only during execution | none | SUN-40-B; SUN-40-C draft frozen; rerun strict candidate checks after any repair |

SUN-40-C finalizes the report only after SUN-40-D returns evidence; that finalization changes documents, not the frozen game. Rehearsal creates no tag, Release, deployment, or publication authority. Missing real-device evidence is NOT_AVAILABLE and remains an open gate.

### 1.0 — Public Release

| Version / ID | One-line player-facing goal | Builder | Mode | Why | Files / areas | Gate | Depends-on |
|---|---|---|---|---|---|---|---|
| 1.0 / SUN-100-A RELEASE | Start, save, resume, and finish the exact release on phone or PC. | OPENAI | Astra High | Release identity and any authorized main close-out need exact-revision reruns. | Consolidated release verification, artifact/digest records and existing release process; code only through separate defect tickets | none | 0.40 exit including final runbook; no P0 or blocking first-run/save P1; Manraj's separate exact-SHA go/no-go and release/close-out authority |
| 1.0 / SUN-100-B PAGE | Find an honest itch.io page with the approved copy, disclosures, and art. | GROK | Grok Expert | Publishing an approved presentation is a narrow, specified task. | Approved storefront text, descriptors, and asset mapping; no new art or runtime work | Myth for art/page composition | SUN-100-A; SUN-39-C/D; Manraj's separate public-page approval |
| 1.0 / SUN-100-C SUPPORT | Know how to get help and which issues remain in the released build. | GROK | Grok Expert | Support and known-issues updates use verified release facts. | Approved support/known-issues/privacy documents and release links | none | SUN-100-A/B and SUN-40-C; owner-approved support channel |

**Builder count:** 25 future steps — **13 OPENAI / 12 GROK**. Counts include conditional/NO_PR steps, exclude historical versions and retained in-flight jobs, and count each ID once. No stage heading is an additional unassigned build ticket.


## 5. L-005 — Truth foundation and simulation invariants

Sections 5–13 preserve the acceptance definitions referenced by LOCKS; they are constraints on §4's assigned steps, not another ticket queue. The historical ten-ticket Truth Hotfix and 0.30.1–0.35 drains stay closed. Ruled L-020–L-024 behavior survives: one-shot Elias→Mira consequence, an enabled affordable exit at every render, preserved early vault priority, retired unused `pair_turn`, and truthful untested-promise treatment.

Historical L-005 boundaries (closed; these are preserved constraints, not additional future builder steps):

| # | Locked ticket boundary | Required outcome |
|---|---|---|
| 1 | Dead-speech/credit batch | Guard or truthfully paraphrase confirmed reachable dead/unrecovered credit. Do not erase memorial/history references. |
| 2 | `quiet_tomas` rewind | Both exits route to `act3_spine_next`. |
| 3 | Cost-gate/softlock class | Every rendered scene has an exit; no mandatory downstream spend without honest affordability. |
| 4 | `vault_priority` clobber | Preserve the early Living/Future/both choice. |
| 5 | `offshift_tomas_r` contract line | Contract-class text renders at most twice. |
| 6 | Lena lingerie asset | Real approved JPEG, not a placeholder. |
| 7 | Vess hair canon | Locked long white-silver hair without changing her route. |
| 8 | `pair_shield_cold` | Reachable exactly once after Mira's lethal path under L-020. |
| 9 | Version identity | `src/state.js` `VERSION` is runtime source; verifier/save/visible/manifest surfaces agree. |
| 10 | `pair_turn` registry | Unused runtime flag removed under L-023. |

| Invariant | Acceptance meaning |
|---|---|
| V1 | No legally reached render has zero enabled exits. |
| V2 | Literal dead/unrecovered name spikes require editorial classification; never a zero gate. |
| V3 | Promise state remains consistent at ending. |
| V4 | Advertised negative costs are affordable and paid; no bypass or double payment. |
| V5 | Ending/reflection agrees with this run. |
| V6 | Promise lifecycle honors approved dead/live untested-holder semantics. |

Strict candidate simulation remains random, cheapest, and priciest with seed `20260817`, 2,000 runs per policy. Bounded ticket smoke is non-certifying. V1, V3, V4, V5 and approved V6 semantics are hard candidate gates; a green model report or a marker check does not close them. Balance edits require Hex's before/after sims and stay within ±20%; observed human evidence must justify the tuning.

## 6. L-006 — Chain-of-custody and systemic-truth foundation

- Pin exact source, runtime, and PR head; one concern per ticket branch and PR. Preserve the full predecessor tree. Never publish through per-file API commits, direct/force-push `main`, or bypass required checks.
- Keep the existing inexpensive ticket checks (`version-release-policy`, `version-lock-ci`, `version-verify`, bounded `version-simulation-smoke`) and relevant targeted regressions. Candidate closure requires the strict matrix; ticket smoke is not a substitute.
- PRs retain evidence, file declarations, and the repository PROOF block. Required checks must pass before any later authorized merge; merge-commit is the integration method, not squash or rebase-merge. This job ends at a draft PR and does not merge.
- Only a separately authorized consolidated version close-out may reach `main`. Rerun strict gates at the exact resulting `main` before any separately authorized immutable tag/Release. Never rewrite historical release identities; artifacts and deployment records must match their SHA and digest.
- Main/version protection, ratchet-only thresholds, and exact-byte release proof survive. Local ZIPs, branch labels, strings, or screenshots alone do not prove released bytes. No certification or publishing authority comes from this document.
- L-024: a dead untested holder remains `made` and is omitted from reflection; never invent betrayal. L-026: zero/one Last Off-Shift remains defensive recovery and preserves `junctionChoice`. L-027: retire `vess_course_lost` and its downstream-course promise, with no new consumer.

## 7. L-007 — Player-experience evidence method

Use the existing PX framework through the assigned steps, without reopening closed implementation packs. PX-1 evidence combines fixed-seed timing with actual first-run/replay reports: elapsed time, beat timestamps, truthful route facts, anonymous run receipt, clarity, remembered choices, fatigue, save trust and replay desire. Separate correctness from experience and rank P0/P1/P2. PX-2's 30–60 minute aspiration remains a hypothesis until measured; no player clock is added.

PX-3 defines an outcome envelope from evidence. Change balance only for dominance, misleading choices, unreachable/vanishing outcomes, or dishonest resource presentation; do not optimize for symmetry. PX-4 audits L-025 Option B without reopening it. PX-5 preserves rank/scarcity/consent/refusal/aftermath honesty, Sela's adult boundaries and Vess's retained power, without a consent meter. PX-6 chronology remains private continuity material, not UI.

PX-7 save trust has existing implementation to verify, not a fresh portability system. PX-8 covers accessibility and real-device performance through SUN-36-G/SUN-38-B; PX-9 audience and distribution evidence informs 0.38–0.39. Internal model predictions do not justify new prose, tutorial, video, economy, or UI scope.

## 8. L-008 — What Remains and evidence-backed density

What Remains remains optional, 3–6 lines, selected by significance rather than append order. Eligible facts are current-run ideology, deaths with authored causes, crisis/vault outcome, one truthful promise state and an optional relational fact. No counterfactuals, moral grade, score or invented betrayal. Existing return/restart controls and their actual transitions are the contract to verify in SUN-36-C/D, before any Grok label work.

Pair residue, debt, pregnancy texture and additional density remain evidence-gated. The six Cascade Allusive beats remain proposals requiring host/voice/live-dead evidence and an owner opening, not an automatic 0.36–0.37 queue.

## 9. L-009 — Packaging and presentation foundation

Preserve completed-save behavior, honest ending actions, one truthful visible version, and removal of production chrome without exposing hidden state. Existing opening, tutorial, Crew details and confirmation controls are observed implementations to verify, not new features to assume missing.

Presentation changes preserve type scale, line length, contrast, touch targets, motion preferences, semantic structure, focus, labels, announcements and revisitable content notice. Video/intro behavior needs skip/pause, captions or equivalent text, reduced-motion fallback, load budget and no autoplay trap. Tutorial behavior stays skippable/replayable and teaches only existing interactions. Crew details may show existing portrait, bio and known status, never numeric affinity/hidden flags or a management system. The explicit-content toggle remains held.

## 10. L-010 — External Review Pilot, executes at 0.37

Entry is the 0.36 evidence exit plus a named owner dispatch. At least two independent strangers, one mobile-primary and one desktop, play the exact same private candidate; they have not seen the code, internal reports, or earlier builds. Record device/browser/build identity. Existing assigned packet work is retained; no duplicate review build or unapproved outreach.

Full start-to-end runs cover first-run clarity, save/resume trust, choices, art/text composition, resource honesty, death continuity, ending specificity, adult-content clarity and replay desire. Findings include severity, scene/UI location, reproduction, device/browser and evidence. Explicit probes cover dead speech, unpaid costs, save loss, softlocks and false ending text.

P0 correctness/save/softlock/false-ending findings must close and be retested. P1 is fixed or explicitly owner-ranked/deferred, but first-run trust and save-integrity P1 blocks 1.0. P2 polish never silently expands into a system. A blocked reviewer run is a finding, not a completed acceptance pass.

## 11. L-011 — PC Readiness, executes at 0.36

PC remains a second composition of the same static browser game. Widescreen plate/prose, desktop type/line length, keyboard play, visible focus/order, number choices and unambiguous Enter/Space share identical scenes, state, saves, consequences, content and endings with phone. Hover, focus, pressed, disabled and selected states remain distinct.

Accept only after start-to-end keyboard play, mouse/touch sanity, fullscreen/resize/zoom, desktop browser coverage, accessibility/performance controls and phone non-regression are proved at the candidate SHA. Previously landed keyboard, widescreen, states and viewport work are inputs, not an automatic exit. No wrapper, gamepad, achievements, cloud saves, PC-only narrative, or separate settings/game system.

## 12. L-012 — Commercial Readiness, executes at 0.39

Enter after 0.38 evidence and owner go/wait/stay-private. itch.io is the primary direction subject to submission-time policy: adult classification, AI disclosure, content descriptors, cover suitability, payment terms and platform rules. Audit fonts, third-party code/assets, licenses and notices. Store copy describes exact bytes honestly; distribution constraints never silently soften canonical adult content.

Manraj decides price, business/tax setup, public messaging, support posture and commercial go/no-go. Rights questions stay open until evidenced; an inventory is not legal approval. Steam remains a separate post-1.0 decision. No storefront is published during readiness work.

## 13. L-013 — Release rehearsal and 1.0 acceptance

0.40 freezes one RC identity from the governed lane and exercises deterministic packaging, inventory/digest, private install, save compatibility/migration, rollback, content descriptors and support. Tag/Release material may be prepared as drafts only when separately requested. Strict verifier/V1–V6 evidence follows §5; exact-main reruns happen only after separately authorized close-out. No rehearsal grants publication authority.

1.0 requires a complete authored arc; strangers can start, save/resume and finish on phone/PC without developer habits; all canon, adult-content, art, architecture, causality, save and outcome locks hold; no P0 remains; blocking first-run/save P1 is fixed and retested; strict gates pass at the exact release identity; approved adult-tagged, AI-disclosed commercial package, store copy, known issues, privacy, support, artifact, digest, tag, GitHub Release and deployment identity agree; Manraj gives final go/no-go. Separate authorization governs performing those release actions; it does not waive the required release identity evidence.

Steam, native wrappers, achievements, gamepad and cloud saves are not requirements. Myth approval for art/scene changes and Hex sims for capped balance changes survive release preparation. Missing evidence is NOT_AVAILABLE, not implied acceptance.


## 14. Stable dispositions and held work

The section numbers cited by `LOCKS.md` remain intact. Their historical version labels do not renumber this program: L-010 executes at 0.37, L-011 at 0.36, L-012 at 0.39, L-013 across 0.40/1.0. No lock disposition changes in this proposal.

| Lock / work | Binding disposition |
|---|---|
| L-025 | LOCKED Option B: player-shaped, second person, faceless; no identity system or portrait. Audit existing rendered facts, do not reopen the choice. |
| L-026 | LOCKED: retain zero/one Last Off-Shift paths as tested defensive save-recovery guards; preserve `junctionChoice`. |
| L-027 | LOCKED: retire `vess_course_lost` and its promised downstream course; do not invent a consumer. |
| L-028 | DEFERRED, default RETIRE: no new-crew indicator unless qualifying mobile-PX evidence meets the pre-registered, Manraj-approved threshold. |
| L-029 / L-030 | Approved Vess/Mira identity law (§2 and full LOCKS language); image presence is not art approval. |
| L-040 | Explicit-content/breast-cover toggle HELD, not accessibility work. |
| L-041 | Pair residue, debt, pregnancy texture remain evidence-gated, not automatic narrative expansion. |
| L-042 | Unrestricted AI roadmap editing REJECTED; owner-requested draft proposal only. |
| L-043 | Engine/state mechanical split DEFERRED until after 1.0 or separate approval. |
| L-044 / L-045 | Native wrapper, gamepad, achievements, cloud saves OUT before 1.0; Steam a separate post-1.0 decision. |
| L-046 / L-047 / L-048 | Fixed event order accepted; conventional dashboard/meters/quest log rejected; V2 literal-name lint is a classified spike detector, never a zero gate. |
| ART-R2 / STORY-SURGERY-R1 / Amara-route | Remain HELD/PARKED. A named observed defect is not an expansion or campaign opening. |
| Ending cinematic leftover 13 | Existing Muse/HITL owner, PARKED; the ending navigation checks do not reassign it or generate art. |
| Damage-cause canon / Cascade Allusive / new narrative density | **proposal — owner yes**; no new canon or scene volume from this split. Keep contested cascade lanes plural and Tomas's reserved phrase unspent. |

Do not remint drained work: #306 embryo sweep (spoken 140,006; HUD 0–100), #307 HITL remap, #326 lethal-resume, #348 Title Continue count, #351 cascade payoff, #433 existing unshadow work, #434 and earlier pointer-only syncs, ADD-KEYS-A, or leftovers 10–12. Preserve the distinct existing #437 job. Opening/tutorial/Crew UI already has implementations; historical candidate wording is not permission to build them again. Do not claim a readiness exit solely because old implementation or planning paper exists.

### Playtest response (post-0.35, pre-0.36)

Historical response scope remains recorded in `artifacts/SUN_PLAYTEST_RESPONSE_PLAN.md`; it is evidence for the named follow-ups above, not a reopened drain. `SUN-ART-BODY-REFERENCE-01` is paper scope, not permission to generate or wire body-reference bytes. The style bible `artifacts/SUN_ART_STYLE_BIBLE.md` must be owner-approved before event/body-reference art chats; do not generate plates in Cursor / Grok Bot. Existing Grok briefs are instructions, not wiring authority. Preserve the existing Muse/HITL owner and parked ending-art scope; ART-R2 broad generation/wiring stays held. Do not mint or open 0.36 from this roadmap or those historical papers: the existing 0.36 PAINT is not a new product opening or certification.

## 15. Parallel map

These pairs are eligible only after their dependencies and current owners' reservations clear. A shared file means serialize, even when two edits look small. Reserve named paths before launch; no simultaneous `engine.js`, `validate.js`, `index.html`, `style.css`, shared verifier entry-point, or receipt edits.

| OPENAI work | GROK work alongside it | Disjoint file boundary and join |
|---|---|---|
| SUN-36-A/B/C/D, one at a time | SUN-36-F CHROME | OPENAI owns runtime/input/save files and targeted checks; GROK owns the three named CSS files only. If runtime proof requires CSS repair, pause and serialize that file. Final integrated browser proof is SUN-36-G. |
| SUN-38-B MATRIX | SUN-39-A RIGHTS preparation only | OPENAI writes device evidence/checks; GROK reads the frozen asset tree and writes only the rights inventory. Preparation earns no 0.39 entry credit; final rights pass awaits the 0.38 decision. |
| SUN-40-B MIGRATION | SUN-40-C RUNBOOK draft | OPENAI owns save code/fixtures/checks; GROK owns release/recovery prose. The RC manifest is read-only to both; reconcile the final runbook after rehearsal. |

SUN-36-E copy follows SUN-36-A–D because it can touch the same runtime literals and `index.html`. SUN-36-G follows all PC edits. Do not run a new art-wire edit alongside #437, a state-truth patch alongside #438, guards alongside #440, or stress/probe edits alongside #443. Review-packet edits stay with the existing 0.37 owner until handed off. Parallel document drafting never starts a held cohort, changes a milestone order, or authorizes publication.

## 16. Dispatch and acceptance

One later dispatch selects one row, rereads the then-live tip, names exact files and current owner, and carries its goal, gate, dependencies, and success proof into the ticket. **verify first → NO_PR if satisfied** applies before creating replacement code or an overlay. Grok copy/art work uses a signed-off behavior/asset specification; unexpected state, save, input, or cross-file engine behavior returns to a separately scoped OPENAI row rather than silently expanding the job. No Fast/Auto.

OPENAI implementation PRs receive GPT-6.1 Sol cross-review. Every runtime claim includes execution evidence at the exact candidate; art/scene changes require Myth, balance changes require Hex sims and stay within ±20%. Missing tooling, human evidence, or an approval is reported honestly; it is not a pass. Preserve source and save compatibility, regression checks, lane locks, and the draft-PR review process. Never weaken tests or identity checks to turn a red check green.

**Next action — Manraj:** review this draft builder split. Existing owners continue only their already-authorized jobs; this prose alone opens no held implementation or release gate.
