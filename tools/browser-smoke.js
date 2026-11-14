import assert from "node:assert/strict";
import { copyFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

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
    ["mobile", { width: 360, height: 800 }],
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
      await page.locator("#intro-art svg").waitFor();
      await page.locator("#intro-skip").click();
      await page.locator("#start").click();
      await page.locator("#base svg").waitFor();
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
      assert.equal(await page.locator("#oxygen").textContent(), oxygen);
      assert.ok(Number(await page.locator("#food").textContent()) < food);

      await page.locator("#language").click();
      assert.equal(await page.locator("#game-title").textContent(), "Один сол до помощи");
      assert.match(await page.locator("#sol").textContent(), /^Сол 2 из 30/);
      assert.match(await page.locator("#solar").textContent(), /Архив NASA/);
      const fitsViewport = await page.evaluate(() =>
        document.documentElement.scrollWidth <= document.documentElement.clientWidth);
      assert.ok(fitsViewport, "mission screen overflows the viewport");
      assert.deepEqual(errors, [], "the browser reported uncaught exceptions");
      assert.deepEqual(requests, [url], "the game requested resources outside index.html");
    });
  }
});
