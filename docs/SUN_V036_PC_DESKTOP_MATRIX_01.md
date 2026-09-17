# SUN-V036-PC-DESKTOP-MATRIX-01

SOURCE main@8d23109b · RUNTIME cee5b4a0fd98ec7a18664f26c08b93a10cabf68b · TASK SUN-V036-PC-DESKTOP-MATRIX-01 · MODE verification

ROADMAP 0.36 workstream 6. Evidence packet only. Not ALREADY_SATISFIED — no prior desktop-matrix file on this tip.
0.34 controls this packet is scored against (already LANDED ON VERSION LANE, not certified):
- PR 107 `SUN-V034-MOBILE-UX-01`
- PR 108 `SUN-V034-A11Y-01` (`:focus-visible`, `prefers-reduced-motion`)
- PR 109 `SUN-V034-PERF-01`
Desktop breakpoint already in `css/style.css`: `@media (min-width: 1024px) and (min-height: 640px)`.

No Electron/Tauri. No gamepad. No cloud saves. No story branch. No certify. No main close-out. Last certified `0.28.1d`. Netlify HOLD.

## Matrix (operator fill)

Browser = current desktop Chromium or Safari. Window focused. Score PASS / FAIL / BLOCKED vs tip `cee5b4a0`.

| Viewport | Zoom | Fullscreen | Status chrome readable | Choice row wrap OK | Focus-visible on Tab | Art panel not clipping HUD | Motion respects reduce |
|---|---|---|---|---|---|---|---|
| 1280×800 | 100% | windowed |  |  |  |  |  |
| 1280×800 | 125% | windowed |  |  |  |  |  |
| 1440×900 | 100% | windowed |  |  |  |  |  |
| 1440×900 | 150% | windowed |  |  |  |  |  |
| 1920×1080 | 100% | windowed |  |  |  |  |  |
| 1920×1080 | 100% | OS fullscreen |  |  |  |  |  |
| resize 1920→1280 live | 100% | windowed |  |  |  |  |  |

## Notes

FAIL cells become later one-concern tickets. This packet does not invent those tickets and does not exit 0.36 PC Readiness.

`OPERATOR:`  
`DATE:`  
`TIP:` cee5b4a0fd98ec7a18664f26c08b93a10cabf68b  
`OUTCOME:` OPEN — not certified
