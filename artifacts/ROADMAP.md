# Sunsplitter — Official Enforceable Roadmap

**Authority domain:** approved future scope, dependency order, design locks, decision gates, and milestone acceptance criteria.
**Owner:** Manraj.
**Lock steward:** Grok records approved locks and prevents scope drift; Grok does not override Manraj.
**Initial authority date:** 2026-08-18.
**Prepared against GitHub `main`:** `3789062f1d0703f63feb8ada66503bb773879550`.
**Verified game-code/audit baseline:** `2bb4517707df90702a9b78fe0fa8fb55c1852dd8`. The only change between these revisions is `artifacts/PROJECT_STATUS.md`, so source findings pinned to `2bb4517` still apply at `3789062`.

The copy of this file committed on GitHub `main` is authoritative. Pasted copies, local drafts, project-doc copies, and AI memory are not authoritative unless the user explicitly asks to work from a draft. The containing Git commit identifies the current revision; do not try to embed that self-referential final commit SHA inside this file.

---

## 1. Authority and change-control law

### Domain authorities

| Question | Authority |
|---|---|
| What is approved next, in what order, and with what exit criteria? | `artifacts/ROADMAP.md` |
| What has actually shipped and what is the active release state? | `artifacts/PROJECT_STATUS.md` |
| What bytes and behavior are actually on `main`? | Git at the exact revision being reviewed |
| What version was released or deployed? | Signed/annotated release tag, GitHub Release, deployment record, and artifact digest |
| What is character/canon/voice truth? | `CHARACTER_BIBLE.md`, `VOICE_CARDS.md`, `FABLE_BRIEF.md`, and explicitly locked cascade/minted-phrase documents |
| What is art truth? | `ART_RULES.md`, `ART_REQUESTS.md`, the CURRENT portrait manifest, and the shipped `images/` bytes |
| How is work executed? | `GITHUB_PUSH_RULES.md` after its 0.28.3 rewrite; until then this roadmap's branch/PR rules supersede its retired API-push workflow |

When documents disagree:

1. Runtime/source truth is reported as a defect; documentation must not pretend the intended behavior already shipped.
2. `PROJECT_STATUS.md` wins only for shipped/current state.
3. `ROADMAP.md` wins only for approved future scope and order.
4. Domain canon documents control detail unless this roadmap or a later recorded lock explicitly supersedes them.
5. A newer `main` revision wins over a pasted or local copy.

### Required session declaration

Every Grok, Fable, Build, Art, GPT, or Claude session must begin by stating:

- role and session type: retrieval, review, design, build, art, or release;
- repository: `mbains89/Sunsplitter`;
- exact `main` SHA read;
- authority files read;
- whether the task is proposal-only or authorized implementation.

If the named SHA or authority files cannot be read, the session must stop rather than silently use memory.

### Who may change the roadmap

- Any approved AI role may draft a roadmap patch or draft PR.
- No AI may directly edit `main`, self-approve a lock, or convert its own recommendation into approved scope.
- A change to permanent locks, sequence, milestone scope, or acceptance criteria requires Manraj's approval and Grok's recorded lock.
- Mechanical truth corrections may be proposed with source evidence, but still land through review.
- Roadmap and status changes that affect both future and shipped truth must land in the same atomic close-out PR.
- GitHub issues and PRs are execution/evidence records, not competing authorities.

### Status vocabulary

| Label | Meaning |
|---|---|
| **SHIPPED** | Present on `main` and recorded by STATUS as current repository truth; this label alone does not prove a GitHub Release or production deploy |
| **RELEASED** | Proven by an immutable tag and GitHub Release at an exact commit with an artifact digest |
| **DEPLOYED** | Proven by a deployment record tied to the released commit/artifact digest |
| **LOCKED** | Approved scope/order; implementation may proceed when dependencies pass |
| **DECISION GATE** | Work is blocked until the named choice is explicitly approved |
| **CANDIDATE** | Worth testing or scoping; not promised scope |
| **HELD** | Deliberately unscheduled; do not implement |
| **OUT** | Excluded before 1.0 |

---

## 2. Permanent product, canon, and implementation locks

These rules survive every version unless Manraj explicitly reopens one.

### Product and canon

- Sunsplitter is a short, grim narrative-survival browser game. The player is the Commander of a damaged colonization ark after Earth's sudden cascade.
- The ship is a full O'Neill cylinder. Interior art uses rectangular rooms, bays, and straight corridors only; no curved-ring interior architecture.
- Named non-player cast is exactly nine: Lena, Elias, Mira, Tomas, Amara, Jiro, Sela, Rourke, and Vess. Rourke dies early; Vess arrives later. The Commander is not an additional named NPC. No permanent character may be added beyond Vess.
- **Commander identity (L-025, Option B):** the Commander is a player-shaped second-person protagonist. The Commander remains faceless, has no official portrait, and gains no identity system. Remove accidental gendering from every rendered prose path and handle reproductive facts deliberately.
- Permanent constants do not drift: `04:19:07`, Tube 3, 214 berths, change orders 4417/4491, 61/19/42 systems, manifest tiers 1–4, nine through the hatch, and the ship name `Sunsplitter`.
- Earth departure remains a colonization mission overtaken by a sudden cascade measured in hours to roughly two days. The official account appears first; contested truths arrive later.
- Fixed event order is an accepted pre-1.0 design limitation, not an open replayability defect.

### Causality and consequence truth

- Resources must gate, kill, or produce an authored consequence. No silent clamps, decorative costs, free advertised costs, or choices that execute without payment.
- Every rendered scene must leave at least one legal enabled exit. A resource gate may not create a hard softlock.
- Dead or unrecovered characters never speak, act, appear as present, receive present-tense credit, or appear in run-state art.
- Endings and reflections cite only facts from the current run. No counterfactual, score, moral grade, or invented betrayal.
- A full-survival run must remain possible. It need not be easy, common, or dominant.
- Delayed consequences cite their cause diegetically when they land.
- Immediate advertised costs and unmet requirements may be shown honestly. Future narrative consequences are never labeled as “important” or scored.
- Future versus Living remains the central ideology tension; leadership and ideology remain separable.

### Romance and adult-content locks

- Romanceable women are Lena, Mira, Amara, Sela, and Vess.
- Default offer: if she is alive, eligible, and not declined, she initiates; the player must explicitly reject.
- First offers have no affinity/trust hard gate.
- Acceptance creates relationship debt and scarce private attention through existing state, not a visible system.
- Sela is fully adult, age 20, with high-trust boundaries that must remain legible.
- Vess is deliberately asymmetric: shorter route, different currency, and power remains hers.
- Adult and explicit content is permanent. A platform mismatch changes distribution, not the canonical content.
- No exclusivity meter, jealousy system, morality bar, romance score, or relationship dashboard.
- A breast-cover/explicit-content toggle is **HELD**, not approved. It would require a separate canon, asset, continuity, platform, and QA decision and must not be slipped into accessibility work.

### Architecture and data shape

- Pure static site: `index.html`, CSS, and JavaScript; no backend or required build step.
- Scenes remain pure data registered through JavaScript globals. A scene contains only `text | choices | onEnter | image` plus its registration key.
- `onEnter` is the scene-level write hook. Rendering must be side-effect-free.
- The engine stays thin. No TypeScript, framework, bundler, component rewrite, or engine/state mechanical split before 1.0.
- No combat loop, mining, inventory management, quest log, skill tree, visible resource dashboard, relationship bar, or new gameplay system.
- New state keys require a recorded lock and same-change registry/schema coverage. Never invent keys speculatively.
- Scene declarations must state live preconditions, exhaustive writes, death exposure, dead-speech review, and image status.

### UI and save model

- Mobile-first, single-column composition remains the primary layout through 0.31.
- Artwork stays pinned while scene text scrolls below/alongside it according to the active composition.
- Choices remain stacked, thumb-friendly, and legible. No mobile-only story branch.
- Primary interface is scene text, speaker/context, choices, and minimal utility buttons—not a conventional HUD, dashboard, notification layer, or quest surface.
- Unavailable choices may be disabled only with an honest reason. They may not disappear in ways that falsify cost or causality.
- Autosave/Continue must disclose enough metadata to earn trust without exposing hidden consequence state.
- Saves remain local and account-free through 1.0. Cloud saves are out.

### Art and presentation

- The official tank-top Batch A portrait set is the sole character-identity reference:
  `artifacts/sunsplitter-official-portraits-CURRENT-2026-08-17.zip` plus the verified shipped portrait bytes.
- Plate aspect ratio remains 784/1168 (approximately 2:3).
- No baked ship names, character names, system labels, production vocabulary, or ending copy.
- Commander depictions are hands, back view, or silhouette only.
- Group plates default to roster-ambiguous; at most two identifiable faces unless exact living-roster preconditions make more honest.
- Unrecovered is treated as dead for art resolution.
- Reuse/rewire is preferred to generation. No new art volume before the corresponding scene is written, gated, and version-locked.
- Art is approved in a real mobile composition, not as an isolated full-size image.
- Generation workflow: one request card and one job per reference; verify references/hashes; generate four bases; triage; allow at most two controlled edits; restart rather than endlessly mutate. Default output budget is six.
- Before wiring, perform identity, lighting, crop, mobile-legibility, roster-honesty, rectangular-interior, and moderation-line QA. Mirror production copies byte-identically and record hashes/contact sheet where the dual-folder art workflow is used.

### Shipped feature inventory

This inventory is baseline context pinned to the preparation revisions above. `PROJECT_STATUS.md` controls later shipped/current truth and must be updated when the inventory changes.

#### Cast and recovery

| Character | Shipped shape |
|---|---|
| Rourke | Dies in the opening; memory/history only after death |
| Tomas | Missing early, recovered mid through Green Tether; Living-textured water-mass/germplasm cost |
| Jiro | Missing early, recovered mid/late through Dead Reckoning; Future/navigation correction-burn cost |
| Vess | Arrives mid/late from Dawnbreak; reaction-mass/bus-downgrade cost; fifth and asymmetric romance |
| Lena, Elias, Mira, Amara, Sela | Initial core crew with romance routes for the women, male bond route for Elias, lethal/promise/pair participation as authored |

#### Narrative systems already present

- Future versus Living ideology fork; leadership is not identical to ideology.
- Mutually exclusive ideology crises: The Breath They Cost (Living) and Custody of Tomorrow (Future).
- Six spoken promises: Amara, Tomas, Elias, Lena, Sela, and Mira.
- Avoidable lethal opportunities for Lena, Tomas, Elias, and Mira; Rourke's opening death; conditional vent losses for Amara/Jiro/Sela; full survival after the opening remains possible.
- Crew pairs: Elias→Mira shield, Tomas↔Jiro grudge, Amara→Sela favor, Jiro→Lena neglect.
- Last Off-Shift scarce private-attention junction with deferred debt.
- Relationship debt and crew-visible favoritism after romance acceptance.
- Vault needs a face, vault voice, ship memory, Sela yellow-sun payoff, boarding stories, and contested departure accounts.
- Full romance route shape for Lena, Mira, Amara, and Sela; asymmetric Vess route; optional explicit continuation beats.
- Non-sexual bond routes for Elias, Tomas, and Jiro.

#### Known partial/deferred features

- Cross-route awareness is incomplete; full mirror coverage belongs to evidence-backed 0.29.
- What Remains is not yet a dedicated significance-based post-ending system.
- Cascade background canon exists; the reserved Cascade Allusive beat set remains deferred to 0.29.
- The current audit baseline registers 207 scenes. Declaration-header coverage is incomplete and remains process debt.
- Mobile-first pinned-art/scrolling-text presentation is shipped; save portability, formal accessibility audit, PC composition, and commercial packaging are not.
- Portrait and intimate-art categories exist for all five women, but the Lena lingerie file on `main` is currently a placeholder and therefore not a shipped usable plate.

---

## 3. Shipped baseline and known source truth

This section is a pinned reconciliation snapshot, not a second shipped-state authority. On any later revision, `PROJECT_STATUS.md` controls current/shipped facts; the tag/Release proves release provenance, and the deployment record proves production.

### Current release label

**0.28.1d — SHIPPED LABEL.**

The release label is 0.28.1d, but version identity is currently split:

- `VERSION.md`: 0.28.1d
- `src/state.js` runtime/save stamp: 0.28.1b
- `index.html` subtitle: 0.28.1c
- numbered scene headers: 0.28.1c

This is a confirmed 0.28.2 defect, not permission to relabel history.

### Verified repository facts at roadmap creation

- Current `main` read: `3789062f1d0703f63feb8ada66503bb773879550`.
- Game source at that revision is byte-unchanged from `2bb4517707df90702a9b78fe0fa8fb55c1852dd8`.
- `images/lingerie_lena.jpg` is a 21-byte placeholder at the verified revision. An external or local real image does not count as shipped until its bytes land on `main`.
- `scripts/verify.mjs`, `scripts/simulate.mjs`, and `.github/workflows/` do not yet exist on `main`.
- The existing `GITHUB_PUSH_RULES.md` describes the retired per-file API workflow and marker checks that failed to catch shipped corruption. It is superseded by this roadmap pending its 0.28.3 rewrite.
- The 0.28.1d engine syntax error was fixed at `2bb4517`. The process hole that allowed it remains open.

### Condensed shipped history

| Version | Shipped focus |
|---|---|
| 0.10–0.14 | Causality hygiene, divergence, romance structure, mobile/art continuity, density |
| 0.15–0.17 | Relationship debt, persistent consequence, Sela payoff, boarding truths, code review |
| 0.18–0.21.1 | Onboarding, UI strength, discoverability, second-pass pursuit |
| 0.21.2–0.24.2 | Causality hygiene, cast drip, Tomas/Jiro recoveries, vault face, Vess arrival and romance |
| 0.25.x | Avoidable lethal opportunities, full-survival preservation, causality fixes |
| 0.26.x | Ideology router, exclusive Living/Future crises, art wiring |
| 0.27.x | Spoken promises, map/art honesty, allusion carriers |
| 0.28 | Crew pairs, Last Off-Shift, scheduled warmth |
| 0.28.1–0.28.1b | Truth repairs, reachable-scene work, unpaid-cost gating |
| 0.28.1c | Mechanical split into numbered scene files |
| 0.28.1d | Release-label bump, official Batch A portrait/CSS work, portrait drift repair, black-screen syntax hotfix |

The detailed pre-0.28 status ledger remains in Git history at `2bb4517:artifacts/PROJECT_STATUS.md`. Stale forward-plan sections in that historical file are not current authority.

---

## 4. Locked dependency spine

```text
AUTHORITY BOOTSTRAP (ROADMAP + STATUS synchronization)
  ↓
0.28.2 — Truth Hotfix
  ↓
0.28.3 — Chain-of-Custody + Systemic-Truth Foundation
  ↓
PX GATE — Player Experience Baseline & Design Governance
  ↓
0.29 — What Remains + evidence-backed density
  ↓
0.30 — Packaging & Presentation
  ↓
0.31 — Independent External Review #2 + remediation/retest
  ↓
0.32 — PC Readiness
  ↓
0.33 — Commercial Readiness
  ↓
1.0 — Release Candidate / launch gate
```

**Milestone A = 0.28.2 + 0.28.3.** Both must ship before the PX gate closes or any 0.29 prose opens.

No new story volume, art batch, gameplay system, Ticket 2 implementation, tutorial, opening video, or crew dossier may jump this sequence.

The authority bootstrap is a one-time documentation-only migration PR explicitly outside the recurring game-version cadence. It changes no runtime bytes, must be reviewed atomically, and is the last non-version PR permitted to target `main`. After it lands, only conforming version close-out PRs may target `main`.

---

## 5. 0.28.2 — Truth Hotfix

**Status:** LOCKED batch shape; four implementation decisions remain gated below.
**Concern:** the current game stops lying about this run.
**Scope:** ten tickets, no new story content.

Before the first hotfix ticket, the certified verifier/simulator copies, minimal Actions checks, and a bootstrap release-policy check must land on the protected 0.28.2 integration branch. Checks are blocking from the first ticket: known baseline failures may be explicitly pinned/ratcheted, but a ticket may never worsen them. This is pipeline bootstrap, not a separate release and not permission to claim 0.28.3 complete.

| # | Ticket | Required outcome |
|---|---|---|
| 1 | Dead-speech/credit batch | Repair the 16 confirmed reachable rows, including verified dead-Tomas credit and the unrecovered-Tomas/Jiro intimacy/pursuit rows. Use guards or truthful paraphrase; do not mechanically erase memorial/history references. |
| 2 | `quiet_tomas` rewind | Both exits route to `act3_spine_next`; the late offer never rewinds to `lead_prompt` or reapplies early writes. |
| 3 | Cost-gate/softlock class | Resolve the approximately 20 confirmed scenes. Every rendered scene has an enabled exit; no mandatory downstream spend is offered without honest affordability. `act3_reckoning_heading` gets an explicit locked floor disposition. |
| 4 | `vault_priority` clobber | Preserve the player's early Living/Future/both priority. Re-key or remove the later Lena-choice write; ending prose never reports the overwritten value as the early choice. |
| 5 | `offshift_tomas_r` contract line | Replace the repeated `remember()` sentence with a paraphrase so contract-class text renders at most twice. |
| 6 | Lena lingerie asset | Replace the 21-byte placeholder with the approved real JPEG; validate magic bytes, dimensions, size floor, reference, and release artifact. |
| 7 | Vess hair canon | Replace the dark/knife-cut boarding description with locked long white-silver hair without changing her route. |
| 8 | `pair_shield_cold` disposition | Either make the consequence reachable exactly once after the Mira lethal path or retire it. Decision required before implementation. |
| 9 | Version identity | Treat `src/state.js` `VERSION` as the runtime source; make all 11 verifier surfaces agree, including save stamp, visible subtitle, `VERSION.md` manifest, and scene consensus. |
| 10 | `pair_turn` registry | If there is no live writer/reader, remove it from `engineFlags`; otherwise document and test the reserved contract. |

### 0.28.2 decision gates

| Decision | Recommended disposition | Lock state |
|---|---|---|
| `pair_shield_cold` | Add a one-shot post-lethal re-entry so the already-authored pair consequence exists; retire only if topology makes it dishonest. | DECISION GATE |
| Global cost rule | A hub must cover the worst mandatory sole downstream cost or charge at entry; every rendered scene also needs an authored floor. Use a zero-cost degraded burn at `act3_reckoning_heading` if the hub rule alone cannot guarantee an exit. Never silently clamp. | DECISION GATE |
| `vault_priority` | Re-key the later Lena choice; preserve the early ideology choice. | DECISION GATE |
| `pair_turn` | Remove the unused flag now; reserve the concept in prose/design notes rather than runtime state. | DECISION GATE |

### 0.28.2 release gate

- All ten tickets have a source citation and regression fixture.
- `verify.mjs` Mode A is green at the candidate revision.
- `simulate.mjs` runs random, cheapest, and priciest policies at seed `20260817` with the pinned run count (currently 2,000/policy); V1 softlocks = 0 and V5 ending lies = 0. Changing seed, policies, or run count requires a recorded lock.
- JavaScript parses; all expected scene modules load exactly once; validator reports 0 errors.
- No placeholder or stale asset reference survives in the release artifact.
- Version surfaces agree. The 0.28.2 preflight verifier must publish its authoritative 11-surface table; until then the minimum known surfaces are `VERSION.md`, `src/state.js VERSION`/save stamp, visible subtitle, and numbered-scene consensus.
- A real phone smoke test reaches the opening, makes a choice, resumes a save, and reaches a verified route beyond the prior failure points.
- The release uses the “Chain-of-custody branch law” below even while protections are being bootstrapped.

### Simulation invariant glossary

| ID | Meaning |
|---|---|
| V1 | A legally reached render has zero enabled exits / hard softlock |
| V2 | Literal dead-or-unrecovered name/presence spike; report and classify, not a zero gate |
| V3 | Promise-state integrity failure at ending |
| V4 | Advertised negative cost executes without being affordable/paid |
| V5 | Ending/reflection contradicts the recorded run |
| V6 | Promise-lifecycle result violates the approved dead/live untested-holder semantics |

---

## 6. 0.28.3 — Chain-of-Custody + Systemic-Truth Foundation

**Status:** LOCKED scope; unresolved promise work remains gated. L-026 and L-027 are ruled below.
**Concern:** make truth repeatable, auditable, and safe to ship.
**Entry:** 0.28.2 green.

### Release-pipeline work

1. Independently re-verify and harden the checked-in `scripts/verify.mjs` and `scripts/simulate.mjs`. Their prior certification outside the repository is evidence, not a substitute for checked-in review.
2. Add dependency-free GitHub Actions verification and release workflows using a pinned supported Node version.
3. Rewrite `GITHUB_PUSH_RULES.md` v2. Retire marker checks, ZIP-as-source, per-file API pushes, file-size push rituals, and direct edits to `main`.
4. Add a PR template with ticket, concern, base SHA, integration SHA, local transcript, state/scene declarations, and evidence links.
5. Make corruption fixtures permanent: historical `&quot;` mutation, truncation, bad image magic/size, missing registration/load-order, validator failure, and version drift must all fail closed.
6. Create deterministic release ZIPs from the exact release revision and publish SHA-256 with the GitHub Release.
7. Keep production deployment opt-in. A production deploy must use the exact release revision/artifact; never deploy a partial version branch. PR previews may be enabled only if the account supports them and they are private/unindexed enough for adult material.
8. Split provenance honestly: the pre-merge close-out manifest records baseline plus ticket PR/head SHAs; the post-merge GitHub Release records merge SHA, tag, release CI run, and artifact digest; the deployment record adds the deployed digest/revision when production is triggered.
9. Use verifier Mode B to compare local bytes with raw GitHub bytes at a named immutable SHA; environment/network failure exits distinctly and never passes silently.
10. Harden the bootstrap `release-policy` check/ruleset on `main` so it permanently rejects non-`version/<semver>` heads after the one-time authority bootstrap and verifies the approved version manifest/ticket map.

### Systemic-truth foundation

- Lock and implement promise lifecycle semantics; V6 becomes a hard regression assertion.
- Replace cause-string inference with explicit stable cause IDs at kill sites before What Remains.
- Move render-time state writes in numbered scene modules and `offshift_amara` into `onEnter`; rendering becomes side-effect-free.
- Harden `validate.js`: real reachability, Vess in romance IDs, fail-closed unknown requirements, invalid-name `isAlive` guard, no accidental global `scenes`, and negative fixtures.
- Change intimacy-window first-offer gates to `romanceOpen`.
- Retire `vess_course_lost` and its promised downstream-course consequence. Do not add a consumer or broaden this ruling to other Vess flags or effects.
- Close the solo-Amara first-offer after `amara_tomas` and add the group relationship to current-run facts.
- Retain the Last Off-Shift zero-eligible bypass and one-eligible auto-route solely as tested defensive save-recovery guards. Preserve existing `junctionChoice` behavior. Validator and documentation coverage must classify them as defensive recovery paths, not ordinary playable content.
- Adopt the coverage-proof rule: future external audits are rejected if they do not declare scanned files/scenes, classifications, and unresolved rows.
- Refresh the stale README layout to the numbered scene modules and add only verified simulator usage; do not reuse the rejected retired-layout README.
- Produce the unified economy close-out: starting values, typical spends, hard floors, lethal thresholds, ending requirements, resource-rich/poor viable paths, and full-survival evidence. PX-3 later judges dominance/feel; 0.28.3 proves honesty and viability.

### Promise semantics — blocking recommendation

The recommended domain is:

| State | Meaning |
|---|---|
| `kept` | The authored test occurred and the holder/player kept the promise |
| `broken` | The authored test occurred and the player's action broke it |
| `dissolved` | The holder died before the promise could be tested |
| `forfeited` | The holder remained alive but routing bypassed the authored test |

An untested dead holder can never become `broken`. A broken promise must correspond to an authored test and player action. What Remains may cite only these truthful states.

**Lock state:** DECISION GATE. No promise resolver or 0.29 promise reflection is implemented until Manraj approves and Grok records the semantics.

### Chain-of-custody branch law

- Freeze direct/API writes to `main` immediately.
- Create `version/<semver>` from an exact `main` baseline.
- Each one-concern ticket uses its own branch and PR targeting the protected version branch, not `main`.
- PRs open as drafts and become mergeable only after the local transcript, evidence, and required CI are present.
- Ticket PRs run all checks and need no separate Manraj review when they remain inside the approved version scope. Merge is performed by a named human maintainer or configured GitHub auto-merge after Grok records scope compliance. An AI may enable/trigger auto-merge only under standing authorization recorded in `GITHUB_PUSH_RULES.md`; drafting or updating a PR alone does not grant merge authority.
- The only route from a version branch to `main` is one consolidated close-out PR. That is Manraj's single manual review/approval point for the version.
- New commits dismiss that approval and rerun the complete gate.
- Protect `main` and version branches, including administrators: no direct/force push, no deletion, no required-check bypass.
- Prefer a merge commit for the close-out so squashed ticket commits remain traceable while `main` changes atomically. If close-out is squashed, the release manifest must preserve the ticket PR/SHA map.
- Tag the exact resulting `main` revision as `sun-vX.Y.Z` from 0.28.2 onward. Do not rewrite historical tags.
- After merge, the release workflow reruns the full suite on the actual `main` merge SHA M, verifies the tag resolves to M, builds once from M, hashes/publishes that artifact, and optionally deploys the same digest. A synthetic PR merge result is not release proof.
- Rollback uses a verified revert PR or the previously published immutable deploy, never ad-hoc file repair.

### 0.28.3 release gate

- Direct push to `main` is mechanically rejected for every actor, including admins.
- The required `release-policy` check rejects ordinary ticket/feature PRs targeting `main` and incomplete version manifests.
- Required CI is green on every ticket PR and the consolidated close-out PR.
- `verify.mjs` is green; V1, V3, V4, and V5 are zero under locked simulation policies.
- V6 is hard and matches the approved promise domain. V2 remains a spike detector/report, not a literal zero gate.
- Thresholds are ratchet-only. Updating an audit pin may not silently update the expected-failure pin or weaken a gate.
- Every rendered scene has an exit; economy table and viable-path evidence are attached.
- Historical entity corruption, truncation, bad image, and version-drift fixtures fail as expected.
- `ROADMAP.md` and `PROJECT_STATUS.md` are coherent in the same close-out.
- Routine Manraj actions are limited to reviewing/approving the one consolidated diff and triggering an opt-in production deploy when desired.

---

## 7. PX Gate — Player Experience Baseline & Design Governance

**Status:** LOCKED sequence.
**Placement:** after all of Milestone A (0.28.2 + 0.28.3), before 0.29.
**Nature:** research/design plus bounded technical validation. PX-7/PX-8 implementation must ship in one or more pre-0.29 0.28.x patch builds (or a dedicated PX-labelled build) assigned by Grok at dispatch; the sequence may not be bypassed merely because the exact patch number is deferred.

No story or economy change is justified merely because an internal reviewer predicts it. First identify a specific observed problem, classify it, and attach evidence.

### Dependency order

1. PX-1 baseline.
2. PX-2 pacing target and PX-3 outcome envelope.
3. PX-4 Commander identity implementation audit and PX-5 command-authority/sexual-power audit.
4. PX-6 private voyage chronology.
5. Only evidence-backed narrative/economy changes.
6. PX-7 save portability and PX-8 accessibility/performance.
7. PX-9 audience/distribution decision.
8. Resolve or ranked-defer every blocking finding before 0.29.

### PX-1 — Player Experience Baseline

**Method:** fixed-seed automated timing plus real human phone playthroughs from strangers and near-strangers. Include at least first-run and replay observations.

**Required evidence:**

- elapsed time and major-beat timestamps;
- route/ending/deaths/resources/promises selected from truthful run state;
- anonymous, copyable end-of-run receipt suitable for playtest reporting;
- observer notes on clarity, remembered choices, emotional peaks, fatigue, save trust, and desire to replay;
- ranked P0/P1/P2 report with correctness defects separated from experience findings.

**Exit:** a ranked report exists; no content has been changed merely to “add more.”

The compact playtest receipt belongs here. Full save export/import belongs to PX-7.

### PX-2 — Run-Length and Macro-Pacing Target

- Use PX-1 evidence to set an internal target range and beat-spacing standard.
- Record target first-run and replay ranges, crisis density, intimacy spacing, and ending runway.
- The earlier 30–60 minute aspiration is a hypothesis, not a locked fact until measured.
- No player-facing clock, countdown, or voyage timer is added.

**Exit:** one written internal pacing standard with measurable tolerances and named exceptions.

### PX-3 — Behavioral Economy and Outcome Envelope

- Define acceptable distributions for full survival, partial loss, resource-rich/poor endings, ideology routes, promise outcomes, and major romance/relationship routes.
- Compare simulation policies with observed human behavior.
- Change balance only for a clear dominant strategy, misleading choice, impossible/vanishing outcome, or dishonest resource presentation.
- Do not optimize toward equal outcomes merely for symmetry.

**Exit:** approved outcome-envelope definitions plus reproducible simulation evidence.

### PX-4 — Commander Identity Implementation Audit

**Locked canon (L-025, Option B):** the Commander is a player-shaped second-person protagonist. The Commander remains faceless, has no official portrait, and gains no identity system. Accidental gendering must be removed and reproductive facts handled deliberately.

PX-4 does not reopen the A/B choice. Audit every rendered prose path, not only literal source lines, then synchronize the relevant Bible, voice, and status notes.

**Exit:** the rendered-path gender and reproductive-fact audit is complete, any approved prose corrections are validated, and the relevant Bible, voice, and status notes agree with Option B.

### PX-5 — Command Authority and Sexual Power

- Audit each romance route for the effect of rank, scarcity, consent, initiation, refusal, aftermath, and operational dependency.
- Preserve adult permanence and asymmetry rather than sanding it down.
- Preserve Sela's boundaries and Vess's retained power.
- Use prose/gating corrections only; no consent meter, morality bar, or relationship system.

**Exit:** per-route findings and any minimal evidence-backed tickets are recorded.

### PX-6 — Voyage Chronology

- Create a private continuity bible for elapsed voyage time, recoveries, crises, intimacy windows, injuries, promises, and ending approach.
- Use it to catch impossible healing/travel/relationship timing.
- Do not expose dates, timers, or a player-facing chronology UI.

**Exit:** one private chronology source exists and every post-PX prose ticket cites it.

### PX-7 — Mobile Save Trust and Run Portability

- Provide non-destructive export/import of local saves, version/schema rules, migration behavior, corruption detection, recovery/fallback, and clear failure messaging.
- Preserve the original save until a new import validates.
- Test upgrade, downgrade refusal, malformed data, interrupted import, and completed-run behavior.
- No accounts, backend, telemetry, or cloud saves.

**Exit:** phone-tested export/import and recovery matrix passes.

### PX-8 — Accessibility and Real-Device Performance

- Audit iPhone Safari and representative Android Chrome first; include desktop browsers before 0.32.
- Measure text scaling, contrast, focus, touch targets, announcements, reduced motion, scrolling, memory/load time, image decode, save/resume, and orientation/resize behavior.
- Rank measured failures P0/P1/P2 and change only what evidence supports.
- Preserve the locked presentation model unless a measured failure requires a revision.

**Exit:** ranked audit, device matrix, performance evidence, and mandatory retests are complete.

### PX-9 — Audience, Distribution, and Shareability

- Record what success means: intended audience, paid/free posture, replay/share goal, support burden, and launch channel.
- Decide how playtest receipts, screenshots, content descriptors, and public messaging represent the game honestly.
- Distribution constraints do not soften canonical adult content.
- Reconfirm the 0.33 itch.io direction and current platform/payment rules before commercial work opens.

**Exit:** written strategic decision approved by Manraj before public commercial push.

---

## 8. 0.29 — What Remains + Evidence-Backed Density

**Status:** LOCKED destination; exact prose opens only after PX findings and promise semantics are resolved.
**Entry:** Milestone A complete; PX findings closed or ranked-deferred.

### Locked core

- **What Remains:** skippable 3–6 lines after the ending, selected by significance rather than append order. Eligible facts: ideology, deaths with explicit cause IDs, crisis/vault outcome, one truthful promise state, and optional relational fact. Never counterfactual.
- **Cascade Allusive:** the six reserved light crew beats—Amara empty berths, Mira cascade records, Tomas vault bolts, Jiro observation, Sela stencil/hand-off, Elias seal/Standing question. Tomas “People were tier four” remains reserved late unless specifically dispatched.
- Cross-route awareness/mirror lines for the original four: Lena, Mira, Amara, and Sela. Vess remains intentionally asymmetric and is audited for truthful awareness without forcing route parity.
- Post-intimacy conditionals in operational scenes.

### Evidence-gated remainder

Death-residue objects, residual Pair 4 texture, unchosen-debt cascade, pregnancy-delayed texture, or other deferred density ships only if a PX finding justifies it. No speculative volume.

### Acceptance

- What Remains uses explicit current-run fact records and stable cause IDs.
- Promise text matches kept/broken/dissolved/forfeited semantics exactly.
- Dead/unrecovered filters and full-survival routes have regression coverage.
- Selector tests cover route combinations and prove significance ordering.
- Cascade lines preserve contract-class render limits and current voice cards.
- No new meter, system, content dashboard, or visible consequence label.

---

## 9. 0.30 — Packaging and Presentation

**Status:** LOCKED presentation milestone; three user ideas remain CANDIDATES.
**Entry:** 0.29 complete.

### Locked baseline

- Remove production chrome such as raw scene IDs; keep one authoritative visible version.
- Correct ending action labels and completed-save behavior.
- Strengthen cold-open/mobile composition, type scale, line length, contrast tokens, touch targets, reduced motion, semantic headings/labels, and screen-reader announcements.
- Provide visible focus, keyboard-safe modal dismissal, focus return, and meaningful accessible labels.
- Keep the content notice revisitable without turning it into a settings dashboard.
- Resolve decision briefs for title/tone merge, settings surface, alt-text policy, scene cadence, death beat, ending hierarchy, and completed-save semantics before 0.32.
- Do not add a new surface unless clarity, accessibility, or measured first-run evidence requires it.

### Candidate presentation experiments

| Candidate | Earliest placement | Gate |
|---|---|---|
| Initial Earth-calamity video | 0.30 | PX-1 must show the cold open needs it. Require skip/pause, captions or equivalent text, reduced-motion/static fallback, load budget, and no autoplay trap. |
| Initial skippable tutorial | 0.30 | PX-1 must identify a first-run comprehension failure. It must be skippable, replayable, touch/keyboard safe, and must teach existing interactions only. |
| Clickable crew portrait/details | 0.30, with desktop composition refined at 0.32 | May show existing portrait, bio, and truthful known status. No numeric/upgradable “stats,” affinity values, hidden flags, or new management system. |

The breast-cover toggle remains HELD and is not part of this milestone.

---

## 10. 0.31 — Independent External Review #2

**Status:** LOCKED definition.
**Entry:** 0.30 candidate build; `verify.mjs` and `simulate.mjs` green.

### Purpose

Fresh-stranger structural and experience audit after systemic truth, PX governance, content, and packaging. Catch residual lies, save/UI trust failures, and pacing problems that project authors no longer see.

### Reviewer independence

- At least two reviewers who have never seen the codebase or prior internal reports.
- At least one mobile-primary reviewer (iPhone Safari preferred) and one desktop reviewer.
- No prior playthrough of an earlier Sunsplitter build.

### Scope and artifacts

- Full start-to-end runs on phone and desktop.
- First-run clarity, save/resume trust, choice legibility, art/text composition, resource honesty, death continuity, ending specificity, adult-content discoverability/consent clarity, and replay desire.
- P0/P1/P2 findings with exact scene ID or UI location, device/browser, reproduction steps, and evidence.
- Short experience notes: what felt earned, opaque, memorable, or exhausting.
- Explicit confirmation checks for dead speech, unpaid cost execution, save loss, softlock, and counterfactual ending text.

### Severity and exit

- **P0:** causality lie, unpaid cost execution, dead speech/presence, save loss, unrecoverable softlock, or false ending. Blocks everything later.
- **P1:** major pacing/comprehension failure, missing gate telegraph, broken image honesty, first-run trust failure, or save-integrity risk.
- **P2:** polish/discoverability/minor wording/non-blocking layout.
- All P0 close and pass retest. A recorded risk acceptance does not silently erase P0 severity; it still blocks 0.32, 0.33, and 1.0 unless evidence supports formal reclassification.
- P1 is fixed or ranked-deferred with owner/version; any P1 affecting first-run trust or save integrity blocks 1.0.
- Reviewers can finish on phone without developer habits.
- Fixes and mandatory retests ship as 0.31.x; new findings may not be waved through without retest evidence.
- No “fix” introduces a new system, meter, or adult-content softening.

---

## 11. 0.32 — PC Readiness

**Status:** LOCKED amendment.
**Entry:** 0.31 has no open P0 and blocking P1s are resolved.

PC is a second composition of the same browser build, not a port.

### Scope

- Widescreen layout: 784×1168 portrait plates beside the prose column instead of above it; no art regeneration merely for widescreen.
- Desktop type scale and line-length caps.
- Full keyboard play: number keys select choices; Enter/Space advance where unambiguous; real focus states and focus order.
- Hover states distinct from pressed/selected states.
- Fullscreen, window resize, zoom, and common desktop viewport sanity.
- Mobile and PC use identical scene data, state, saves, consequences, and content.

### Out

- No Electron/Tauri/native wrapper.
- No gamepad support, achievements, cloud saves, new gameplay systems, or PC-only narrative branch.
- No rebuild of settings/title/cadence decisions that 0.30 already resolved.

### Acceptance

- Start-to-end keyboard-only run succeeds.
- Mouse, touch, keyboard, zoom, fullscreen, and resizing preserve choice/state integrity.
- Desktop composition does not regress phone layout.
- Representative desktop browser/device matrix passes the PX-8 checks.

---

## 12. 0.33 — Commercial Readiness

**Status:** LOCKED direction, with submission-time policy recheck.
**Entry:** 0.32 passes.

### Distribution direction

- itch.io is the primary 1.0 commercial storefront.
- Before submission, complete itch.io's Adult classification and built-in AI Disclosure; keep cover art non-explicit; verify content and monetization against current adult-content and payment-processor rules.
- Re-check policies at submission because platform and processor requirements change and some review is case-by-case.
- Retire Netlify as the canonical public/commercial game host before monetization, or retain only a private preview/non-explicit marketing mirror. This is a conservative continuity decision, not a claim that Netlify categorically bans lawful adult content.
- Steam is a separate post-1.0 decision. If later pursued, submit the stable near-final build/store page with mature-content and generative-AI disclosures and allow extra review time.

Official policy references to re-check:

- [itch.io adult-content FAQ](https://itch.io/docs/creators/faq#is-adult-content-allowed)
- [itch.io adult classification](https://itch.io/docs/creators/quality-guidelines#adult-content)
- [itch.io AI disclosure](https://itch.io/docs/creators/quality-guidelines#ai-disclosure)
- [itch.io payment terms](https://itch.io/docs/legal/terms#7-acceptable-payment-forms)
- [Netlify Acceptable Use Policy](https://www.netlify.com/legal/acceptable-use-policy/)
- [Netlify Website Terms of Use](https://www.netlify.com/legal/terms-of-use/)
- [Netlify Self-Serve Subscription Agreement](https://www.netlify.com/legal/self-serve-subscription-agreement/)
- [Steam rules/onboarding](https://partner.steamgames.com/doc/gettingstarted/onboarding#5)
- [Steam content survey](https://partner.steamgames.com/doc/gettingstarted/contentsurvey)
- [Steam review process](https://partner.steamgames.com/doc/store/review_process)

### Commercial checklist

- Audit and bundle fonts; confirm licenses such as OFL where applicable.
- Enumerate third-party code/assets and preserve license notices.
- Manraj decides price.
- Prepare honest store copy, screenshots, adult/content descriptors, AI disclosure, trailer/press kit as justified, support contact, and known-bugs list.
- Verify before claiming: localStorage-only saves, zero analytics, no account/backend, and the exact privacy posture stated on the page.
- Run the full release gate: `verify.mjs` green; V1–V6 at their locked hard thresholds; mobile/desktop playtest sign-off; policy/content review; artifact digest.
- Business-entity and tax setup remains owner-handled and outside the game roadmap.

---

## 13. 1.0 — Release Candidate / Launch Gate

**Status:** LOCKED definition.

1.0 may release only when:

- the authored arc is complete;
- a stranger can start, save/resume, and finish on phone or desktop without developer habits;
- all permanent causality, adult-content, art, architecture, and outcome locks still hold;
- no P0 remains; blocking first-run/save P1s are closed and retested;
- `verify.mjs` and the locked V1–V6 simulation gates pass at the exact release revision;
- save compatibility/recovery, accessibility, and device matrices pass;
- the adult-tagged, AI-disclosed build is purchasable on itch.io;
- store copy, known bugs, privacy posture, support path, release artifact, digest, tag, and deployment record agree;
- Manraj gives the final go/no-go.

Steam, a native wrapper, achievements, gamepad, and cloud saves are not requirements for 1.0.

---

## 14. Proposal, deferred, held, and rejected register

| Item | Disposition |
|---|---|
| Earth-calamity opening video | CANDIDATE at 0.30 after PX evidence |
| Skippable first-run tutorial | CANDIDATE at 0.30 after PX evidence |
| Clickable crew portrait/details | CANDIDATE at 0.30/0.32; descriptive only, no hidden/numeric stats |
| “PM-like” quick roadmap updater | CANDIDATE 0.28.3 governance helper. It may fetch `main`, draft a patch/draft PR, validate, and return a copy-ready summary. It may never write directly to `main` or self-lock. |
| Ticket 2 new-crew indicator | DEFERRED — default RETIRE. Reconsider only if mobile PX evidence meets a pre-registered, Manraj-approved comprehension threshold in the dispatched PX protocol; absent qualifying evidence at PX closure, retire. No implementation now. |
| Four-state promise domain | DECISION GATE before 0.28.3 promise implementation and all 0.29 prose |
| Commander identity A/B | LOCKED — Option B; player-shaped second-person Commander; rendered-path audit still required. |
| Last Off-Shift zero/one branches | LOCKED — retain zero/one routes solely as tested defensive save-recovery guards; preserve `junctionChoice` behavior. |
| `vess_course_lost` | LOCKED — retire `vess_course_lost` and its promised downstream-course consequence; no consumer. |
| Pair residual textures/debt/pregnancy texture | DEFERRED to evidence-gated 0.29 scope |
| Breast-cover/explicit-content toggle | HELD/UNSCHEDULED |
| Unrestricted AI roadmap editing | REJECTED; proposal PR only |
| Engine/state mechanical split | DEFERRED until after 1.0 or a separately approved architectural need |
| Native wrapper, gamepad, achievements, cloud saves | OUT before 1.0 |
| Steam launch | DEFERRED to a separate post-1.0 decision |
| Fixed event-order redesign | ACCEPTED PERMANENT LIMITATION unless Manraj explicitly reopens the lock; no scheduled redesign |
| `warmth_laughter` latent Vess guard/duplicate wording | Ranked P2 debt outside the exact 0.28.2 ten-ticket batch; fix only through a separately approved ticket |
| Conventional HUD/dashboard/meters/quest log | REJECTED |
| Stale GPT README describing retired scene layout | REJECTED; salvage only verified simulator usage |
| V2 literal-name lint as a zero gate | REJECTED; spike detector only, with classified editorial audit as authority |

---

## 15. Agent operating rules

### Grok / program office

- Read exact `main` SHA and both authority files.
- Record Manraj-approved locks, dispatch one-concern tickets, and prevent out-of-order work.
- Maintain the decision register and close-out evidence.
- Do not draft scene prose or self-approve unresolved creative/commercial choices.

### Fable

- Design, draft prose, and perform independent voice/causality review.
- Begin from this roadmap, current status, Fable brief, voice cards, scene skeleton, and only the domain documents needed.
- Every scene declares preconditions, writes, death exposure, dead-speech check, and image status.
- Return one complete copy-ready handoff, not scattered fragments.
- A writer does not certify its own scenes.

### Build / Engine

- Implement only an approved ticket against a pinned baseline/integration SHA.
- Use the version-branch PR flow; no direct/API writes to `main`.
- Preserve pure-data shape and state registry discipline.
- Run local verification before PR and attach the exact transcript/evidence.
- Never claim a version shipped until the close-out revision, tag, and release evidence exist.

### Art

- Work only from locked requests tied to written/gated scenes.
- Match CURRENT Batch A identity, rectangular interiors, roster honesty, and Commander anonymity.
- Use the bounded base/edit workflow and approve in the target composition.
- Return real files plus manifest/hash evidence; a chat image is not a shipped asset.

### External GPT / Claude reviewers

- State exact SHA, method, coverage, and limitations.
- Separate source correctness from experience predictions.
- Do not invent systems, keys, content volume, policy claims, or locks.
- Return one copy-ready text block or one coherent artifact bundle.

---

## 16. Quick reference

| Stage | Exit summary |
|---|---|
| Authority bootstrap | ROADMAP exists on `main`; STATUS/README point to it; retired API rules visibly superseded |
| 0.28.2 | Ten truth defects close; V1/V5 zero; verifier green |
| 0.28.3 | Chain-of-custody enforced; promise/economy/state foundation truthful; V6 hard |
| PX Gate | Measured baseline, pacing/outcome standards, identity/power/chronology/save/a11y/distribution decisions |
| 0.29 | Truthful What Remains + evidence-backed density |
| 0.30 | Stranger-ready presentation; user ideas only if evidence-backed |
| 0.31 | Independent mobile/desktop review; blockers fixed and retested |
| 0.32 | Same browser game works cleanly on PC |
| 0.33 | itch.io commercial package, disclosures, rights/privacy/release checks |
| 1.0 | Phone-or-desktop, adult-tagged, AI-disclosed, purchasable, verified |

**Do not start 0.29 or any new story/art volume until both 0.28.2 and 0.28.3 are complete and the PX gate exits.**
