# Sunsplitter — Official Enforceable Roadmap

`SOURCE main@8d23109 · RUNTIME 685d400 · TASK SUN-V033-ROADMAP-REBASE-01 · MODE proposal`

**Acting role:** Grok / program office. Planning only.
**Implementation authority:** none. This file is a planning replacement. It authorizes no code, leftover drain, ticket mint, PR, merge, close-out, tag, certify, Netlify, or publication.
**Authority domain:** approved future scope, dependency order, design locks, decision gates, and milestone acceptance criteria.
**Owner:** Manraj.
**Lock steward:** Grok / program office.
**Prepared against GitHub `main`:** `8d23109b63b844e0703fb36643f14b91b8800c90`.
**Candidate planning runtime:** `version/0.30.1-main-reconcile-ci.1@685d40007d5cae12621d88639bbfb1cd6bdaa3be`.
**Player-facing version paint:** `0.33` (PR 98).
**Live preview:** Netlify deploy `6a974ce6083c96103110b960` at https://sunsplitter.netlify.app — preview only, `NOT_CERTIFIED`.
**Release posture:** `NO-PUBLISH / NOT_CERTIFIED`. Last certified baseline label remains `0.28.1d`.

The copy of this file committed on the version lane is authoritative for future scope after owner merge. Candidate-lane facts below are planning evidence, not shipped, released, certified, published, or deployed claims. `PROJECT_STATUS.md` controls current `main` state. Immutable release and deployment evidence control release claims.

Codex numbering is authority. Do not reuse 0.31–0.33 for independent review, PC readiness, or commercial itch. Those definitions execute at 0.37, 0.36, and 0.39.

---

## 1. Authority and change-control law

### Domain authorities

| Question | Authority |
|---|---|
| What is approved next, in what order, and with what exit criteria? | `artifacts/ROADMAP.md` |
| What has actually shipped and what is the active release state? | `artifacts/PROJECT_STATUS.md` |
| What bytes and behavior exist at a revision? | Git at that exact revision |
| What version was released or deployed? | Immutable tag, GitHub Release, artifact digest, and a named deployment record |
| What is character/canon/voice truth? | `CHARACTER_BIBLE.md`, `VOICE_CARDS.md`, `FABLE_BRIEF.md`, and explicitly locked cascade/minted-phrase documents |
| What is art truth? | `ART_RULES.md`, `ART_REQUESTS.md`, the CURRENT portrait manifest, and exact image bytes |
| How is work executed? | `AGENTS.md` and the governed branch/PR law below |

When documents disagree:

1. Code and assets at the pinned runtime are observed behavior; contradictions are reported, not hidden.
2. `PROJECT_STATUS.md` wins for shipped/current `main` state.
3. `ROADMAP.md` wins for approved future scope and order.
4. `LOCKS.md` controls dispositions; this roadmap carries the full approved language.
5. Domain documents control craft detail unless a later recorded lock supersedes them.
6. A newer exact GitHub revision wins over pasted text, memory, a browser observation, or a local ZIP.

### Required session declaration

Every Grok, Fable, Build, Art, GPT, or Claude deliverable begins with:

`SOURCE main@<sha7> · RUNTIME <sha7> · TASK <id-or-session-type> · MODE <review|proposal|implementation|verification>`

It also states role, files read, and whether implementation is authorized. If the named revisions or required authority files cannot be read, stop rather than substitute memory.

### Who may change the roadmap

- Manraj is the only product, canon, commercial, and unresolved-gate approval authority.
- Grok records owner-approved sequence and lock dispositions; Grok does not self-approve.
- Any approved role may draft a roadmap patch. No AI may directly edit `main` or convert its recommendation into a lock.
- Roadmap changes land through one-concern PR review on the version lane. A documentation merge creates no gameplay, release, certification, publication, or deployment credit.
- GitHub issues, PRs, playtest reports, model reports, and screenshots are evidence and execution records, not competing authorities.

### Write and preview law (2026-09-01)

- Write authority is the version lane `version/0.30.1-main-reconcile-ci.1`, not `main`.
- GitHub merge-commit is the default land path for ticket PRs into that lane.
- Do not promote the lane onto `main`. Do not open or merge a version close-out.
- Leave PR 45 and draft PR 46 untouched.
- Do not certify this lane. Last certified remains `0.28.1d`.
- Netlify fires only when Manraj names an exact SHA. No auto-Netlify. The live preview at deploy `6a974ce6083c96103110b960` is not certification and is not a close-out.
- Do not leftover-drain. Closed 0.30.1 / 0.31 / 0.32 work is not reopened as a new queue.
- Playtest bugs Manraj reports during 0.33 stay one-PR tickets on 0.33. They do not mint a new version.

### Status vocabulary

| Label | Meaning |
|---|---|
| **OBSERVED** | Present at an exact revision; no shipped/release claim implied |
| **LANDED ON VERSION LANE** | Merge-committed into the candidate lane; not on `main` and not certified |
| **SHIPPED** | Present on `main` and recorded by STATUS; not automatically released or deployed |
| **RELEASED** | Proven by immutable tag and GitHub Release at an exact commit with artifact digest |
| **DEPLOYED** | Proven by deployment record tied to the released commit and digest |
| **LOCKED** | Owner-approved scope/order; implementation may proceed when entry gates pass |
| **DECISION GATE** | Blocked until the named owner choice is recorded |
| **CANDIDATE** | Worth testing or scoping; not promised scope |
| **HUNCH** | Unconfirmed finding; verify on the current authority before ticketing |
| **HELD** | Deliberately unscheduled; do not implement |
| **DEFERRED** | Valid concern assigned to a later gate or version |
| **OUT** | Excluded before 1.0 |

---

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

## 3. Current authority and source truth

### Controlling revisions

| Surface | Exact state | Meaning |
|---|---|---|
| GitHub `main` | `8d23109b63b844e0703fb36643f14b91b8800c90` | Observed repository authority; not certified |
| Version lane HEAD used for this rebuild | `685d40007d5cae12621d88639bbfb1cd6bdaa3be` | Playtest candidate; player-facing label `0.33` |
| 0.32 Save Trust exit mark | `~7ec5b30` | Owner-accepted 0.32 exit on the lane; not certification |
| Last certified baseline label | `0.28.1d` | Historical certification boundary |
| Live preview | Netlify deploy `6a974ce6083c96103110b960` | Named preview only; `NOT_CERTIFIED` |
| Release posture | `NO-PUBLISH / NOT_CERTIFIED` | No release artifact, tag, publication, or certified deploy |
| Held close-out identities | PR 45 and draft PR 46 | Do not merge, close, or use as release authority |

The version lane has advanced well beyond `main`. Nothing on that lane is **SHIPPED**, **RELEASED**, or **CERTIFIED** under this roadmap's vocabulary.

### Version-lane evidence absorbed (do not reopen as drain)

- **0.30.1 Governed Recovery Integrity:** leftover drain emptied. Still `NOT_CERTIFIED`.
- **0.31 Systemic Truth Closure:** landed on the lane. Remaining C/D items stay hunches, not a queue.
- **0.32 Save Trust and Recovery:** exited ~`7ec5b30`. Early keyboard (PR 84) and widescreen (PR 85) work is evidence for 0.36, not 0.36 closure.
- **0.33 version paint + named playtest:** PR 98 painted the player-facing version to `0.33`. Manraj is playtesting this candidate now. Vess-scene plates were wired on the lane earlier on 2026-09-01.
- Confirmed playtest bugs become one-PR 0.33 tickets. They do not open 0.34 and they do not reopen 0.30.1–0.32.

### Explicitly outside current write authority

- PR 45 / draft PR 46.
- ART-R2 / L-004 art-audit opening.
- Any leftover-drain identity.
- Close-out to `main`, certification, tag, GitHub Release, publication.
- Auto-Netlify or any Netlify action except a SHA Manraj names.
- ET-03 count sweep, issue 24 / REC-02 reopen, and STORY-SURGERY-R1 unless the 0.33 playtest plus owner lock names them.

---

## 4. Locked dependency spine

```text
0.30.1 — Governed Recovery Integrity     DRAIN CLOSED; NOT CERTIFIED
  ↓
0.31 — Systemic Truth Closure            LANDED ON LANE; NOT CERTIFIED
  ↓
0.32 — Save Trust and Recovery           EXITED ~7ec5b30; NOT CERTIFIED
  ↓
0.33 — Named playtest candidate          ACTIVE PLAYTEST; ART-R2 HELD
  ↓
0.34 — Mobile UX, Accessibility, Performance
  ↓
0.35 — Packaging and Private Itch
  ↓
0.36 — PC Readiness
  ↓
0.37 — External Review Pilot
  ↓
0.38 — Player Validation Cohort
  ↓
0.39 — Commercial Readiness
  ↓
0.40 — Launch Rehearsal / Release Candidate
  ↓
1.0 — Public Release
```

Rules of the spine:

- One concern, one ticket branch, one PR into the version lane. Ticket PRs merge with merge commits.
- A milestone advances only when its acceptance evidence exists. Early implementation receives no later milestone credit.
- Hunches stay hunches until reproduced on current bytes.
- Correctness failures found in the 0.33 playtest are repaired on 0.33. They do not become 0.34–0.37 scope.
- Experience findings from the 0.33 playtest are classified before they become a later version slice. Classification happens after the playtest report, not during it.
- Story, art-audit, and gameplay volume cannot jump the ART-R2 hold.
- Mobile/accessibility work cannot be relabeled PC readiness; PC work cannot create a separate game.
- Independent review is 0.37. PC readiness is 0.36. Public/commercial itch is 0.39. Do not reuse 0.31–0.33 for those jobs.
- No milestone authorizes close-out, certification, tag, release, publication, Netlify, itch.io public page, or deployment. Those are separate owner actions at their named gates.

Stable lock identities in `LOCKS.md` keep their section anchors. Historical version labels inside those rows do not override this spine: L-010 executes at 0.37; L-011 at 0.36; L-012 at 0.39; L-013 splits across 0.40 and 1.0.

---

## 5. L-005 — Truth Hotfix foundation

Historical 0.28.2 ten-ticket batch boundary. Not a reopened queue. Current L-020–L-028 dispositions in `LOCKS.md` control.

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

### Simulation invariants

| ID | Meaning |
|---|---|
| V1 | A legally reached render has zero enabled exits / hard softlock |
| V2 | Literal dead-or-unrecovered name/presence spike; classify editorially, not a zero gate |
| V3 | Promise-state integrity failure at ending |
| V4 | Advertised negative cost executes without being affordable and paid |
| V5 | Ending/reflection contradicts the recorded run |
| V6 | Promise lifecycle violates approved dead/live untested-holder semantics |

Strict candidate simulation remains random, cheapest, and priciest at seed `20260817`, 2,000 runs per policy, unless a later owner-approved lock changes it. Ticket smoke is non-certifying. No simulation-green result certifies the lane.

---

## 6. L-006 — Chain-of-custody and systemic-truth foundation

### Repository and release law

- Freeze direct and per-file API writes to `main`.
- Ticket work targets the protected version lane, not `main`.
- PRs begin as drafts and become reviewable only after local transcript, evidence, declarations, and required CI exist.
- Ticket PRs run inexpensive `version-release-policy`, `version-verify`, and bounded `version-simulation-smoke`. They do not claim the strict candidate matrix unless dispatch escalates it.
- Ticket PRs merge with merge commits. A green check is not merge authority.
- The only route to `main` is one consolidated version close-out PR. That close-out is **not authorized** in this planning window.
- Protect `main` and version branches, including administrators: no direct/force push, branch deletion, or required-check bypass.
- Thresholds are ratchet-only.
- Tag only an exact resulting `main` revision as `sun-vX.Y.Z` after a separately authorized close-out. Never rewrite historical tags.
- Production is opt-in and SHA-named. Never deploy a partial version branch as certified.

### Systemic-truth law

- **L-024:** an untested dead holder remains `made` and is omitted from reflection; never invent a betrayal.
- **L-026:** Last Off-Shift zero/one routes remain defensive save-recovery guards and preserve `junctionChoice`.
- **L-027:** `vess_course_lost` and its promised downstream course are retired; do not add a consumer.
- V2 stays a classified spike detector. V1, V3, V4, V5, and approved V6 semantics are hard at candidate closure, which this file does not authorize.

---

## 7. L-007 — Player-experience evidence method

Execution map under the owner-accepted spine:

- PX-7 save trust executed at 0.32 and is exited.
- PX-1 through PX-6 evidence is collected from the 0.33 playtest. It does not automatically become 0.34–0.37 work.
- PX-8 mobile accessibility/performance executes at 0.34; desktop revalidation at 0.36.
- PX-9 audience/distribution completes across 0.38–0.39.

No prose, economy, tutorial, video, or interface expansion is justified merely because an internal model predicts it. First identify an observed problem, classify it, and attach evidence.

### PX-1 — Player Experience Baseline

Fixed-seed automated timing plus real first-run and replay playthroughs. Capture elapsed time, major-beat timestamps, truthful route facts, a copyable anonymous run receipt, and notes on clarity, remembered choices, emotional peaks, fatigue, save trust, and replay desire. Separate correctness from experience. Rank P0/P1/P2.

**Exit:** a ranked evidence report exists; no content was changed merely to add volume.

### PX-2 — Run-Length and Macro-Pacing Target

Use PX-1 evidence to set first-run/replay ranges and beat-spacing. The 30–60 minute aspiration remains a hypothesis until measured. Add no player-facing clock.

### PX-3 — Behavioral Economy and Outcome Envelope

Define acceptable outcome distributions. Change balance only for dominance, misleading choice, impossible/vanishing outcome, or dishonest resource presentation. Do not optimize toward symmetry.

### PX-4 — Commander Identity Implementation Audit

L-025 Option B is not reopened. Audit rendered paths for accidental gendering, portrait drift, and reproductive-fact handling.

### PX-5 — Command Authority and Sexual Power

Audit each romance route for rank, scarcity, consent, initiation, refusal, aftermath, and operational dependency. Preserve adult permanence, Sela's boundaries, and Vess's retained power. No consent meter.

### PX-6 — Voyage Chronology

Private continuity source only. No player-facing chronology UI.

### PX-7 — Mobile Save Trust and Run Portability

Executed at 0.32. Reopen only if the 0.33 playtest proves a save-loss, trap, or silent-replace defect. That repair stays a 0.33 one-PR ticket.

### PX-8 — Accessibility and Real-Device Performance

0.34 primary; 0.36 desktop revalidation.

### PX-9 — Audience, Distribution, and Shareability

0.38–0.39. Distribution constraints never soften canonical adult content.

---

## 8. L-008 — What Remains and evidence-backed density

Governing definition, already present on the candidate lane:

- What Remains is skippable, 3–6 lines, selected by significance rather than append order.
- Eligible facts: current-run ideology, deaths with authored causes, crisis/vault outcome, one truthful promise state, optional relational fact.
- No counterfactual, score, moral grade, or invented betrayal.
- Pair residue, debt, pregnancy texture, and additional density remain evidence-gated.
- The six light Cascade Allusive beats remain **PROPOSALS** behind playtest evidence and a later owner open. They are not 0.34–0.37 work.

---

## 9. L-009 — Packaging and presentation foundation

Split across later versions. 0.33 does not absorb this work during playtest.

- Remove production chrome such as raw scene IDs; keep one truthful visible version.
- Preserve completed-save behavior and honest ending actions.
- Strengthen type scale, line length, contrast, touch targets, motion preferences, semantic structure, focus, labels, and announcements at 0.34.
- Keep the content notice revisitable without creating a settings dashboard.
- Opening video, tutorial, and crew portrait/details remain evidence-gated candidates.
- The breast-cover toggle remains held.

| Candidate | Gate |
|---|---|
| Earth-calamity opening video | PX-1 must prove a cold-open comprehension need. Skip/pause, captions or equivalent text, reduced-motion fallback, load budget, no autoplay trap. |
| Skippable first-run tutorial | PX-1 must prove a first-run comprehension failure. Skippable, replayable, touch/keyboard safe; teaches existing interactions only. |
| Clickable crew portrait/details | Existing portrait, bio, and truthful known status only. No numeric stats, affinity values, hidden flags, or management system. |

---

## 10. L-010 — External Review Pilot, executes at 0.37

**Entry:** 0.36 passes.
**Purpose:** fresh-stranger structural and experience audit after systemic truth, the 0.33 playtest response, mobile, private packaging, and PC work.

### Reviewer independence

- At least two reviewers who have not seen code, internal reports, or earlier builds.
- At least one mobile-primary reviewer and one desktop reviewer.
- Review uses the exact private candidate and records device/browser/build identity.

### Scope and evidence

- Full start-to-end runs on phone and desktop.
- First-run clarity, save/resume trust, choice legibility, art/text composition, resource honesty, death continuity, ending specificity, adult-content clarity, and replay desire.
- Findings carry severity, exact scene/UI location, reproduction, device/browser, and evidence.
- Explicit probes cover dead speech, unpaid costs, save loss, softlock, and false ending text.

### Exit

- P0 correctness/save/softlock/false-ending findings are closed and retested.
- P1 is fixed or owner-ranked/deferred; first-run trust and save-integrity P1 blocks 1.0.
- P2 remains polish and cannot be silently inflated into a new system.

---

## 11. L-011 — PC Readiness, executes at 0.36

PC is a second composition of the same static browser build, not a port.

### Scope

- Widescreen portrait plate beside prose, desktop type scale, and line-length caps.
- Full keyboard play, visible focus/order, number-key choices, and unambiguous Enter/Space advance.
- Hover distinct from focus, pressed, disabled, and selected states.
- Fullscreen, resize, zoom, and common desktop viewport sanity.
- Identical scene data, state, saves, consequences, content, and endings across phone and PC.

### Out

- No native wrapper, gamepad, achievements, cloud saves, PC-only narrative branch, or separate settings/game system.

### Acceptance

- Start-to-end keyboard-only run succeeds.
- Mouse, touch, keyboard, zoom, fullscreen, and resize preserve state and choice integrity.
- Desktop composition does not regress phone layout.
- Representative desktop browser/device matrix passes the 0.34 accessibility/performance controls.

PRs 84 and 85 are early landed evidence for keyboard and composition only; they do not close this section.

---

## 12. L-012 — Commercial Readiness, executes at 0.39

**Entry:** 0.38 cohort findings are closed or owner-ranked.

- itch.io remains the primary 1.0 storefront direction, subject to submission-time policy recheck.
- Adult classification, AI disclosure, content descriptors, cover-art suitability, payment terms, and current platform rules are verified at submission time.
- Netlify is not the canonical commercial host.
- Audit fonts, third-party code/assets, licenses, and notices.
- Manraj decides price, business/tax setup, public messaging, support posture, and final commercial go/no-go.
- Store copy must describe exact bytes honestly.
- Steam remains a separate post-1.0 decision.

---

## 13. L-013 — 0.40 release rehearsal and 1.0 launch gate

### 0.40 rehearsal

- Freeze one release-candidate identity from the exact governed lane.
- Run strict verifier and V1–V6 gates at that exact candidate and again at exact merged `main` only if close-out is separately authorized.
- Exercise deterministic packaging, digest, tag/Release draft, rollback, private install, save migration, content descriptors, support, and deployment dry run.
- Rehearsal prepares drafts and private evidence. It does not authorize publication.

### 1.0 public release

1.0 may release only when the authored arc is complete; a stranger can start, save/resume, and finish on phone or PC without developer habits; causality, adult-content, art, architecture, save, and outcome locks hold; no P0 remains; blocking first-run/save P1s are closed and retested; strict gates pass at the exact release revision; the adult-tagged, AI-disclosed commercial package is ready; store copy, known bugs, privacy, support, artifact, digest, tag, Release, and deployment identity agree; and Manraj gives final go/no-go.

Steam, native wrapper, achievements, gamepad, and cloud saves are not 1.0 requirements.

---

## 14. Accepted version program and live work

### 0.30.1 — Governed Recovery Integrity

**State:** drain closed on the version lane; `NOT_CERTIFIED`; no close-out credit.

Do not mint a new leftover identity. PRs 45/46 remain held.

### 0.31 — Systemic Truth Closure / This Run Does Not Lie

**State:** landed on the version lane; `NOT_CERTIFIED`.

Remaining C/D items are parked hunches. They are not 0.34 work. If the 0.33 playtest reproduces one as a correctness defect, repair it as a 0.33 one-PR ticket.

### 0.32 — Save Trust and Recovery

**State:** exited ~`7ec5b30`; `NOT_CERTIFIED`.

Do not reopen the 0.32 queue. If playtest proves a save-loss, trap, silent replace, or version-misread, that is a 0.33 bug ticket.

### 0.33 — Named playtest candidate

**State:** ACTIVE. Player-facing label `0.33` at `685d400`. ART-R2 **HELD**.

**Purpose:** let Manraj play the current candidate and report what is actually wrong.

Work allowed now:

1. Playtest on the named live preview and/or the exact lane SHA.
2. One-PR bug tickets on 0.33 for defects Manraj reports.
3. Capture PX-1 notes when they appear. Do not pre-write the baseline report as scope.
4. Keep ART-R2, STORY-SURGERY-R1, Cascade Allusive proposals, and new art volume closed.

**Entry:** 0.32 exited; version paint landed; owner named this SHA as the playtest.
**Exit:** owner declares the playtest window closed enough to classify findings. Bugs already filed on 0.33 are closed or ranked. No ART-R2. No close-out. No certify.

### 0.34 — Mobile UX, Accessibility, and Performance

**Purpose:** make the already-playtested candidate usable on real phones without changing the story.

**Workstreams**

1. Real-device pass on current iPhone Safari and one representative Android Chrome.
2. Text scaling, contrast, focus visibility, touch targets, and reduced-motion.
3. Screen-reader reading order and honest image alternatives that are not raw scene IDs.
4. Scene-to-scene image decode, memory pressure over a full run, and resume-after-background.
5. Orientation, zoom, and resize without state loss.
6. Retest only the 0.33 playtest defects that were classified as presentation/performance, not new narrative work.

**Entry:** 0.33 playtest window closed; findings classified; remaining 0.33 bug PRs ranked or closed; ART-R2 still held unless separately opened.
**Exit:** ranked device/performance matrix exists; P0 and blocking P1 presentation failures are fixed and retested on phone. No new story. No art batch. No certify.

**Hard holds:** PR 45/46, ART-R2, leftover drain, main close-out, certification, auto-Netlify.

### 0.35 — Packaging and Private Itch

**Purpose:** prove the game can be packaged and handed privately without making a public or commercial claim.

**Workstreams**

1. Deterministic private candidate ZIP from an exact lane SHA, with SHA-256.
2. Font, license, asset-inventory, path, and MIME/cache honesty.
3. Content-notice and adult-classification fields as draft private metadata.
4. Private download → open → save → resume path on phone.
5. Draft non-public store/support/privacy copy. No public page.
6. Record platform/rights issues for 0.39. Do not solve commercial policy here.

**Entry:** 0.34 device matrix passed.
**Exit:** reproducible private package and digest exist; private open/save path works; no public itch page; no payment; no publication.

**Hard holds:** PR 45/46, ART-R2 unless opened, main close-out, certification, auto-Netlify, public itch, price, Steam.

### 0.36 — PC Readiness

**Purpose:** give the same static browser game a second composition that a keyboard-and-mouse stranger can finish.

**Workstreams**

1. Revalidate PR 84 keyboard controls on the then-current candidate.
2. Revalidate PR 85 widescreen plate-beside-prose without regressing phone layout.
3. Hover versus focus versus pressed versus disabled versus selected.
4. Fullscreen, resize, zoom, and common desktop viewport sanity.
5. One start-to-end keyboard-only run.
6. Desktop browser matrix against the 0.34 accessibility/performance controls.

**Entry:** 0.35 private package exists so PC and phone are tested against the same bytes.
**Exit:** keyboard-only run succeeds; desktop matrix passes; phone layout is not regressed.

**Hard holds:** no Electron/Tauri, no gamepad, no achievements, no cloud saves, no PC-only story branch, no 45/46, no certify, no main close-out.

### 0.37 — External Review Pilot

**Purpose:** put the private candidate in front of two strangers who have never seen the code or prior reports.

**Workstreams**

1. Select one mobile-primary and one desktop reviewer with no prior Sunsplitter playthrough.
2. Freeze the exact private candidate identity they will play.
3. Full start-to-end runs plus explicit probes for dead speech, unpaid cost, save loss, softlock, and false ending.
4. Ranked P0/P1/P2 report with scene/UI, device/browser, and reproduction.
5. Retest only after owner-ranked repairs. Repairs are one-concern PRs, not a new mid-version invented here.
6. Feed 0.38 cohort design. Do not start the cohort inside 0.37.

**Entry:** 0.36 passed.
**Exit:** both reviewers finished or their blockers are ranked; P0 closed and retested; first-run-trust and save-integrity P1s are closed or owner-deferred with a named later version.

**Hard holds:** PR 45/46, ART-R2 unless opened, main close-out, certification, auto-Netlify, public page, paying customers.

### 0.38 — Player Validation Cohort

Bounded cohort on the exact private candidate. Separate correctness, accessibility, experience, and market findings. Define stop/continue thresholds before reading results.

### 0.39 — Commercial Readiness

Execute §12. Public itch, disclosures, rights, price, and store truth live here — not at 0.33 or 0.35.

### 0.40 — Launch Rehearsal / RC

Execute §13 rehearsal against one frozen identity.

### 1.0 — Public Release

Execute §13 launch gate. Manraj remains the final and separate go/no-go authority.

---

## 15. Wait for playtest — do not pre-slice

These items stay off 0.34–0.37 until the 0.33 playtest produces a classified finding or Manraj opens the named gate.

| Item | Why it waits |
|---|---|
| ART-R2 identity/roster/crop audit | Explicitly HELD |
| STORY-SURGERY-R1 | HELD until evidence names exact prose |
| Cascade Allusive six light beats | Proposals; need host/voice/live-dead confirmation after play |
| Opening video, tutorial, crew dossier | Candidates; PX-1 must prove the failure |
| Ticket 2 / L-028 new-crew indicator | Default RETIRE until pre-registered mobile-PX threshold |
| Pair residue, pregnancy delayed texture, unchosen-debt cascade | Evidence-gated density |
| Economy rebalance / outcome-envelope retune | Needs human play, not another model prediction |
| Ship-exterior damage-cause canon | Fable proposal + owner lock; not a version slice |
| Spoken 140,006 prose sweep | Only if playtest hits the old count as a visible lie and owner wants it now |
| Command-authority/sexual-power tickets | Audit after play notes, not before |
| Voyage chronology bible as blocking work | Useful, not a version |
| New art generation or unwire of discarded Vess plates | ART-R2 still held |
| Any leftover-drain identity from 0.30.1–0.32 | Closed on purpose |

Playtest **bugs** (softlock, dead speech, save loss, unpaid cost, broken image, version label lie) stay on **0.33** as one-PR tickets.

---

## 16. Proposal, deferred, held, and rejected register

| Item | Disposition |
|---|---|
| Cascade Allusive six-beat package | PROPOSAL; wait for 0.33 playtest + owner open |
| Heavy standalone boarding manifest / cascade records scenes | RETIRED in favor of distributed allusion |
| Lena disposition beat | DEFERRED to a late evidence-backed private moment |
| Tomas “People were tier four.” | RESERVED; do not spend early |
| Earth-calamity opening video | CANDIDATE only after first-run evidence |
| Skippable tutorial | CANDIDATE only after a measured comprehension failure |
| Clickable crew portrait/details | CANDIDATE; descriptive only |
| Ticket 2 new-crew indicator | DEFERRED / default RETIRE under L-028 |
| Pair residue, debt, pregnancy texture | DEFERRED to evidence-backed narrative scope |
| Breast-cover/explicit-content toggle | HELD / UNSCHEDULED |
| STORY-SURGERY-R1 | HELD |
| ART-R2 | HELD |
| Unrestricted AI roadmap editing | REJECTED; proposal PR only |
| Engine/state mechanical split | DEFERRED until after 1.0 or separate approval |
| Native wrapper, gamepad, achievements, cloud saves | OUT before 1.0 |
| Steam launch | DEFERRED to separate post-1.0 decision |
| Fixed event-order redesign | ACCEPTED LIMITATION unless explicitly reopened |
| Conventional HUD/dashboard/meters/quest log | REJECTED |
| V2 literal-name lint as zero gate | REJECTED; classified spike detector only |
| Leftover drain reopen | REJECTED unless owner reopens it by name |
| Close-out of this lane to `main` in the current window | HELD |
| Certification of 0.33 | HELD; last certified remains 0.28.1d |

---

## 17. Agent operating rules

### Grok / program office

- Read exact authority and runtime revisions.
- Record owner-approved locks and prevent out-of-order work.
- Keep confirmed findings, hunches, holds, and landed evidence distinct.
- Do not draft prose or self-approve creative/commercial decisions.
- Do not leftover-drain. Do not mint tickets in a planning pass unless the owner asks for a ticket.

### Fable

- Design/draft prose only from exact authority after a named ticket.
- Every scene declares preconditions, writes, death exposure, dead-speech check, and image status.
- Keep contested cascade lanes plural and phrase ownership exact.

### Build / Engine

- Implement only an approved ticket from a pinned lane head.
- Preserve pure-data shape and one concern per PR.
- Open the PR, return exact evidence, and stop. Build does not merge, publish, tag, deploy, or close a lock.

### Art

- ART-R2 is held. Work only from locked requests after that gate opens.
- Match CURRENT identity, rectangular interiors, roster honesty, Commander anonymity, and `vess.jpg` as the official Vess face.

### External reviewers

- State exact build, method, coverage, device/browser, and limitations.
- Separate correctness from experience and recommendations from locks.

---

## 18. Quick reference

| Stage | State / exit |
|---|---|
| 0.30.1 | Drain closed on lane; NOT CERTIFIED |
| 0.31 | Systemic truth landed on lane; NOT CERTIFIED |
| 0.32 | Save trust exited ~7ec5b30; NOT CERTIFIED |
| 0.33 | Named playtest active at `685d400`; bugs stay here; ART-R2 held |
| 0.34 | Phone a11y/perf matrix passes |
| 0.35 | Private package + private itch path proven; no publication |
| 0.36 | Same browser game works on PC without phone regression |
| 0.37 | Independent pilot findings ranked and retested |
| 0.38 | Cohort evidence supports product and commercial decisions |
| 0.39 | Rights, policy, store, support, privacy, and package truth ready |
| 0.40 | Frozen RC survives rehearsal |
| 1.0 | Owner-authorized public release at exact verified identity |

**Current next action:** finish the 0.33 playtest. File bugs as one-PR 0.33 tickets. Do not start 0.34 until Manraj closes the playtest window and classifies findings.

**Hard holds that survive every later version in this file:** leave PR 45/46; ART-R2 held; no certify; last certified `0.28.1d`; no auto-Netlify; no main close-out; no leftover drain.
