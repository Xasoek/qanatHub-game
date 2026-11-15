# Контракты модулей

Импортируем именованные экспорты с расширением `.js`. Движок работает как в браузере, так и в Node.js. UI читает актуальный `STATE` через импорт, а движок может заменить объект при старте или загрузке партии. Роль 1 владеет его схемой. Изменения согласуются с ролями, которые его читают, и с ролью 5.

## CONFIG и STATE

`CONFIG` содержит параметры миссии, фаз, скоростей, сложностей, кубиков, культур и списки допустимых идентификаторов. Время передаём в миллисекундах. Кислород и еду измеряем в солах, энергию в кубиках, урон в процентах. `cubes` показывает свободный остаток на текущий сол. Выделенные кубики хранятся в `alloc`.

| Поле STATE | Значения или форма |
| --- | --- |
| `sol`, `phase` | Сол от 1 до `CONFIG.missionSols`, фаза `morning\|day\|evening\|night` |
| `speed`, `paused`, `status` | Скорость `1\|2\|4`, пауза boolean, статус `playing\|rescued\|emergencySleep` |
| `site`, `difficulty` | `gale\|jezero\|arcadia` и `cadet\|engineer` |
| `oxygen`, `food`, `damage`, `cubes` | Числа, не меньше нуля |
| `alloc`, `panels`, `crop` | Числа по системам `air\|farm\|repair\|heat\|comms\|science`, объекты `{total,broken,dusty}` и `{type,progress}` |
| `dose`, `fatigue`, `crates`, `stars` | Числа, не меньше нуля |
| `weather`, `forecast`, `scrubberBroken` | `clear\|dusty\|storm`, прогноз или `null`, boolean |
| `pending`, `log` | Массив последствий, журнал `{sol,choice,cost,note}`. `choice` — ID, `cost` — объект с числовой ценой, `note` — ключ текста или `null` |
| `solarMode`, `flares`, `seed` | `archive\|live`, массив записей DONKI, числовой сид |

## API движка

| Экспорт | Договор |
| --- | --- |
| `newGame({site, difficulty, seed, solarData, presentation} = {})` | Сбрасывает партию и возвращает новый `STATE`. Настройки по умолчанию берёт из `CONFIG`. Сид задаёт даты и порядок событий: одинаковый сид даёт одинаковую партию, поэтому UI передаёт новый сид в каждой партии. `presentation: {act: 1\|2\|3}` включает режим презентации: старт с сола 1, 11 или 21 с готовыми запасами из `CONFIG.presentation`, скорость ×4, сохранение не трогается. В актах 2 и 3 на следующий сол приходит буря, ещё через сол — вспышка класса X. Акт 3 доходит до концовки примерно за 5 минут. Для демо выбирайте Гейл: на Езеро двойной урон часто ломает базу. |
| `allocate(system, delta)` | Меняет выделение на целое число кубиков в дневной фазе. Отрицательный `delta` возвращает кубики. Возвращает `false`, если система ещё закрыта обучением (`CONFIG.unlockSol`), закрыта решением на этот сол, выходит за `CONFIG.maxAlloc` или кубиков не хватает. Во время паузы и открытого события выделять можно. |
| `endSol()` | Переходит в вечер, сжигает свободные кубики и подводит итог дня. Неотвеченные события получают вариант по умолчанию. Из утра сначала запускает день, чтобы события не пропали. Возвращает boolean. |
| `tick(dtMs)` | Принимает прошедшее реальное время. Скорость ускоряет фазы. Таймер открытого решения (буря) идёт в реальном времени и не ускоряется. Пока открыто событие, фазы стоят. |
| `resolveEvent(id, choice)` | Принимает ID открытого события и ID варианта. Возвращает `false` для чужого ID, неизвестного варианта или варианта, на который не хватает кубиков (`spend`). |
| `getActiveEvent()` | Открытое событие с полем `remainingMs` (реальные миллисекунды до автоответа) или `null`. Удобно для перерисовки модалки. |
| `getBlockedSystems()` | Системы, закрытые решением до конца сола, и решение, которое их закрыло: `{farm: "flare.shelter", repair: "flare.shelter"}`. Пустой объект, если закрытых нет. Возвращает копию. `allocate` в закрытую систему возвращает `false`, поставленные туда кубики движок уже вернул в свободные. С началом следующего сола всё открывается. Возможные значения: `flare.shelter`, `dustyPanels.clean` (теплица и ремонт), `roverCrate.food`, `roverCrate.oxygen` (теплица), `storm.fold` (обогрев). Для причины на экране подходит подпись выбранного варианта события. |
| `setSpeed(x)` | `0` ставит паузу, `1\|2\|4` задают скорость и снимают паузу. Автопауза события держится, пока событие не решено. Возвращает boolean. |
| `skipToDecision()` | Перематывает до следующего дня или события. Внутри дня и при открытом событии возвращает `false`. |
| `save()`, `load()`, `hasSave()` | Движок сам сохраняет партию каждую ночь и удаляет сохранение после концовки. `save` возвращает boolean, `load` — восстановленный `STATE` или `null`, `hasSave` — есть ли что продолжить. Без `localStorage` все три возвращают `false`/`null` без ошибок. |
| `getEndReport()` | Возвращает `{status, sol, chains, oxygen, food, damage, panelsWorking, stars}`. `chains` — до трёх самых дорогих решений: `{sol, choice, cost, effects: [{sol, kind, cost}], score}`. |
| `on(type, fn)` | Возвращает функцию отписки. `phase` передаёт `{sol, phase}`, `gameover` — итоговый отчёт, `event` — событие (ниже). |

Итог дня считается при переходе в вечер, обогрев и отложенные последствия — ночью. Победа наступает вечером сола `CONFIG.missionSols`. Провал: кислород 0, еда 0 или урон `CONFIG.damageLimit`.

### События

Все события приходят в начале дня по одному. Пока событие открыто, игра на автопаузе (`STATE.paused`). Форма: `{id, type, sol, choices, defaultChoice, timeoutMs, data}`. Вариант: `{id, cost, disabled}` и при необходимости `spend` (кубики списываются сразу), `blocks` (системы закрываются до конца сола), `risk` (вероятность плохого исхода). `cost` — числовая цена для подсказки: положительные числа — потеря, отрицательные — выигрыш.

| `type` | Варианты (`defaultChoice` первым) | `data` |
| --- | --- | --- |
| `storm` | `keep`, `fold`. Единственное событие с `timeoutMs`: 10 с «Инженер», 15 с «Курсант» | `damage: [min, max]` |
| `flare` | `shelter`, `work` | `flareClass: C\|M\|X`, `flare: {beginTime, classType, flrID, link}` из DONKI или `null`; `link` — адрес записи DONKI для экрана фактов, `null` у записи без ссылки, `damage` |
| `scrubber` | `later`, `fix` | — |
| `dustyPanels` | `live`, `clean`. `live` добавляет одну запылённую панель, `clean` убирает пыль со всех панелей, включая пыль от прошлых бурь, но закрывает теплицу и ремонт до конца сола. Полная энергия возвращается со следующего сола | — |
| `roverCrate` | `stay`, `food`, `oxygen` | — |
| `coldNight` | `skip`, `heat` | — |
| `cropChoice` | `radish`, `lettuce`, `potato` (сол 2) | — |
| `earthAdvice` | `ack` | прогноз, как в `STATE.forecast` |
| `consequence` | `ack` | `{kind, sourceSol, sourceChoice, cost}`, `kind`: `dose\|cold\|crack` |
| `lowReserve` | `ack` | `{resource: oxygen\|food, value}` |

`STATE.forecast` — `{sol, sols, storm, flare, stale}`: вероятности бури и вспышки в процентах на `sols` солов вперёд, `stale` — совет устарел. `STATE.pending` — `{id, kind, sol, choice, logIndex, triggerSol, fromSol, toSol, cubes, damage, fired}`. В `STATE.log` поле `choice` имеет вид `<type>.<вариант>` (`storm.keep`) или `air.low`, `farm.skip`, `heat.skip`, `repair.neglect`, `farm.harvest`, `sol.end`. Поле `note` — ключ текста `log.<choice>` для роли 4.

## Данные и интерфейс

- `data.js` экспортирует исходный массив `NASA_ARCHIVE`, список источников `SOURCES` с элементами `{id, title, url}` и `async loadSolarData({mode = "archive"} = {})`. Результат `{mode, flares, asOf, noticeKey}` сообщает фактический режим, массив донесений, дату `YYYY-MM-DD` или `null` и ключ уведомления или `null`. В режиме `live` функция запрашивает вспышки за последние 30 дней с таймаутом 5 секунд и кэшем в `localStorage` на сутки. При сетевой ошибке, таймауте или пустом ответе она возвращает архив с `noticeKey: "solar.liveUnavailable"`. Поля записей сохраняют исходные имена DONKI: `flrID`, `beginTime`, `peakTime`, `classType`, `sourceLocation`, `activeRegionNum`, а для записей из уведомлений также `messageID` и `messageURL`. Поле `link` есть у каждой записи: у записей FLR это ссылка DONKI, у записей из уведомлений — `messageURL`, страница этого уведомления о вспышке. Все 36 ссылок архива проверены в браузере 2026-11-14.
- Все эндпоинты живого режима опрашиваются параллельно, побеждает первый непустой ответ. Для проверки в браузере `loadSolarData` принимает `fetchImpl`, `storage`, `now` и `timeoutMs`.
- Архив генерирует `tools/donki-archive.js` в `src/nasa-archive.js`. `ARCHIVE_INFO` сообщает эндпоинт, диапазон дат и дату получения. Сейчас `api.nasa.gov` отвечает 404 на `DONKI/FLR`, поэтому архив за май 2024 собран из уведомлений DONKI о вспышках. Они покрывают значимые вспышки от M5 и сильнее.
- `SOURCES` дополнен полями `org` и `usedFor`. `FACTS` содержит `{id, sourceId, value?, quote}`: `quote` — дословная цитата источника, а текст для игрока пишет роль 4. `SITES.gale|jezero|arcadia` содержит координаты из газетира USGS/IAU (`lat`, `lon` — планетоцентрическая широта и восточная долгота) и диаметр, а `profile` — 16 точек высоты MOLA с запада на восток через центр (`km` от центра, `lon`, `elevationM`) из сервиса Mars Trek. `STUDIES` содержит исследования OSDR `{id, topic, title, url}`.
- Для движка: `flareClass("M1.4")` возвращает `"M"`, `flaresToSols(flares, {startDate, sols})` возвращает `[{sol, class, classType, beginTime, flrID}]`, где день N диапазона соответствует солу N.
- `text.js` экспортирует вложенные каталоги `TEXT.en` и `TEXT.ru` и функцию `t(lang, key, vars)`. Ключи вида `game.turn` общие для языков, переменные вида `{sol}` подставляются из `vars`. Вставляйте переводы через `textContent`.
- `art.js` экспортирует `renderBase(state)` и возвращает строку встроенного SVG. Используйте известные значения из `STATE`. Подпись сцены задаёт UI.
  **Изменение графического контракта (роль 2, на согласование с ролью 5).** Основная сцена теперь трёхмерная: `art.js` дополнительно экспортирует `createWorld(container, {onPick, stateRoot})`, `hasCapableGpu()`, `ART_CREDITS`, `renderIntroScene(frame)` и `renderProfile(profile)`. Модули 3D лежат в `src/art/` (сцена, модели, освещение, буря, интро), встроенные ассеты — в `src/art/assets/` (модель Perseverance NASA/JPL, карта Viking, тайл Mars Trek, архивные записи DONKI и RadLab). Мир только читает `STATE` через `world.setState(STATE)` и ничего в нём не меняет. Добавлена зависимость `three@0.187.0`: esbuild встраивает её в `index.html`, внешних загрузок нет. Без аппаратного WebGL 2 (в том числе в CI на SwiftShader) UI показывает `renderBase` — SVG-сцену, поэтому браузерный тест ждёт `#base canvas, #base svg`. Игра работает только в горизонтальной ориентации: в вертикальной показывается просьба повернуть устройство, а миссия и таймер бури стоят на паузе. Поэтому мобильный браузерный тест использует экран 800×360. Новые строки интерфейса лежат в `TEXT.en.ui` и `TEXT.ru.ui` с одинаковыми ключами; их текст проверяет роль 4.
- `ui.js` экспортирует `async mountGame(root)`. UI загружает данные до `newGame({solarData})`, передаёт изменения в API движка и отрисовывает состояние. Для стартовой проверки UI двигает фазы кнопками. Роль 2 подключит цикл реального времени.
- `main.js` монтирует UI один раз. `tools/build.js` собирает ES-модули в обычный встроенный скрипт, вставляет CSS и генерирует корневой `index.html`. Сборщик не допускает внешние импорты и ссылки на файлы из CSS. Дополнительные ссылки на источники открываются по действию игрока. Будущий запрос за свежими данными выполняется при выборе этого режима, основная игра использует встроенный архив.

## Simulator extension in the game
The browser calls newGame({simulation:true}). Classic engine callers retain their existing behavior.
STATE.sim persists battery, spare parts, refundable task reservations, inspection, seal/radio/debris
faults, patch expiry, finite EVA crates, readiness and departure. Engine commands planTask,
unplanTask, drawBattery, taskAvailable and simulationPreview are the only UI mutation entry points.
CONFIG.simulation owns balance. Work consumes six abstract game hours per sol. Free generation and
heating allocations charge the battery at sunset, then base load and heating discharge it at night.
Scripted shelter/cleaning blocks cancel and refund reserved tasks. Far EVA blocks farming.
A response arrives next sol, with request and receipt timestamps. Rescue requires beacon, route,
lander, repaired radio/seal and a departure during sols 27–30. These timings and amounts are game
simplifications. Real flare archive records stay separately attributed.

## Role 2 local integration, main 836243f
The UI now reads getBlockedSystems() directly, including after loading a saved mission.
New missions get a fresh uint32 seed, presentations use seed 9 and the team's classic
presentation presets. Normal browser missions retain the optional mission simulator.
Presentation entry saves the normal game; its own autosave and ending cannot overwrite it.
A flare decision may add sourceFlare to its log entry, retaining the exact DONKI ID/link
through save/load. Old saves without that optional field do not reconstruct historical records.
Saved live datasets are labelled as snapshots, separate from a fresh live request.

## Engineering campaign (simulator missions)
Data lives in `CONFIG.simulation.tasks` (steps with `hours`, `cubes`, `parts`, `oxygen`, `mission`, `requires`, `repeat`)
and `CONFIG.simulation.missions` (`priority: critical|optional`, `goal` step). New engine exports:
`missionBoard()` returns `[{id, priority, status}]` with `LOCKED|AVAILABLE|IN_PROGRESS|COMPLETED`, computed only from
completed steps; `taskReason(key)` returns `null` or why a step cannot be planned (`energy`, `parts`, `air`, `hours`,
`needs:<step>`, `event`, ...). `STATE.sim` adds `done` (completed steps), `water` (sols of reserve) and `commsLevel`
(0 none, 1 emergency beacon, 2 basic, 3 full). The legacy flags `inspected`, `sealBroken`, `radioBroken`, `debris`,
`ready` stay in step with `done` because the 3D scene reads them. Earth answers each new link level with the events
`earthContact`, `earthLink`, `earthPlan` (acknowledge only). `getEndReport().simulation` adds `water`, `missions`
and `rating` (`exceptional|operational|damaged|limited`, rescues only). Older saves are filled in by
`normalizeSimulation` on `load()`. The air and water rules live once in `src/simulator.js` (`airLoss`, `waterUse`),
used by both the engine and `simulationPreview()`. Balance bots: `tools/campaign-bot.js`.

## Mission of the day
`dailySeed(date = new Date())` (engine) returns the UTC date as `YYYYMMDD`. The setup button `#daily-mission` starts a
normal campaign with that seed and asks for the last 30 days of DONKI flares (`loadSolarData({mode:"live"})`), falling
back to the archive with its notice. Everyone who starts on the same UTC date gets the same events.
