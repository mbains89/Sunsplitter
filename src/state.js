// Sunsplitter — state.js
// Version 0.33 — Player Experience and Narrative Closure
// Game state, crew definitions, sceneImages map, core helpers
const VERSION = "0.33";

// FLAGS: see validate + scene onEnter/flag writes. state.dying is sole source for slow-death clock (map form from 0.25).
// Edit this file to change starting stats, characters, or image mappings
//
// 0.22+ locked flag keys (written by later tickets; do not invent meters/quest logs):
//   recovered.tomas / recovered.jiro / recovered.vess  (mirrored in state.recovered{})
//   sela_vault_vow  ("accepted" | "refused" — written by pursuit_sela crisis-request)
//   busDowngraded
//   crisisPath  (top-level: "breath" | "custody" | null)
// Prefer state.recovered.vess over a separate vessAboard alias.
// 0.24.1 crisis-request cost flags: pursuit_*_cost, lena_regen, mira_memory_public, amara_vent_delayed
// 0.25: state.dying is a map { [name]: causeString }; legacy scalar "lena" normalized on load.

function freshState() {
  return {
    survivors: 9,
    integrity: 62,
    cohesion: 48,
    supplies: 61,
    embryos: 100,
    flags: {},
    dead: [],
    deathCause: {},
    scene: "wake",
    affinity: { lena: 0, elias: 0, mira: 0, tomas: 0, amara: 0, jiro: 0, sela: 0, vess: 0 },
    trust: { lena: 40, elias: 35, mira: 45, tomas: 50, amara: 40, jiro: 40, sela: 30, vess: 35 },
    romance: {},
    pursuit: {},
    favors: {},
    past_known_by: {},
    dying: {},
    past_known: false,
    marks: {},
    memories: [],
    ideology: { future: 0, living: 0 },
    // 0.22.0 groundwork — Tomas/Jiro missing until recovery; Vess slot for 0.24
    recovered: { tomas: false, jiro: false, vess: false },
    promises: {},          // key = who, value = absent | "made" | "declined" | "kept" | "broken"
    crisisPath: null       // "breath" | "custody" | null — set in 0.26
  };
}

const state = freshState();

// Character ideological lean (locked voice). "swing" characters can move.
const crewLean = {
  lena:   "living",   // treats the breathing first; vault is secondary until forced
  elias:  "future",   // mission and order over comfort; soft leadership is death
  mira:   "swing",    // systems vs people — driven by drive-fix and who she trusts
  tomas:  "living",   // presence, confession, the human cost
  amara:  "living",   // green things, warmth, the key from Lagos
  jiro:   "future",   // numbers, trajectory, the mission that justified escape
  sela:   "living",   // the yellow sun — a world worth arriving in
  vess:   "swing",    // long-range / relay; mourns a ship, not a planet; power stays hers
  rourke: "future"    // died doing the work; docking was for the mission
};

const crew = {
  lena:   { name: "Dr. Lena Voss", first: "Lena", role: "Medical", bio: "Former trauma surgeon from the orbital hospitals. Lost her entire staff during the evacuation. Attractive, sharp, exhausted. The living come first until the math forces her hand." },
  elias:  { name: "Elias Kane", first: "Elias", role: "Security", bio: "Ex-corporate security. Believes soft leadership is a luxury the dead cannot afford. Tall, scarred, magnetic. The mission outranks comfort." },
  mira:   { name: "Mira Solis", first: "Mira", role: "Engineer", bio: "Drive systems specialist. Still believes the ship can be saved if she is given enough time and parts. Intense, brilliant, hungry for connection. Torn between systems and people." },
  tomas:  { name: "Brother Tomas", first: "Tomas", role: "None", bio: "Hospital chaplain turned refugee. Carries no rank and no weapons, only presence. Quiet intensity under the calm. Keeps the human cost on the ledger." },
  amara:  { name: "Amara Vale", first: "Amara", role: "Hydroponics", bio: "Grew food for three habitats before the fall. Still carries the house key from her home in Lagos. Grounded, sensual, grieving. Living things are not a luxury." },
  jiro:   { name: "Jiro Okada", first: "Jiro", role: "Navigation", bio: "Navigator who plotted the escape trajectory. Speaks little. Watches everything. Reserved, precise, carrying quiet grief. The numbers are the only honest language left." },
  sela:   { name: "Sela", first: "Sela", role: "None", bio: "Twenty years old. Draws yellow circles that look like suns. Speaks carefully and precisely when she chooses to — refusal as much as grief. Quiet, watchful, present. Wants a world that is still warm." },
  vess:   { name: "Vess", first: "Vess", role: "Relay", bio: "Twenty-two. Sole survivor of the Dawnbreak fragment. Tall, wiry-athletic, long white-silver hair. Log-trained flat voice that cracks under surprise. Kept a beacon alive alone for six years. Long-range ears. Power stays hers." },
  rourke: { name: "Marcus Rourke", first: "Rourke", role: "Docking", bio: "Docking crew. Knew the ship better than most. Did not make it past the first hour." }
};

const ROMANCEABLE = ["lena", "mira", "amara", "sela", "vess"];
const CREW_ORDER = Object.keys(crew);
const LIVING_CREW_KEYS = CREW_ORDER.filter(k => k !== "rourke"); // starting living set (rourke dies early)

// Scene → illustration mapping (grimdark industrial / cyberpunk hybrid)
const sceneImages = {
  // Opening / medical
  wake:            "images/medical_bay.jpg",
  dying:           "images/medical_bay.jpg",
  rourke_end:      "images/covered_body.jpg",
  rourke_stop:     "images/covered_body.jpg",
  rourke_try:      "images/covered_body.jpg",
  silence:         "images/medical_bay.jpg",

  // Character intros (Batch A portraits — locked)
  intro_lena:      "images/lena.jpg",
  intro_elias:     "images/elias.jpg",

  // Early / status
  vault_reveal:    "images/vault_reveal.jpg",
  status:          "images/observation_bridge_alt.jpg",
  priority_repairs:"images/crisis.jpg",
  priority_ration: "images/observation_reckon.jpg",
  priority_planet: "images/rogue_planet.jpg",
  commit_planet:   "images/rogue_planet.jpg",
  hydroponics:     "images/hydroponics.jpg",
  empty_berths:     "images/empty_berths.jpg",
  bond_elias:       "images/bond_elias.jpg",
  bond_tomas:       "images/bond_tomas.jpg",
  bond_jiro:        "images/bond_jiro.jpg",
  competence_watch: "images/observation_bridge_alt.jpg",
  crew_walk:       "images/corridor_pressure_4.jpg",
  lead_prompt:     "images/lead_prompt.jpg",
  lead_together:   "images/observation_bridge_alt.jpg",
  lead_hard:       "images/corridor_pressure_1.jpg",
  lead_watch:      "images/corridor_pressure_2.jpg",
  power_crisis:    "images/power_stress_2.jpg",
  private_stores:  "images/private_stores.jpg",
  time_pass:       "images/corridor_pressure_2.jpg",

  // Crisis family
  crisis:          "images/crisis.jpg",
  cut_out:         "images/cut_out.jpg",
  vent:            "images/vent.jpg",
  self_risk:       "images/self_risk.jpg",
  aftermath:       "images/aftermath.jpg",

  // Private human moments — dedicated quiet plates now wired
  quiet_sela:      "images/quiet_sela.jpg",
  quiet_mira:      "images/quiet_mira.jpg",
  quiet_tomas:     "images/quiet_tomas.jpg",
  quiet_amara:     "images/quiet_amara.jpg",

  // Mid-path exclusive
  // v0.11 exclusive mid-arcs
  arc_fork:         "images/observation_reckon.jpg",
  arc_future_1:     "images/power_stress_2.jpg",
  arc_future_2:     "images/vault_interior_alt.jpg",
  arc_future_3:     "images/cascade_records.jpg",
  arc_future_4:     "images/abandoned_section.jpg",
  arc_living_1:     "images/hydroponics.jpg",
  arc_living_2:     "images/sela_ritual.jpg",
  arc_living_3:     "images/arc_living_conflict.jpg",
  arc_living_4:     "images/corridor_pressure_2.jpg",
  vault_voice:     "images/vault_voice.jpg",
  vault_sacrifice: "images/vault_sacrifice.jpg",
  transmission:    "images/transmission.jpg",
  tomas_break:     "images/tomas_break.jpg",
  faction_split:   "images/corridor_variant.jpg",
  pregnancy_check: "images/medbay_dim_alt.jpg",

  // 0.28 Off-Shift + pairs + warmth (all REUSE)
  offshift_open:       "images/corridor_variant.jpg",
  offshift_lena:       "images/medical_bay.jpg",
  offshift_elias:      "images/elias.jpg",
  offshift_mira:       "images/quiet_mira.jpg",
  offshift_tomas:      "images/quiet_tomas.jpg",
  offshift_tomas_r:    "images/quiet_tomas.jpg",
  offshift_amara:      "images/quiet_amara.jpg",
  offshift_jiro:       "images/jiro.jpg",
  offshift_sela:       "images/sela_ritual.jpg",
  offshift_vess:       "images/vess.jpg",
  pair_grudge_settle:  "images/observation.jpg",
  pair_favor_confront: "images/hydroponics_amara.jpg",
  pair_shield_cold:    "images/elias.jpg",
  warmth_meal:         "images/hydroponics.jpg",
  warmth_laughter:     "images/corridor.jpg",
  warmth_music:        "images/corridor.jpg",

  // Romance

  intimacy_window:  "images/observation_bridge_alt.jpg",
  pursuit_window:   "images/corridor_pressure_3.jpg",
  pursuit_mira:     "images/lingerie_mira.jpg",
  pursuit_mira_sex: "images/afterglow_mira.jpg",
  pursuit_amara:    "images/lingerie_amara.jpg",
  pursuit_amara_sex:"images/afterglow_amara.jpg",
  pursuit_sela:     "images/lingerie_sela.jpg",
  pursuit_sela_sex: "images/afterglow_sela.jpg",
  pursuit_lena:     "images/lingerie_lena.jpg",
  pursuit_lena_sex: "images/pursuit_lena.jpg",
  coolant_trade:    "images/corridor_variant.jpg",
  seal_or_food:     "images/corridor_variant.jpg",
  history_elias:    "images/elias.jpg",
  favor_mira:       "images/mira.jpg",
  debt_notice:      "images/corridor_pressure_4.jpg",
  // 0.23 recoveries + vault face (reuse closest plates; dedicated art later)
  act2_tether_sighting: "images/debris_field.jpg",
  act2_tether_vent:     "images/power_crisis.jpg",
  act2_tether_rush:     "images/tether_ride.jpg",
  act2_tether_hand_elias: "images/tether_ride.jpg",
  act2_tether_hand_mira:  "images/self_risk.jpg",
  act2_tether_hand_sela:  "images/self_risk.jpg",
  act2_tether_dock:     "images/bulkhead.jpg",
  act2_tether_manifest: "images/medbay_dim.jpg",
  act2_tether_truth:    "images/observation_crew.jpg",
  act2_tether_lie:      "images/observation_bridge.jpg",
  act2_spine_next:      "images/corridor.jpg",
  act3_reckoning_pattern: "images/observation_bridge_alt.jpg",
  act3_reckoning_heading: "images/observation_bridge.jpg",
  act3_reckoning_burn_stale: "images/power_crisis.jpg",
  act3_reckoning_burn_verified: "images/power_crisis.jpg",
  act3_reckoning_delay: "images/observation_bridge.jpg",
  act3_reckoning_cut:   "images/cut_out.jpg",
  act3_reckoning_briefing: "images/cascade_records.jpg",
  act3_vault_face:      "images/vault.jpg",
  act3_vault_face_read: "images/vault.jpg",
  act3_spine_next:      "images/corridor_variant_2.jpg",
  act3_lethal_elias_order: "images/work_elias.jpg",
  act3_lethal_elias_sealant: "images/work_elias.jpg",
  // 0.24 Vess arrival + short asymmetric romance (closest existing plates)
  vess_signal:          "images/vess_signal.jpg",
  vess_cost:            "images/vess_signal.jpg",
  vess_boarding:        "images/vess_boarding.jpg",
  vess_offer:           "images/vess_offer.jpg",
  vess_transmission:    "images/vess_signal.jpg",
  vess_intimate:        "images/vess_intimate.jpg",
  ship_interrupt:   "images/power_crisis.jpg",
  ship_interrupt_resolve: "images/ship_interrupt_resolve.jpg",
  ship_memory_payoff: "images/bulkhead.jpg",
  sun_payoff:       "images/sela_ritual.jpg",
  boarding_stories: "images/corridor.jpg",
  patch_fails:      "images/vent.jpg",
  bond_mira:        "images/mira.jpg",
  bond_amara:       "images/amara.jpg",
  bond_sela:        "images/sela.jpg",
  bond_lena:        "images/lena.jpg",
  romance_lena_sex: "images/afterglow_lena.jpg",
  romance_amara_1:  "images/hydroponics.jpg",
  romance_sela_1:   "images/shower_sela.jpg",
  romance_amara_tomas_sex: "images/romance_amara_tomas.jpg",
  romance_mira_1:      "images/quiet_mira.jpg",
  romance_amara_tomas: "images/romance_amara_tomas.jpg",
  romance_lena_1:      "images/observation_bridge_alt_2.jpg",

  // 0.22.1 explicit art utilization (one-shot aftermath variants)
  lena_shower:     "images/shower_lena.jpg",
  mira_shower:     "images/shower_mira.jpg",
  lena_rear:       "images/rear_lena.jpg",
  mira_rear:       "images/rear_mira.jpg",
  amara_rear:      "images/rear_amara.jpg",
  sela_rear:       "images/rear_sela.jpg",

  // Character beats
  lena_dying:      "images/lena.jpg",
  past_leak:       "images/elias.jpg",

  // Reckoning / late
  reckon_public:   "images/reckon_public.jpg",
  reckon_memory:   "images/aftermath.jpg",
  reckon_truth:    "images/observation_reckon.jpg",
  reckon_summary:  "images/observation_reckon.jpg",
  reckon_suppress: "images/observation_reckon.jpg",
  final_choice:    "images/final_choice.jpg"
};

const STAT_CAPS = {
  survivors: { min: 0, max: 20 },
  integrity: { min: 0, max: 100 },
  cohesion:  { min: 0, max: 100 },
  supplies:  { min: 0, max: 100 },
  embryos:   { min: 0, max: 100 },
  affinity:  { min: 0, max: 100 },
  trust:     { min: 0, max: 100 }
};

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function updateStats(changes = {}) {
  for (const k of ["survivors", "integrity", "cohesion", "supplies", "embryos"]) {
    if (changes[k] !== undefined) {
      const cap = STAT_CAPS[k];
      state[k] = clamp(state[k] + changes[k], cap.min, cap.max);
    }
  }
  renderStatus();
}

function kill(key, cause) {
  if (!state.dead.includes(key)) {
    state.dead.push(key);
    state.survivors = Math.max(0, state.survivors - 1);
    if (cause) state.deathCause[key] = cause;
  }
}

function addAffinity(who, amount) {
  if (state.affinity[who] !== undefined) {
    const cap = STAT_CAPS.affinity;
    state.affinity[who] = clamp(state.affinity[who] + amount, cap.min, cap.max);
  }
}

function addTrust(who, amount) {
  if (state.trust[who] !== undefined) {
    const cap = STAT_CAPS.trust;
    state.trust[who] = clamp(state.trust[who] + amount, cap.min, cap.max);
  }
}

function mark(who, tag) {
  if (!who || !tag) return;
  // Accumulate tags so spoken/declined/bonded etc. do not erase each other (P1.5)
  const cur = state.marks[who];
  if (!cur) {
    state.marks[who] = tag;
  } else if (typeof cur === "string") {
    const set = new Set(cur.split("|").filter(Boolean));
    set.add(tag);
    state.marks[who] = [...set].join("|");
  } else if (typeof cur === "object") {
    cur[tag] = true;
  }
}

function hasMark(who, tag) {
  const cur = state.marks[who];
  if (!cur || !tag) return false;
  if (typeof cur === "string") {
    if (cur === tag) return true;
    return cur.split("|").includes(tag);
  }
  return !!cur[tag];
}

function remember(text) {
  if (!text) return;
  if (state.memories.includes(text)) return;
  if (state.memories.length < 12) state.memories.push(text);
}

function lean(side, amount) {
  if (side === "future" || side === "living") {
    state.ideology[side] = (state.ideology[side] || 0) + amount;
  }
}

// Moral shape of the run: which ideology won in practice
function ideologyShape() {
  const f = state.ideology.future || 0;
  const l = state.ideology.living || 0;
  const sac = state.flags.vault_sacrifice;
  // Hard vault choice outweighs soft leans for endings and mid-voyage voice.
  if (sac === "future") return "future";
  if (sac === "living") return "living";
  if (sac === "split") return "split";
  if (f - l >= 8) return "future";
  if (l - f >= 8) return "living";
  return "split";
}

// What Remains first line cites recorded order weights, not the vault override.
function whatRemainsIdeologyShape() {
  const f = state.ideology.future || 0;
  const l = state.ideology.living || 0;
  if (f - l >= 8) return "future";
  if (l - f >= 8) return "living";
  return "split";
}

// Living crew who embody a side (for ending/faction text)
function voicesFor(side) {
  return Object.keys(crewLean)
    .filter(k => crewLean[k] === side && isAlive(k) && k !== "rourke")
    .map(k => crew[k].name);
}

function highestAffinity() {
  let best = null, score = -1;
  for (const k of Object.keys(state.affinity)) {
    if (!isAlive(k)) continue;
    if (state.affinity[k] > score) { score = state.affinity[k]; best = k; }
  }
  return { who: best, score };
}

function favoritism() {
  // Returns { favored, othersNotice } if one living affinity is clearly ahead
  const living = Object.keys(state.affinity).filter(k => isAlive(k));
  if (living.length < 2) return null;
  living.sort((a, b) => state.affinity[b] - state.affinity[a]);
  const top = living[0], second = living[1];
  if (state.affinity[top] >= 35 && state.affinity[top] - state.affinity[second] >= 20) {
    return { favored: top, gap: state.affinity[top] - state.affinity[second] };
  }
  return null;
}

function namedDead() {
  // Dedup by crew key so the same death is never listed twice
  const seen = new Set();
  const out = [];
  for (const k of state.dead || []) {
    if (seen.has(k)) continue;
    seen.add(k);
    const name = crew[k] ? crew[k].name : k;
    const cause = state.deathCause && state.deathCause[k];
    out.push(cause ? `${name} (${cause})` : name);
  }
  return out;
}

function isRecovered(who) {
  return !!(state.recovered && state.recovered[who]);
}

function isAlive(key) {
  // Tomas / Jiro start missing (not dead). Alive only after recovered.X and not later killed.
  // Vess is permanent 10th: absent until recovered.vess; then normal death tracking.
  // Rourke uses normal death tracking.
  if (key === "tomas" || key === "jiro" || key === "vess") {
    return isRecovered(key) && !state.dead.includes(key);
  }
  return !state.dead.includes(key);
}


function relationshipDebtors() {
  // Living crew who notice heavy favoritism / exclusive romance and cool off.
  // Not jealousy minigame — people measuring who gets private time.
  const keys = ["lena", "elias", "mira", "tomas", "amara", "jiro", "sela", "vess"].filter(isAlive);
  const fav = favoritism();
  const romanced = ["lena", "mira", "amara", "sela", "vess"].filter(k => state.romance[k]);
  const favored = fav ? fav.favored : (romanced.length === 1 ? romanced[0] : null);
  const debtors = [];
  if (!favored && romanced.length === 0) return debtors;
  for (const k of keys) {
    if (k === favored) continue;
    if (romanced.includes(k)) continue;
    const aff = state.affinity[k] || 0;
    const topAff = favored ? (state.affinity[favored] || 0) : 0;
    if (favored && topAff - aff >= 18) debtors.push(k);
    else if (romanced.length >= 1 && aff < 22 && topAff >= 35) debtors.push(k);
  }
  // Cap so debt stays readable
  return debtors.slice(0, 4);
}

// ═══ CONTENT-BLOCK DECLARATION ══════════════════════════════════
// CONTENT_ID: what_remains [POST-ENDING REFLECTION DATA]
// VERSION: 0.29        TICKET: What Remains
// SPINE: after the resolved ending screen; separately skippable
// PRECONDITIONS: an ending has resolved; every candidate is proven by
//   current-run state under the selector below
// STATE WRITES: none; selection and rendering are side-effect-free
// DEATH EXPOSURE: reads state.dead plus matching state.deathCause only;
//   dead names are past-tense facts and never emit speech or action
// IMAGE: REUSE resolved ending image/background; NO ART_REQUEST
// ═════════════════════════════════════════════════════════════════

function whatRemainsJoinNames(keys) {
  const names = keys.map(key => crew[key] ? crew[key].first : key);
  if (names.length < 2) return names[0] || "";
  if (names.length === 2) return names[0] + " and " + names[1];
  return names.slice(0, -1).join(", ") + ", and " + names[names.length - 1];
}

function whatRemainsDeathClause(key, cause) {
  const name = crew[key] ? crew[key].first : key;
  switch (cause) {
    case "died with company":
      return `${name} died with company`;
    case "ordered to stop treatment":
      return `${name} died after treatment was ordered stopped`;
    case "attempted rescue, still died":
      return `${name} died during the attempted rescue`;
    case "died in silence while orders waited":
      return `${name} died in silence while orders waited`;
    case "died while command was taken":
      return `${name} died while command was taken`;
    case "vented with the lower ring":
      return `${name} died when the lower ring was vented`;
    case "vented at twenty":
      return `${name} died when the lower ring vented at twenty`;
    case "resources diverted to the vault":
      return `${name} died after medical power was diverted to the vault`;
    case "kept working until the clock ran out":
      return `${name} died after working until her clock ran out`;
    case "refused the order and paid for it":
      return `${name} died after refusing the order`;
    case "went back for the living and did not return":
      return `${name} went back for the living and did not return`;
    case "held the line":
      return `${name} died holding the line`;
    case "would not leave the board":
      return `${name} died after refusing to leave the board`;
    case "finished the repair":
      return `${name} finished the repair and died`;
    case "lost the shared medical line to Lena":
      return `${name} died when the shared medical line moved to Lena`;
    case "vented breathing in the service pocket":
      return `${name} died breathing when the service pocket was vented`;
    default:
      return `${name} died`;
  }
}

function whatRemainsDeathFacts() {
  const seen = new Set();
  const ordered = [];
  for (const key of (state.dead || [])) {
    if (!key || seen.has(key)) continue;
    seen.add(key);
    ordered.push(key);
  }
  const rourkeIndex = ordered.indexOf("rourke");
  if (rourkeIndex > 0) ordered.unshift(ordered.splice(rourkeIndex, 1)[0]);
  const clauses = ordered.map(key => whatRemainsDeathClause(
    key,
    state.deathCause && state.deathCause[key]
  ));
  if (!clauses.length) return [];
  if (clauses.length <= 3) return [clauses.join("; ") + "."];
  const splitAt = Math.ceil(clauses.length / 2);
  return [
    clauses.slice(0, splitAt).join("; ") + ".",
    clauses.slice(splitAt).join("; ") + "."
  ];
}

function whatRemainsCrisisFact() {
  const vaultClauses = {
    future: "At the vault fault, the restart package was kept and habitation paid the cost",
    living: "At the vault fault, habitation was protected and the embryo count fell",
    split: "At the vault fault, both habitation and the restart package were degraded"
  };
  const breathClauses = {
    racks: "The Breath They Cost ended with sterile filters and outer embryo racks stripped into the air loop",
    trunks: "The Breath They Cost ended with crew clearing the contaminated scrubber trunks by hand",
    garden: "The Breath They Cost ended with the hydroponics garden converted into a disposable scrubber",
    blacksleep: "The Breath They Cost ended with the vulnerable in controlled black sleep while Lena managed the loop awake"
  };
  const custodyClauses = {
    possession: "Custody of Tomorrow ended with heat dumped through the inhabited ring while the vault stayed whole",
    thawed: "Custody of Tomorrow ended with outer embryo racks thawed to absorb the heat",
    severed: "Custody of Tomorrow ended with Mira severing the fused junction and carrying the cold-radiation injury",
    shared: "Custody of Tomorrow ended with Sela holding the second physical key"
  };
  const clauses = [];
  const vault = vaultClauses[state.flags.vault_sacrifice];
  if (vault) clauses.push(vault);
  if (state.crisisPath === "breath") {
    const breath = breathClauses[state.flags.breath_answer];
    if (breath) clauses.push(breath);
  } else if (state.crisisPath === "custody") {
    const custody = custodyClauses[state.flags.custody_answer];
    if (custody) clauses.push(custody);
  }
  return clauses.length ? clauses.join("; ") + "." : null;
}

function whatRemainsPromiseCausedDeath(owner) {
  if (state.promises[owner] !== "broken") return false;
  const causes = Object.values(state.deathCause || {});
  if (owner === "amara") return causes.includes("vented breathing in the service pocket");
  if (owner === "lena") return causes.includes("lost the shared medical line to Lena");
  return false;
}

function whatRemainsPromiseLine(owner) {
  const result = state.promises[owner];
  if (result !== "kept" && result !== "broken") return null;
  if (owner === "tomas" && state.crisisPath !== "custody") return null;
  const lines = {
    amara: {
      kept: "At the service-pocket test, the vent stayed shut until the reader came out breathing.",
      broken: "At the service-pocket test, the pocket was vented while the reader was still breathing."
    },
    tomas: {
      kept: "At the custody test, the living received the shared mercy promised to Tomas.",
      broken: "At the custody test, the inhabited ring paid to keep the vault as possession."
    },
    lena: {
      kept: "At the shared-line test, the medical line stayed with the other patient.",
      broken: "At the shared-line test, the medical line moved to Lena and the other patient died."
    },
    sela: {
      kept: "At the petition test, Sela was not made the price of the crew's fear.",
      broken: "At the petition test, the room was allowed to put its fear on Sela."
    },
    mira: {
      kept: "The Earth-era directive binding was refused; authority stayed with the living.",
      broken: "The ark was rebound to Earth-era directives written by the dead."
    }
  };
  if (owner === "elias") {
    if (result === "kept") return "The complete Deck Four record went to Elias first.";
    if (state.flags.prom_deck4_edited) {
      return "Elias received an edited Deck Four record after it entered the general log.";
    }
    if (state.flags.prom_deck4_buried) {
      return "The Deck Four record was buried; Elias later heard it from the ship.";
    }
    return null;
  }
  return lines[owner] ? lines[owner][result] : null;
}

function whatRemainsPromiseFact() {
  const owners = ["amara", "tomas", "elias", "lena", "sela", "mira"];
  const tested = owners.filter(owner => {
    const result = state.promises[owner];
    return result === "kept" || result === "broken";
  });
  const prioritized = [
    ...tested.filter(whatRemainsPromiseCausedDeath),
    ...tested.filter(owner => !whatRemainsPromiseCausedDeath(owner))
  ];
  for (const owner of prioritized) {
    const line = whatRemainsPromiseLine(owner);
    if (line) return line;
  }
  return null;
}

function whatRemainsRelationalFact() {
  const partners = ROMANCEABLE.filter(key => state.romance[key]);
  if (!partners.length) return null;
  const living = partners.filter(isAlive);
  const dead = partners.filter(key => !isAlive(key));
  const allNames = whatRemainsJoinNames(partners);
  if (partners.length === 1) {
    if (living.length) return `A private line was crossed with ${allNames}; she was alive when the run ended.`;
    return `A private line was crossed with ${allNames} before her death.`;
  }
  if (!dead.length) {
    const subject = partners.length === 2 ? "both" : "all";
    return `Private lines were crossed with ${allNames}; ${subject} were alive when the run ended.`;
  }
  if (!living.length) return `Private lines were crossed with ${allNames} before their deaths.`;
  const livingNames = whatRemainsJoinNames(living);
  const deadNames = whatRemainsJoinNames(dead);
  const livingVerb = living.length === 1 ? "was" : "were";
  return `Private lines were crossed with ${allNames}; ${livingNames} ${livingVerb} alive at the ending, and ${deadNames} had died.`;
}

function whatRemainsFacts() {
  const ideologyLines = {
    future: "Across the recorded orders, Future carried more weight.",
    living: "Across the recorded orders, Living carried more weight.",
    split: "The recorded orders remained split between Future and Living."
  };
  const facts = [ideologyLines[whatRemainsIdeologyShape()]];
  facts.push(...whatRemainsDeathFacts());
  const crisis = whatRemainsCrisisFact();
  if (crisis) facts.push(crisis);
  const promise = whatRemainsPromiseFact();
  if (promise && facts.length < 6) facts.push(promise);
  const relational = whatRemainsRelationalFact();
  if (relational && facts.length < 6) facts.push(relational);
  return facts.filter(Boolean).slice(0, 6);
}

function romanceOpen(who) {
  // Default-offer gate: held-only and declined both complete the first offer.
  if (!who || !ROMANCEABLE.includes(who)) return false;
  if (who === "amara" && state.romance.amara_tomas) return false;
  return isAlive(who) && !state.romance[who] && !hasMark(who, "declined") && !hasMark(who, "held_only") && state.promises[who] !== "broken";
}

function hasOpenRomanceGates() {
  // Default offer: any romanceable still open
  return ROMANCEABLE.some(romanceOpen);
}


function renderStatus() {
  const set = (id, value, display, classify) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = display;
    el.className = "stat-value" + (classify ? " " + (value < 30 ? "low" : value < 60 ? "mid" : "high") : "");
  };
  set("stat-survivors", state.survivors, state.survivors, false);
  set("stat-integrity", state.integrity, state.integrity + "%", true);
  set("stat-cohesion", state.cohesion, state.cohesion + "%", true);
  set("stat-supplies", state.supplies, state.supplies + "%", true);
  set("stat-embryos", state.embryos, state.embryos + "%", true);
  const announcement = `Ship status: ${state.survivors} survivors, hull integrity ${state.integrity}%, cohesion ${state.cohesion}%, supplies ${state.supplies}%, embryos ${state.embryos}%.`;
  const announcer = document.getElementById("stat-announcer");
  if (announcer && announcer.textContent !== announcement) announcer.textContent = announcement;
  if (typeof renderCrewPanel === "function") renderCrewPanel();
}

function showScreen(id) {
  // Each surface starts at its own top. Short phones otherwise inherit the
  // previous surface's scroll position and can open with the heading hidden.
  const main = document.getElementById("main");
  if (main) main.scrollTop = 0;
  if (main) main.classList.toggle("cinematic-active", id === "cinematic");
  if (id !== "cinematic" && typeof cancelCinematic === "function") cancelCinematic();
  if (typeof releaseInactiveArtForScreen === "function") releaseInactiveArtForScreen(id);
  ["tone-screen", "title-screen", "cinematic-screen", "game-screen", "ending-screen", "what-remains-screen", "status", "meta", "crew-panel"].forEach(x => {
    const el = document.getElementById(x);
    if (el) el.classList.add("hidden");
  });
  const crew = document.getElementById("crew-panel");
  if (crew) crew.classList.remove("visible");
  const crewToggle = document.getElementById("btn-crew");
  if (crewToggle) crewToggle.setAttribute("aria-expanded", "false");
  // 0.21.3: scene art lives outside #main; force hide when leaving game
  const imgWrap = document.getElementById("scene-image-wrap");
  if (imgWrap && id !== "game") {
    imgWrap.classList.remove("visible");
    imgWrap.classList.remove("intimate");
  }
  if (id === "tone") {
    const el = document.getElementById("tone-screen");
    if (el) el.classList.remove("hidden");
  }
  if (id === "title") {
    const el = document.getElementById("title-screen");
    if (el) el.classList.remove("hidden");
    const sub = document.getElementById("game-subtitle");
    if (sub && typeof VERSION !== "undefined") sub.textContent = "v" + VERSION;
  }
  if (id === "game") {
    document.getElementById("game-screen").classList.remove("hidden");
    document.getElementById("status").classList.remove("hidden");
    document.getElementById("meta").classList.remove("hidden");
  }
  if (id === "ending") document.getElementById("ending-screen").classList.remove("hidden");
  if (id === "cinematic") document.getElementById("cinematic-screen").classList.remove("hidden");
  if (id === "what-remains") document.getElementById("what-remains-screen").classList.remove("hidden");

  const focusTargetId = {
    tone: "tone-heading",
    title: "title-heading",
    cinematic: "cinematic-heading",
    ending: "ending-title",
    "what-remains": "what-remains-heading"
  }[id];
  const focusTarget = focusTargetId ? document.getElementById(focusTargetId) : null;
  if (focusTarget && typeof focusTarget.focus === "function") {
    try { focusTarget.focus({ preventScroll: true }); }
    catch (e) { focusTarget.focus(); }
  }
}

// ─── 0.28 helpers: Last Off-Shift eligibility + pairs + attributable death ───

function leansLiving() {
  return ideologyShape() === "living";
}

function stillFavoring(who) {
  const fav = favoritism();
  return !!(fav && fav.favored === who);
}

function neglected(who) {
  if (!isAlive(who)) return false;
  if (hasMark(who, "bonded") || hasMark(who, "bond_skipped")) return false;
  const living = Object.keys(state.affinity).filter(isAlive);
  if (living.length < 2) return false;
  let lowest = living[0], score = state.affinity[lowest];
  for (const k of living) {
    if (state.affinity[k] < score) { score = state.affinity[k]; lowest = k; }
  }
  return lowest === who;
}

// Attributable causes name command agency / spent order / resource choice.
const ATTRIBUTABLE_CAUSES = [
  "resources diverted to the vault",
  "vented with the lower ring",
  "vented at twenty",
  "ordered to stop treatment",
  "finished the repair",
  "would not leave the board"
];
function attributableDeath(who) {
  const cause = state.deathCause && state.deathCause[who];
  if (!cause) return false;
  if (ATTRIBUTABLE_CAUSES.includes(cause)) return true;
  const c = String(cause).toLowerCase();
  return c.includes("ordered") || c.includes("refused the order") ||
         c.includes("enforced") || c.includes("paid for it") ||
         c.includes("vented");
}
function anyAttributableDeath() {
  return (state.dead || []).some(attributableDeath);
}
function firstAttributableDeath() {
  for (const k of (state.dead || [])) {
    if (attributableDeath(k)) return { who: k, name: (crew[k] && crew[k].name) || k, cause: state.deathCause[k] };
  }
  return null;
}

function eligLena()  { return isAlive("lena"); }
function eligElias() { return isAlive("elias") && !isAlive("mira"); } // LOCK 4: alive-Mira branch cut
function eligMira()  { return isAlive("mira") && state.crisisPath === "custody" && state.flags.custody_answer === "severed"; }
function eligTomas() { return isAlive("tomas") && (leansLiving() || state.crisisPath === "breath"); }
function eligAmara() { return isAlive("amara") && anyAttributableDeath(); }
function eligJiro()  { return isAlive("jiro"); }
function eligSela()  { return isAlive("sela"); }
function eligVess()  { return isAlive("vess"); }

function partnerUnchosen() {
  const jc = state.flags.junctionChoice;
  if (!jc || jc === "none") return null;
  const partners = ["lena", "mira", "amara", "sela", "vess"].filter(w => state.romance[w] && isAlive(w));
  for (const p of partners) {
    if (p !== jc) {
      // only report if they were eligible
      if (p === "lena" && eligLena()) return p;
      if (p === "mira" && eligMira()) return p;
      if (p === "amara" && eligAmara()) return p;
      if (p === "sela" && eligSela()) return p;
      if (p === "vess" && eligVess()) return p;
    }
  }
  return null;
}

function closingPartnerLine() {
  const p = partnerUnchosen();
  if (p === "mira") return "Somewhere below, a torque wrench keeps time past shift-end.";
  if (p === "amara") return "The hydroponics light outlasts you. Barely.";
  if (p === "sela") return "At cycle-turn, a yellow lamp somewhere reaches amber on schedule.";
  if (p === "vess") return "The relay bay light is on when you pass. Shut by morning.";
  if (p === "lena") return "Down-corridor, the medbay channel light burns past cycle-turn. Then it doesn't.";
  return "";
}

// Register scene maps; throw on duplicate IDs so act splits cannot silently collide
function registerScenes(map) {
  if (!map || typeof map !== "object") return;
  if (typeof scenes === "undefined" || !scenes) {
    scenes = {};
  }
  for (const id of Object.keys(map)) {
    if (Object.prototype.hasOwnProperty.call(scenes, id)) {
      throw new Error('[Sunsplitter] duplicate scene id: "' + id + '"');
    }
    scenes[id] = map[id];
  }
}

// --- end state.js ---
