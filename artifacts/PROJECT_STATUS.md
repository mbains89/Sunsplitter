# Sunsplitter — Current Status

`schema_version: 2`
`updated_utc: 2026-09-05`
`status_lock: Fable DO · 2026-09-05`
`version_lane_sha: 24bc29dc17031e71eb7008b13636c3be383b821a`
`version_lane_tip_short: 24bc29dc`
`last_merged_privacy_pr: 170`
`owner_playtest_pin_sha: REPIN_OWED_GE_24bc29dc`
`source_main_sha: observe-on-next-boundary · do not invent`

This is the compact rolling handoff. Process: `/AGENTS.md`. Future scope: `ROADMAP.md`. Dispositions: `LOCKS.md`. Vocabulary in this file follows ROADMAP §1: **LANDED ON VERSION LANE** is merge-committed into `version/0.30.1-main-reconcile-ci.1` and is not on `main` and is not certified. **SHIPPED** is present on `main` and recorded here as current repository truth; it is not a Release or deploy. **CERTIFIED** applies only to the last certified baseline below. Nothing on the version lane is SHIPPED or CERTIFIED.

## Release and authority state

`observed_runtime: version lane @24bc29dc — LANDED ON VERSION LANE after PR 170 privacy; not SHIPPED; not CERTIFIED`
`version_lane_head: 24bc29dc17031e71eb7008b13636c3be383b821a — PR 170 privacy merged; LANDED ON VERSION LANE only`
`player_facing_paint: ~0.33`
`last_certified_baseline_label: 0.28.1d`
`version_integrity: NOT_CERTIFIED`
`release_state: NO-PUBLISH`
`release_artifact: none authorized`
`deployment: none authorized`
`sequential_gate_closure: none credited from 0.28.2 onward`
`pc_readiness_0_36: not opened`

Owner playtesting requires a Netlify re-pin **≥ `24bc29dc`**. This file records pin **debt**; it does not remint PIN-02 and does not authorize a deploy by itself. Until that re-pin lands under separate owner authority, hosted playtest is not current to this tip.

PR 45 and draft PR 46 remain held and untouched.

Do not remint ticket/PR identities **107–170**.

## Current work

`milestone: Fable DO lock 2026-09-05 — version-lane implement queue`
`state: IN IMPLEMENT — 0.36 not opened; NO-PUBLISH / NOT_CERTIFIED`
`governed_branch: version/0.30.1-main-reconcile-ci.1`
`owner: Grok / program office; Manraj remains sole publish authority`
`default: Fable`

Lane facts below are LANDED ON VERSION LANE. They are not SHIPPED and not CERTIFIED. Last certified remains `0.28.1d`.

### Fable DO — ordered current work (do these)

1. **Finish `SUN-VERIFY-MAIN-POSTURE-LANE`** — IN_FLIGHT close-out on current tip; privacy PR 170 is DONE at `24bc29dc`; posture verify is not certification.
2. **`SUN-VOICE-HYGIENE-01`** — confirmed defects only (`vault_voice` tags; Vess dead list no truncation; Tomas Captain→Commander). JOB_SWAP only after live-tip reverify. Do not broaden into unconfirmed voice sweeps.
3. **Art Honesty** — amend **4** brief cells **before** any regen; then queue **6** REJECT regenerations. HOLD rows stay HOLD. No Canon wake; no soft prose wake this lock.
4. **Ending-citation docs** — truth table + negative fixtures (Fable session-2 / verifier law); review/docs first. Not a story rewrite campaign.

### Soft later (not this lock)

Soft / Canon art and soft prose (crisis-declare, offshift-lena, debt-line, neglect-pair, plate soft) remain HOLD until the owner resumes bots. Do not wake Canon from this status.

### Drained / done on the version lane (do not reopen as a new queue)

- **0.30.1–0.32:** previously recorded drain/exit on the lane. Still `NOT_CERTIFIED`.
- **0.33 playtest tickets:** one-PR playtest repairs and named ART-R2 one-scene retargets landed through the prior playtest window. Player-facing label remains `~0.33`.
- **0.34 Mobile UX / a11y / perf:** PRs 107–109 merge-committed on the lane. Drain recorded. Not certified.
- **0.35 Packaging and private itch:** packaging and refresh identities on the lane. Drain recorded. Not publication. Not certified.
- **Privacy PR 170** at tip `24bc29dc`: DONE. Remint ban extends through **170**.

### Holds (unchanged)

- **0.36 not opened.** Do not mint PC-readiness work from this file.
- ART-R2 **broad campaign** (binary regen batch) remains held. Named confirmed-only voice/art honesty work above is not a campaign reopen and not wiring authority.
- Amara-route parked.
- PR 45 / draft PR 46 untouched.
- No main close-out, tag, Release, deploy, or certification language.
- No remint of PRs **107–170**. No Netlify pin remint / PIN-02 remint invented here — only the owed re-pin **≥ `24bc29dc`** under owner authority.
- L-025–L-028 are not reopened here. LOCKS dispositions are unchanged. ROADMAP digest in LOCKS may be rewritten if current-work bullets change; that is not a lock ruling.
- **SKIP this lock:** Blender / Imagine MCP as runtime; any certify claim; any 0.36 mint.

## L-025–L-028 dispositions

- **L-025 — LOCKED:** Commander Option B. The rendered-path gender/canon audit and document synchronization remain implementation work; this reconciliation changes no gameplay prose.
- **L-026 — LOCKED:** retain Last Off-Shift zero/one routes solely as tested defensive save-recovery guards and preserve `junctionChoice`. Required coverage remains implementation work.
- **L-027 — LOCKED:** retire `vess_course_lost` and its promised downstream-course consequence. Runtime removal remains implementation work.
- **L-028 — DEFERRED:** default RETIRE unless qualifying mobile-PX evidence meets the pre-registered, Manraj-approved threshold. No indicator is authorized.

L-020 through L-024 remain ruled. This handoff does not reopen L-004, art governance, product/canon scope outside L-025–L-028, or any release gate.

## Verification and CI state

The version lane carries dependency-free `scripts/verify.mjs` and `scripts/simulate.mjs` plus version/main Actions workflows. Green version-lane checks are candidate evidence only. They do not certify, ship, or close a sequential gate. Known remaining findings stay attributable and may not be accepted, weakened, or ratcheted into certification.

This ticket set has no ruleset-mutation authority.

## Blockers

- `NO-PUBLISH / NOT_CERTIFIED` remains controlling; no release artifact or deployment authority exists.
- Last certified baseline remains `0.28.1d`. The version lane is not certified.
- Netlify re-pin **≥ `24bc29dc`** is owed before hosted playtest matches this tip.
- L-025–L-027 gameplay/coverage work is not implemented by this docs handoff; L-028 remains deferred.
- Strict candidate simulation must reach zero at its locked thresholds; current known failures remain blockers, not an accepted baseline.
- This handoff has no merge-to-main, tag, release, or certify authority.

## Next action

**Implementers (`$ S1` / version lane):** execute the Fable DO order above from tip `24bc29dc` (refresh HEAD after each prior merge). One concern per PR into `version/0.30.1-main-reconcile-ci.1`. Do not mint 0.36. Do not remint 107–170.

**Grok / orchestrator:** keep live floor tips current; treat this file as boundary truth only. Soft/Canon wake is owner-gated later.

**Manraj:** remains sole publish authority. Approves any Netlify re-pin ≥ `24bc29dc` personally. Green CI is not merge-to-main authority and is not certification. `NO-PUBLISH / NOT_CERTIFIED` remains controlling. No close-out to `main`, tag, release, deploy, or invented PIN-02 remint.

<!-- STATUS_COMPLETE -->
