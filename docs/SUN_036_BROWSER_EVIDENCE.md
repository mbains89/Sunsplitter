# 0.36 PC readiness — real-browser evidence

`ticket: SUN-BROWSER-BOT-01 · runtime: work branch 0eead44 (after PR #488) · tool: scripts/sun-browser-bot.mjs @ d987dc2 · 2026-11-05`

This is **candidate evidence** for ROADMAP §11 acceptance. It is not a §11 exit, a certification, or a release credit. The posture stays `NO-PUBLISH / NOT_CERTIFIED`, and the last certified build is `0.28.1d`. Manraj rules whether §11 is met.

## Method

`scripts/sun-browser-bot.mjs` serves the repo locally and plays complete runs in Playwright Chromium: tone screen → title → commander creation → intro cinematic → tutorial → story → ending → What Remains. It picks among *enabled* choices with a seeded random generator. Every run is checked for:
- page errors and console errors
- failed requests and broken plates
- empty story and horizontal page overflow
- renders with no enabled choice, and scene loops

`--chaos` adds three disruptions per choice:
- About 4% are replaced by a page reload and **Continue**. The scene, survivors, supplies, integrity, cohesion, dead list and story text must come back identical.
- About 3% open **Crew**.
- About 3% resize the viewport to one of seven sizes: 390×844, 844×390, 768×1024, 1024×768, 1280×720, 1920×1080, 720×450. State must be unchanged afterwards, and no choice may be clipped.

Input modes:
- `mouse`: clicks.
- `touch`: taps.
- `keys`: digit keys for choices; dialogs by focus plus Enter.
- `tab`: every button is reached by pressing **Tab** only, then Enter. A button that is not reachable within 40 Tabs is reported.

Desktop uses a 1440×900 viewport. Phone uses Playwright's Pixel 7 profile (touch, device scale).

## Results at 0eead44

| Config | Command | Runs | Reloads | Resizes | Findings |
|---|---|---|---|---|---|
| Desktop, Tab only | `--viewport desktop --input tab --seed 201` | 4/4 ended | — | — | 0 |
| Phone, Tab only | `--viewport phone --input tab --seed 202` | 4/4 ended | — | — | 0 |
| Desktop, mouse, chaos | `--viewport desktop --input mouse --chaos --seed 203` | 5/5 ended | 62 | 38 | 0 |
| Desktop, keys, chaos | `--viewport desktop --input keys --chaos --seed 205` | 5/5 ended | 17 | 19 | 0 |
| Phone, touch, chaos | `--viewport phone --input touch --chaos --seed 206` | 5/5 ended | 73 | 36 | 0 |
| Phone, keys, chaos | `--viewport phone --input keys --chaos --seed 104` | 5/5 ended | 18 | 16 | 0 |
| **Total** | | **28/28** | **170** | **109** | **0** |

Endings reached: The Living Ship ×12, Fracture ×9, Still Burning ×4, The Long Dark ×2, The Quiet Ship ×1.

## Against §11 acceptance

| §11 acceptance line | What this shows | Still open |
|---|---|---|
| Start-to-end keyboard-only run succeeds | 8 of 8 Tab-only runs (desktop and phone) ended, with every dialog and choice reached by Tab. 10 more digit-key runs ended. | A human keyboard pass. The bot doesn't judge whether the focus ring is visible or the focus order makes sense. |
| Mouse, touch, keyboard, zoom, fullscreen and resize preserve state and choice integrity | 170 reload-and-Continue cycles and 109 resizes with no drift. Choices stayed on screen after every resize. | Browser zoom and the fullscreen API are not exercised; resize stands in for zoom only roughly. |
| Desktop composition does not regress phone layout | No horizontal overflow and no clipped choice at any phone, tablet or desktop size above. | Visual review by eye. The bot checks geometry, not looks. |
| Desktop matrix passes the 0.34 accessibility/performance controls | Chromium only. | Firefox and Safari, and the 0.34 controls themselves. |

## Defect found and fixed during collection

- **#488 SUN-CREW-FOCUS-DIGITS-01.** After clicking **Crew**, digit keys did nothing until the player clicked into the story. A phone keys-plus-chaos run pressed "2" sixty times on `seal_or_food`. The same seed now passes.

## Re-running

```
node scripts/sun-browser-bot.mjs --runs 5 --viewport phone --input touch --chaos --seed 206
```

Exit 0 means no findings. Playwright resolves from `SUNSPLITTER_PLAYWRIGHT_MODULE`, then `playwright`, then the global npm root. CI has no Playwright, so this is a manual check. The headless counterpart that does run in CI is `scripts/sun-playerflow-scene-coverage-checks.mjs` (#487).
