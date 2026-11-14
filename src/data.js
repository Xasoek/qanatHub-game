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

export const SOURCES = [
  { id: "donki", title: "NASA DONKI", url: "https://kauai.ccmc.gsfc.nasa.gov/DONKI/" },
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
