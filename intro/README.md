# One Sol to Rescue — интро (40 с, 1920×1080, 24 fps)

Новая версия вступительного ролика: 5 шотов (обычный день → тревога → потерян в пыли → взлёт → один, но не один).
Сцена собрана из арт-модулей игры (`src/art`): база «Заря», Марк, Бип, корабль, освещение и пыль. Надписи на моделях
заменены плашками, в кадре нет текста. Готовый ролик со звуком: [`OneSol-Intro.mp4`](OneSol-Intro.mp4).

Проект самостоятельный: свой `package.json`, на сборку игры (`npm run build` в корне) не влияет.
Все команды ниже выполняются из папки `intro/`.

## Рендер на Mac

Нужен Node.js 22 (https://nodejs.org). В папке проекта:

```bash
npm install
```

Готовый ролик со звуком:

```bash
npx remotion render src/index.ts OneSolIntro out/intro.mp4 --crf=16
```

Только один шот (например, шот 4 = кадры 552–743):

```bash
npx remotion render src/index.ts OneSolIntro out/shot4.mp4 --frames=552-743
```

Быстрый черновик 960×540:

```bash
npx remotion render src/index.ts OneSolIntro out/draft.mp4 --scale=0.5
```

Только звук:

```bash
npx remotion render src/index.ts OneSolAudio out/audio.wav --codec=wav
```

Студия для просмотра и покадровой перемотки:

```bash
npx remotion studio src/index.ts
```

## Что где лежит

- `src/engine/shots.js` — хореография 5 шотов (камеры, позы, буря, тайминги)
- `src/engine/world.js` — сборка базы «Заря», Марк, Бип, экипаж, Тулпар
- `src/engine/cockpit.js` — кабина Тулпара
- `src/game/` — арт-модули из игры (освещение, грунт, здания, персонажи); надписи заменены плашками
- `src/Soundtrack.tsx` — таблица звуков с привязкой к кадрам
- `src/HelmetHud.tsx` — дисплей шлема (иконки сигнала, без текста)
- `scripts/synth_audio.py` — генерация звуков (эмбиент, тревога, писк Бипа, гул)
