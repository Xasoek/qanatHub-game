// Role 1 owns the game balance and the state machine's shared settings.
// Every gameplay number lives here. tools/sim.js checks the balance targets.
export const CONFIG = {
  missionSols: 30,
  // 1 sol = 2 minutes at x1 (TZ 3.1).
  phasesMs: { morning: 15_000, day: 75_000, evening: 20_000, night: 10_000 },
  speeds: [1, 2, 4],
  defaults: { site: "gale", difficulty: "engineer", crop: "radish", seed: 0 },
  sites: ["gale", "jezero", "arcadia"],
  difficulties: {
    cadet: { oxygen: 18, food: 24, stormDecisionMs: 15_000 },
    engineer: { oxygen: 15, food: 20, stormDecisionMs: 10_000 },
  },

  // Energy cubes per sol (TZ 3.4). The TZ starts at 6/4/2; the simulator
  // lowered clear and dusty days to reach the 40-60% engineer target.
  cubesByWeather: { clear: 5, dusty: 3, storm: 2 },
  cubePenalty: {
    perDownPanel: 1, // broken or dusty panel
    fatigueAt: 3, // fatigue at or above this costs one cube
    fatigue: 1,
  },
  panels: 4,

  // Site trade-offs (TZ 2, "Место базы"). dustyChance is per sol after the tutorial.
  // Gale: +1 cube, more dust. Jezero: cheaper scrubber, double event damage.
  // Arcadia: crops never wilt, heating costs 2 cubes.
  siteRules: {
    gale: { bonusCubes: 1, airFullCubes: 2, heatCubes: 1, cropWilts: true,
      dustyChance: 0.8, damageMultiplier: 1 },
    jezero: { bonusCubes: 0, airFullCubes: 1, heatCubes: 1, cropWilts: true,
      dustyChance: 0.5, damageMultiplier: 2 },
    arcadia: { bonusCubes: 0, airFullCubes: 2, heatCubes: 2, cropWilts: false,
      dustyChance: 0.1, damageMultiplier: 1 },
  },

  // Systems. A system opens on the given sol during the tutorial (TZ 4, sols 1-5).
  systems: ["air", "farm", "repair", "heat", "comms", "science"],
  unlockSol: { air: 1, farm: 2, repair: 3, heat: 4, comms: 4, science: 5 },
  maxAlloc: { air: 2, farm: 2, repair: 4, heat: 2, comms: 1, science: 3 },

  // Oxygen use in sols of reserve by air cubes: 0 cubes, 1 below full, full.
  // airUseByCubes stays for the starter UI, which reads its length.
  airUseByCubes: [1, 0.5, 0],
  oxygenMultiplier: { scrubberBroken: 2, leak: 2, minLossWhenFaulty: 0.5 },
  leakDamage: 50, // damage above this leaks air

  foodUsePerSol: 1,
  crops: {
    lettuce: { sols: 4, food: 2 },
    radish: { sols: 5, food: 3 },
    potato: { sols: 8, food: 6 },
  },
  farm: { stepPerCube: 1, wiltSteps: 1 },

  repair: { damagePerCube: 10, cubesPerFix: 2 },
  heat: { fatigueWithoutHeat: 1, fatigueRecovery: 1 },
  comms: { staleChance: 0.25, forecastSols: 3 },
  science: { starSamples: [3, 6, 10] }, // samples for 1, 2, 3 stars

  damageLimit: 100,

  // Events (TZ 3.6). Damage is in percent.
  events: {
    storm: { damage: [10, 20], dustChance: 0.5, dustPanels: [1, 2] },
    flare: {
      // Weighted random class when NASA data has no flares.
      classWeights: { C: 0.45, M: 0.4, X: 0.15 },
      damage: { C: 0, M: 5, X: 15 },
      dose: { C: 1, M: 3, X: 6 },
      // "Work" choice: cubes lost per sol and for how many sols, from tomorrow.
      doseCubes: { C: 1, M: 2, X: 2 },
      doseSols: { C: 1, M: 1, X: 2 },
    },
    scrubber: { fixCubes: 2 },
    rover: { food: 4, oxygen: 3, stormRisk: 0.3, stormDamage: 15 },
    coldNight: { extraCubes: 1, cropSteps: 1, fatigue: 1 },
  },

  // Event schedule by act (TZ 4). Random events come from the pool.
  schedule: {
    tutorialSols: 5,
    cropChoiceSol: 2,
    acts: [
      { from: 6, to: 10, storms: 1, flares: 0, scrubber: 0, random: [1, 1] },
      { from: 11, to: 20, storms: 0, flares: 1, scrubber: 1, random: [2, 3] },
      { from: 21, to: 28, storms: 0, flares: 1, scrubber: 0, random: [3, 4] },
    ],
    finalStormSol: 29,
    randomPool: ["dustyPanels", "roverCrate", "coldNight"],
  },

  // Delayed consequences (TZ 3.7).
  consequences: {
    crack: { damageAbove: 30, streakSols: 3, delaySols: [3, 5], damage: 15 },
    cold: { nightsWithoutHeat: 2, cubes: 1, sols: 2 },
  },
  lowReserveSols: 3, // autopause when oxygen or food drops below this

  // Weights that rank decisions for the end report chains.
  costWeights: { oxygen: 3, food: 2, damage: 0.3, cubes: 1, fatigue: 1, crop: 1, panels: 2, dose: 0.3 },

  saveKey: "oneSolToRescue.save",
  saveVersion: 1,
};
