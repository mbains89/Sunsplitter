# SUN-PREP-RESTOCK-01

SOURCE lane@2c49176c1643 · TASK SUN-PREP-RESTOCK-01 · MODE proposal

Docs-only planning packet. Does **not** mint `GAME_VERSION`, open or
repaint 0.36, certify, remint Netlify, generate JPEG, or start gameplay.

## Tip honesty (live 2026-09-19)

| Surface | Value |
|---|---|
| Write lane | `version/0.30.1-main-reconcile-ci.1` |
| Lane tip (this packet) | `2c49176c16430258be7cbf9d0a302fed05ae9b88` |
| Evidence | Merge of PR **#292** `SUN-289-VERIFY-FIX-01` |
| #292 parents | `bc353227497a0aaefe78241f7238e30eb6a848c9` (lane before verify-fix) + `a8f349621cb8e5e1ed407cbaab8d7a9a7dab8b27` (ticket head) |
| #292 scope | Restore full `src/validate.js` (`window.validateSunsplitter`); title Enter/Space prefers `#btn-resume` when Continue is visible |
| Prior lane merge | PR **#291** `SUN-SLOT15-ARC-FUTURE-2-WIRE-01` @ `bc353227` (vault_interior_alt APPROVED v3) |
| `main` (SHIPPED observation only) | `8d23109b63b844e0703fb36643f14b91b8800c90` |
| Player-facing `VERSION.md` on lane | first line `0.36` — **existing PAINT**, not a new mint from this PR |
| Lock line | `lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 HOLD for certify/Netlify/OPEN product` |
| Last certified | `0.28.1d` |
| Release | `NO-PUBLISH` / `NOT_CERTIFIED` |

Do not treat `VERSION.md` = `0.36` as owner OPEN to certify, tag, publish,
or remint a Netlify pin. Paint already exists on the lane; this restock
does not change it.

Stale queue tip `a5e52b0` / PR 163 in the previous `TICKET_QUEUE.md` is
**superseded** by `2c49176c1643` / PR 292.

## What this restock does

- Refresh `docs/TICKET_QUEUE.md` and `docs/SUN_ROADMAP_NEXT_PACKS_01.md`.
- Mark Pack **0.30.2** and Pack **0.30.3** identities **ALREADY_SATISFIED**
  on this tip (do not remint).
- Leave Pack **0.30.4** JPEG / Imagine generation **not fireable** from
  Cursor or Grok Bot.
- Queue ≥6 paste-ready fireable tickets for `$ S2` FEED from leftovers
  that are **not** already landed as playable one-concern work.
- Keep every `SUN-V036-PC-*`, certify, and Netlify item **OPEN-GATED**.

## What this restock does not do

- Edit `VERSION.md`, `src/**`, `css/**`, `images/**`, `index.html`.
- Edit `artifacts/ROADMAP.md` or `artifacts/LOCKS.md`.
- Remint PRs 107–292.
- Open 0.36 product work, certify, tag, deploy, or pin Netlify.
- Generate plates in Cursor / Grok Bot.
- Touch Copilot non-ticket branches.
