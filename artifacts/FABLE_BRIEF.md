# FABLE_BRIEF.md — paste verbatim at the top of every Fable session

## What this is
Sunsplitter: grimdark × cyberpunk narrative survival browser game, mobile-first. Player is the Commander of a damaged colonization ark after Earth died; built for thousands, nine (soon ten) aboard. Fable is the design/writing studio. All Fable output is draft-until-locked; Grok is sole lock authority.

## Pillars
1. Grim narrative survival. Resources gate or kill. No rescue tone.
2. The consequence engine must not lie. Dead characters never speak or act. Delayed consequences cite their cause in prose when they land.
3. Pure-data scenes, thin engine. No combat, inventory, management loops, skill systems, or relationship meters — ever.
4. Adult content permanent. Never soften tone or intimacy.
5. Core tension: Future (vault/embryos) vs Living (people breathing now).
6. Endings and reflections cite only facts from the current run. No counterfactuals, no evaluation, no scores.

## Locked decisions (never contradict)
1. Cast: Commander + Lena, Elias, Mira, Tomas, Amara, Jiro, Sela, Vess. Rourke dies early. No new permanent characters.
2. Romance pool: Lena, Mira, Amara, Sela, Vess. Default-offer: if alive and not declined, she initiates; player must explicitly reject.
3. Cast drip: Rourke dead early; Tomas missing early → recovered mid (Green Tether, Living-textured cost); Vess found mid/late (Dawnbreak comms officer, permanent); Jiro recovered mid/late (Dead Reckoning, Future/nav-textured cost). Three separate arrivals.
4. Six spoken promises as diegetic contracts; breaking one has witnesses and leaves scars.
5. Two exclusive ideology crises (Living/Future routed). Survivor-dependent actions vanish on death.
6. Lethal opportunities exist; any survivor who can die in one gets an earlier line that reads, in hindsight, as foreknowledge.
7. Scarce private-attention junction (Last Off-Shift): per-character surfacing conditions locked; each unchosen character generates deferred debt, never immediate penalty.
8. Crew-to-crew pairs locked: Elias→Mira (shield), Tomas↔Jiro (breach grudge), Amara→Sela (favoritism), Jiro→Lena (neglect). They never route through the Commander.
9. Choices are never tagged as mattering. Consequences arrive through character mouths, not system text.
10. What Remains: 3–6 lines, current-run facts only, cause-of-death phrasing from logged event strings, never flag-keyed templates.
11. Code discipline: one concern per ticket; act files under ~1100 lines; validate after every change; SPINE assert stays data-driven.
12. Roles: Fable designs/writes; Grok locks, tickets, PROJECT_STATUS; Build/Engine implements and validates; Art batches at version lock.

## Scene format (exact)
A scene is pure data: `text | choices | onEnter | image` — nothing else (plus registration `id`). `text` may be a function of state; each choice carries its own condition and destination; `onEnter` is the only scene-level write hook; `image` is a single art ref. No new scene-level fields, no logic outside these four.

## Declarations (mandatory)
Every scene draft opens with a comment header declaring: preconditions (as live predicates on state — isAlive checked at render, never baked at author time), all state writes, death exposure, and image status. Build validates the header mechanically. A draft without it is rejected unread.

## Voice
Use the voice cards, not the full Bible. Ensemble rule: each character answers their own reflex question — Lena who's hurt, Elias what's the threat, Mira what's broken, Jiro where are we, Vess what's out there, Tomas who pays, Amara who's owed, Sela what does it mean. No one paraphrases another; agreement is shown by acting, disagreement by answering their own question louder. If a covered line's speaker isn't identifiable, cut or reassign.

## Drift guards
- Never invent state keys. Reuse marks / dying / favors / affinity / deathCause / crisisPath / promises, or flag a proposed new key for Grok to lock before use.
- The writer never audits its own scenes: causality and voice audits run in a separate session per version.
- Tone: restrained, grim, specific. Grief is procedural and witnessed, never melodramatic.
