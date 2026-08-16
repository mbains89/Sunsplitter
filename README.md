# Sunsplitter

Grimdark x cyberpunk narrative survival browser game. Pure static site:
no build step, no backend. index.html + CSS + JS modules, deployed
as-is.

## Repo layout

/index.html          entry point
/css/                 stylesheets
/src/                 engine + state + scene modules
  state.js, engine.js, validate.js
  scenes-early.js, scenes-mid-a.js, scenes-mid-b.js, scenes-late.js
  scenes-crises.js, scenes-exclusive.js, scenes-promises.js
/images/              art assets
/artifacts/           canon docs (see below)

## Canon docs (/artifacts)

PROJECT_STATUS.md is the single source of truth for what's shipped,
locked, or open. It supersedes every other doc in this repo on those
questions. Everything else is reference material it points to:
FABLE_BRIEF.md, VOICE_CARDS.md, SCENE_SKELETON.md, CHARACTER_BIBLE.md,
ART_RULES.md, ART_REQUESTS.md, MINTED_PHRASES.md,
FABLE_CASCADE_BACKGROUND.md, FABLE_CASCADE_ALLUSIVE.md.

## Process

Four roles, kept separate: Fable (scene drafting, audits, design),
Grok (program office, owns the lock registry and PROJECT_STATUS.md),
Build (implementation, validate.js), Art (batched at version lock).
Version close-out updates PROJECT_STATUS.md and any changed canon docs
in the same commit as the code change. Tag each shipped version
(v0.27.2, etc.) rather than naming zip files by hand.

## Constants that must not drift

04:19:07 · Tube 3 · 214 berths · change orders 4417 and 4491 · 61/19/42
systems · manifest tiers 1-4 · nine through the hatch · ship name
Sunsplitter.
