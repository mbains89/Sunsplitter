# Sunsplitter — Ticket Queue (Fable DO · 2026-09-05)

Docs-only planner output for Orchestrator / Cursor `$ S1`.
Written: 2026-09-05. No checkout edits, no merges, no certify from this file.

**Default = Fable.** Tip authority: version lane `24bc29dc17031e71eb7008b13636c3be383b821a` (PR **170** privacy).
**Paint:** ~0.33 · **Certified:** 0.28.1d · **Posture:** NO-PUBLISH / NOT_CERTIFIED · **Mint:** no 0.36.
**Pin debt:** re-pin Netlify **≥ `24bc29dc`** owed (owner authority). **Remint ban:** 107–170.

---

## 1. Status snapshot

| Surface | State |
|---|---|
| Write lane | `version/0.30.1-main-reconcile-ci.1` |
| Live tip | `24bc29dc` (PR 170 privacy merged) |
| Release posture | **NO-PUBLISH / NOT_CERTIFIED**. Last certified: **0.28.1d** |
| Do not mint | **0.36** |
| Do not remint | PR / ticket identities **107–170** |
| Locks | **L-025–L-028 do not reopen** |
| Amara-route | **PARKED** |
| PR 45 / draft 46 | **Leave untouched** |
| Soft / Canon wake | **HOLD** until owner resumes bots |

**Zero-downtime rule:** refresh write-lane HEAD after each prior merge before branching. Do not invent 0.36 work to fill idle time.

---

## 2. Ordered Fable DO queue (version lane)

Base for every ticket: `version/0.30.1-main-reconcile-ci.1` @ tip ≥ `24bc29dc`.

| # | Ticket | State | One-line objective |
|---|---|---|---|
| 0 | **Netlify re-pin ≥ `24bc29dc`** | OWED (owner) | Hosted playtest matches tip; NOT_CERTIFIED only |
| 1 | **SUN-VERIFY-MAIN-POSTURE-LANE** | FINISH / IN_FLIGHT | Close main-posture verify on current tip; privacy DONE; not certify |
| 2 | **SUN-VOICE-HYGIENE-01** | READY | Confirmed defects only: `vault_voice` tags; Vess dead list no truncation; Tomas Captain→Commander. JOB_SWAP only after live-tip reverify |
| 3 | **ART-HONESTY-AMEND-THEN-REGEN** | READY | Amend **4** brief cells first; then queue **6** REJECT regenerations; HOLD stays HOLD |
| 4 | **STORYLINE-CITATION-TRUTH** | READY | Ending-citation truth table + negative fixtures; review/docs first |

### Soft later (not in this queue fire order)

Soft / Canon art & soft prose remain HOLD. Do not pull into this lane window.

---

## 3. Ticket briefs

### Ticket 1 — SUN-VERIFY-MAIN-POSTURE-LANE (finish)

**Objective:** Finish the in-flight main-posture verify lane against tip `24bc29dc` / PR 170 privacy. Produce attributable verify evidence only.

**Success proof:** posture checks recorded against exact tip; no certify/tag/deploy language; remint 107–170 untouched.

**Prohibitions:** mint 0.36; remint 107–170; Netlify without owner pin; Amara-route; touch 45/46; reopen L-025–028; claim CERTIFIED.

**Stop:** PR or ALREADY_SATISFIED receipt into the version lane; wait for owner merge-commit.

```text
/goal
repo: mbains89/Sunsplitter
ticket: SUN-VERIFY-MAIN-POSTURE-LANE
base: version/0.30.1-main-reconcile-ci.1 @ ≥24bc29dc
authority: Fable DO lock 2026-09-05. Last certified 0.28.1d. NO-PUBLISH.
objective: finish main-posture verify on current tip; privacy PR170 is DONE; do not certify.
prohibitions: merge, auto-Netlify, certify, remint 107-170, mint 0.36, Amara-route, touch 45/46, reopen L-025-028
stop: one PR or ALREADY_SATISFIED into version lane; wait. Do not merge.
```

### Ticket 2 — SUN-VOICE-HYGIENE-01

**Objective:** Repair only confirmed voice defects: `vault_voice` tags; Vess dead-list truncation; Tomas Captain→Commander. Reverify JOB_SWAP against live tip before any swap ticket.

**Success proof:** each confirmed defect closed or ALREADY_SATISFIED on exact HEAD; no unconfirmed prose campaign.

**Prohibitions:** broad voice sweep; soft/Canon wake; remint 107–170; 0.36; certify.

**Stop:** one PR; wait.

```text
/goal
repo: mbains89/Sunsplitter
ticket: SUN-VOICE-HYGIENE-01
base: version/0.30.1-main-reconcile-ci.1 (refresh after Ticket 1)
authority: Fable DO — confirmed-only voice hygiene. NO-PUBLISH. Certified 0.28.1d.
objective: fix only confirmed vault_voice / Vess dead-list truncation / Tomas Captain→Commander; JOB_SWAP only after live-tip reverify.
prohibitions: unconfirmed voice campaign, soft/Canon wake, remint 107-170, mint 0.36, certify, Netlify, Amara-route
stop: one PR into version lane; wait. Do not merge.
```

### Ticket 3 — ART-HONESTY-AMEND-THEN-REGEN

**Objective:** Amend **4** brief cells before regen; then queue **6** REJECT regenerations. HOLD rows stay HOLD.

**Success proof:** four amended brief cells recorded; six REJECT items queued with identity locks; no HOLD→regen; no Cursor event-plate generation beyond owner-approved path.

**Prohibitions:** broad ART-R2 campaign; Canon wake; remint 107–170; 0.36; certify; wiring without Canon PASS.

**Stop:** docs/brief amend PR and/or REJECT queue receipt; wait.

```text
/goal
repo: mbains89/Sunsplitter
ticket: ART-HONESTY-AMEND-THEN-REGEN
base: version/0.30.1-main-reconcile-ci.1 (refresh after Ticket 2)
authority: Fable DO Art Honesty. Amend 4 briefs before regen; queue 6 REJECT regens; HOLD stays HOLD.
objective: honesty amend then REJECT queue only; no soft/Canon wake; no broad ART-R2.
prohibitions: remint 107-170, mint 0.36, certify, Amara-route, HOLD regen, unapproved wiring
stop: amend + REJECT queue evidence; wait. Do not merge.
```

### Ticket 4 — STORYLINE-CITATION-TRUTH

**Objective:** Ending-citation truth table + negative fixtures (Fable session-2 / verifier law). Review/docs first.

**Success proof:** truth table and negative fixtures land as docs/tests without inventing endings; no mint 0.36.

**Prohibitions:** story rewrite campaign; remint 107–170; certify; Netlify; Amara-route.

**Stop:** one docs/fixtures PR; wait.

```text
/goal
repo: mbains89/Sunsplitter
ticket: STORYLINE-CITATION-TRUTH
base: version/0.30.1-main-reconcile-ci.1 (refresh after Ticket 3)
authority: Fable DO ending-citation docs. NO-PUBLISH. Certified 0.28.1d.
objective: ending-citation truth table + negative fixtures; review/docs first.
prohibitions: remint 107-170, mint 0.36, certify, story rewrite campaign, Amara-route, touch 45/46
stop: one PR into version lane; wait. Do not merge.
```

---

## 4. Explicit non-goals

- No **0.36** mint / PC-readiness open
- No remint **107–170**
- No G-2 / Ashes tickets on this queue
- No soft/Canon wake; no Blender / Imagine MCP runtime
- No certify, tag, Release, main close-out, or invented PIN-02 remint

**Next after this lock:** owner re-pin ≥ `24bc29dc`, then fire §2 in order. Soft later under a separate owner open.
