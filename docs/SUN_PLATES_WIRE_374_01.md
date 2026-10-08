# SUN-PLATES-WIRE-374-01

Lane: `version/0.30.1-main-reconcile-ci.1` @ `5a17d633d799dc54487e7b16127e8049969db5cd`
Source PR: #374 `ticket/0.30.1-hitl-wire-88-01` @ `cdb920de` (26 JPEG overwrites only)
This branch: `ticket/0.30.1-plates-wire-374-01`

Lock: `lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 PAINT`

No VERSION bump. No tag. No Netlify. No image generate / edit / recolor / crop / swap.

## Rule applied

#374 images are old harvest copies. Plates already live from #391 (and later tip landings) stay byte-for-byte. This ticket only fills an event whose plate file is missing. None of the 26 filenames are missing on the tip, so no harvest byte is copied.

`corridor.jpg` is not introduced as a fallback. No plate whose #374 bytes are a Vess portrait is placed on an event where Vess is dead or not yet recovered.

## Wired (already live — not overwritten)

Identity pin is the tip git blob SHA (`git hash-object`). The check also computes sha256 of that same file and fails if the blob drifts.

| event_id | file | live blob SHA | size |
|---|---|---|---|
| pursuit_amara_sex | images/afterglow_amara.jpg | 006e605ba05257c9fe1d53020e89dabb07f358f6 | 296516 |
| act2_spine_next | images/corridor.jpg | d8050e25b6a5101c82c6db1cfd9d75313372bc6e | 207286 |
| boarding_stories | images/corridor.jpg | d8050e25b6a5101c82c6db1cfd9d75313372bc6e | 207286 |
| lead_hard | images/corridor_pressure_1.jpg | 6096d2d2403925da51106c8ebf654b4b1b1a6e07 | 200010 |
| lead_watch | images/corridor_pressure_2.jpg | b4bfbbd83d81b173045100c2250f0873dc12ee1a | 228784 |
| arc_living_4 | images/corridor_pressure_2.jpg | b4bfbbd83d81b173045100c2250f0873dc12ee1a | 228784 |
| faction_split | images/corridor_variant.jpg | dde2faf8ac7a6bdc571c5645e3b1baf0a4ea98fc | 212954 |
| offshift_open | images/corridor_variant.jpg | dde2faf8ac7a6bdc571c5645e3b1baf0a4ea98fc | 212954 |
| coolant_trade | images/corridor_variant.jpg | dde2faf8ac7a6bdc571c5645e3b1baf0a4ea98fc | 212954 |
| seal_or_food | images/corridor_variant.jpg | dde2faf8ac7a6bdc571c5645e3b1baf0a4ea98fc | 212954 |
| rourke_end | images/covered_body.jpg | db4a3b0b52e9760c35aa066a3152db48f6f9e06d | 173951 |
| rourke_stop | images/covered_body.jpg | db4a3b0b52e9760c35aa066a3152db48f6f9e06d | 173951 |
| rourke_try | images/covered_body.jpg | db4a3b0b52e9760c35aa066a3152db48f6f9e06d | 173951 |
| silence | images/covered_body.jpg | db4a3b0b52e9760c35aa066a3152db48f6f9e06d | 173951 |
| custody_onset | images/custody_onset.jpg | a44bed3060678ab3fe45df40163ad842cd215e46 | 327861 |
| cut_out | images/cut_out.jpg | e7fa38b94668e9ff48c30b94abe432336e263796 | 594906 |
| empty_berths | images/empty_berths.jpg | fea93b3be0259d14d9546583368eee5818cc4104 | 494643 |
| pursuit_mira | images/lingerie_mira.jpg | bbaaf50d6d85454d60168673247ff08e239548ba | 360012 |
| pursuit_sela | images/lingerie_sela.jpg | 9631531b15d185496d7009fa63a935243e8f1d64 | 329900 |
| act2_tether_manifest | images/medbay_dim.jpg | cd9f9d0c83e0028a3152accbe7de28eb1a759fb9 | 176141 |
| status | images/observation_bridge_alt.jpg | 2a3d8b1661d439d642056357893fa8a64adf47fd | 234767 |
| intimacy_window | images/observation_bridge_alt.jpg | 2a3d8b1661d439d642056357893fa8a64adf47fd | 234767 |
| arc_fork | images/observation_reckon.jpg | 1d36d3aa85a419945befc2591b1e9b2b5c2ab067 | 310576 |
| reckon_truth | images/observation_reckon.jpg | 1d36d3aa85a419945befc2591b1e9b2b5c2ab067 | 310576 |
| reckon_summary | images/observation_reckon.jpg | 1d36d3aa85a419945befc2591b1e9b2b5c2ab067 | 310576 |
| reckon_suppress | images/observation_reckon.jpg | 1d36d3aa85a419945befc2591b1e9b2b5c2ab067 | 310576 |
| power_crisis | images/power_crisis.jpg | c4d8595cf9b0fb6553076c4e75f14ad999c67423 | 201508 |
| quiet_mira | images/quiet_mira.jpg | 4e61569f2dc6c69135881c66d41d717ba4fdcd53 | 191304 |
| bond_mira | images/quiet_mira.jpg | 4e61569f2dc6c69135881c66d41d717ba4fdcd53 | 191304 |
| romance_mira_1 | images/quiet_mira.jpg | 4e61569f2dc6c69135881c66d41d717ba4fdcd53 | 191304 |
| mira_rear | images/rear_mira.jpg | 2d3789d1a1f9f82231e7e97f111ef7203618f71e | 257088 |
| sela_rear | images/rear_sela.jpg | b9b9f4f5ef84611c562c1d4a46123850cb1ab0d7 | 252630 |
| arc_living_2 | images/sela_ritual.jpg | 2aaf1904e300e78fe84be22b7c1a91e2d4f6aa29 | 273657 |
| offshift_sela | images/sela_ritual.jpg | 2aaf1904e300e78fe84be22b7c1a91e2d4f6aa29 | 273657 |
| ship_interrupt_resolve | images/ship_interrupt_resolve.jpg | 0ef82b6d7bf774af5a872ff37b782cf9b02013fd | 273858 |
| vault_reveal | images/vault_reveal.jpg | ace67061627827db4e5957a53c4d31c180094040 | 183579 |
| vault_sacrifice | images/vault_sacrifice.jpg | 2d49af8dc9e494456e7ad1b78acdc035b715696a | live |

`act2_spine_next` and `boarding_stories` already declare `corridor.jpg` on the tip. This ticket does not add that mapping and does not use it as a fallback.

## Skipped (do not overwrite)

| file | #374 blob | why |
|---|---|---|
| images/afterglow_amara.jpg | ce2ece1695b02973e082cd2d6ac5759fbe4648c9 | live plate exists (pursuit_amara_sex). Old harvest. |
| images/arc_living_conflict.jpg | 53ac6ce18b287a94e8e06f95b9b9719433edb1cd | live file exists. No missing event. arc_living_3 already has arc_living_3.jpg. Left empty. |
| images/cascade_records.jpg | 6e6ba800f2d70ca6f73fe4ba9256b07c021d2d7f | live file exists. No missing event on tip sceneImages. Left empty. |
| images/corridor.jpg | cd23a9a38d915a4fad8ec1a980aa230cb382736e | live file exists. #374 bytes equal tomas.jpg. corridor.jpg is never a fallback. |
| images/corridor_pressure_1.jpg | 3e7afbef7cac2754134e115f1db5f9508bc876ab | live plate exists (lead_hard). Old harvest. |
| images/corridor_pressure_2.jpg | ea0783fa773313ba7d29d117b08bde1196974a55 | live plate exists (lead_watch, arc_living_4). Old harvest. |
| images/corridor_variant.jpg | 0e5ecaefbb03f5d5b5e43eaaaea345dcdd4b9035 | live file exists. #374 bytes equal lena.jpg. |
| images/covered_body.jpg | 04738d86eb0fd7ccc426b34ee1f8c363b86b6af0 | live file exists. #374 bytes equal mira.jpg. |
| images/custody_onset.jpg | 04738d86eb0fd7ccc426b34ee1f8c363b86b6af0 | live file exists (#391). #374 bytes equal mira.jpg. |
| images/cut_out.jpg | cdc01f5ff0b82bbd9928b577a507c2614ec4e896 | live plate exists (cut_out). Old harvest. |
| images/empty_berths.jpg | fde4ee14f04b2608857a565b9ab6e850764855ef | live plate exists (#391 empty_berths). Old harvest. |
| images/lingerie_mira.jpg | 7b3e680a405a281953ed49dab302274be4f33ec8 | live plate exists (pursuit_mira). Old harvest. |
| images/lingerie_sela.jpg | d1aa5248b41770bf58146262409e43dfe693464f | live plate exists (pursuit_sela). Old harvest. |
| images/medbay_dim.jpg | a1d7cb0231aa32c7341e7175ab4321e952f97917 | live plate exists (#391). Old harvest. |
| images/mira_thermal_cut.jpg | 3770fce9e9e82c1bbe5ec949eda4e6d52b407291 | live file exists. #374 bytes equal sela.jpg. No missing event. Left empty. |
| images/observation_bridge_alt.jpg | adc977f1879e834eca8bd3cebd71c75fde4432e9 | live plate exists (status, intimacy_window). Old harvest. |
| images/observation_reckon.jpg | cae717b7f7a21fde3df6e41b60cae7d2ccb47768 | live plate exists (arc_fork, reckon_*). Old harvest. |
| images/power_crisis.jpg | 3770fce9e9e82c1bbe5ec949eda4e6d52b407291 | live plate exists. #374 bytes equal sela.jpg. |
| images/quiet_mira.jpg | 24c53cd152d0ae69d60aefbce0ae3cdaa8573ad2 | live plate exists (#391 quiet_mira). Old harvest. |
| images/rear_mira.jpg | 4bf8fa851f66ba43f4c6f2faef9d3fa2cf234b78 | live plate exists (mira_rear). Old harvest. |
| images/rear_sela.jpg | 1b848208873225dc1ca2d56928c6d0a47966b092 | live plate exists (sela_rear). Old harvest. |
| images/sela_ritual.jpg | 675b91df48c27f2d3a6a2cd887f7f043a344539c | live plate exists (arc_living_2, offshift_sela). Old harvest. |
| images/ship_interrupt_resolve.jpg | fba2b448528264492ed28494dc8b5bfcf701cdce | live plate exists (#391). Old harvest. |
| images/vault_interior_alt.jpg | 05e5cf0f6190b24a5d74316fa30c83b9dc499c58 | live file exists. arc_future_2 stays arc_future_2.jpg. Left empty. |
| images/vault_reveal.jpg | 90d3fb23b7ddd4291b0431c357fb40c9b7be44a1 | live plate exists. #374 bytes equal vess.jpg. Vess plate refused on pre-recovery vault_reveal. |
| images/vault_sacrifice.jpg | 0ff952b8f3a062782403d5ab1a90b33c8ffeeeb9 | live plate exists (#391). Old harvest. |

## Left empty

- `arc_living_conflict.jpg` — no event is missing this plate. Not wired.
- `cascade_records.jpg` — no event is missing this plate. Not wired.
- `mira_thermal_cut.jpg` — harvest bytes are a Sela portrait. Not wired.
- `vault_interior_alt.jpg` — would steal `arc_future_2` from its live plate. Not wired.
- `vault_reveal` harvest — Vess portrait. Not wired onto an event where Vess is not yet recovered.

## STOP

Do not merge #374. Myth plate check, then Hex test review, before any merge of this branch.
