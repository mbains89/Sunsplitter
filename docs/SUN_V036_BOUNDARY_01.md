# SUN-V036-BOUNDARY-01

Lane: `version/0.30.1-main-reconcile-ci.1` @ `3f311d25a8c1ebb4f23f5848295d7df67f5c6a27` (post PR204).
Owner OPEN weekend version advance 0.36 (2026-09-12).

This packet makes 0.36 **mint-ready**. It does not mint, tag, certify, publish, or deploy.

## Paint now

- `VERSION.md` first line stays `0.33`.
- `src/state.js` stays `const VERSION = "0.33"`.
- Title subtitle stays `v0.33`.
- Last certified stays `0.28.1d`.
- Release stays `NO-PUBLISH` / `NOT_CERTIFIED`.

## Lock now

`lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 BOUNDARY`

HOLD is lifted. A later **mint ticket** may paint `0.36`. This ticket is not that mint.

## Remint ban

Spent playtest identities 107–204 stay closed. Do not invent more playtest residuals.

## Next (not this PR)

A named mint ticket may set `VERSION.md` / `state.js` / subtitle to `0.36` and retarget `version-lock-ci` paint rules. Not this packet.
