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
  { id: "osdr", org: "NASA", title: "Open Science Data Repository (OSDR)", url: "https://osdr.nasa.gov/bio/repo/",
    usedFor: "Bip's lines about muscles and bones" },
];

/**
 * Base sites. Coordinates: IAU/USGS gazetteer, planetocentric latitude, east longitude 0–360.
 * Mars Trek elevation profiles are still to be added.
 */
export const SITES = {
  gale: { name: "Gale", lat: -5.44, lon: 137.7, diameterKm: 155.3,
    url: "https://planetarynames.wr.usgs.gov/Feature/2071", sourceId: "gazetteer" },
  jezero: { name: "Jezero", lat: 18.41, lon: 77.69, diameterKm: 47.52,
    url: "https://planetarynames.wr.usgs.gov/Feature/14300", sourceId: "gazetteer" },
  arcadia: { name: "Arcadia Planitia", lat: 46.66, lon: 192, diameterKm: 2200,
    url: "https://planetarynames.wr.usgs.gov/Feature/348", sourceId: "gazetteer" },
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
  { id: "moxie", sourceId: "moxie", value: { grams: 122 },
    quote: "Since Perseverance landed on Mars in 2021, MOXIE has generated a total of 122 grams of oxygen – about what a small dog breathes in 10 hours." },
];

/** OSDR studies for Bip's lines. Only the study titles are claimed. */
export const STUDIES = [
  { id: "OSD-195", topic: "muscle", title: "Effects of 21 days of bedrest on human skeletal muscle gene expression",
    url: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-195" },
  { id: "OSD-342", topic: "bone", title: "Targeting myostatin/activin A protects against skeletal muscle and bone loss during spaceflight [plasma proteomics]",
    url: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-342" },
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
  if (message.messageURL) flare.messageURL = message.messageURL;
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

async function fetchLive(fetchImpl, now, signal) {
  const params = `startDate=${isoDate(now - (LIVE.days - 1) * DAY_MS)}&endDate=${isoDate(now)}`;
  for (const endpoint of LIVE.endpoints) {
    if (signal.aborted) return null;
    try {
      const url = `${endpoint}${endpoint.includes("?") ? "&" : "?"}${params}`;
      const response = await fetchImpl(url, { signal });
      if (!response.ok) continue;
      const body = await response.json();
      const flares = extractFlares(body);
      if (flares.length) return flares;
    } catch { /* Offline, CORS or a bad body: try the next endpoint. */ }
  }
  return null;
}

/** Resolves to null after timeoutMs even when fetch ignores the abort signal. */
async function fetchWithDeadline(fetchImpl, now, timeoutMs) {
  const controller = new AbortController();
  let timer;
  const deadline = new Promise((resolve) => {
    timer = setTimeout(() => { controller.abort(); resolve(null); }, timeoutMs);
  });
  try {
    return await Promise.race([fetchLive(fetchImpl, now, controller.signal), deadline]);
  } finally {
    clearTimeout(timer);
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
