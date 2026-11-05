# verify.mjs modes

SOURCE main@8d23109b · RUNTIME 06010765 · TASK SUN-RECEIPT-VERIFY-MODES-01 · MODE documentation

Lock: `lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 PAINT`

This file documents how `scripts/verify.mjs` chooses its identity route. It does not change those checks and does not authorize a weaker local pass.

## Two ways the gate runs

`identityAndAuthorityChecks()` in `scripts/verify.mjs` always:

- binds `SOURCE_MAIN_SHA` / `SOURCE_MAIN_TREE`
- requires `e4f8440` as an ancestor of `HEAD`
- requires STATUS `NO-PUBLISH` / `NOT_CERTIFIED` / art posture / L-025–L-028 tokens
- requires the LOCKS roadmap digest to match `artifacts/ROADMAP.md`
- requires the fixture identity in `scripts/fixtures/main-reconcile-ci-pr-baseline.json`

Those checks are not optional.

The extra **authorized `HEAD:src` tree** check is the reconciliation route:

```js
const testedRef = process.env.VERIFY_HEAD_REF || "";
const currentReconciliationRoute =
  !testedRef ||
  testedRef === fixture.branches.ticket ||
  testedRef === fixture.branches.version;
if (currentReconciliationRoute && git(["rev-parse", "HEAD:src"]) !== REQUIRED_SRC_TREE) {
  errors.push("main-reconcile HEAD:src changed from the authorized runtime tree");
}
```

Fixture branch names (do not invent a second pair):

- `fixture.branches.version` = `version/0.30.1-main-reconcile-ci.1`
- `fixture.branches.ticket` = `ticket/0.30.1-main-reconcile-ci-successor-01`

### Mode A — bare local

```bash
node scripts/verify.mjs --self-test
node scripts/verify.mjs
```

`VERIFY_HEAD_REF` is empty. `VERIFY_EXPECTED_SHA` defaults to `git rev-parse HEAD`.

Empty `VERIFY_HEAD_REF` **is** the old reconciliation route. If lane `src/` has moved past `REQUIRED_SRC_TREE` (`f907a0e455b9ccb562769f3520244ef16099f752` at this writing), bare verify **FAIL**s with `main-reconcile HEAD:src changed from the authorized runtime tree`. That FAIL is correct for Mode A. Do not delete or skip the check to make a local tree look green.

### Mode B — PR / version-verify context

GitHub Actions `version-verify` (`.github/workflows/verify.yml`) sets:

```bash
export VERIFY_EXPECTED_SHA="<pull-request head sha>"
export VERIFY_HEAD_REF="<github.head_ref>"   # e.g. ticket/0.30.1-receipt-verify-modes-01
test "$(git rev-parse HEAD)" = "$VERIFY_EXPECTED_SHA"
node scripts/verify.mjs --self-test
node scripts/verify.mjs
```

When `VERIFY_HEAD_REF` is a live `ticket/*` other than the fixture successor ticket, the authorized-`src` equality check is **not** the route. Identity / STATUS / LOCKS / fixture checks still run. Green version-verify on a ticket PR is not certification and is not a sequential-gate close.

Reproduce a ticket-PR pass locally only by setting the same env the workflow sets, on the same SHA:

```bash
export VERIFY_EXPECTED_SHA="$(git rev-parse HEAD)"
export VERIFY_HEAD_REF="ticket/0.30.1-receipt-verify-modes-01"
test "$(git rev-parse HEAD)" = "$VERIFY_EXPECTED_SHA"
node scripts/verify.mjs --self-test
node scripts/verify.mjs
```

Do not export a fake `VERIFY_HEAD_REF` to hide a real reconciliation FAIL on `main` or on the fixture ticket/version refs.

## What this file does not do

- Does not weaken `identityAndAuthorityChecks`.
- Does not mint `GAME_VERSION` or 0.36 OPEN.
- Does not authorize Netlify, certify, or merge-to-main.
