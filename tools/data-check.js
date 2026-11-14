// Role 3 checks for src/data.js: archive, live mode, cache, timeout, errors and empty answers.
import assert from "node:assert/strict";
import {
  ARCHIVE_INFO, LIVE, NASA_ARCHIVE, flareClass, flaresToSols, loadSolarData,
} from "../src/data.js";

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

// Second endpoint is used when the first fails.
let calls = 0;
const second = await loadSolarData({ mode: "live", storage: memoryStorage(), now: NOW,
  fetchImpl: async () => (++calls === 1 ? reply([], false)() : reply([FLARE])()) });
assert.equal(second.mode, "live");
assert.equal(calls, 2);

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
