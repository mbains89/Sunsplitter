// SUN-FIX-CORRIDOR-PORTRAIT-LOCKS-01 — live resolution must not use the rejected plates.
// Myth 2026-10-08: corridor.jpg is a Vess lookalike. corridor_variant.jpg shows people.
// Absent/dead fallback is images/corridor_pressure_3.jpg. Living offshift_sela is sela_ritual.jpg.
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BANNED = ["images/corridor.jpg", "images/corridor_variant.jpg"];
const EMPTY = "images/corridor_pressure_3.jpg";
const CREW = ["lena", "elias", "mira", "tomas", "amara", "jiro", "sela", "vess"];

function sample(runtime) {
  return runtime.evaluate(`(() => {
    const banned = ${JSON.stringify(BANNED)};
    const empty = ${JSON.stringify(EMPTY)};
    const crew = ${JSON.stringify(CREW)};
    const ready = () => {
      resetRunState();
      state.recovered.tomas = true;
      state.recovered.jiro = true;
      state.recovered.vess = true;
    };
    const killWho = (who) => {
      ready();
      if (who) kill(who, "corridor portrait lock");
    };
    const sweep = (label) => {
      const hits = [];
      for (const id of Object.keys(scenes)) {
        const got = resolveSceneImage(id, scenes[id]);
        if (banned.includes(got)) hits.push(id + " -> " + got);
      }
      return { label, hits };
    };
    const pin = (id) => resolveSceneImage(id, scenes[id]);
    const sweeps = [sweep("all-alive")];
    for (const who of crew) {
      killWho(who);
      sweeps.push(sweep("dead-" + who));
    }
    ready();
    state.flags.prom_line_other = "jiro";
    const alive = {
      offshift_sela: pin("offshift_sela"),
      filters_stencil: pin("filters_stencil"),
      act2_spine_next: pin("act2_spine_next"),
      boarding_stories: pin("boarding_stories"),
      warmth_laughter: pin("warmth_laughter"),
      warmth_music: pin("warmth_music"),
      aftermath_seal: pin("aftermath_seal"),
      aftermath_seal_order: pin("aftermath_seal_order"),
      aftermath_seal_holds: pin("aftermath_seal_holds"),
      prom_vent: pin("prom_vent"),
      prom_vent_keep: pin("prom_vent_keep"),
      prom_vent_break: pin("prom_vent_break"),
      offshift_open: pin("offshift_open"),
      coolant_trade: pin("coolant_trade"),
      seal_or_food: pin("seal_or_food"),
      faction_split: pin("faction_split")
    };
    killWho("sela");
    const selaDead = pin("offshift_sela");
    const stencilDead = pin("filters_stencil");
    killWho("vess");
    const vessDead = pin("offshift_vess");
    killWho("amara");
    state.flags.crisis = null;
    const crisis = pin("crisis");
    const repairs = pin("priority_repairs");
    const aftermath = pin("aftermath");
    killWho("tomas");
    const arc3 = pin("arc_living_3");
    ready();
    state.survivors = 5;
    const walk = pin("crew_walk");
    const status = pin("status");
    ready();
    kill("mira", "corridor portrait lock");
    const shield = pin("pair_shield_cold");
    killWho("lena");
    const faction = pin("faction_split");
    const debt = pin("debt_notice");
    const reckonPublic = pin("reckon_public");
    return {
      sweeps,
      alive,
      selaDead,
      stencilDead,
      vessDead,
      crisis,
      repairs,
      aftermath,
      arc3,
      walk,
      status,
      shield,
      faction,
      debt,
      reckonPublic
    };
  })()`);
}

export function corridorPortraitLocksChecks(runtime) {
  const errors = [];
  if (!runtime || typeof runtime.evaluate !== "function") {
    errors.push("corridor portrait locks require the loadGame runtime");
    return errors;
  }
  let fixture;
  try {
    fixture = sample(runtime);
  } catch (error) {
    errors.push(error.stack || error.message);
    return errors;
  }
  for (const row of fixture.sweeps || []) {
    for (const hit of row.hits || []) errors.push(row.label + " resolves banned plate: " + hit);
  }
  const expect = (label, got, wanted) => {
    if (got !== wanted) errors.push(label + " resolved " + (got || "missing") + "; expected " + wanted);
  };
  expect("offshift_sela alive", fixture.alive.offshift_sela, "images/sela_ritual.jpg");
  expect("filters_stencil alive", fixture.alive.filters_stencil, "images/sela.jpg");
  expect("offshift_sela dead", fixture.selaDead, EMPTY);
  expect("filters_stencil dead", fixture.stencilDead, EMPTY);
  expect("offshift_vess dead", fixture.vessDead, EMPTY);
  expect("crisis missing Amara", fixture.crisis, EMPTY);
  expect("priority_repairs missing Amara", fixture.repairs, EMPTY);
  expect("aftermath missing Amara", fixture.aftermath, EMPTY);
  expect("arc_living_3 missing Tomas", fixture.arc3, EMPTY);
  expect("crew_walk survivors<=5", fixture.walk, EMPTY);
  expect("status survivors<=5", fixture.status, EMPTY);
  expect("pair_shield_cold invalid", fixture.shield, EMPTY);
  expect("faction_split missing Lena", fixture.faction, EMPTY);
  expect("debt_notice missing Lena", fixture.debt, EMPTY);
  expect("reckon_public missing Lena", fixture.reckonPublic, "images/observation.jpg");
  expect("act2_spine_next", fixture.alive.act2_spine_next, EMPTY);
  expect("boarding_stories", fixture.alive.boarding_stories, EMPTY);
  expect("warmth_laughter", fixture.alive.warmth_laughter, "images/warmth_laughter.jpg");
  expect("warmth_music", fixture.alive.warmth_music, "images/warmth_music.jpg");
  expect("aftermath_seal", fixture.alive.aftermath_seal, "images/aftermath_seal.jpg");
  expect("aftermath_seal_order", fixture.alive.aftermath_seal_order, "images/aftermath_seal_order.jpg");
  expect("aftermath_seal_holds", fixture.alive.aftermath_seal_holds, "images/aftermath_seal_holds.jpg");
  expect("prom_vent", fixture.alive.prom_vent, "images/prom_vent.jpg");
  expect("prom_vent_keep", fixture.alive.prom_vent_keep, "images/prom_vent_keep.jpg");
  expect("prom_vent_break", fixture.alive.prom_vent_break, "images/prom_vent_break.jpg");
  expect("offshift_open", fixture.alive.offshift_open, EMPTY);
  expect("coolant_trade", fixture.alive.coolant_trade, EMPTY);
  expect("seal_or_food", fixture.alive.seal_or_food, EMPTY);
  expect("faction_split full crew", fixture.alive.faction_split, EMPTY);
  if (!ROOT) errors.push("root missing");
  return errors;
}

void loadGame;
