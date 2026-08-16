# ART_RULES.md — Sunsplitter art honesty & wiring rules

**Verified against engine 0.25** (2026-08-15).  
Living companion to `ART_REQUESTS.md`. Rules here are permanent unless a later version explicitly revises them.

---

## Core honesty (locked)

Art must not contradict run state the way prose is forbidden to. Group/character plates that show identifiable living people are state assertions.

1. **Manifest requirement (every new plate):** characters depicted, location, palette pole (Living-warm / Future-cold / neutral), tier, earliest + latest reachable render point — declared in ART_REQUESTS.md.
2. **Group plates default to roster-ambiguous.** Backs, partial frames, silhouettes unless preconditions pin the exact living roster. Death-aware variants only when a plate must show specific faces after possible deaths.
3. **Crowd cap:** No more figures than the minimum possible roster at the plate’s earliest render point. Default ≤2 identifiable faces + backs/silhouettes. Non-cast adults never appear aboard.
4. **No invented legible text.** No ship names, name tapes, status strings, production vocabulary (“BATCH A”, “LOCKED”). Signage is illegible-by-design or a Grok-locked string only.
5. **Ending and Hero plates carry zero baked text.** All ending copy is engine-rendered over the image.
6. **Commander depiction:** back view, silhouette, or hands only. Never a face.
7. **Lethal-moment plates** show the *choice* (pre-commitment instant), not the outcome.
8. **Recovery plates** carry the *cost*, not rescue warmth.
9. **Portrait orientation only** (≈784×1168).
10. **Byte-identical reuse** must be a declared manifest alias.
11. **Portrait reference:** finalized attractive Batch A only. Rectangular interiors only.

---

## 0.25 locks (shipped)

### Grouped-plate resolver (Edit H)

`resolveSceneImage` substitutes a safe fallback whenever **ANY** of the eight named crew is not alive (not only total ≤3 or unrecovered Tomas/Jiro):

```
lena, elias, mira, tomas, amara, jiro, sela, vess
```

Applies to the enumerated group ids (including but not limited to):

- `faction_split` / `faction_split_alt` / `debt_notice` → `corridor_variant.jpg`
- `reckon_public` / `reckon_summary` → `observation.jpg`
- Plus existing id-keyed guards for crisis / observation_crew family / arc plates that already checked unrecovered Tomas/Jiro

New group plates must either be roster-ambiguous by design or be added to this guard list.

### faction_split retired from live wiring

- `sceneImages.faction_split` → **`images/corridor_variant.jpg`** (permanent)
- Source file `faction_split.jpg` / `faction_split_alt.jpg` remain on disk for reference only
- **Regen queued** in ART_REQUESTS: roster-ambiguous / backs-only version (≤2 faces or silhouettes, zero text, rectangular) for post-0.25 use

### Other 0.25 art notes

- `covered_body.jpg` approved for `act3_lethal_lena_end` (and rourke_end alias) — identity-hidden, no baked text. Protect.
- Opening `medical_bay.jpg` must not be reused as a late-game plate (playtest: too recognizable). Prefer dedicated or distinct plates for recovery/lethal aftermaths.

---

## Process

- Always show Imagine cards in chat for approval before lock.
- Lock = save to `artifacts/sunsplitter_images/` **and** mirror to `sunsplitter/images/`.
- Efficiency: Hero / Strong / Solid tiers; target ~25–35 distinct + variants.
- Clothing: mix form-fitting cyberpunk bodysuits with tank tops / layered work clothes.

---

## Moderation avoidance plan (locked 2026-08-16)

Use a **very gentle touch**. Apply all of the following together when a plate is at risk of moderation; do not over-correct any single lever.

### Existing (still primary)
- Side / three-quarter angles preferred over full frontal.
- Soft purple + cyan lighting (avoid harsh pure red).
- Leg or pose covering where needed.

### Expanded levers (add gently)
1. **Framing & crop** — Prefer above-waist or three-quarter. Tighter crops reduce explicit territory.
2. **Pose & cover** — Body as cover (crossed leg, arm across torso, hair over chest, turned torso). “Just finished / just starting” moments (bra in hand, robe half-open) clear better than pure nudity.
3. **Clothing-state language** — Soft descriptors first (“revealing,” “barely covering,” “open at the collar”). Full nudity only when paired with a strong secondary action.
4. **Atmosphere & detail load** — Heavy environmental detail (frost, steam, condensation, neon, grit, metal texture) gives the model safe pixels. Sparse studio backgrounds moderate more often.
5. **Expression & tone** — Prefer exhausted competence, flat spent look, quiet afterglow, or quiet mischief over pure seduction or ecstasy.
6. **Prompt structure** — Character + activity first; clothing/nudity state later. Optional soft guard language (“grounded,” “cinematic still,” “not graphic”) when on the edge.

Apply the whole set with a light hand. The goal is clearance without changing the approved composition or character identity.

When these rules change, bump the verification stamp at the top of this file and note the version in PROJECT_STATUS close-out.

