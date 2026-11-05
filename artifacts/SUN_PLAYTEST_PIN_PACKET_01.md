# SUN-PLAYTEST-PIN-PACKET-01

Docs-only owner manual. **PLAYTEST_READY.** Not a pin remint.
`NO-PUBLISH / NOT_CERTIFIED`. Last certified remains `0.28.1d`.

| Field | Value |
|---|---|
| Host | https://sunsplitter.netlify.app |
| Packet tip (lane contracts) | `4769569e61d598bf960f68688fdf9c27ae66a856` |
| STATUS recorded host pin | `a91a26d47ac76a976ca4406caf9b04511c11ba82` |
| PIN-02 | **do not remint** |

If the hosted build is still `a91a26d`, play the four contracts against that host and note SHA mismatch. Do not change Netlify from this ticket.

## 1. Amara / Tomas privacy

- Commander default-offer for Amara stays closed when `state.romance.amara_tomas` is set (`romanceOpen` in `src/state.js`).
- Vess first-offer (`vess_offer` / `src/scenes-17.js`) names only Commander-crossed living romances in the private-channel line. It does not invent an Amara–Tomas pair as the Commander's.
- Fail: Amara initiates to the Commander after an Amara–Tomas pair, or Vess cites that pair as the Commander's warm channel.

## 2. Voice hygiene (PR 171, still on this tip)

- `vault_voice` (`src/scenes-05.js`): presence quote is tagged Mira if living, else Tomas if living. Never unattributed.
- Vess casualty list (`src/scenes-17.js`): first names for every `state.dead` except Rourke; Oxford join; no `and others`.
- Tomas breath (`src/scenes-53.js`): `Commander.` + vent-the-rescued line; refused beat `Understood, Commander. The math is yours.` No `Captain`.

## 3. Storyline citation negatives (PR 174)

On What Remains / ending reflection:

- 3–6 current-run facts only.
- Ban: `would have`, `if you had`, `should have`, scores, ratings, points.
- Deaths follow logged `deathCause`; unknown cause is `<Name> died`.
- `deathCause` without `state.dead` does not name that person.
- Untested promise (`made`) does not print the service-pocket test line.

Table: `artifacts/SUN_STORYLINE_CITATION_TRUTH_01.md`.

## 4. NEW-RUN confirm

With a save on the title screen:

- New Run / Begin opens in-page confirm (`#new-run-confirm`, `confirmNewRun` / `cancelNewRun`).
- Confirm starts a fresh campaign (`beginFreshCampaign({ persist: true })`) at wake/intro.
- Cancel leaves the save.

Proof surface: `scripts/playtest-new-run-checks.mjs`.

## Owner pass / fail

Mark each block PASS or FAIL. FAIL is a note back to Orchestrator, not a remint of 107–174 and not a Netlify action.

HOLD: PR 45/46, L-025–028 closed, no Canon wake, no 0.36.
