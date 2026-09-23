# SUN-DOCS-PC036-PACK-CLOSE-01

SOURCE main@8d23109b · RUNTIME 818a11198c1dac5bee152ab9188fb2da0d3a61cd · TASK SUN-DOCS-PC036-PACK-CLOSE-01 · MODE docs

Closes the **tip-named 0.36 PC evidence pack** for FEED.
Does not mint 0.36. Does not certify. Does not deploy. Last certified remains `0.28.1d`.
Paint on this lane stays `VERSION.md` first line `0.36` (**PAINT**, not OPEN).
No gameplay code. No JPEG. No Netlify. No remint of #249 / #252 / #256 / #257 / #258.
Does not invent OPEN 0.37 implementation.

Lane: `version/0.30.1-main-reconcile-ci.1`
Live tip recorded here: `818a11198c1dac5bee152ab9188fb2da0d3a61cd`
Evidence: merge of PR **#366** ROADMAP-UPCOMING after PR **#364** TIP-HONESTY-363.
This cite is that pre-PR lane HEAD. It is not this docs PR's own merge SHA.
`main` stays `8d23109b63b844e0703fb36643f14b91b8800c90`. Do not close the lane onto main.

---

## Tip-named pack (on lane, closed-for-FEED)

| PR | Ticket | Merged | Receipt on lane |
|---|---|---|---|
| 249 | `SUN-V036-PC-KEYBOARD-01` | yes | `docs/SUN_V036_PC_KEYBOARD_01.md` |
| 257 | `SUN-V036-PC-HOVER-FOCUS-01` | yes | `docs/SUN_V036_PC_HOVER_FOCUS_01.md` |
| 256 | `SUN-V036-PC-DESKTOP-MATRIX-01` | yes | `docs/SUN_V036_PC_DESKTOP_MATRIX_01.md` |
| 258 | `SUN-V036-PC-VIEWPORT-01` | yes | `docs/SUN_V036_PC_VIEWPORT_01.md` |
| 252 | `SUN-V036-PC-KEYBOARD-RUN-01` | yes | `docs/SUN_V036_PC_KEYBOARD_RUN_01.md` |

Widescreen revalidate is **not** credited: PR **#367** `SUN-V036-PC-WIDESCREEN-REVALIDATE-01` is open against this same base and is not merged.

`pc_readiness_0_36` in STATUS is now:
`tip-named pack closed-for-FEED (NOT certified; 0.36 PAINT; last certified 0.28.1d)`

Closed-for-FEED ≠ certified. Closed-for-FEED ≠ 0.36 product exit.

---

## Pointer files this ticket edits

- `artifacts/PROJECT_STATUS.md` (lane-head fields + `pc_readiness_0_36` + pack table)
- `docs/SUN_DOCS_PC036_PACK_CLOSE_01.md` (this receipt)

Not edited: `VERSION.md`, `docs/version-lock.md`, `docs/TICKET_QUEUE.md`, `AGENTS.md`, `artifacts/ROADMAP.md`, `artifacts/LOCKS.md`, gameplay, art plates, Netlify.

`docs/TICKET_QUEUE.md` at `818a1119` still lists `SUN-V036-PC-*` as OPEN-GATED. That queue line is labeled incomplete; this ticket does not rewrite the queue.

`identityAndAuthorityChecks` still requires these STATUS substrings unchanged: `` `release_state: NO-PUBLISH` ``, `` `version_integrity: NOT_CERTIFIED` ``, `PRESENT / UNRECONCILED / NO INTEGRATION OR RELEASE CREDIT`, `L-025 — LOCKED`, `L-026 — LOCKED`, `L-027 — LOCKED`, `L-028 — DEFERRED`. This ticket keeps them. `source_main_sha` and `runtime_baseline_sha` stay `8d23109b63b844e0703fb36643f14b91b8800c90`.
