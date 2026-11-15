// Role 1 owns the game balance and the state machine's shared settings.
// Every gameplay number lives here. tools/sim.js checks the balance targets.
export const CONFIG = {
  missionSols: 30,
  field: { brushColumns: 24, brushRows: 12, brushRadius: .065, clearFraction: .82, antennaTolerance: 8, walkSpeed: 3.2, panelClamps: 4, seedSites: 6, waterRange: [40, 70] },
  simulation: {
    // Game design, not physics: the Arcadia base was built with a larger array to pay for heating.
    generationBonus: 0, generationBySite: { gale: 0, jezero: 0, arcadia: 1 }, cableBonus: 2, hours: 6, batteryCapacity: 6, batteryInitial: 2, drawLimit: 2,
    startingDusty: 2, startingDustyBySite: { gale: 2, jezero: 2, arcadia: 1 }, startingDamage: 50, startingBroken: 1, sealLoss: .5,
    patchSols: 3, patchDamageReturn: 10, spares: 6, nightBase: 1,
    evacuationFrom: 27, evacuationOxygen: .5,
    labor: { air: 0, farm: 1, repair: .5, heat: 0, comms: .5, science: 1 },
    // Engineering campaign (IMPLEMENTATION_PLAN.md). Hours, energy units and water in
    // "sols of reserve" are game units, not measured hardware values.
    stormAirUsed: 5, // stored air the evacuation storm already used (sols), set by balancing
    co2Loss: .5, // air lost per sol while Mark vents the cabin because the CO2 cartridge is spent
    damagedLightsMaxSteps: 1, // greenhouse growth per sol until the lamps are repaired
    damagedInsulationHeat: 1, // extra night energy until the insulation is repaired
    fatigueHours: [3, 5], // each threshold reached removes one work hour
    // Water in sols of reserve. Until the pump test the recycler is off; after it the processor
    // returns most used water (the ISS recovers about 98%), shown as "recovery" per sol.
    water: { start: 6, capacity: 8, use: .25, leak: 1, isolatedLeak: .5, farmStep: .25, recovery: .75,
      dehydrationFatigue: 1 },
    crateParts: { near: 1, far: 2 },
    salvageParts: 1, // parts Mark salvages from broken equipment while clearing debris
    tasks: {
      // Power
      inspectArray: { hours: 1, cubes: 0, parts: 0, oxygen: .25, target: "panels", mission: "power" },
      cable: { hours: 2, cubes: 1, parts: 1, oxygen: .25, target: "panels", mission: "power", requires: ["inspectArray"] },
      panel: { hours: 2, cubes: 1, parts: 1, oxygen: .25, target: "panels", mission: "power", requires: ["inspectArray"], repeat: true },
      clean: { hours: 1, cubes: 0, parts: 0, oxygen: .25, target: "panels", mission: "power", requires: ["inspectArray"], repeat: true },
      powerTest: { hours: 1, cubes: 0, parts: 0, oxygen: 0, target: "panels", mission: "power", requires: ["cable"] },
      // Life support: CO2 removal is separate from the oxygen supply
      inspectAir: { hours: 1, cubes: 0, parts: 0, oxygen: 0, target: "air", mission: "life" },
      co2: { hours: 1, cubes: 1, parts: 1, oxygen: 0, target: "air", mission: "life", requires: ["inspectAir"] },
      airTest: { hours: 1, cubes: 0, parts: 0, oxygen: 0, target: "air", mission: "life", requires: ["co2"] },
      // Pressure leak in the airlock seal
      inspect: { hours: 1, cubes: 0, parts: 0, oxygen: 0, target: "air", mission: "pressure" },
      patch: { hours: 1, cubes: 1, parts: 0, oxygen: 0, target: "air", mission: "pressure", requires: ["inspect"], repeat: true },
      seal: { hours: 2, cubes: 1, parts: 1, oxygen: 0, target: "air", mission: "pressure", requires: ["inspect"] },
      // Water
      findLeak: { hours: 1, cubes: 0, parts: 0, oxygen: 0, target: "air", mission: "water" },
      isolate: { hours: 1, cubes: 0, parts: 0, oxygen: 0, target: "air", mission: "water", requires: ["findLeak"] },
      pipe: { hours: 2, cubes: 1, parts: 1, oxygen: 0, target: "air", mission: "water", requires: ["isolate"] },
      pumpTest: { hours: 1, cubes: 1, parts: 0, oxygen: 0, target: "air", mission: "water", requires: ["pipe"] },
      // Communication: beacon -> basic -> full
      inspectAntenna: { hours: 1, cubes: 0, parts: 0, oxygen: .25, target: "comms", mission: "comms" },
      radio: { hours: 2, cubes: 1, parts: 1, oxygen: .25, target: "comms", mission: "comms", requires: ["inspectAntenna"] },
      actuator: { hours: 2, cubes: 1, parts: 1, oxygen: .25, target: "comms", mission: "comms", requires: ["radio"] },
      align: { hours: 2, cubes: 1, parts: 0, oxygen: .25, target: "comms", mission: "comms", requires: ["actuator"] },
      // Greenhouse (optional)
      inspectFarm: { hours: 1, cubes: 0, parts: 0, oxygen: 0, target: "farm", mission: "farm" },
      lights: { hours: 1, cubes: 1, parts: 1, oxygen: 0, target: "farm", mission: "farm", requires: ["inspectFarm"] },
      nutrients: { hours: 1, cubes: 0, parts: 0, oxygen: 0, target: "farm", mission: "farm", requires: ["lights"] },
      // Thermal control (optional)
      inspectHeat: { hours: 1, cubes: 0, parts: 0, oxygen: 0, target: "heat", mission: "thermal" },
      insulation: { hours: 2, cubes: 1, parts: 1, oxygen: 0, target: "heat", mission: "thermal", requires: ["inspectHeat"] },
      // Rover (optional)
      roverDiag: { hours: 1, cubes: 0, parts: 0, oxygen: .25, target: "science", mission: "rover" },
      roverFix: { hours: 2, cubes: 1, parts: 1, oxygen: .25, target: "science", mission: "rover", requires: ["roverDiag"] },
      // Supplies and Mark's health
      near: { hours: 2, cubes: 1, parts: 0, oxygen: .5, food: 2, target: "science", mission: "supplies" },
      far: { hours: 3, cubes: 1, parts: 0, oxygen: 1, food: 4, target: "science", mission: "supplies", requires: ["roverFix"] },
      robot: { hours: .5, cubes: 1, parts: 0, oxygen: 0, target: "science", mission: "supplies" },
      rest: { hours: 2, cubes: 0, parts: 0, oxygen: 0, target: "air", mission: "health", repeat: true },
      // Rescue preparation
      debris: { hours: 1, cubes: 0, parts: 0, oxygen: .25, target: "repair", mission: "rescue" },
      route: { hours: 2, cubes: 0, parts: 0, oxygen: .5, target: "science", mission: "rescue", requires: ["debris"] },
      beacon: { hours: 1, cubes: 1, parts: 0, oxygen: 0, target: "comms", mission: "rescue", requires: ["actuator"] },
      // The return vehicle carries its own spares, so the rescue path never waits for base stock.
      lander: { hours: 2, cubes: 1, parts: 0, oxygen: 0, target: "repair", mission: "rescue", requires: ["powerTest"] },
      // The airlock must hold until departure: a permanent seal or a patch that is still holding.
      depart: { hours: 1, cubes: 0, parts: 0, oxygen: .5, target: "science", mission: "rescue",
        requires: ["inspect", "radio", "beacon", "route", "lander"] },
    },
    // goal: the step that completes the mission. Critical missions are on the rescue path.
    missions: {
      power: { priority: "critical", goal: "powerTest" },
      life: { priority: "critical", goal: "airTest" },
      pressure: { priority: "critical", goal: "seal" },
      water: { priority: "critical", goal: "pumpTest" },
      comms: { priority: "critical", goal: "align" },
      rescue: { priority: "critical", goal: "depart" },
      farm: { priority: "optional", goal: "nutrients" },
      thermal: { priority: "optional", goal: "insulation" },
      rover: { priority: "optional", goal: "roverFix" },
    },
  },
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

  // Presentation mode (TZ 3.2): start from an act with ready reserves at x4.
  // Acts 2 and 3 add a showcase storm and a strong flare right after the start.
  // Act 3 reaches the ending in about 5 minutes. With careful play and the NASA archive
  // the simulator reaches the rescue in ~99% of act 3 demos on Gale and Arcadia, ~23% on
  // Jezero (double damage), so demo on Gale. Act 2 is harder (~25%): it opens with a
  // storm and an X flare and still has 20 sols to go.
  presentation: {
    speed: 4,
    stormAfter: 1, // sols after the start
    flareAfter: 2,
    flareClass: "X", // used when the NASA data has no X flare
    acts: {
      1: { sol: 1, showcase: false },
      2: { sol: 11, oxygen: 13, food: 18, damage: 0, crop: { type: "radish", progress: 2 }, showcase: true },
      3: { sol: 21, oxygen: 9, food: 12, damage: 0, crop: { type: "potato", progress: 4 }, showcase: true },
    },
  },

  // Weights that rank decisions for the end report chains.
  costWeights: { oxygen: 3, food: 2, damage: 0.3, cubes: 1, fatigue: 1, crop: 1, panels: 2, dose: 0.3 },

  saveKey: "oneSolToRescue.save",
  saveVersion: 1,
};
