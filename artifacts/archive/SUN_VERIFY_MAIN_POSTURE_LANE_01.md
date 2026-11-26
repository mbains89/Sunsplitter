# SUN-VERIFY-MAIN-POSTURE-LANE-01

Docs/proof only. Not certification. Not a close-out to `main`.

## Tip under test

- Lane: `version/0.30.1-main-reconcile-ci.1`
- Base tip: `9e9025ebccef2a99daffcd615ecc42d82b6f38bd` (merge of PR 171 `SUN-VOICE-HYGIENE-01`)
- Prior DONE on this tip: privacy-loop (PR 170), voice hygiene (PR 171)
- Proof PR: 172 on `ticket/0.30.1-verify-main-posture-lane-01-r2`

## Main posture pins (live)

- `main` HEAD: `8d23109b63b844e0703fb36643f14b91b8800c90`
- `SOURCE_MAIN_TREE`: `a6b96e0907de586f6cdd31cf15db09bc1341ddaf`
- Main `src` / `REQUIRED_SRC_TREE`: `992f7c57e18709acc08c8ee3cddcfdea816a6acf`
- Fixture `scripts/fixtures/main-reconcile-ci-pr-baseline.json` matches those three values
- Fixture `certification`: `NO-PUBLISH / NOT_CERTIFIED`
- Fixture branches: `version/0.30.1-main-reconcile-ci.1` and `ticket/0.30.1-main-reconcile-ci-successor-01`

`scripts/verify.mjs` `identityAndAuthorityChecks` binds the same pins. The `HEAD:src == REQUIRED_SRC_TREE` equality applies only when `VERIFY_HEAD_REF` is empty or equals those fixture branch names. Later version-lane tickets may advance lane `src`. That is allowed and is not a main-posture drift.

## STATUS tokens preserved

- `release_state: NO-PUBLISH`
- `version_integrity: NOT_CERTIFIED`
- art: `PRESENT / UNRECONCILED / NO INTEGRATION OR RELEASE CREDIT`
- `L-025 — LOCKED` / `L-026 — LOCKED` / `L-027 — LOCKED` / `L-028 — DEFERRED`

## Holds

NO-PUBLISH · NOT_CERTIFIED · no 0.36 · remint 107–171 banned · no tag/deploy/Netlify remint
