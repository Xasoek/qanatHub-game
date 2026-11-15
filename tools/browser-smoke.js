import assert from "node:assert/strict";
import { copyFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";
import { CONFIG } from "../src/config.js";
import { GUIDE_STEPS } from "../src/guide.js";

test("the standalone index.html plays offline on desktop and mobile", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "one-sol-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const copy = join(directory, "index.html");
  await copyFile(new URL("../index.html", import.meta.url), copy);
  const url = pathToFileURL(copy).href;

  const browser = await chromium.launch();
  t.after(() => browser.close());

  for (const [name, viewport] of [
    ["desktop", { width: 1280, height: 800 }],
    // The game is landscape-only; a phone is tested held sideways.
    ["mobile", { width: 800, height: 360 }],
  ]) {
    await t.test(name, async (scenario) => {
      const context = await browser.newContext({ offline: true, viewport, hasTouch: name === "mobile" });
      scenario.after(() => context.close());
      const requests = [];
      const errors = [];
      context.on("request", (request) => requests.push(request.url()));
      const page = await context.newPage();
      page.on("pageerror", (error) => errors.push(error.message));
      page.setDefaultTimeout(5_000);
      await page.goto(url);

      assert.equal(await page.locator("#game-title").textContent(), "One Sol to Rescue");
      // A first visit opens the "How to play" guide at once; it pages forward and back and closes for good.
      const guide = page.getByRole("dialog", { name: "Your mission" });
      await guide.waitFor();
      assert.equal(await page.locator("#guide-progress").textContent(), `1/${GUIDE_STEPS.length}`);
      await page.locator("#guide-next").click();
      assert.equal(await page.locator("#guide-progress").textContent(), `2/${GUIDE_STEPS.length}`);
      await page.locator("#guide-back").click();
      assert.equal(await page.locator("#guide-progress").textContent(), `1/${GUIDE_STEPS.length}`);
      for (let step = 1; step < GUIDE_STEPS.findIndex(({ id }) => id === "bottom") + 1; step++) await page.locator("#guide-next").click();
      assert.equal(await page.locator("#guide-title").textContent(), "Buttons at the bottom");
      assert.ok(await page.locator("#guide-rows").getByText("Start day", { exact: true }).isVisible());
      await page.locator("#guide-skip").click();
      await page.locator("#guide-layer").waitFor({ state: "hidden" });
      await page.reload();
      assert.ok(await page.locator("#guide-layer").isHidden(), "a returning player is not shown the guide again");
      await page.locator("#start").click();
      // The base is a WebGL canvas; browsers without WebGL 2 get the SVG fallback.
      await page.locator("#base canvas, #base svg").first().waitFor();
      assert.match(await page.locator("#solar").textContent(), /NASA archive/);

      await page.locator("#next").click();
      const oxygen = await page.locator("#oxygen").textContent();
      const food = Number(await page.locator("#food").textContent());
      const energy = Number(await page.locator("#energy").textContent());
      const powerAir = page.locator('#system-air button[data-delta="1"]');
      await powerAir.click();
      await powerAir.click();
      assert.equal(Number(await page.locator("#energy").textContent()), energy - 2);
      await page.locator("#end").click();
      await page.locator("#advance").click();
      assert.match(await page.locator("#sol").textContent(), /^Sol 2 of 30/);
      // Sol 1 of the campaign: the airlock leaks and the CO2 cartridge is spent (CONFIG.simulation).
      const loss = CONFIG.simulation.sealLoss + CONFIG.simulation.co2Loss;
      assert.equal(Number(await page.locator("#oxygen").textContent()), Math.round((Number(oxygen) - loss) * 100) / 100);
      assert.ok(Number(await page.locator("#food").textContent()) < food);

      await page.locator("#language").click();
      assert.equal(await page.locator("#game-title").textContent(), "Один сол до помощи");
      assert.match(await page.locator("#sol").textContent(), /^Сол 2 из 30/);
      assert.match(await page.locator("#solar").textContent(), /Архив NASA/);
      const fitsViewport = await page.evaluate(() =>
        document.documentElement.scrollWidth <= document.documentElement.clientWidth);
      assert.ok(fitsViewport, "mission screen overflows the viewport");

      // The "?" button reopens the guide during a mission; Escape closes it.
      await page.locator("#help").click();
      await page.getByRole("dialog", { name: "Твоя миссия" }).waitFor();
      const next = page.locator("#guide-next");
      for (let step = 1; step < GUIDE_STEPS.length; step++) {
        const box = await next.boundingBox();
        assert.ok(box && box.y + box.height <= viewport.height, `Next stays on screen on step ${step}`);
        await next.click();
      }
      assert.equal(await next.textContent(), "Вперёд!");
      await page.keyboard.press("Escape");
      await page.locator("#guide-layer").waitFor({ state: "hidden" });
      assert.match(await page.locator("#sol").textContent(), /^Сол 2 из 30/);
      assert.deepEqual(errors, [], "the browser reported uncaught exceptions");
      // The page is loaded twice (the reload above); it never requests anything but index.html.
      assert.deepEqual([...new Set(requests)], [url], "the game requested resources outside index.html");
    });
  }
});
