// Role 3 supplies the verified DONKI archive and the opt-in live path ("Today's Sun").
import { ARCHIVE } from "./nasa-archive.js";

/** Where and when the bundled archive came from. Filled by tools/donki-archive.js. */
export const ARCHIVE_INFO = Object.freeze({
  endpoint: ARCHIVE.endpoint,
  startDate: ARCHIVE.startDate,
  endDate: ARCHIVE.endDate,
  fetchedAt: ARCHIVE.fetchedAt,
});

/**
 * DONKI flare records for 1–31 May 2024 with DONKI field names and unchanged values.
 * ARCHIVE_INFO.endpoint says which DONKI endpoint they came from.
 */
export const NASA_ARCHIVE = ARCHIVE.flares;

/**
 * Every source the game cites. URLs were opened on 2026-11-14; the DONKI site itself
 * did not answer from our network then, its data came through api.nasa.gov.
 * usedFor names the game feature; facts below point here by id.
 */
export const SOURCES = [
  { id: "donki", org: "NASA CCMC", title: "DONKI: Space Weather Database Of Notifications, Knowledge, Information",
    url: "https://kauai.ccmc.gsfc.nasa.gov/DONKI/", usedFor: "solar flares (archive and Today's Sun)" },
  { id: "nasaApi", org: "NASA", title: "NASA Open APIs", url: "https://api.nasa.gov/",
    usedFor: "access to DONKI" },
  { id: "marsFactSheet", org: "NASA NSSDC", title: "Mars Fact Sheet",
    url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html", usedFor: "base sensors: temperature, pressure, sol length" },
  { id: "marsFacts", org: "NASA Science", title: "Mars: Facts", url: "https://science.nasa.gov/mars/facts/",
    usedFor: "what a sol is" },
  { id: "radStorm2024", org: "NASA", title: "NASA Watches Mars Light Up During Epic Solar Storm",
    url: "https://www.nasa.gov/solar-system/planets/mars/nasa-watches-mars-light-up-during-epic-solar-storm/",
    usedFor: "It was real: the May 2024 flare and the Curiosity RAD dose" },
  { id: "opportunity", org: "NASA Science", title: "Mars Exploration Rover: Opportunity",
    url: "https://science.nasa.gov/mission/mer-opportunity/", usedFor: "It was real: the 2018 dust storm" },
  { id: "veggie", org: "NASA", title: "Veggie fact sheet",
    url: "https://www.nasa.gov/wp-content/uploads/2019/04/veggie_fact_sheet_508.pdf", usedFor: "greenhouse: lettuce" },
  { id: "aphRadish", org: "NASA", title: "Astronauts Harvest Radish Crop on International Space Station",
    url: "https://www.nasa.gov/missions/station/astronauts-harvest-radish-crop-on-international-space-station/",
    usedFor: "greenhouse: radish" },
  { id: "cipPotato", org: "International Potato Center (CIP)", title: "Potatoes on Mars",
    url: "https://cipotato.org/pressreleases/potatoes-on-mars/", usedFor: "greenhouse: potato" },
  { id: "moxie", org: "NASA", title: "NASA's Oxygen-Generating Experiment MOXIE Completes Mars Mission",
    url: "https://www.nasa.gov/missions/mars-2020-perseverance/nasas-oxygen-generating-experiment-moxie-completes-mars-mission/",
    usedFor: "site choice: Jezero" },
  { id: "gazetteer", org: "USGS / IAU", title: "Gazetteer of Planetary Nomenclature",
    url: "https://planetarynames.wr.usgs.gov/", usedFor: "site choice: coordinates" },
  { id: "marsTrek", org: "NASA", title: "Mars Trek", url: "https://trek.nasa.gov/mars/",
    usedFor: "site choice: map" },
  { id: "marsTrekDem", org: "NASA Mars Trek", title: "MOLA global elevation model (Mars Trek map service)",
    url: "https://trek.nasa.gov/mars/trekarcgis/rest/services/mola128_mola64_merge_90Nto90S_SimpleC_clon0/ImageServer",
    usedFor: "site choice: elevation profiles" },
  { id: "osdr", org: "NASA", title: "Open Science Data Repository (OSDR)", url: "https://osdr.nasa.gov/bio/repo/",
    usedFor: "Bip's lines about muscles, bones and fatigue" },
  { id: "ntrsIssDose", org: "NASA NTRS", title: "Moon 2 Mars Space Radiation Protection \u201cBuying Down\u201d Risks to Crew (Simonsen et al.)",
    url: "https://ntrs.nasa.gov/citations/20250006168", usedFor: "dose scale: a day on the ISS" },
  { id: "ntrsSleep", org: "NASA NTRS", title: "Humans are Capable of Achieving Sufficient Sleep in Microgravity",
    url: "https://ntrs.nasa.gov/citations/20220014772", usedFor: "Bip's lines about sleep and fatigue" },
  { id: "csaFood", org: "Canadian Space Agency", title: "Toolkit for educators and youth – Food production on the Moon and in remote areas",
    url: "https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/", usedFor: "Bip's lines about food; For Teachers" },
  { id: "csaStem", org: "Canadian Space Agency", title: "Space resources for STEM and youth organizations",
    url: "https://www.asc-csa.gc.ca/eng/youth-educators/resources-stem-and-youth-organizations.asp", usedFor: "For Teachers" },
];

/**
 * Base sites. Coordinates: IAU/USGS gazetteer, planetocentric latitude, east longitude 0–360.
 * profile: 16 west-to-east MOLA elevation samples through the centre (km from centre,
 * east longitude, metres), read from the Mars Trek DEM service on 2026-11-14.
 */
export const SITES = {
  gale: { name: "Gale", lat: -5.44, lon: 137.7, diameterKm: 155.3,
    url: "https://planetarynames.wr.usgs.gov/Feature/2071", sourceId: "gazetteer",
    profileSourceId: "marsTrekDem",
    profile: [
      { km: -100, lon: 136.002, elevationM: -813 },
      { km: -86.7, lon: 136.2284, elevationM: -1503 },
      { km: -73.3, lon: 136.4548, elevationM: -854 },
      { km: -60, lon: 136.6812, elevationM: -2976 },
      { km: -46.7, lon: 136.9076, elevationM: -3477 },
      { km: -33.3, lon: 137.134, elevationM: -3634 },
      { km: -20, lon: 137.3604, elevationM: -3062 },
      { km: -6.7, lon: 137.5868, elevationM: -3148 },
      { km: 6.7, lon: 137.8132, elevationM: -1419 },
      { km: 20, lon: 138.0396, elevationM: -1980 },
      { km: 33.3, lon: 138.266, elevationM: -2598 },
      { km: 46.7, lon: 138.4924, elevationM: -2583 },
      { km: 60, lon: 138.7188, elevationM: -2449 },
      { km: 73.3, lon: 138.9452, elevationM: -1478 },
      { km: 86.7, lon: 139.1716, elevationM: -299 },
      { km: 100, lon: 139.398, elevationM: -492 },
    ] },
  jezero: { name: "Jezero", lat: 18.41, lon: 77.69, diameterKm: 47.52,
    url: "https://planetarynames.wr.usgs.gov/Feature/14300", sourceId: "gazetteer",
    profileSourceId: "marsTrekDem",
    profile: [
      { km: -35, lon: 77.0665, elevationM: -2023 },
      { km: -30.3, lon: 77.1496, elevationM: -2046 },
      { km: -25.7, lon: 77.2327, elevationM: -2000 },
      { km: -21, lon: 77.3159, elevationM: -2168 },
      { km: -16.3, lon: 77.399, elevationM: -2537 },
      { km: -11.7, lon: 77.4822, elevationM: -2612 },
      { km: -7, lon: 77.5653, elevationM: -2628 },
      { km: -2.3, lon: 77.6484, elevationM: -2643 },
      { km: 2.3, lon: 77.7316, elevationM: -2652 },
      { km: 7, lon: 77.8147, elevationM: -2640 },
      { km: 11.7, lon: 77.8978, elevationM: -2626 },
      { km: 16.3, lon: 77.981, elevationM: -2531 },
      { km: 21, lon: 78.0641, elevationM: -2419 },
      { km: 25.7, lon: 78.1473, elevationM: -2205 },
      { km: 30.3, lon: 78.2304, elevationM: -2266 },
      { km: 35, lon: 78.3135, elevationM: -2145 },
    ] },
  arcadia: { name: "Arcadia Planitia", lat: 46.66, lon: 192, diameterKm: 2200,
    url: "https://planetarynames.wr.usgs.gov/Feature/348", sourceId: "gazetteer",
    profileSourceId: "marsTrekDem",
    profile: [
      { km: -100, lon: 189.537, elevationM: -4021 },
      { km: -86.7, lon: 189.8654, elevationM: -3999 },
      { km: -73.3, lon: 190.1938, elevationM: -3980 },
      { km: -60, lon: 190.5222, elevationM: -4029 },
      { km: -46.7, lon: 190.8506, elevationM: -4014 },
      { km: -33.3, lon: 191.179, elevationM: -4010 },
      { km: -20, lon: 191.5074, elevationM: -4007 },
      { km: -6.7, lon: 191.8358, elevationM: -4007 },
      { km: 6.7, lon: 192.1642, elevationM: -4002 },
      { km: 20, lon: 192.4926, elevationM: -3997 },
      { km: 33.3, lon: 192.821, elevationM: -3987 },
      { km: 46.7, lon: 193.1494, elevationM: -3986 },
      { km: 60, lon: 193.4778, elevationM: -3994 },
      { km: 73.3, lon: 193.8062, elevationM: -3972 },
      { km: 86.7, lon: 194.1346, elevationM: -3989 },
      { km: 100, lon: 194.463, elevationM: -3995 },
    ] },
};

/**
 * Verified facts. `quote` is copied from the source page; role 4 writes the player's text.
 * Numbers the game uses for real-world captions sit in `value`.
 */
export const FACTS = [
  { id: "solLength", sourceId: "marsFactSheet", value: { hours: 24.6597 },
    quote: "Length of day (hrs) 24.6597" },
  { id: "sol", sourceId: "marsFacts",
    quote: "Martian days are called sols — short for \"solar day.\"" },
  { id: "surfacePressure", sourceId: "marsFactSheet", value: { mb: 6.36, minMb: 4.0, maxMb: 8.7 },
    quote: "Surface pressure: 6.36 mb at mean radius (variable from 4.0 to 8.7 mb depending on season)" },
  { id: "temperature", sourceId: "marsFactSheet", value: { averageC: -59, minC: -89, maxC: -31 },
    quote: "Average temperature: ~214 K (-59 C) Diurnal temperature range: 184 K to 242 K (-89 to -31 C)" },
  { id: "flare2024", sourceId: "radStorm2024", value: { date: "2024-05-20", classType: "X12" },
    quote: "The biggest event occurred on May 20 with a solar flare later estimated to be an X12" },
  { id: "radDose2024", sourceId: "radStorm2024", value: { microgray: 8100, chestXrays: 30 },
    quote: "If astronauts had been standing next to NASA’s Curiosity Mars rover at the time, they would have received a radiation dose of 8,100 micrograys — equivalent to 30 chest X-rays." },
  // ISS doses are effective doses in mSv; the RAD figure above is an absorbed dose in µGy.
  // They are different units, so the game must not compare them as the same number.
  { id: "issDailyDose", sourceId: "ntrsIssDose",
    value: { mSvPerDayMin: 0.2, mSvPerDayMax: 0.5, mSvSixMonthsMin: 40, mSvSixMonthsMax: 90 },
    quote: "On the International Space Station (ISS), effective doses accumulate at a rate of approximately 0.2 to 0.5 mSv/day, averaging between ~40 and 90 mSv during a typical six-month mission" },
  { id: "sleepInSpace", sourceId: "ntrsSleep", value: { hoursInSpace: 6, hoursNeeded: 7 },
    quote: "Studies consistently find that humans average approximately six hours of sleep per night in space, which is less than they sleep on Earth. Consensus recommendations suggest that humans need at least seven hours of sleep per night for appropriate functioning." },
  { id: "opportunityStorm", sourceId: "opportunity",
    value: { lastContact: "2018-06-10", endOfMission: "2019-02-13" },
    quote: "June 10, 2018: Last communication with Opportunity Feb. 13, 2019: NASA declares End of Mission" },
  { id: "opportunityPanels", sourceId: "opportunity",
    quote: "Opportunity went quiet during a historic Mars-wide dust storm in 2018 that reduced the energy available to the rover’s solar panels." },
  { id: "lettuce", sourceId: "veggie", value: { days: 33, planted: "2014-05-08" },
    quote: "Astronaut Steve Swanson started the first crop of lettuce on May 8, 2014, and it grew for 33 days." },
  { id: "radish", sourceId: "aphRadish", value: { days: 27, harvested: "2020-11-30" },
    quote: "NASA selected radishes because they are well understood by scientists and reach maturity in just 27 days." },
  { id: "potato", sourceId: "cipPotato",
    quote: "The experiment, led by the International Potato Center (CIP) and NASA, is a major step towards building a controlled dome on Mars capable of farming the invaluable crop" },
  { id: "csaFoodToolkit", sourceId: "csaFood",
    quote: "This toolkit aims to outline how food production in space can relate to the health and nutrition of astronauts as well as benefit humans on Earth." },
  { id: "csaEducators", sourceId: "csaStem",
    quote: "That's why our initiatives are tailored to the needs of teachers in the classroom, but also of educators in more informal learning settings and parents, whether or not they homeschool their kids." },
  { id: "moxie", sourceId: "moxie", value: { grams: 122 },
    quote: "Since Perseverance landed on Mars in 2021, MOXIE has generated a total of 122 grams of oxygen – about what a small dog breathes in 10 hours." },
];

/** OSDR studies for Bip's lines. Only the study titles are claimed. Sleep is in FACTS.sleepInSpace. */
export const STUDIES = [
  { id: "OSD-195", topic: "muscle", title: "Effects of 21 days of bedrest on human skeletal muscle gene expression",
    url: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-195" },
  { id: "OSD-342", topic: "bone", title: "Targeting myostatin/activin A protects against skeletal muscle and bone loss during spaceflight [plasma proteomics]",
    url: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-342" },
  { id: "OSD-343", topic: "fatigue", title: "Comprehensive multi-omics analysis reveals mitochondrial stress as a central biological hub for spaceflight impact",
    url: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-343" },
  { id: "OSD-32", topic: "brain", title: "Effect of microgravity on brain gene expression in mice",
    url: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-32" },
];

/** Live-mode settings. The public DEMO_KEY is the only key allowed in the repository. */
export const LIVE = Object.freeze({
  days: 30,
  timeoutMs: 5_000,
  cacheMs: 24 * 60 * 60 * 1_000,
  cacheKey: "oneSol.donki.flr.v1",
  endpoints: [
    "https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/FLR",
    "https://api.nasa.gov/DONKI/FLR?api_key=DEMO_KEY",
    // FLR answers 404 on api.nasa.gov since 2026-11; flare notifications carry the same fields.
    "https://api.nasa.gov/DONKI/notifications?type=FLR&api_key=DEMO_KEY",
  ],
});

/** DONKI fields the game keeps. Values are copied as they are. */
export const FLARE_FIELDS = Object.freeze([
  "flrID", "beginTime", "peakTime", "endTime", "classType",
  "sourceLocation", "activeRegionNum", "link", "messageID", "messageURL",
]);

const DAY_MS = 24 * 60 * 60 * 1_000;

export function pickFlare(record) {
  return Object.fromEntries(FLARE_FIELDS.filter((field) => Object.hasOwn(record, field))
    .map((field) => [field, record[field]]));
}

const NOTE_LINES = {
  flrID: /^Activity ID:\s*(\S+?-FLR-\d+)\.?\s*$/m,
  beginTime: /^Flare start time:\s*(\S+?)\.?\s*$/m,
  peakTime: /^Flare peak time:\s*(\S+?)\.?\s*$/m,
  endTime: /^Flare end time:\s*(\S+?)\.?\s*$/m,
  classType: /^Flare intensity:\s*([A-Z][\d.]+) class\.?\s*$/m,
};

/**
 * Reads one DONKI flare notification ("Space Weather Notification - X1.6 Flare").
 * Copies the values as written by DONKI; returns null for other messages.
 */
export function parseFlareNotification(message) {
  const body = message?.messageBody;
  if (typeof body !== "string" || !/^## Message Type: Space Weather Notification - [A-Z][\d.]+ Flare\s*$/m.test(body)) return null;
  const flare = {};
  for (const [field, pattern] of Object.entries(NOTE_LINES)) {
    const match = body.match(pattern);
    if (match) flare[field] = match[1];
  }
  const region = body.match(/^Source region:\s*(\S+)(?:\s*\(Active Region (\d+)\))?/m);
  if (region) {
    flare.sourceLocation = region[1];
    if (region[2]) flare.activeRegionNum = Number(region[2]);
  }
  if (message.messageID) flare.messageID = message.messageID;
  if (message.messageURL) {
    flare.messageURL = message.messageURL;
    // The DONKI page of this notification is the record of this flare; "link" is the
    // field name DONKI FLR records use, so the engine and UI read one field for both.
    flare.link = message.messageURL;
  }
  return flare.flrID && flare.beginTime && flareClass(flare.classType) ? flare : null;
}

/** Turns a DONKI FLR array or a notifications array into flare records, one per flrID. */
export function extractFlares(body) {
  if (!Array.isArray(body)) return [];
  const flares = new Map();
  for (const record of body) {
    const flare = record && "messageBody" in record ? parseFlareNotification(record)
      : record && flareClass(record.classType) && record.beginTime ? pickFlare(record) : null;
    if (flare) flares.set(flare.flrID ?? `${flare.beginTime}/${flare.classType}`, flare);
  }
  return [...flares.values()].sort((a, b) => a.beginTime.localeCompare(b.beginTime));
}

/** "M1.4" → "M". Returns null when the class is missing or not A/B/C/M/X. */
export function flareClass(classType) {
  const letter = typeof classType === "string" ? classType.trim().charAt(0).toUpperCase() : "";
  return "ABCMX".includes(letter) && letter ? letter : null;
}

/**
 * Maps each flare's UTC day to a sol: the first day of the range is sol 1.
 * C flares stay in the list (they go to the feed); the engine decides which make an event.
 * @returns {{sol: number, class: string, classType: string, beginTime: string, flrID?: string}[]}
 */
export function flaresToSols(flares, { startDate, sols = 30 } = {}) {
  const first = startDate ? Date.parse(`${startDate}T00:00:00Z`)
    : Math.min(...flares.map((flare) => utcDay(flare.beginTime)));
  return flares.flatMap((flare) => {
    const letter = flareClass(flare.classType);
    const day = utcDay(flare.beginTime);
    if (!letter || Number.isNaN(day) || Number.isNaN(first)) return [];
    const sol = Math.floor((day - first) / DAY_MS) + 1;
    if (sol < 1 || sol > sols) return [];
    return [{ sol, class: letter, classType: flare.classType, beginTime: flare.beginTime,
      ...(flare.flrID ? { flrID: flare.flrID } : {}) }];
  }).sort((a, b) => a.sol - b.sol || a.beginTime.localeCompare(b.beginTime));
}

function utcDay(time) {
  const ms = Date.parse(time?.endsWith("Z") ? time : `${time}Z`);
  return Number.isNaN(ms) ? NaN : Math.floor(ms / DAY_MS) * DAY_MS;
}

function isoDate(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

function archiveResult(noticeKey) {
  return {
    mode: "archive",
    flares: structuredClone(NASA_ARCHIVE),
    asOf: NASA_ARCHIVE.length ? ARCHIVE_INFO.endDate : null,
    noticeKey,
  };
}

function defaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function readCache(storage, now) {
  try {
    const cached = JSON.parse(storage?.getItem(LIVE.cacheKey) ?? "null");
    if (cached && Array.isArray(cached.flares) && cached.flares.length &&
        now - cached.fetchedAt >= 0 && now - cached.fetchedAt < LIVE.cacheMs) return cached;
  } catch { /* A broken or blocked cache means a fresh request. */ }
  return null;
}

function writeCache(storage, entry) {
  try {
    storage?.setItem(LIVE.cacheKey, JSON.stringify(entry));
  } catch { /* Storage can be full or blocked; the game goes on without a cache. */ }
}

/** One endpoint: resolves to its flares or rejects, so Promise.any can pick the first good one. */
async function fetchEndpoint(fetchImpl, endpoint, params, signal) {
  const url = `${endpoint}${endpoint.includes("?") ? "&" : "?"}${params}`;
  const response = await fetchImpl(url, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const flares = extractFlares(await response.json());
  if (!flares.length) throw new Error("no flares");
  return flares;
}

/**
 * Asks all endpoints at once and keeps the first non-empty answer: a host that hangs
 * (the DONKI site often does) must not use up the whole timeout. Resolves to null after
 * timeoutMs even when fetch ignores the abort signal.
 */
async function fetchWithDeadline(fetchImpl, now, timeoutMs) {
  const params = `startDate=${isoDate(now - (LIVE.days - 1) * DAY_MS)}&endDate=${isoDate(now)}`;
  const controller = new AbortController();
  let timer;
  const deadline = new Promise((resolve) => {
    timer = setTimeout(() => resolve(null), timeoutMs);
  });
  const first = Promise.any(LIVE.endpoints.map((endpoint) => (async () =>
    fetchEndpoint(fetchImpl, endpoint, params, controller.signal))()))
    .catch(() => null);
  try {
    return await Promise.race([first, deadline]);
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}

/**
 * @param {{mode?: "archive" | "live", fetchImpl?: typeof fetch, storage?: Storage | null,
 *   now?: number, timeoutMs?: number}} options  Everything but mode is for tests.
 * @returns {Promise<{mode: "archive" | "live", flares: object[], asOf: string | null, noticeKey: string | null}>}
 */
export async function loadSolarData({ mode = "archive", fetchImpl = globalThis.fetch,
  storage = defaultStorage(), now = Date.now(), timeoutMs = LIVE.timeoutMs } = {}) {
  if (mode !== "live") return archiveResult(null);

  const cached = readCache(storage, now);
  if (cached) return { mode: "live", flares: structuredClone(cached.flares), asOf: cached.asOf, noticeKey: null };

  const flares = typeof fetchImpl === "function" ? await fetchWithDeadline(fetchImpl, now, timeoutMs) : null;
  if (!flares) return archiveResult("solar.liveUnavailable");

  const asOf = isoDate(now);
  writeCache(storage, { fetchedAt: now, asOf, flares });
  return { mode: "live", flares: structuredClone(flares), asOf, noticeKey: null };
}
