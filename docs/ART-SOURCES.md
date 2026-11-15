# One Sol to Rescue — Role 2

Откройте **index.html** двойным щелчком в Safari или Chrome. Работает без сети, требуется WebGL 2. Только горизонтальный экран; вертикальная ориентация приостанавливает и скрывает сцену.

Встроена официальная модель Perseverance NASA/JPL: геометрия и текстуры сохранены, Draco декодирован заранее. В браузере внешние модели, картинки, шрифты и декодеры не загружаются.

**Осмотр:** выберите объект → Источники → Осмотреть объект. Для возврата ко всей базе нажмите ⌂. «Весь Марс» и «На базу» запускают объёмный пылевой переход. Кнопка бури включает пыль и ослабление света.

## Использованные источники

- NASA Open APIs — каталог для выбора DONKI: https://api.nasa.gov/
- NASA DONKI/CCMC — реальная архивная вспышка X3.9, 2024-05-10T06:27Z: https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/30666/-1
- NASA OSDR, OSD-895 — EDEN ISS, наземная теплица в Антарктиде, эксперимент 2018: https://osdr.nasa.gov/bio/repo/data/studies/OSD-895
- NASA RadLab — DosTel2, МКС, 2022-04-01T23:00:00, 10.2160856666667 µGy/h. Это разовое архивное показание, не марсианская доза и не среднесуточная величина: https://visualization.osdr.nasa.gov/radlab/gui/data-api/
- NASA Mars Trek — настоящий тайл слоя MGS MOLA Global Color Hillshade 463m у Гейла, на картографическом столе и в карточке источников: https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=mars
- CSA STEM & youth — образовательное задание о потребностях растений: https://www.asc-csa.gc.ca/eng/youth-educators/resources-stem-and-youth-organizations.asp
- CSA Food Production — принципы управляемой среды, воды, освещения и выбора культур: https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/
- NASA/JPL 3D Perseverance: https://science.nasa.gov/3d-resources/mars-2020-perseverance-rover/
- NASA/JPL/USGS Viking — поверхность Марса 1440×720: https://space.jpl.nasa.gov/tmaps/mars.html

## Границы достоверности

База, персонажи, резервуары и дозиметр — концептуальные модели, не точные копии сертифицированного оборудования. Тайл Mars Trek — цветная светотень, а не высотные данные; из цветов не восстанавливалась геометрия рельефа. Геометрия площадки и местоположение базы художественные. Рельеф, кратеры, камни и слой пыли на поверхностях генерируются процедурно и тоже художественные, это не карта высот реального места. Установка «ISRU O2» — концепт по мотивам эксперимента NASA MOXIE на ровере Perseverance, который получал кислород из углекислого газа марсианской атмосферы (https://science.nasa.gov/mission/mars-2020-perseverance/science-instruments/); это не копия прибора. Лаборатория, посадочная площадка, нижняя ступень корабля, аккумуляторы и грузовой двор — художественные. Песок на «объективе» и струи песка в бурю — визуальный эффект, а не научная модель бури. Энергоустановка FSP-1 — концепт по мотивам проекта NASA Fission Surface Power; ледяная скважина — по мотивам концепции Rodwell для добычи подземного льда; марсоход у гаража — по мотивам концепта NASA Space Exploration Vehicle с суитпортами. Это художественные модели, не копии реальной техники. Иней по утрам опирается на снимки инея посадочного модуля Viking 2. Вид солнечной системы: перелёт корабля «Сұңқар» считается по переходной орбите Гоманна (около 259 дней) с настоящими константами (гравитационный параметр Солнца, 1 а. е., орбитальные периоды планет), скорость — по уравнению vis-viva, задержка сигнала — по расстоянию Земля–Марс и скорости света. Упрощения: орбиты круговые и в одной плоскости; в масштабе только внутренние орбиты, размеры планет и дальние планеты — нет. В раннем эскизе «Сұңқар» был солнечно-электрическим буксиром. В корневом index.html этой копии внешний вид корабля реконструирован по кадрам Hermes из фильма «Марсианин» (2015). Геометрия, материалы и анимация созданы для игры. Визуальный источник — [Framestore, The Martian](https://www.framestore.com/work/martian). Текстура Земли нарисована процедурно и не является картой.

Это UI-прототип с демонстрационными запасами и научными архивными записями. Движок 30-соловой миссии ещё не подключён. Общие STATE/API и src-файлы других ролей не изменены. Ветка: role-2/ui.

Three.js: MIT, текст в THREE-LICENSE.txt. Установлены навыки frontend-design, threejs-geometry, threejs-materials, threejs-shaders, threejs-loaders, threejs-animation.

## Video prologue
`src/assets/intro-30s.mp4` is the team's supplied 30-second introduction. The supplied
Full HD H.264/AAC film was re-encoded at its original 1920×1080 resolution with H.264
CRF 23 and AAC 128 kb/s to reduce the offline download. No scenes were added or removed.
The build embeds it as a video data URL; no streaming service or runtime request is used.
This is a narrative film, not NASA scientific footage or a live data feed.
