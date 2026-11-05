# SUN-RECEIPT-VERIFY-MODES-01

SOURCE main@8d23109b · RUNTIME 06010765 · TASK SUN-RECEIPT-VERIFY-MODES-01 · MODE documentation

Lock: `lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 PAINT`

Docs/process only. Owner GO 2026-09-22 Astra apply route · F1+F2.

## F1 — receipt honesty

Completion receipts must not claim `artifacts/PROJECT_STATUS.md`, `docs/TICKET_QUEUE.md`, or any other path edit that is absent from the final `gh pr diff` / changed-files list. Verify claimed paths against that list before IDLE STOP. Incomplete scope must be labeled incomplete.

Landed in `AGENTS.md` § Receipts. Not already present verbatim on base `06010765`.

## F2 — verify.mjs modes

Landed in `docs/VERIFY_MODES.md`. Bare `node scripts/verify.mjs` (empty `VERIFY_HEAD_REF`) takes the old reconciliation route and FAILs when `HEAD:src` is not the authorized tree. PR `version-verify` sets `VERIFY_EXPECTED_SHA` + `VERIFY_HEAD_REF`. Identity checks are not weakened.

## Holds

No engine rewrite. No overlay. No GAME_VERSION mint. No Netlify. No invent OPEN scenes. No STATUS/QUEUE rewrite in this ticket (those files are not in the diff).
