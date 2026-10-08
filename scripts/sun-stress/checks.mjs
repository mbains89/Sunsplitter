// Independent observations: never call the production affordability/ending oracle.
export const resources = ["survivors", "integrity", "cohesion", "supplies", "embryos"];

export function resourceFailures(state) {
  return resources.filter(k => !Number.isFinite(state[k]) || state[k] < 0)
    .map(key => ({ rule: "negative_or_invalid_resource", key, value: state[key] }));
}

export function paymentFailures({ before, after, changes, choice }) {
  const failures = [];
  for (const key of resources) {
    const delta = changes[key];
    if (typeof delta !== "number" || delta >= 0) continue;
    if (before[key] + delta < 0) failures.push({ rule: "unpaid_cost", key, before: before[key], cost: -delta, choice });
    if (after[key] !== before[key] + delta) failures.push({ rule: "cost_not_fully_debited", key, before: before[key], after: after[key], cost: -delta, choice });
  }
  return failures;
}

export function plainText(html) {
  return String(html).replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, "&");
}

// Deliberately high-confidence present-tense attribution. Historical mentions,
// death descriptions and recollections are not active speakers (L-048).
// Unmatched prose is not a claim that every semantic dead-speech case is covered.
export function speechFailures(text, absent) {
  const failures = [];
  for (const { key, name } of absent) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const attribution = new RegExp(`\\b${escaped}(?:\\s+(?:(?:says|asks|replies|answers|whispers|murmurs|calls|shouts|adds|interrupts|nods|shakes|steps|stands|waits|watches|leans|looks|turns|takes|puts|sends|slides|offers|hands|touches|reaches)\\b|(?:is|are)\\s+(?:still\\s+)?(?:saying|asking|waiting|standing|watching|speaking)\\b)|:\\s*["“])`, "g");
    for (const match of text.matchAll(attribution)) {
      const start = Math.max(text.lastIndexOf("\n", match.index), text.lastIndexOf(".", match.index), text.lastIndexOf("!", match.index)) + 1;
      const prefix = text.slice(start, match.index);
      if (/\b(?:remember|remembered|memory|memories|recording|recorded|used to|once|last time|before|if|when|would|could|will|watching how)\b/i.test(prefix)) continue;
      failures.push({ rule: "absent_crew_active_attribution", crew: key, excerpt: text.slice(start, Math.min(text.length, match.index + 150)).trim() });
    }
  }
  return failures;
}

export function endingFailures(state, ending, facts, cast = {}) {
  const failures = [];
  if (!ending.title || !ending.text.trim()) failures.push({ rule: "empty_ending" });
  if (ending.title === "Landfall" && (state.flags.final !== "hold" || state.survivors < 6 || state.cohesion < 50 || state.embryos < 65 || state.integrity < 35 || state.flags.crisis === "vent" || state.flags.vault_sacrifice === "living")) failures.push({ rule: "landfall_contradicts_run" });
  if (state.flags.final !== "hold" && /The course is a fact on the board|The course remains locked|The commitment made earlier was enough/i.test(ending.text)) failures.push({ rule: "abandoned_course_reported_locked" });
  const difference = Number(state.ideology.future || 0) - Number(state.ideology.living || 0);
  // Expected title from saved run facts, without invoking resolveEnding,
  // canYellowCircle, ideologyShape, or any production title builder.
  const f = state.flags, s = state.survivors, c = state.cohesion, e = state.embryos, i = state.integrity;
  const shape = ["future", "living", "split"].includes(f.vault_sacrifice) ? f.vault_sacrifice : difference >= 8 ? "future" : difference <= -8 ? "living" : "split";
  const marked = (who, tag) => typeof state.marks?.[who] === "string" ? state.marks[who].split("|").includes(tag) : !!state.marks?.[who]?.[tag];
  const yellow = f.crisis !== "vent" && marked("sela", "spoken") && !(state.dead || []).includes("sela") && shape === "living" && c >= 50 && s >= 6 && !marked("tomas", "broke") && f.sela_attention !== "ignored" && f.sun_doctrine !== "scrubbed" && (f.sun_doctrine === "doctrine" || f.sela_attention === "present" || state.romance?.sela) && ["endure", "hold", "comfort"].includes(f.final);
  const communal = f.leadership === "together" || ["public", "memory"].includes(f.reckon);
  const expectedTitle = yellow ? "The Yellow Circle" : s >= 6 && c >= 50 && e >= 65 && i >= 35 && f.crisis !== "vent" && f.vault_sacrifice !== "living" && f.final === "hold" && (communal || shape === "future") ? "Landfall" : f.vault_sacrifice === "living" && s >= 5 && c >= 30 ? "The Living Ship" : s <= 4 || e < 25 && c < 30 || i < 15 && s <= 5 ? "The Quiet Ship" : c >= 48 && s >= 5 && i >= 22 && (communal || f.mid_arc === "living") ? "Still Burning" : c < 30 || f.leadership === "watch" || f.reckon === "suppress" || f.vault_sacrifice === "future" && c < 40 ? "Fracture" : "The Long Dark";
  if (ending.title !== expectedTitle) failures.push({ rule: "ending_title_contradicts_run", expected: expectedTitle, actual: ending.title });
  const expected = difference >= 8 ? "Across the recorded orders, Future carried more weight." : difference <= -8 ? "Across the recorded orders, Living carried more weight." : "The recorded orders remained split between Future and Living.";
  if (facts[0] !== expected) failures.push({ rule: "ending_ideology_contradicts_run", expected, actual: facts[0] });
  const reflection = facts.join("\n");
  for (const [key, person] of Object.entries(cast)) {
    const dead = (state.dead || []).includes(key);
    const declaredDead = new RegExp(`\\b${person.first} (?:died\\b|went back for the living and did not return|finished the repair and died)`).test(reflection);
    if (declaredDead !== dead) failures.push({ rule: "ending_death_fact_contradicts_run", crew: key, dead, declaredDead });
    if (dead && (ending.text.includes(`${person.name} still looks for you`) || ending.text.includes(`corridors: ${person.name}.`) || ending.text.includes(`still speaks through ${person.name}`))) failures.push({ rule: "dead_crew_in_living_ending_role", crew: key });
  }
  const numbered = [
    [/embryo counts are permanently lower \((\d+)%\)/i, "embryos"],
    [/restart package is wounded \((\d+)%\)/i, "embryos"],
    [/Hull is a daily argument \((\d+)%\)/, "integrity"],
    [/Supplies are a shorter argument \((\d+)%\)/, "supplies"]
  ];
  for (const [pattern, key] of numbered) {
    const match = ending.text.match(pattern);
    if (match && Number(match[1]) !== state[key]) failures.push({ rule: "ending_resource_text_contradicts_run", key, expected: state[key], actual: Number(match[1]) });
  }
  return failures;
}

export function saveFailures(before, after, restored) {
  if (!restored) return [{ rule: "save_resume_rejected" }];
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])];
  return keys.filter(key => JSON.stringify(before[key]) !== JSON.stringify(after[key]))
    .map(key => ({ rule: "save_resume_state_loss", key, before: before[key], after: after[key] }));
}
