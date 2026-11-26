# SUN-V036-PC-HOVER-FOCUS-01

SOURCE main@8d23109b · RUNTIME 656e1e1bb953e7a462329aa941564aec6f3679f4 · TASK SUN-V036-PC-HOVER-FOCUS-01 · MODE verification

ROADMAP 0.36 workstream 3. **ALREADY_SATISFIED** at token level on this tip. No CSS remint.
Covering land: PR 108 `SUN-V034-A11Y-01` plus choice/crew chrome already in `css/style.css`.
No Electron/Tauri. No gamepad. No cloud saves. No story branch. No certify.

## State map on tip `656e1e1b`

| State | Where | Cite |
|---|---|---|
| hover | `.choice-btn:hover`, `.btn:hover`, `#btn-crew:hover`, `.btn-primary:hover` | `css/style.css` |
| focus | `.choice-btn:focus`, `.choice-btn:focus-visible`, `button/input/[role=button]:focus-visible` | same + PR 108 |
| pressed | `.choice-btn:active`, `.btn:active`, `.crew-chip:active` | same |
| disabled | `.choice-btn:disabled`, `.choice-btn.disabled`, and disabled hover/active locked off | same; engine gated choices |
| selected | `.crew-chip.selected` | crew name list only — choices are one-shot, not sticky-selected |

`prefers-reduced-motion: reduce` already damps choice/btn active motion (PR 108).

## Operator smoke (optional fill)

Hover must not equal focus-visible. Disabled must not look hoverable. Selected chip stays distinct from hover.

`OPERATOR:`  
`DATE:`  
`TIP:` 656e1e1bb953e7a462329aa941564aec6f3679f4  
`OUTCOME:` OPEN sitting — tokens already landed; not 0.36 exit
