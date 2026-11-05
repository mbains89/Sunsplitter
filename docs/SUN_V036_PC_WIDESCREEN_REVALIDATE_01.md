# SUN-V036-PC-WIDESCREEN-REVALIDATE-01

SOURCE main@8d23109b · RUNTIME 818a11198c1dac5bee152ab9188fb2da0d3a61cd · TASK SUN-V036-PC-WIDESCREEN-REVALIDATE-01 · MODE verification

Lock: `lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 PAINT`

**ALREADY_SATISFIED** on tip `818a11198c1dac5bee152ab9188fb2da0d3a61cd`.
This is a revalidate receipt for ROADMAP §0.36 workstream 2 (revalidate PR **#85**). It does not mint or certify 0.36. It does not invent OPEN 0.37 product.

## Verdict

PR **#85** (`SUN-V032-DESKTOP-COMPOSITION-01`, merged 2026-09-01, head `753a58681b2d084d5f5e67846f9bba142dc8ffbf`) still supplies widescreen plate-beside-prose on the live write lane. Phone stacked layout and the 0.34 touch contract are still present. No CSS patch in this ticket.

## Tip files cited

- `css/style.css` @ `818a1119`
- `scripts/verify.mjs` `desktopCompositionChecks()` @ `818a1119`
- historical PR: https://github.com/mbains89/Sunsplitter/pull/85

## Widescreen needles still present in `css/style.css`

| Needle (exact `verify.mjs` string) | Line on tip |
|---|---|
| `@media (min-width: 1024px) and (min-height: 640px)` | 426 |
| `grid-template-columns: minmax(320px, 0.85fr) minmax(0, 1.15fr)` | 430 |
| `width: min(calc(100% - 32px), 48dvh, 430px)` | 453 |
| `#scene-image-wrap.visible + #main` | 468 |
| `grid-column: 2` | 469 |
| `max-width: 68ch` | 474 |
| `font-size: 1.08rem` | 479 |

`scripts/verify.mjs` still runs `desktopCompositionChecks()` and still fails a missing needle with `0.32 desktop composition missing …`. Those identity strings were not weakened.

## Phone contract still present (no regression patch)

| Needle | Line on tip |
|---|---|
| `--touch: 48px` | 24 |
| `#crew-panel` | 199 |
| `max-height: min(36dvh, 260px)` | 211 |
| `overflow-y: auto` | 212 |
| `min-width: var(--touch)` / `min-height: var(--touch)` | 159–160, 231–232 |
| `@media (max-width: 360px)` | 1026 |
| `@media (max-width: 480px) and (max-height: 700px)` | 1042 |
| `max-height: min(48dvh, 320px)` | 1047 |

Stacked phone layout is unchanged. No Electron/Tauri/gamepad/cloud saves. No PC-only story. `css/style.css` is **not** in this PR diff.

## Holds

- No 0.36 mint / certify / OPEN product.
- No invent OPEN 0.37 product.
- No Netlify / PIN-02 remint.
- No STATUS/QUEUE rewrite in this ticket (those files are not in the diff; incomplete pointer sync labeled incomplete).
- Do not remint PR **#85**.
