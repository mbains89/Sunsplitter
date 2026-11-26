# SUN-PLAYTEST-COMMANDER-LIGHT-01

SOURCE main@8d23109b · RUNTIME 2ae0541f4af4f4e67a3bc934b90efc8daa414579 · TASK SUN-PLAYTEST-COMMANDER-LIGHT-01 · MODE verification

Plan item 12. AUTO-OPEN standing. Prefer playable light hybrid over a second paper pass.
**ALREADY_SATISFIED** on this tip. Do not remint. Do not grow a full character-creator.

Playable surface already landed:
- PR 161 paper design
- PR 210 `SUN-V036-COMMANDER-CREATION-01` playable `#commander-create` (callsign + optional seal + oath; role stays Commander)
- PR 238 `SUN-V036-COMMANDER-CREATE-HINT-01` chrome hint

Tip evidence: `index.html` `#commander-create` / `#commander-callsign` / seal radios / oath; `src/validate.js` `showCommanderCreate` + `commitNewRunWithCommander` writes `state.commanderCallsign` and stamps intro line 3.

Crew-conflict events are PR 213 — not this ticket. Do not remint #213.
Netlify HOLD. No 0.36 mint. L-025 Commander stays faceless.
