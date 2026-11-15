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
      const touch = name === "mobile";
      const context = await browser.newContext({ offline: true, viewport, hasTouch: touch });
      scenario.after(() => context.close());
      const requests = [];
      const errors = [];
      context.on("request", (request) => requests.push(request.url()));
      const page = await context.newPage();
      page.on("pageerror", (error) => errors.push(error.message));
      page.setDefaultTimeout(5_000);
      await page.goto(url);
      const press = (control) => touch ? control.tap() : control.click();

      assert.equal(await page.locator("#game-title").textContent(), "One Sol to Rescue");
      await page.locator("#intro-art svg").waitFor();
      await press(page.locator("#intro-skip"));
      await page.locator("#difficulty").selectOption("cadet");
      await press(page.locator("#start"));
      await page.locator("#base svg").waitFor();
      assert.match(await page.locator("#solar").textContent(), /NASA archive/);

      await press(page.locator("#next"));
      const oxygen = await page.locator("#oxygen").textContent();
      const food = Number(await page.locator("#food").textContent());
      const energy = Number(await page.locator("#energy").textContent());
      const powerAir = page.locator('#system-air button[data-delta="1"]');
      await press(powerAir);
      await press(powerAir);
      assert.equal(Number(await page.locator("#energy").textContent()), energy - 2);
      await press(page.locator("#end"));
      await press(page.locator("#advance"));
      assert.match(await page.locator("#sol").textContent(), /^Sol 2 of 30/);
      assert.equal(await page.locator("#oxygen").textContent(), oxygen);
      assert.ok(Number(await page.locator("#food").textContent()) < food);

      await press(page.locator("#language"));
      assert.equal(await page.locator("#game-title").textContent(), "Один сол до помощи");
      assert.match(await page.locator("#sol").textContent(), /^Сол 2 из 30/);
      assert.match(await page.locator("#solar").textContent(), /Архив NASA/);
      await press(page.locator("#next"));
      const event = page.locator("#event");
      await event.waitFor();
      const cropChoice = event.getByRole("button", { name: "Редис" });
      await cropChoice.waitFor();
      const fitsViewport = await page.evaluate(() =>
        document.documentElement.scrollWidth <= document.documentElement.clientWidth);
      assert.ok(fitsViewport, "crop choice overflows the viewport");
      await press(cropChoice);
      await event.waitFor({ state: "hidden" });
      assert.match(await page.locator("#bip").textContent(), /редис/i);

      await scenario.test("event choices block allocation only for the current sol (#11)", async () => {
        const allocation = (system, delta = 1) => page.locator(`#system-${system} button[data-delta="${delta}"]`);
        const blockReason = (system) => page.locator(`#system-${system}-reason`);
        async function assertBlocked(systems, reason) {
          for (const system of systems) {
            assert.ok(await allocation(system).isDisabled());
            assert.ok(await allocation(system, -1).isDisabled());
            assert.ok(await blockReason(system).isVisible());
            assert.match(await blockReason(system).textContent(), reason);
            assert.equal(await allocation(system).getAttribute("aria-describedby"), `system-${system}-reason`);
          }
        }

        async function nextSol() {
          await press(page.locator("#end"));
          await press(page.locator("#advance"));
          await press(page.locator("#next"));
        }

        await press(page.locator("#language"));
        // The game's default seed schedules panel cleaning on sol 6 and a storm on sol 7.
        for (let sol = 2; sol < 6; sol++) {
          await press(allocation("air"));
          await press(allocation("air"));
          await press(allocation("farm"));
          await press(allocation("farm"));
          if (sol >= 4) await press(allocation("heat"));
          await nextSol();
        }
        assert.match(await page.locator("#sol").textContent(), /^Sol 6 of 30/);
        await press(event.getByRole("button", { name: /^Clean the panels/ }));
        await assertBlocked(["farm", "repair"], /Unavailable this sol.*Clean the panels/);
        await press(page.locator("#language"));
        await assertBlocked(["farm", "repair"], /Недоступно до следующего сола.*Почистить панели/);
        const energyBefore = Number(await page.locator("#energy").textContent());
        await press(allocation("air"));
        assert.equal(Number(await page.locator("#energy").textContent()), energyBefore - 1);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));

        await nextSol();
        assert.match(await page.locator("#sol").textContent(), /^Сол 7 из 30/);
        await press(event.getByRole("button", { name: /^Сложить панели/ }));
        await assertBlocked(["heat"], /Недоступно до следующего сола.*Сложить панели/);
        for (const system of ["farm", "repair"]) {
          assert.ok(await allocation(system).isEnabled());
          assert.ok(await blockReason(system).isHidden());
          assert.equal(await allocation(system).getAttribute("aria-describedby"), null);
        }
        await press(page.locator("#language"));
        await assertBlocked(["heat"], /Unavailable this sol.*Fold the panels/);
        await nextSol();
        assert.match(await page.locator("#sol").textContent(), /^Sol 8 of 30/);
        assert.equal(Number(await page.locator("#energy").textContent()), 0);
        assert.ok(await blockReason("heat").isHidden());
        assert.equal(await allocation("heat").getAttribute("aria-describedby"), null);

        const acknowledge = () => press(event.getByRole("button", { name: "Got it" }));
        await acknowledge();
        await nextSol();
        assert.ok(await allocation("heat").isEnabled());
        await nextSol();
        await acknowledge();
        await nextSol();
        assert.match(await page.locator("#sol").textContent(), /^Sol 11 of 30/);
        await press(event.getByRole("button", { name: /^Take shelter/ }));
        await assertBlocked(["farm", "repair"], /Unavailable this sol.*Take shelter/);
        await press(page.locator("#language"));
        await assertBlocked(["farm", "repair"], /Недоступно до следующего сола.*В укрытие/);
        await nextSol();
        await press(event.getByRole("button", { name: "Понятно" }));
        for (const system of ["farm", "repair"]) {
          assert.ok(await allocation(system).isEnabled());
          assert.ok(await blockReason(system).isHidden());
        }
      });

      assert.deepEqual(errors, [], "the browser reported uncaught exceptions");
      assert.deepEqual(requests, [url], "the game requested resources outside index.html");
    });
  }
});
