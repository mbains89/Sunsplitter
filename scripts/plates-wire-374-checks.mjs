import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Already-wired events on tip 5a17d633. Pins are live blobs, not #374 harvest blobs.
export const PLATES_WIRE_374 = [
  ["pursuit_amara_sex", "images/afterglow_amara.jpg", "006e605ba05257c9fe1d53020e89dabb07f358f6", 296516],
  ["act2_spine_next", "images/corridor.jpg", "d8050e25b6a5101c82c6db1cfd9d75313372bc6e", 207286],
  ["boarding_stories", "images/corridor.jpg", "d8050e25b6a5101c82c6db1cfd9d75313372bc6e", 207286],
  ["lead_hard", "images/corridor_pressure_1.jpg", "6096d2d2403925da51106c8ebf654b4b1b1a6e07", 200010],
  ["lead_watch", "images/corridor_pressure_2.jpg", "b4bfbbd83d81b173045100c2250f0873dc12ee1a", 228784],
  ["arc_living_4", "images/corridor_pressure_2.jpg", "b4bfbbd83d81b173045100c2250f0873dc12ee1a", 228784],
  ["faction_split", "images/corridor_variant.jpg", "dde2faf8ac7a6bdc571c5645e3b1baf0a4ea98fc", 212954],
  ["offshift_open", "images/corridor_variant.jpg", "dde2faf8ac7a6bdc571c5645e3b1baf0a4ea98fc", 212954],
  ["coolant_trade", "images/corridor_variant.jpg", "dde2faf8ac7a6bdc571c5645e3b1baf0a4ea98fc", 212954],
  ["seal_or_food", "images/corridor_variant.jpg", "dde2faf8ac7a6bdc571c5645e3b1baf0a4ea98fc", 212954],
  ["rourke_end", "images/covered_body.jpg", "db4a3b0b52e9760c35aa066a3152db48f6f9e06d", 173951],
  ["rourke_stop", "images/covered_body.jpg", "db4a3b0b52e9760c35aa066a3152db48f6f9e06d", 173951],
  ["rourke_try", "images/covered_body.jpg", "db4a3b0b52e9760c35aa066a3152db48f6f9e06d", 173951],
  ["silence", "images/covered_body.jpg", "db4a3b0b52e9760c35aa066a3152db48f6f9e06d", 173951],
  ["custody_onset", "images/custody_onset.jpg", "a44bed3060678ab3fe45df40163ad842cd215e46", 327861],
  ["cut_out", "images/cut_out.jpg", "e7fa38b94668e9ff48c30b94abe432336e263796", 594906],
  ["empty_berths", "images/empty_berths.jpg", "fea93b3be0259d14d9546583368eee5818cc4104", 494643],
  ["pursuit_mira", "images/lingerie_mira.jpg", "bbaaf50d6d85454d60168673247ff08e239548ba", 360012],
  ["pursuit_sela", "images/lingerie_sela.jpg", "9631531b15d185496d7009fa63a935243e8f1d64", 329900],
  ["act2_tether_manifest", "images/medbay_dim.jpg", "cd9f9d0c83e0028a3152accbe7de28eb1a759fb9", 176141],
  ["status", "images/observation_bridge_alt.jpg", "2a3d8b1661d439d642056357893fa8a64adf47fd", 234767],
  ["intimacy_window", "images/observation_bridge_alt.jpg", "2a3d8b1661d439d642056357893fa8a64adf47fd", 234767],
  ["arc_fork", "images/observation_reckon.jpg", "1d36d3aa85a419945befc2591b1e9b2b5c2ab067", 310576],
  ["reckon_truth", "images/observation_reckon.jpg", "1d36d3aa85a419945befc2591b1e9b2b5c2ab067", 310576],
  ["reckon_summary", "images/observation_reckon.jpg", "1d36d3aa85a419945befc2591b1e9b2b5c2ab067", 310576],
  ["reckon_suppress", "images/observation_reckon.jpg", "1d36d3aa85a419945befc2591b1e9b2b5c2ab067", 310576],
  ["power_crisis", "images/power_crisis.jpg", "c4d8595cf9b0fb6553076c4e75f14ad999c67423", 201508],
  ["quiet_mira", "images/quiet_mira.jpg", "4e61569f2dc6c69135881c66d41d717ba4fdcd53", 191304],
  ["bond_mira", "images/quiet_mira.jpg", "4e61569f2dc6c69135881c66d41d717ba4fdcd53", 191304],
  ["romance_mira_1", "images/quiet_mira.jpg", "4e61569f2dc6c69135881c66d41d717ba4fdcd53", 191304],
  ["mira_rear", "images/rear_mira.jpg", "2d3789d1a1f9f82231e7e97f111ef7203618f71e", 257088],
  ["sela_rear", "images/rear_sela.jpg", "b9b9f4f5ef84611c562c1d4a46123850cb1ab0d7", 252630],
  ["arc_living_2", "images/sela_ritual.jpg", "2aaf1904e300e78fe84be22b7c1a91e2d4f6aa29", 273657],
  ["offshift_sela", "images/sela_ritual.jpg", "2aaf1904e300e78fe84be22b7c1a91e2d4f6aa29", 273657],
  ["ship_interrupt_resolve", "images/ship_interrupt_resolve.jpg", "0ef82b6d7bf774af5a872ff37b782cf9b02013fd", 273858],
  ["vault_reveal", "images/vault_reveal.jpg", "ace67061627827db4e5957a53c4d31c180094040", 183578],
  ["vault_sacrifice", "images/vault_sacrifice.jpg", "2d49af8dc9e494456e7ad1b78acdc035b715696a", 0]
];

const HARVEST_BLOBS = {
  "images/afterglow_amara.jpg": "ce2ece1695b02973e082cd2d6ac5759fbe4648c9",
  "images/corridor.jpg": "cd23a9a38d915a4fad8ec1a980aa230cb382736e",
  "images/corridor_variant.jpg": "0e5ecaefbb03f5d5b5e43eaaaea345dcdd4b9035",
  "images/covered_body.jpg": "04738d86eb0fd7ccc426b34ee1f8c363b86b6af0",
  "images/custody_onset.jpg": "04738d86eb0fd7ccc426b34ee1f8c363b86b6af0",
  "images/mira_thermal_cut.jpg": "3770fce9e9e82c1bbe5ec949eda4e6d52b407291",
  "images/power_crisis.jpg": "3770fce9e9e82c1bbe5ec949eda4e6d52b407291",
  "images/vault_reveal.jpg": "90d3fb23b7ddd4291b0431c357fb40c9b7be44a1"
};

function mapped(state, eventId, file) {
  const escaped = file.replace(/\./g, "\\.");
  return new RegExp(eventId + ":\\s+['\"]" + escaped + "['\"]").test(state);
}

export function platesWire374Checks(root = ROOT) {
  const errors = [];
  const state = readFileSync(resolve(root, "src/state.js"), "utf8");
  const engine = readFileSync(resolve(root, "src/engine.js"), "utf8");
  if (/corridor\.jpg[\s\S]{0,80}fallback|fallback[\s\S]{0,80}corridor\.jpg/.test(engine)) {
    errors.push("corridor.jpg introduced as a fallback");
  }
  for (const [eventId, file, blob, size] of PLATES_WIRE_374) {
    if (!mapped(state, eventId, file)) errors.push(eventId + " does not resolve to " + file);
    const abs = resolve(root, file);
    let buf;
    try { buf = readFileSync(abs); }
    catch { errors.push(file + " missing (404)"); continue; }
    if (size && buf.length !== size) errors.push(file + " size " + buf.length + " != " + size);
    const live = execSync("git hash-object " + JSON.stringify(abs), { cwd: root }).toString().trim();
    if (live !== blob) errors.push(file + " blob " + live + " != live " + blob);
    if (HARVEST_BLOBS[file] && live === HARVEST_BLOBS[file]) errors.push(file + " is the #374 harvest copy");
    const sha256 = createHash("sha256").update(buf).digest("hex");
    if (!/^[a-f0-9]{64}$/.test(sha256)) errors.push(file + " sha256 did not resolve");
    if (file === "images/vault_reveal.jpg" && live === "90d3fb23b7ddd4291b0431c357fb40c9b7be44a1") {
      errors.push("vault_reveal is showing the Vess harvest plate");
    }
  }
  if (mapped(state, "arc_future_2", "images/vault_interior_alt.jpg")) {
    errors.push("arc_future_2 remapped onto vault_interior_alt");
  }
  if (mapped(state, "vault_reveal", "images/vess.jpg")) {
    errors.push("vault_reveal wired to a Vess plate");
  }
  return errors;
}

if (process.argv[1] && process.argv[1].endsWith("plates-wire-374-checks.mjs")) {
  const errors = platesWire374Checks();
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
  }
  console.log("plates-wire-374 ok " + PLATES_WIRE_374.length);
}
