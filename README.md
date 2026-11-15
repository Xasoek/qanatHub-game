# One Sol to Rescue · Один сол до помощи

Двуязычная образовательная игра для NASA Space Apps Challenge. Марк и робот Бип должны продержаться 210 солов на марсианской базе «Заря», пока летит помощь. Игрок распределяет энергию между системами базы, бережёт кислород и еду, принимает решения во время пылевых бурь и солнечных вспышек. В финале игра показывает последствия решений.

[Играть в браузере на GitHub Pages](https://xasoek.github.io/qanatHub-game/)

## Играть офлайн

Скачайте [`index.html` из ветки `main`](https://raw.githubusercontent.com/Xasoek/qanatHub-game/main/index.html) и откройте файл в современном браузере. Сборка включает JavaScript, CSS, SVG и архив солнечных вспышек NASA DONKI за май 2024 года. Для игры достаточно одного файла. Ссылки на научные источники открываются по выбору игрока при наличии сети.

Пройдите или пропустите вступление, выберите место базы и сложность. Для первого знакомства выберите Гейл и уровень «Курсант». Нажмите **Начать день**, распределите энергию, нажмите **Завершить сол**, затем **Подвести итоги сола**. Язык можно переключить в верхней части экрана. Меню содержит научные факты, источники и материалы для учителей.

Фазы можно проходить кнопками или с выбранной скоростью симуляции. Обратный отсчёт во время бури работает в реальном времени. В игре доступны сохранения, режим презентации и настройки данных NASA DONKI. Архив работает офлайн. Для запроса свежих данных нужна сеть, а при сбое игра возвращается к архиву.

## Собрать и проверить

Установите Git и Node.js 22 с npm. Выполните из корня репозитория.

```bash
git clone https://github.com/Xasoek/qanatHub-game.git
cd qanatHub-game
npm ci
npm test
npm run build
npm run build:check
npx playwright install chromium
npm run test:browser
npm run sim -- 1000
```

| Команда | Результат |
| --- | --- |
| `npm ci` | Устанавливает версии из `package-lock.json`. Для первого скачивания зависимостей нужна сеть. |
| `npm test` | Запускает тесты движка, smoke-проверку контракта и сборки, проверки архива, кэша и резервного режима NASA. |
| `npm run build` | Собирает из `src/` корневой `index.html`. После установки зависимостей сборка работает без сети. |
| `npm run build:check` | Сравнивает существующий HTML со свежим результатом сборки. Для проверки коммита запустите команду до `npm run build`. |
| `npm run test:browser` | Проверяет собранный HTML в Chromium с отключённой сетью. Требуется разовая установка Chromium из блока выше. В Linux для системных библиотек используйте `npx playwright install --with-deps chromium`. |
| `npm run sim -- 1000` | Прогоняет 1 000 миссий на строку отчёта и выводит результаты по стратегиям, местам, сложностям и актам презентации. |

Браузерный тест переносит только `index.html` во временную папку и открывает через `file://` на настольном экране и при ширине 360 px. Он проверяет вступление, SVG базы, архив NASA, расход энергии, переход к солу 2, EN/RU, выбор культуры и отсутствие внешних запросов или ошибок JavaScript. На ширине 360 px тест использует сенсорные нажатия и проверяет, что экран выбора культуры помещается по ширине.

## Структура и вклад в проект

| Роль | Основные файлы | Рабочая ветка |
| --- | --- | --- |
| 1 · Движок и баланс | `src/config.js`, `src/engine.js`, `tools/sim.js`, `tests/engine.test.js` | `role-1/engine` |
| 2 · Интерфейс и графика | `src/ui.js`, `src/art.js`, `src/style.css` | `role-2/ui` |
| 3 · Данные NASA | `src/data.js`, `src/nasa-archive.js`, `tools/data-check.js`, `tools/donki-archive.js` | `role-3/nasa-data` |
| 4 · Сюжет и локализация | `src/text.js` | `role-4/story` |
| 5 · Интеграция и выпуск | `src/main.js`, `tools/build.js`, `tools/*smoke.js`, npm, CI, документация и сборка | `role-5/integration` |

`src/main.js` монтирует интерфейс. Интерфейс передаёт действия в движок, читает состояние из движка и показывает двуязычные строки, встроенную графику и данные NASA. `tools/build.js` собирает JS в обычный встроенный скрипт, встраивает CSS и проверяет зависимости сборки.

Работайте в ветке своей роли, вносите изменения через PR в `main`. Если правки влияют на сборку, добавляйте заново сгенерированный `index.html` вместе с исходниками. [Порядок работы с Git](CONTRIBUTING.md) · [Роли и приёмка](TEAM_GUIDE.md) · [Контракты модулей](CONTRACTS.md)

## CI и GitHub Pages

[Build and smoke checks](https://github.com/Xasoek/qanatHub-game/actions/workflows/smoke.yml) запускается для PR в `main` и при каждом push в `main`. Шаги проверяют исходники и актуальность HTML, собирают его заново и открывают офлайн в Chromium. После успешных проверок на push в `main` GitHub Pages получает артефакт с единственным `index.html`.

Первоначальная настройка для владельца репозитория: **Settings → Pages → Build and deployment → Source → GitHub Actions**. Если на странице предложены шаблоны workflow, используется уже существующий `smoke.yml`. После успешной публикации адрес появится в задании **Deploy to GitHub Pages** и в **Settings → Pages**. [Настройка источника GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

[Чек-лист тестирования и выпуска](docs/RELEASE_CHECKLIST.md) · [Сценарий демо и материалы для презентации](docs/DEMO.md)

## Simulator in the game
The browser starts the optional simulator extension, paused for planning. Use “Start day”,
“Plan work”, “End sol” and the review button to advance manually, or select a playback speed.
The six-hour work allowance is an abstract daily budget. A planned job completes at sunset.
Reopen the planner and click the job to cancel its reservation before settlement.

After the opening storm, inspect and repair the airlock, replace the broken array and restore
the radio. Free generation and heating allocations charge the battery; the base and heating
use it at night. Temporary patches expire after three sols. There are two finite supply trips.
The distant trip blocks crop care, with a declared equipment penalty during dust storms.
To finish the return, test the beacon, survey the route, service the return vehicle and choose
departure on sols 27–30. Otherwise the epilogue describes an assisted rescue.

All energy units, labor hours, yields and the one-sol reply are educational simplifications.
DONKI event dates and classes remain attributed archive records. Illustrative radiation risk
points are separate from measured astronaut or Mars radiation doses.
