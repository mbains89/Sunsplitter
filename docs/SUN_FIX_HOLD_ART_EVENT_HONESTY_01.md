# SUN-FIX-HOLD-ART-EVENT-HONESTY-01-REMINT

Base: `048c7a506e7cfe1e7ff0e8681656fed7c55498ac` (lane after #399).
Prior #402 FAIL: sidecar `src/hold-art-event-honesty.js` + extra `index.html` script broke version-verify script manifest. Do not merge #402.

No new JPEG. crisis / priority_repairs out of scope. No sidecar. No extra index script.

## Tip proof before change

On `048c7a50`, live wires were still dishonest vs named copy:

| event_id | map / scene.image | Why HOLD |
|---|---|---|
| `boarding_stories` | `corridor.jpg` | Generic corridor; copy is hatch / three accounts (Elias, Amara, Tomas). |
| `coolant_trade` | `corridor_variant.jpg` | Neutral corridor; copy is Mira vs Lena over one tank. |
| `seal_or_food` | `corridor_variant.jpg` | Neutral corridor; copy is Deck 4 seal vs paste (Elias / Amara). |
| `time_pass` | `time_pass.jpg` | Hex TIME_PASS_UNAUTH — do not keep that plate live. |

#398 resolver precedence did not remap these four.

## After (folded into `src/engine.js` `resolveSceneImage` + `sceneImages`)

Guards in `resolveSceneImage` win before `scene.image` / map. Same crisis-style fold as #399.

| event_id | live plate |
|---|---|
| `boarding_stories` | `empty_berths.jpg` (hatch leftover; no false group) |
| `coolant_trade` | `medical_bay.jpg` if Lena alive; else `power_stress_1.jpg` if Mira alive; else `corridor_pressure_2.jpg` |
| `seal_or_food` | `work_elias.jpg` if Elias alive; else `hydroponics_amara.jpg` if Amara alive; else `corridor_pressure_3.jpg` |
| `time_pass` | `onboarding_background.jpg` (person-free days-pass stand-in) |

Map strings in `state.js` + scene.image on boarding / coolant / seal aligned to the living-default plate.

`index.html` script manifest unchanged: state + scenes-01..55 + engine.js + validate.js only.

NO-PUBLISH / NOT_CERTIFIED. No GAME_VERSION. No Netlify.
