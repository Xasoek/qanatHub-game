// Role 1 owns the game balance and the state machine's shared settings.
export const CONFIG = {
  missionSols: 30,
  phasesMs: { morning: 15_000, day: 75_000, evening: 20_000, night: 10_000 },
  speeds: [1, 2, 4],
  defaults: { site: "gale", difficulty: "engineer", crop: "radish", seed: 0 },
  sites: ["gale", "jezero", "arcadia"],
  difficulties: {
    cadet: { oxygen: 18, food: 24, stormDecisionMs: 15_000 },
    engineer: { oxygen: 15, food: 20, stormDecisionMs: 10_000 },
  },
  cubesByWeather: { clear: 6, dusty: 4, storm: 2 },
  panels: 4,
  crops: {
    lettuce: { sols: 4, food: 2 },
    radish: { sols: 5, food: 3 },
    potato: { sols: 8, food: 6 },
  },
  systems: ["air", "farm", "repair", "heat", "comms", "science"],
  airUseByCubes: [1, 0.5, 0],
  foodUsePerSol: 1,
  damageLimit: 100,
};
