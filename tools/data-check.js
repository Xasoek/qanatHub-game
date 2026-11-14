// Role 3 checks for src/data.js: archive, live mode, cache, timeout, errors and empty answers.
import assert from "node:assert/strict";
import {
  ARCHIVE_INFO, LIVE, NASA_ARCHIVE, extractFlares, flareClass, flaresToSols, loadSolarData,
  FACTS, SITES, SOURCES, STUDIES, parseFlareNotification,
} from "../src/data.js";

// Every fact, site and study points to a listed https source.
const sourceIds = new Set(SOURCES.map((source) => source.id));
assert.equal(sourceIds.size, SOURCES.length);
for (const source of SOURCES) assert.match(source.url, /^https:\/\//, source.id);
for (const fact of FACTS) {
  assert.ok(sourceIds.has(fact.sourceId), `${fact.id} has no source`);
  assert.ok(fact.quote.length > 10, `${fact.id} has no quote`);
}
assert.equal(new Set(FACTS.map((fact) => fact.id)).size, FACTS.length);
assert.deepEqual(Object.keys(SITES).sort(), ["arcadia", "gale", "jezero"]);
for (const site of Object.values(SITES)) {
  assert.ok(sourceIds.has(site.sourceId) && site.lat >= -90 && site.lat <= 90 && site.lon >= 0 && site.lon < 360);
}
for (const site of Object.values(SITES)) {
  assert.ok(sourceIds.has(site.profileSourceId) && site.profile.length >= 10);
  for (const point of site.profile) assert.ok(Number.isInteger(point.elevationM) && Math.abs(point.elevationM) < 30_000);
}
for (const study of STUDIES) assert.match(study.url, /^https:\/\/osdr\.nasa\.gov\//);

const NOW = Date.parse("2026-11-14T10:00:00Z");
const FLARE = { flrID: "2026-11-01T01:00:00-FLR-001", beginTime: "2026-11-01T01:00Z",
  peakTime: "2026-11-01T01:10Z", classType: "M1.4", extra: "dropped" };

function memoryStorage() {
  const data = new Map();
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, String(v)), data };
}
const reply = (body, ok = true) => async () => ({ ok, status: ok ? 200 : 503, json: async () => body });

// Archive: offline, a copy, real dates only.
const archive = await loadSolarData();
assert.equal(archive.mode, "archive");
assert.equal(archive.noticeKey, null);
assert.deepEqual(archive.flares, NASA_ARCHIVE);
assert.notStrictEqual(archive.flares, NASA_ARCHIVE);
for (const flare of NASA_ARCHIVE) {
  assert.ok(flare.beginTime >= ARCHIVE_INFO.startDate && flare.beginTime <= `${ARCHIVE_INFO.endDate}T23:59Z`);
  assert.ok(flareClass(flare.classType), `bad classType ${flare.classType}`);
}

// The bundled archive is real data for May 2024 with a source.
assert.ok(NASA_ARCHIVE.length > 0, "the archive is empty; run tools/donki-archive.js");
assert.match(ARCHIVE_INFO.endpoint, /^DONKI\//);
assert.match(ARCHIVE_INFO.fetchedAt, /^\d{4}-\d{2}-\d{2}$/);
assert.equal(new Set(NASA_ARCHIVE.map((flare) => flare.flrID)).size, NASA_ARCHIVE.length);
// Each archived flare links to its own DONKI record (issue #12).
for (const flare of NASA_ARCHIVE) {
  assert.match(flare.link, /^https:\/\/(ccmc|kauai\.ccmc)\.gsfc\.nasa\.gov\/DONKI\//, flare.flrID);
}

// DONKI flare notifications become FLR-shaped records; other messages are ignored.
const NOTE = {
  messageType: "FLR", messageID: "20260101-AL-001",
  messageURL: "https://ccmc.gsfc.nasa.gov/DONKI/view/Alert/1/1",
  messageBody: [
    "## Message Type: Space Weather Notification - X1.6 Flare", "## Summary:",
    "Flare start time: 2026-11-01T01:00Z. ", "Flare peak time: 2026-11-01T01:10Z.",
    "Flare intensity: X1.6 class.", "Source region: S06W63 (Active Region 13654) (based on SDO imagery).",
    "Activity ID: 2026-11-01T01:00:00-FLR-001.",
  ].join("\n\n"),
};
assert.deepEqual(parseFlareNotification(NOTE), {
  flrID: "2026-11-01T01:00:00-FLR-001", beginTime: "2026-11-01T01:00Z",
  peakTime: "2026-11-01T01:10Z", classType: "X1.6", sourceLocation: "S06W63",
  activeRegionNum: 13654, messageID: NOTE.messageID, messageURL: NOTE.messageURL, link: NOTE.messageURL,
});
const cme = { ...NOTE, messageBody: "## Message Type: Space Weather Notification - CME\n\nActivity ID: x-CME-001" };
assert.equal(parseFlareNotification(cme), null);
assert.equal(extractFlares([NOTE, NOTE, cme]).length, 1);

// Live success: last 30 days requested, fields kept, cached for a day.
const storage = memoryStorage();
const urls = [];
const live = await loadSolarData({ mode: "live", storage, now: NOW,
  fetchImpl: async (url) => { urls.push(url); return reply([FLARE])(); } });
assert.equal(live.mode, "live");
assert.equal(live.asOf, "2026-11-14");
assert.equal(live.noticeKey, null);
assert.deepEqual(live.flares, [{ flrID: FLARE.flrID, beginTime: FLARE.beginTime,
  peakTime: FLARE.peakTime, classType: "M1.4" }]);
assert.match(urls[0], /startDate=2026-10-16&endDate=2026-11-14/);
assert.ok(storage.data.has(LIVE.cacheKey));

const fail = async () => { throw new Error("must use the cache"); };
const fromCache = await loadSolarData({ mode: "live", storage, now: NOW + LIVE.cacheMs - 1, fetchImpl: fail });
assert.equal(fromCache.mode, "live");
assert.equal(fromCache.asOf, "2026-11-14");
const expired = await loadSolarData({ mode: "live", storage, now: NOW + LIVE.cacheMs, fetchImpl: reply([]) });
assert.equal(expired.mode, "archive");

// Fallbacks: offline, HTTP error, empty answer, bad JSON, timeout, no fetch, blocked storage.
const fallback = { mode: "archive", noticeKey: "solar.liveUnavailable" };
const offline = async () => { throw new TypeError("Failed to fetch"); };
const never = () => new Promise(() => {});
const blocked = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
for (const [name, options] of Object.entries({
  offline: { fetchImpl: offline },
  httpError: { fetchImpl: reply([FLARE], false) },
  empty: { fetchImpl: reply([]) },
  notArray: { fetchImpl: reply({ error: "x" }) },
  timeout: { fetchImpl: never, timeoutMs: 20 },
  noFetch: { fetchImpl: null },
})) {
  const result = await loadSolarData({ mode: "live", storage: memoryStorage(), now: NOW, ...options });
  assert.equal(result.mode, fallback.mode, name);
  assert.equal(result.noticeKey, fallback.noticeKey, name);
  assert.deepEqual(result.flares, NASA_ARCHIVE, name);
}
const started = Date.now();
await loadSolarData({ mode: "live", storage: memoryStorage(), now: NOW, fetchImpl: never, timeoutMs: 50 });
assert.ok(Date.now() - started < 1_000, "timeout must not wait for fetch");
const noStorage = await loadSolarData({ mode: "live", storage: blocked, now: NOW, fetchImpl: reply([FLARE]) });
assert.equal(noStorage.mode, "live");

// Another endpoint is used when the first fails.
let calls = 0;
const second = await loadSolarData({ mode: "live", storage: memoryStorage(), now: NOW,
  fetchImpl: async () => (++calls === 1 ? reply([], false)() : reply([FLARE])()) });
assert.equal(second.mode, "live");
assert.equal(calls, LIVE.endpoints.length);

// A hanging first host (the DONKI site) must not block a fast answer from another one.
const hangFirst = Date.now();
const notBlocked = await loadSolarData({ mode: "live", storage: memoryStorage(), now: NOW, timeoutMs: 2_000,
  fetchImpl: (url) => (url.startsWith(LIVE.endpoints[0]) ? never() : reply([FLARE])()) });
assert.equal(notBlocked.mode, "live");
assert.ok(Date.now() - hangFirst < 1_000, "a hanging host blocked the live answer");

// Notifications work as the last live endpoint.
const viaNotes = await loadSolarData({ mode: "live", storage: memoryStorage(), now: NOW,
  fetchImpl: async (url) => (url.includes("notifications") ? reply([NOTE, cme])() : reply([], false)()) });
assert.equal(viaNotes.mode, "live");
assert.equal(viaNotes.flares[0].classType, "X1.6");

// Classes and sols.
assert.equal(flareClass("X8.7"), "X");
assert.equal(flareClass("m1.0"), "M");
assert.equal(flareClass(""), null);
assert.equal(flareClass(undefined), null);
assert.deepEqual(flaresToSols([
  { beginTime: "2024-05-20T05:00Z", classType: "X1.6", flrID: "b" },
  { beginTime: "2024-05-01T23:59Z", classType: "C3.0" },
  { beginTime: "2024-06-01T00:00Z", classType: "M1.0" },
  { beginTime: "2024-05-03T00:00Z", classType: "" },
], { startDate: "2024-05-01" }), [
  { sol: 1, class: "C", classType: "C3.0", beginTime: "2024-05-01T23:59Z" },
  { sol: 20, class: "X", classType: "X1.6", beginTime: "2024-05-20T05:00Z", flrID: "b" },
]);

console.log(`Data checks passed (${NASA_ARCHIVE.length} archived flares)`);
