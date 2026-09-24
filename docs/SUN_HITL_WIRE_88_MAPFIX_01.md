# SUN-HITL-WIRE-88-MAPFIX-01 / FINISH-03

Lock: `lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 PAINT`

Myth PASS Slot15 DONE. Owner GO merge HITL. MERGE STOP until state+engine+verify green.
No second unpaid PR. No JPEG regen. No Netlify. No certify. No 0.36 mint.

## Landed on PR #376

- scene.image FIX×6 (scenes-03/11/23/41)
- remains-lean expected plates
- art-r2-playtest-close-checks expected plates (`aba000f4`)
- Slot15 PASS receipt

## Still unpaid (version-verify FAIL)

| file | remote blob |
|---|---|
| `src/state.js` | `4a6fc253` |
| `src/engine.js` | `951b6155` |
| `scripts/verify.mjs` | `2f18cbfc` |
| `scripts/playtest-art-event-audit-checks.mjs` | `2c840cc8` |

Connector cannot push 39k/92k/274k. HTTPS git push has no credentials. PASTE_OK in $S2 chat f92e6661 did not land on this branch.

Patched copies exist in the seat at `/tmp/sun88` (this turn). Drop those three files onto `ticket/0.30.1-hitl-wire-88-mapfix-01` via GitHub web UI, then re-run version-verify.
