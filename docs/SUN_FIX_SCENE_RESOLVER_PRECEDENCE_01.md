# SUN-FIX-SCENE-RESOLVER-PRECEDENCE-01

Base: `696676d4` (lane tip after #396; ≥ `3f43b2b5` #395).
Branch: `ticket/0.30.1-fix-scene-resolver-precedence-01`
NO-PUBLISH / NOT_CERTIFIED. No OPEN / GAME_VERSION / Netlify / Imagine.

## Resolver order (unchanged)

eventArt → id-keyed death/living guards → livingCastPresent/Only → scene.image → sceneImages[id] LAST

## A) vault_voice

BEFORE: eventArt early-return `images/vault.jpg` (BYTE_DIFF vs dedicated).
AFTER: eventArt key dropped. Map `images/vault_voice.jpg` wins (no scene.image).

## B) hygiene

- pregnancy_check: living-guard still `lena.jpg` if Lena alive (Myth PASS). Map `medbay_dim_alt.jpg` retired. No presence rewrite.
- aftermath_seal map → `corridor_variant.jpg` (match scene.image / OWNER HITL)
- act2_tether_truth map → `observation_crew.jpg`
- prom_make_tomas map → `quiet_tomas.jpg`
- breath_racks map → `vault_interior_alt.jpg`
- silence eventArt `covered_body.jpg` unchanged (BYTE_DUP / protect)

## C) out of ticket

priority_repairs / Vess-before-join stay on SUN-FIX-CRISIS-PLATE-01. Copilot draft #397 not used.

## D) protect list untouched

Vess boarding · quiet_* · bond_* · pursuit/afterglow · shower/rear · covered_body on Rourke · hydroponics · sela_ritual · vault_reveal · rogue_planet · final_choice · ending_landfall/fracture · custody_severed · onboarding_background.
