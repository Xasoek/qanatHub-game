// Role 4 adds keys to both languages.
export const TEXT = {
  en: {
    game: {
      title: "One Sol to Rescue",
      intro: "Keep the Mars base running until help arrives.",
      turn: "Sol {sol} of {total} · {phase}",
      oxygen: "Oxygen",
      food: "Food",
      energy: "Energy",
      addAir: "Power the air scrubber",
      next: "Start day",
      end: "End sol",
      advance: "Apply sol results",
      restart: "Restart",
      emergencySleep: "Emergency sleep. The rescue crew will find you.",
      rescued: "The rescue crew has arrived.",
      scene: "The Mars base with its greenhouse and solar panels",
    },
    phases: { morning: "Morning", day: "Day", evening: "Evening", night: "Night" },
    solar: {
      archive: "NASA archive",
      unavailable: "NASA data pending",
      liveUnavailable: "Live NASA data is unavailable.",
      live: "Live NASA data · {date}",
    },
  },
  ru: {
    game: {
      title: "Один сол до помощи",
      intro: "Поддерживай работу марсианской базы до прибытия помощи.",
      turn: "Сол {sol} из {total} · {phase}",
      oxygen: "Кислород",
      food: "Еда",
      energy: "Энергия",
      addAir: "Дать энергию очистителю",
      next: "Начать день",
      end: "Завершить сол",
      advance: "Подвести итоги сола",
      restart: "Начать заново",
      emergencySleep: "Аварийный сон. Спасатели найдут тебя.",
      rescued: "Спасатели прибыли.",
      scene: "Марсианская база с теплицей и солнечными панелями",
    },
    phases: { morning: "Утро", day: "День", evening: "Вечер", night: "Ночь" },
    solar: {
      archive: "Архив NASA",
      unavailable: "Ожидаются данные NASA",
      liveUnavailable: "Свежие данные NASA недоступны.",
      live: "Свежие данные NASA · {date}",
    },
  },
};

export function t(lang, key, vars = {}) {
  const catalog = TEXT[lang] ?? TEXT.en;
  const value = key.split(".").reduce((node, part) => node?.[part], catalog);
  if (typeof value !== "string") throw new RangeError(`Missing text: ${lang}.${key}`);
  return value.replace(/\{(\w+)\}/g, (token, name) => String(vars[name] ?? token));
}
