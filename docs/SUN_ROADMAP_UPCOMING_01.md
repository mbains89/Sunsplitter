# SUN-ROADMAP-UPCOMING-01

SOURCE main@8d23109b · RUNTIME 50ec4895168774dd9341633fb46ee6d364a81707 · TASK SUN-ROADMAP-UPCOMING-01 · MODE docs

Docs-only tip honesty after PR **#363** RECEIPT-VERIFY-MODES, plus the labeled upcoming-version table.

Does not mint 0.36. Does not invent OPEN 0.37. Does not certify. Does not deploy.
Last certified remains `0.28.1d`.
Paint on this lane stays `VERSION.md` first line `0.36` (**PAINT**, not OPEN).
No gameplay code. No JPEG. No Netlify.
Ignore Copilot leftovers **#297** and **#304** unless the owner names them.
Remint is HOLD Approve-only.

Lane: `version/0.30.1-main-reconcile-ci.1`
Live tip recorded here (pre-this-PR HEAD): `50ec4895168774dd9341633fb46ee6d364a81707`
Evidence: merge of PR **#363** `SUN-RECEIPT-VERIFY-MODES-01`.
Parents: `0601076596c8d775c76cb1c8ae1b54631734b64e` (lane parent) and `3304b2d26a27940f17d786cc7656bc62db59efb1` (#363 ticket head).

This cite is that pre-PR lane HEAD. It is not this docs PR's own merge SHA.
`main` stays `8d23109b63b844e0703fb36643f14b91b8800c90`. Do not close the lane onto main.

Lock line: `lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 PAINT`

## Why this ticket exists

PR **#352** `SUN-ROADMAP-TIP-SYNC-351-01` added `docs/SUN_ROADMAP_TIP_SYNC_351.md` and **claimed** STATUS/QUEUE retarget to `3aa2053f` / #351. The final diff contained only the receipt. Pointer files at live HEAD still cited `c3626434` / PR **#345`.

PR **#362** `SUN-FABLE-HONESTY-01` recorded that lie and still did not rewrite STATUS/QUEUE.

PR **#363** labeled STATUS/QUEUE sync **incomplete** and forbade claiming those edits when they are absent from the diff.

This ticket performs the missing STATUS/QUEUE rewrite **and** records the upcoming-version table in this receipt. It does not remint #352 / #362 / #363.

`docs/SUN_ROADMAP_TIP_SYNC_351.md` stays a historical receipt (its live cite was `3aa2053f` / PR **#351**).
`docs/SUN_DOCS_TIP_HONESTY_02.md` stays historical (`c3626434` / PR **#345**).
`docs/SUN_DOCS_TIP_HONESTY_01.md` stays historical (`9788ce10` / PR **#333**).
`docs/SUN_FABLE_HONESTY_01.md` stays historical (tip `7b8a9acf` / PR **#358**).
`docs/SUN_RECEIPT_VERIFY_MODES_01.md` stays the #363 process receipt.

## Named tip cites (were stale → now this pre-PR HEAD)

| Surface | Stale live cite before this pass | Live truth |
|---|---|---|
| `artifacts/PROJECT_STATUS.md` lane head | `c3626434add931b4a8e164febb5c1c7b46bf9471` / PR **#345** | `50ec4895168774dd9341633fb46ee6d364a81707` after PR **#363** RECEIPT-VERIFY-MODES |
| `docs/TICKET_QUEUE.md` live lane line | `c3626434add931b4a8e164febb5c1c7b46bf9471` / PR **#345** / TASK SUN-DOCS-TIP-HONESTY-02 | `50ec4895168774dd9341633fb46ee6d364a81707` after PR **#363** / TASK SUN-ROADMAP-UPCOMING-01 |
| `artifacts/ROADMAP.md` planning-runtime header | `c3626434add931b4a8e164febb5c1c7b46bf9471` / TASK SUN-ROADMAP-TIP-SYNC-04 | **Not rewritten in this PR.** Header bytes still read `c3626434`. Do not treat that header as live tip. Upcoming table lives in this receipt. Decision gates stay labeled / not OPEN. |
| `docs/SUN_ROADMAP_TIP_SYNC_351.md` | `3aa2053fad907580c4abcf976c851d48db39d5f6` / PR **#351** | Historical receipt only. Not rewritten. |

`identityAndAuthorityChecks` still requires these STATUS substrings unchanged: `` `release_state: NO-PUBLISH` ``, `` `version_integrity: NOT_CERTIFIED` ``, `PRESENT / UNRECONCILED / NO INTEGRATION OR RELEASE CREDIT`, `L-025 — LOCKED`, `L-026 — LOCKED`, `L-027 — LOCKED`, `L-028 — DEFERRED`. This ticket keeps them. `pc_readiness_0_36: not opened` stays. `source_main_sha` and `runtime_baseline_sha` stay `8d23109b63b844e0703fb36643f14b91b8800c90`.

`artifacts/ROADMAP.md` and `artifacts/LOCKS.md` are **not** in this diff. ROADMAP source SHA-256 is not recomputed. Lock dispositions are unchanged.

## Upcoming versions (labeled; not OPEN)

| Number | Job | State |
|---|---|---|
| **0.28.1d** | Last certified baseline | CERTIFIED floor. |
| **0.30** | Packaging label on `main` | SHIPPED observation. `NO-PUBLISH`. |
| **0.30.1–0.35** | Recovery through private-package paper | LANDED ON VERSION LANE. Drain closed. `NOT_CERTIFIED`. |
| **0.36** | PC Readiness | **PAINT.** Not opened as a PC-evidence mint. |
| **0.37** | External Review Pilot | PREP / labeled gate. Entry = 0.36 passed. **Not OPEN.** |
| **0.38** | Player Validation Cohort | After 0.37 P0 closed. |
| **0.39** | Commercial itch readiness | After 0.38. |
| **0.40** | Launch rehearsal / RC | After 0.39. Does not publish. |
| **1.0** | Public release | Separate owner go/no-go. |

Do not reuse 0.31–0.33 for independent review, PC, or commercial itch.

## Spent on or before this tip (do not remint)

| PR | Ticket | Meaning |
|---|---|---|
| **#363** | `SUN-RECEIPT-VERIFY-MODES-01` | Live tip. AGENTS receipt-path honesty + `docs/VERIFY_MODES.md`. STATUS/QUEUE explicitly incomplete there. |
| **#362** | `SUN-FABLE-HONESTY-01` | Receipt only. Recorded pointer lie. Did not rewrite STATUS/QUEUE. |
| **#360** | `SUN-CREW-BOARD-FOLLOW-CLARITY-01` | First Crew tap shows living board. `#crew-sheet` stays closed. Keep `renderCrewPanel("lena")`. |
| **#352** | `SUN-ROADMAP-TIP-SYNC-351-01` | Receipt only. Claimed STATUS/QUEUE retarget was not in the diff. |
| **#351** | `SUN-CASCADE-ALLUSIVE-PAYOFF-01` | `flags.changeorders` on `reckon_summary`. Tomas "People were tier four." unspent. |
| **#349** | `SUN-HITL-WIRE-REMAP-01` | SKIP 1–3 / ALREADY_SATISFIED 4–5. |
| **#348** | `SUN-TITLE-CONTINUE-CREW-02` | Continue chip = saved visible living crew. |
| **#347** | `SUN-DOCS-TIP-HONESTY-02` | Historical #345 cite. |
| **#346** | `SUN-ART-PLATE-LOOP-01` | Docs brief only. |
| **#345** | `SUN-STILL-BURNING-CORRIDOR-01` | Historical prior tip `c3626434`. |
| **#326** | `SUN-LETHAL-RESUME-DEATHBEAT-01` | Resume death-beat harness. |
| **#306** | `SUN-EMBRYO-COUNT-SWEEP-01` | Spoken 140,006 live. |

FEED rows drained: HITL remap, embryo sweep, lethal-resume harness, art-plate-loop dispatch. They are not fireable.

## Holds kept

- **Do not invent OPEN 0.37.**
- **0.36 stays PAINT, not OPEN.** `VERSION.md` and `docs/version-lock.md` are not edited.
- **Remint HOLD Approve-only.**
- **No Netlify.** No pin remint.
- **Ignore #297 and #304** unless the owner names them. #297 ships corrupt `src/engine.js` PLACEHOLDER. Do not merge.
- **No Bot JPEG.** No gameplay, `src/**`, `css/**`, `index.html`, or image bytes.
- **No certify, tag, Release, or close-out onto `main`.**
- PR 45 / draft PR 46 untouched. Amara-route PARKED. ART-R2 broad campaign HELD.

## Pointer files this ticket edits

- `docs/SUN_ROADMAP_UPCOMING_01.md` (this receipt)
- `docs/TICKET_QUEUE.md` (live lane line + empty FEED + spent table)
- `artifacts/PROJECT_STATUS.md` (lane-head fields + recently-landed + honesty pointer)

Not edited: `VERSION.md`, `docs/version-lock.md`, `artifacts/ROADMAP.md`, `artifacts/LOCKS.md`, historical honesty receipts, `AGENTS.md`, gameplay, art plates, Netlify.

Stop after this merge. Do not start the next ticket. Do not invent OPEN 0.37.
