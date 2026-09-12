# SUN-V036-MINT-BLOCKERS-01

Lane tip at write: `1e9f548106ea` (PR205 SUN-V036-BOUNDARY-01).
Paint stays **0.33**. This packet does not mint, tag, certify, publish, or Netlify-remint.

## Already landed

- `docs/SUN_V036_BOUNDARY_01.md` — owner OPEN 0.36 BOUNDARY
- `docs/version-lock.md` — `lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 BOUNDARY`
- Playtest residual drain through PR204 closed; remint 107–205 banned

## Mint-blocking next (ordered)

| Ticket | Objective | Holds |
|---|---|---|
| `SUN-V036-VERSION-PAINT-01` | Coordinated paint `VERSION.md` / `state.js` / title subtitle → `0.36`; retarget `version-lock-ci` to allow 0.36 paint. | One PR; no certify; no tag |
| `SUN-V036-PIN-PACKET-01` | Docs pin packet for NOT_CERTIFIED playtest @ post-paint tip. Approve-only host pin — Orchestrator remints only after owner Approve. | No remint in the docs PR |
| `SUN-V036-ROADMAP-NEXT-01` | Post-0.36 mint-blocking queue (2–3 tickets max). Not infinite residuals. | Docs only |

## Not mint-blocking

- Further playtest residuals (CREW/MOBILE/CACHE/TITLE reconfirms)
- Art HITL / wire (PARKED)
- Certified close-out / 0.28.1d changes

## Overnight feeds

Paste-ready copies: `~/.codex/overnight/S2_FEED_V036_*` (Orchestrator-owned).
