// Role 1: Mission of the day (TZ 3.8) gives every player the same mission on the same date.
import test from "node:test";
import assert from "node:assert/strict";
import { dailySeed, on } from "../src/engine.js";
import { playCampaign } from "../tools/campaign-bot.js";

function events(seed) {
  const seen = [];
  const off = on("event", (event) => seen.push(`${event.sol}:${event.type}`));
  try {
    playCampaign({ seed, site: "gale", difficulty: "cadet" });
  } finally {
    off();
  }
  return seen;
}

test("the daily seed is the UTC date as YYYYMMDD", () => {
  assert.equal(dailySeed(new Date("2026-11-15T23:30:00Z")), 20261115);
  assert.equal(dailySeed(new Date("2026-01-02T00:00:00Z")), 20260102);
});

test("two players on the same day get the same mission, another day differs", () => {
  const morning = events(dailySeed(new Date("2026-11-15T08:00:00Z")));
  const evening = events(dailySeed(new Date("2026-11-15T21:00:00Z")));
  assert.ok(morning.length > 5, "the mission runs long enough to compare events");
  assert.deepEqual(morning, evening);
  assert.notDeepEqual(morning, events(dailySeed(new Date("2026-11-16T08:00:00Z"))));
});
