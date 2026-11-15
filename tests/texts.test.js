// Role 4: every TZ term is explained in one phrase in both languages, and real flares are labelled honestly.
import test from "node:test";
import assert from "node:assert/strict";
import { TEXT } from "../src/text.js";

const TZ_TERMS = ["sol", "radiation", "dose", "flare", "flareClasses", "panels", "lifeSupport", "delay"];

test("every term from the TZ has a short explanation in English and Russian", () => {
  for (const lang of ["en", "ru"]) {
    for (const term of TZ_TERMS) {
      const line = TEXT[lang].bip.term[term];
      assert.ok(line, `${lang}: ${term}`);
      assert.ok((line.match(/[.!?](\s|$)/g) ?? []).length <= 2, `${lang}: ${term} is short`);
    }
  }
});

test("real NASA flares are labelled as seen from Earth and redirected in the game", () => {
  assert.match(TEXT.en.real.flareAimed, /real/i);
  assert.match(TEXT.en.real.flareAimed, /Mars/);
  assert.match(TEXT.ru.real.flareAimed, /настоящ/);
  assert.match(TEXT.ru.real.flareAimed, /Марс/);
});

test("the radio delay matches the Earth-Mars distance range (3-22 minutes)", () => {
  assert.match(TEXT.en.bip.term.delay, /3 to 22 minutes/);
  assert.match(TEXT.ru.bip.term.delay, /от 3 до 22 минут/);
});
