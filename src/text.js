import { FIELD_COPY } from "./field-copy.js";
import { CONFIG } from "./config.js";

// Story and interface strings share the same keys in both languages.
export const TEXT = {
  en: {
    story: {
      systems: { air: "Scrubber", farm: "Greenhouse", repair: "Repairs", heat: "Heating", comms: "Radio", science: "Science" },
      blocked: "Unavailable this sol.",
      blockedReason: "Unavailable this sol. Reason: {reason}",
      back: "Back",
      task: "Today’s task",
      done: "Task complete",
      cost: "Cost: {value} · {unit}",
      gain: "Gain: {value} · {unit}",
      noEffect: "The effect was immediate.",
      site: "Base site",
      difficulty: "Difficulty",
      cadet: "Cadet",
      engineer: "Engineer",
      start: "Start mission",
      timer: "Seconds left: {n}",
      units: {
      oxygen: "oxygen",
      food: "food",
      cubes: "energy",
      damage: "base damage (%)",
      fatigue: "fatigue",
      crop: "crop growth",
      panels: "panels",
      dose: "radiation dose",
      },
    },
    log: {
      air: { low: "Gave the scrubber too little power" },
      farm: { harvest: "Harvested the crop", skip: "Skipped work in the greenhouse" },
      heat: { skip: "Skipped night heating" },
      repair: { neglect: "Put off repairs to the base" },
      sol: { end: "Used supplies for the sol" },
      effect: {
        crack: "A crack made the damage worse", cold: "Cold nights made work harder",
        dose: "Mark needed time to rest", noPower: "The panels produced no power",
        scrubberBroken: "Oxygen ran out faster", wilt: "The crop lost some growth",
      },
    },
    intro: {
      videoTitle: "One Sol to Rescue · Prologue", playVideo: "Play", pauseVideo: "Pause", muteVideo: "Mute", unmuteVideo: "Sound on", playPrompt: "Press Play to start the film.", videoError: "The film could not play in this browser. Skip to continue the mission.",
      art: { frame1: "Zarya base", frame2: "Dust storm warning", frame3: "Mark loses contact", frame4: "Tulpar lifts off", frame5: "Beep finds Mark" },
      play: "Watch intro",
      f1: "Sol 18. The crew is at work at Zarya base.\nBotanist Mark Yermekov checks the far sensors.",
      f2: "Earth: “The storm will block the Sun.\nTulpar lifts off in 20 minutes!”",
      f3: "Mark can only see dust. His safety line snaps, and he slides into a ravine.\nHis helmet flashes: “NO SIGNAL.”",
      f4: "Commander: “We’ve lost Mark’s signal. We have power for one launch.”\nTulpar’s light fades into the dust.",
      f5: "Suit oxygen: 4%. Beep: “I’m here, Mark. Let’s get to base.”\nSol 1. Rescue is 30 sols away.",
      skip: "Skip",
      next: "Next scene",
      finish: "Choose a base",
      progress: "Scene {n} of {total}"
    },
    bip: {
      study: {
      muscle: "NASA researchers studied how staying in bed affects muscles. On long missions, crews exercise to keep their muscles working.",
      bone: "Researchers studied how spaceflight affects muscles and bones in mice. This helps scientists plan future studies.",
      sleep: "NASA used wrist sensors to track how astronauts sleep. Getting enough rest helps crews stay alert.",
      },
      training: {
        s1: "A sol is a day on Mars, about 40 minutes longer than an Earth day. Power the scrubber: it removes CO₂, so Mark does not waste stored oxygen.",
        s2: "Pick a crop for the greenhouse. Astronauts have already grown lettuce and radishes on the space station.",
        s3: "Check the base sensors. Fix the damage before air starts leaking through cracks.",
        s4: "Power the radio and Earth will answer tomorrow. Save some cubes for heating tonight if you can.",
        s5: "The cargo ship is on its way to us! You can now spend cubes on science when you have supplies to spare."
      },
      term: {
        sol: "A sol is a day on Mars, about 40 minutes longer than an Earth day.",
        radiation: "Radiation is energy that travels as waves or tiny particles.",
        dose: "A dose tells us how much energy from radiation an object or body absorbed.",
        flare: "A solar flare is a sudden burst of energy on the Sun.",
        flareClasses: "Of these three flare classes, C is the weakest, M is stronger, and X is the strongest.",
        delay: "A radio signal takes time to travel from Earth to Mars: about 4 to 24 minutes one way.",
        pressure: "Air pressure tells us how hard the air pushes against the walls of the dome."
      },
      warning: {
        oxygen: "We have less than three sols of oxygen. Check the scrubber and the base sensors.",
        food: "We have less than three sols of food. See how soon your crop will be ready.",
        damage: "The base is more than half damaged. Air is leaking through cracks, so set aside power for repairs."
      },
      consequence: {
        crack: "The base damage went unrepaired after sol {sol}. A crack grew and made the damage worse.",
        cold: "We ran short of heat on sol {sol}. Cold nights make it harder to work, so we have fewer cubes.",
        dose: "Mark worked during the flare on sol {sol}. He needs rest now, so we have fewer cubes.",
        panels: "The storm on sol {sol} left dust on some panels. They’ll make less power until we clean them."
      }
    },
    ev: {
      storm: {
        title: "Dust storm",
        body: "A wall of dust is closing in. What should we do with the panels?",
        fold: "Fold the panels — no heat tonight and no cubes tomorrow",
        keep: "Leave them open — dust may cover the panels",
        afterFold: "We folded the panels. Crews sometimes shut equipment down to protect it so they can use it later.",
        afterKeep: "We left the panels open. Dust blocks sunlight, so dusty panels make less power."
      },
      flare: {
        title: "Solar flare",
        body: "Flare class: {flareClass}. Take shelter or keep working?",
        shelter: "Take shelter — skip greenhouse work and repairs today",
        work: "Keep working — take a radiation dose",
        afterShelter: "We paused work and took shelter. Thick walls help block some radiation.",
        afterWork: "We kept working during the flare. On real missions, crews measure their dose and use it to plan their work."
      },
      scrubber: {
        title: "The scrubber broke",
        body: "Without repairs, we’ll use up our oxygen reserve faster.",
        fix: "Fix it now — spend energy",
        later: "Wait — use up oxygen faster",
        afterFix: "The scrubber is working again. In space, repairing air systems matters because air supplies are limited.",
        afterLater: "We put off the repair and will use more oxygen from the reserve. On real missions, reserves buy time when equipment breaks."
      },
      dustyPanels: {
        title: "Dust on the panels",
        body: "Dirty panels catch less sunlight.",
        clean: "Clean the panels — skip greenhouse work and repairs today",
        live: "Leave the dust — less power until cleaning",
        afterClean: "We cleaned the panels and put other work aside. On real missions, looking after equipment takes time too.",
        afterLive: "We left the dust on the panels for now. On Mars, a layer of dust can cut power for a long time."
      },
      roverCrate: {
        title: "A crate in the rover",
        body: "The rover has supplies. If we go, the greenhouse will go untended and a storm could catch us outside.",
        food: "Go for food",
        oxygen: "Go for oxygen",
        stay: "Stay at base — miss the supplies",
        afterFood: "We brought back food. Before going outside on a real mission, crews check whether they have enough time and energy for the trip.",
        afterOxygen: "We topped up our oxygen reserve. Real crews set aside supplies in case something goes wrong.",
        afterStay: "We stayed at base and left the supplies in the rover. Crews sometimes call off a trip when it’s too risky."
      },
      coldNight: {
        title: "Cold night",
        body: "It’ll be colder than usual tonight. Should we give the heater more power?",
        heat: "Turn up the heat — spend energy",
        skip: "Save power — Mark gets tired and seedlings suffer",
        afterHeat: "We spent power to stay warm. In space, both people and equipment need heat.",
        afterSkip: "Mark is tired and the seedlings have slowed down. Working and growing plants both depend on keeping the right temperature."
      },
      earthAdvice: {
        title: "Advice from Earth",
        body: "Forecast window: {sols} sols. Dust storm: {storm}%. Solar flare: {flare}%.",
        ack: "Read message",
        afterAck: "We have a forecast. Signals take time to travel, and conditions can change while a message is on its way."
      },
      cropChoice: {
        title: "What should we plant?",
        body: "A quick harvest gets us food sooner. A slower crop may give us more food.",
        lettuce: "Lettuce",
        radish: "Radish",
        potato: "Potato",
        afterLettuce: "We planted lettuce. Astronauts have already harvested lettuce on the space station.",
        afterRadish: "We planted radishes. On the space station, astronauts grew them in a special plant chamber.",
        afterPotato: "We planted potatoes. Researchers on Earth tested how they grow in a chamber that mimics conditions on Mars."
      },
      consequence: {
        title: "Delayed consequence",
        body: "Something that happened on sol {sol} is affecting us today.",
        ack: "Got it"
      },
      lowReserve: {
        title: "Reserve running low",
        body: "Check your supplies and decide where to send power.",
        ack: "Check supplies"
      }
    },
    earth: {
      rescue: "Mark, we hear you! The cargo ship is already approaching. We’re redirecting it to Zarya base.",
      forecastStorm: "Chance of a dust storm: {p}%. Check the panels and your supplies.",
      forecastFlare: "Chance of a solar flare: {p}%. Check that the shelter is ready.",
      staleStorm: "We put the storm chance at {p}%. The dust cloud may have changed course while the signal was on its way.",
      staleFlare: "We put the flare chance at {p}%. The Sun’s activity may have changed since we sent the report.",
      sent: "Sent on sol {sol}"
    },
    task: {
      noAirLoss: "Finish the sol without losing oxygen.",
      powerAir: "Power the air scrubber.",
      powerFarm: "Power the greenhouse.",
      moreFarm: "Give the greenhouse at least two cubes.",
      harvest: "Harvest a crop.",
      repair: "Set aside power for repairs.",
      reduceDamage: "Finish the sol with less base damage.",
      restorePanel: "Get at least one panel working again.",
      warmNight: "Keep the base warm overnight.",
      lessFatigue: "End the night with Mark feeling less tired.",
      contactEarth: "Send a request to Earth.",
      collectScience: "Set aside power to collect a science sample.",
      airAndFarm: "Power both the air scrubber and the greenhouse.",
      noDose: "Get through the sol without taking an extra radiation dose.",
      moreFood: "Finish the sol with more food in reserve."
    },
    end: {
      rescued: {
        title: "Rescued",
        body: "The ship has landed by Zarya base. Mark takes Beep and heads out to meet the rescue crew."
      },
      emergencySleep: {
        title: "Emergency sleep",
        body: "Mark switches his suit to emergency mode and falls asleep. When the ship lands, the rescue crew brings him aboard."
      },
      oxygen: "Oxygen reserve: {n} sols",
      food: "Food reserve: {n} sols",
      panels: "Working panels: {n} of {total}",
      stars: "Science stars: {n} of {total}",
      review: "Which choices shaped the outcome?",
      chain: {
        choice: "Sol {sol} · {choice}",
        effect: "What changed",
        outcome: "How it affected the mission"
      },
      retry: "Play again"
    },
    real: {
      title: "What really happened",
      storm: "In 2018, a dust storm spread across Mars and blocked sunlight from reaching the Opportunity rover. Its last signal arrived on June 10.",
      flare: "On May 20, 2024, the Sun produced a flare estimated at X12. The Curiosity rover’s detector measured a dose of about 8,100 micrograys during the solar storm.",
      lettuce: "The first lettuce crop in Veggie on the ISS grew for 33 Earth days.",
      radish: "In the Plant Habitat-02 experiment on the ISS, radishes took 27 Earth days to mature.",
      potato: "The International Potato Center tested growing potatoes in an Earth-based chamber that simulated some Martian conditions.",
      cropTiming: "Crops grow faster in the game so you can harvest them in a few sols.",
      site: "Your base was at {site}. Find it on NASA’s Mars Trek map.",
      flareRecord: "{date} · class {class} · NASA DONKI",
      noFlares: "This mission had no flares with a date from NASA DONKI."
    },
    site: {
      gale: "Gale Crater",
      jezero: "Jezero Crater",
      arcadia: "Arcadia Planitia"
    },
    sources: {
      title: "Sources"
    },
    teachers: {
      title: "For teachers",
      intro: "After the game, ask students to compare their choices and share what they noticed.",
      q1: "You have one cube, and both the greenhouse and the scrubber need power. Which do you choose and why?",
      q2: "What three things would you take to a Mars base first? Compare your lists and agree on one together.",
      q3: "What would you tell Earth if you could send only one short message?",
      q4: "Think of a choice that mattered a few sols later. What early sign could have helped you spot it?",
      q5: "What would make you change your plan if a storm forecast arrived late?",
      q6: "What does the game speed up or simplify? How would that change your plan on a real mission?"
    },
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
    story: {
      systems: { air: "Очиститель", farm: "Теплица", repair: "Ремонт", heat: "Обогрев", comms: "Связь", science: "Наука" },
      blocked: "Недоступно до следующего сола.",
      blockedReason: "Недоступно до следующего сола. Причина: {reason}",
      back: "Назад",
      task: "Задача сола",
      done: "Задача выполнена",
      cost: "Цена: {value} · {unit}",
      gain: "Получено: {value} · {unit}",
      noEffect: "Последствие наступило сразу.",
      site: "Место базы",
      difficulty: "Сложность",
      cadet: "Курсант",
      engineer: "Инженер",
      start: "Начать миссию",
      timer: "Осталось секунд: {n}",
      units: {
      oxygen: "кислород",
      food: "еда",
      cubes: "энергия",
      damage: "урон базы (%)",
      fatigue: "усталость",
      crop: "рост рассады",
      panels: "панели",
      dose: "доза радиации",
      },
    },
    log: {
      air: { low: "Дал очистителю мало энергии" },
      farm: { harvest: "Собрал урожай", skip: "Пропустил работу в теплице" },
      heat: { skip: "Оставил базу без обогрева" },
      repair: { neglect: "Отложил ремонт базы" },
      sol: { end: "Потратил припасы за сол" },
      effect: {
        crack: "Трещина увеличила урон", cold: "После холодных ночей стало тяжелее работать",
        dose: "Марку понадобился отдых", noPower: "Панели не дали энергии",
        scrubberBroken: "Запас кислорода уменьшался быстрее", wilt: "Рассада стала хуже расти",
      },
    },
    intro: {
      videoTitle: "Один сол до помощи · Пролог", playVideo: "Смотреть", pauseVideo: "Пауза", muteVideo: "Без звука", unmuteVideo: "Включить звук", playPrompt: "Нажми «Смотреть», чтобы запустить видео.", videoError: "Браузер не смог воспроизвести видео. Нажми «Пропустить», чтобы продолжить миссию.",
      art: { frame1: "База «Заря»", frame2: "Предупреждение о буре", frame3: "Марк теряет связь", frame4: "Взлёт «Тулпара»", frame5: "Бип находит Марка" },
      play: "Смотреть интро",
      f1: "Сол 18. На базе «Заря» команда за работой.\nБотаник Марк Ермеков проверяет дальние датчики.",
      f2: "Земля: «Буря закроет Солнце.\n„Тулпар“ взлетает через 20 минут!»",
      f3: "Марк видит только пыль. Трос рвётся, и Марк скатывается в овраг.\nНа шлеме мигает: «НЕТ СИГНАЛА».",
      f4: "Командир: «Сигнала Марка нет. Энергии хватит на один взлёт».\nОгонёк «Тулпара» исчезает в пыли.",
      f5: "Кислород в скафандре: 4%. Бип: «Марк, я здесь. Идём на базу».\nСол 1. До помощи осталось 30 солов.",
      skip: "Пропустить",
      next: "Следующий кадр",
      finish: "К выбору базы",
      progress: "Кадр {n} из {total}"
    },
    bip: {
      study: {
      muscle: "Учёные NASA изучали, что происходит с мышцами, когда люди долго лежат. В длительных полётах экипаж тренируется, чтобы мышцы оставались сильными.",
      bone: "Учёные изучали, как полёт влияет на мышцы и кости мышей. Это помогает планировать новые исследования.",
      sleep: "NASA следило за сном астронавтов с помощью датчиков на запястье. Хороший сон помогает экипажу сохранять внимание.",
      },
      training: {
        s1: "Сол — это сутки на Марсе, примерно на 40 минут длиннее земных. Дай энергию очистителю: он убирает CO₂, и Марку не придётся тратить запас кислорода.",
        s2: "Выбери культуру для теплицы. Салат и редис уже выращивали на космической станции.",
        s3: "Загляни в датчики базы. Почини повреждения, пока через трещины не начал уходить воздух.",
        s4: "Дай энергию связи, и Земля ответит завтра. Оставь кубики на ночной обогрев, если можешь.",
        s5: "Грузовой корабль уже в пути к нам! Теперь можно тратить кубики на науку, когда хватает запасов."
      },
      term: {
        sol: "Сол — это сутки на Марсе, примерно на 40 минут длиннее земных.",
        radiation: "Радиация — это энергия, которая летит в виде волн или крошечных частиц.",
        dose: "Доза показывает, сколько энергии от радиации получил предмет или тело.",
        flare: "Солнечная вспышка — это резкий выброс энергии на Солнце.",
        flareClasses: "Среди этих трёх классов вспышек C — слабые, M — сильнее, X — самые мощные.",
        delay: "Радиосигналу нужно время, чтобы долететь с Земли до Марса: примерно от 4 до 24 минут в одну сторону.",
        pressure: "Давление воздуха показывает, с какой силой воздух давит на стены купола."
      },
      warning: {
        oxygen: "Кислорода осталось меньше чем на 3 сола. Проверь очиститель и датчики базы.",
        food: "Еды осталось меньше чем на 3 сола. Посмотри, скоро ли урожай.",
        damage: "База повреждена больше чем наполовину. Через трещины уходит воздух, так что выдели энергию на ремонт."
      },
      consequence: {
        crack: "База оставалась без ремонта после сола {sol}. Трещина выросла, и урон увеличился.",
        cold: "На соле {sol} не хватило обогрева. После холодных ночей нам сложнее работать, поэтому кубиков меньше.",
        dose: "На соле {sol} Марк работал во время вспышки. Теперь ему нужен отдых, поэтому кубиков меньше.",
        panels: "После бури на соле {sol} часть панелей покрылась пылью. Пока их не почистим, они будут давать меньше энергии."
      }
    },
    ev: {
      storm: {
        title: "Пылевая буря",
        body: "Стена пыли уже рядом. Что сделаем с панелями?",
        fold: "Сложить панели — без обогрева ночью и без кубиков завтра",
        keep: "Оставить открытыми — пыль может покрыть панели",
        afterFold: "Мы сложили панели. В экспедициях иногда отключают оборудование, чтобы защитить его и включить позже.",
        afterKeep: "Мы оставили панели открытыми. Пыль заслоняет свет, и запылённые панели дают меньше энергии."
      },
      flare: {
        title: "Солнечная вспышка",
        body: "Класс вспышки: {flareClass}. Уйти в укрытие или продолжить работу?",
        shelter: "В укрытие — сегодня без теплицы и ремонта",
        work: "Продолжить работу — получить дозу радиации",
        afterShelter: "Мы отложили работу и укрылись. Толстые стены помогают ослабить действие радиации.",
        afterWork: "Мы продолжили работу во время вспышки. В настоящих полётах дозу измеряют приборами и учитывают при планировании работы."
      },
      scrubber: {
        title: "Сломался очиститель",
        body: "Без ремонта запас кислорода будет уходить быстрее.",
        fix: "Починить сейчас — потратить энергию",
        later: "Отложить ремонт — тратить кислород быстрее",
        afterFix: "Очиститель снова работает. В космосе ремонт систем воздуха важен, потому что запас воздуха ограничен.",
        afterLater: "Мы отложили ремонт и будем чаще брать кислород из запаса. В настоящих полётах запас помогает переждать поломку."
      },
      dustyPanels: {
        title: "Пыль на панелях",
        body: "Грязные панели ловят меньше света.",
        clean: "Почистить панели — сегодня без теплицы и ремонта",
        live: "Оставить пыль — меньше энергии до чистки",
        afterClean: "Мы занялись панелями и отложили другие дела. В экспедициях уход за оборудованием тоже занимает время.",
        afterLive: "Мы пока оставили пыль на панелях. На Марсе слой пыли может надолго снизить выработку энергии."
      },
      roverCrate: {
        title: "Ящик в вездеходе",
        body: "В вездеходе есть припасы. Если пойдём, теплица останется без ухода, а по дороге может начаться буря.",
        food: "Пойти за едой",
        oxygen: "Пойти за кислородом",
        stay: "Остаться на базе — без припасов",
        afterFood: "Мы забрали еду. Перед настоящим выходом экипаж проверяет, хватит ли времени и сил на дорогу.",
        afterOxygen: "Мы пополнили запас кислорода. В настоящей экспедиции часть припасов хранят про запас на случай неполадок.",
        afterStay: "Мы остались на базе, а припасы остались в вездеходе. В экспедициях иногда отменяют выход, если дорога слишком рискованна."
      },
      coldNight: {
        title: "Холодная ночь",
        body: "Ночью станет холоднее обычного. Дадим больше энергии обогреву?",
        heat: "Усилить обогрев — потратить энергию",
        skip: "Сберечь энергию — Марк устанет, рассада пострадает",
        afterHeat: "Мы потратили энергию на тепло. В космосе обогрев нужен и людям, и оборудованию.",
        afterSkip: "Марк устал, и рассада хуже растёт. Для работы и для роста растений важно поддерживать нужную температуру."
      },
      earthAdvice: {
        title: "Совет с Земли",
        body: "Прогноз на {sols} сол.: буря {storm}%, вспышка {flare}%.",
        ack: "Принять сообщение",
        afterAck: "У нас есть прогноз. Сигналу нужно время на дорогу, и за это время условия могут измениться."
      },
      cropChoice: {
        title: "Что посадим?",
        body: "Быстрый урожай даст еду раньше. Более долгий рост может дать больше еды.",
        lettuce: "Салат",
        radish: "Редис",
        potato: "Картофель",
        afterLettuce: "Посадили салат. Такой урожай уже собирали на космической станции.",
        afterRadish: "Посадили редис. На космической станции его выращивали в специальной камере для растений.",
        afterPotato: "Посадили картофель. На Земле уже проверяли, как он растёт в камере с условиями, похожими на марсианские."
      },
      consequence: {
        title: "Отложенное последствие",
        body: "Сегодня сказалось то, что произошло на соле {sol}.",
        ack: "Понятно"
      },
      lowReserve: {
        title: "Запас на исходе",
        body: "Проверь запасы и выбери, куда направить энергию.",
        ack: "Проверить запасы"
      }
    },
    earth: {
      rescue: "Марк, мы тебя слышим! Грузовой корабль уже подлетает. Перенаправляем его к базе «Заря».",
      forecastStorm: "Шанс пылевой бури — {p}%. Проверь панели и запасы.",
      forecastFlare: "Шанс солнечной вспышки — {p}%. Проверь, готово ли укрытие.",
      staleStorm: "Прогноз бури был {p}%. Пока сигнал летел, облако пыли могло сменить путь.",
      staleFlare: "Прогноз вспышки был {p}%. Состояние Солнца могло измениться с момента отправки.",
      sent: "Отправлено на соле {sol}"
    },
    task: {
      noAirLoss: "Закончи сол без потери кислорода.",
      powerAir: "Дай энергию очистителю.",
      powerFarm: "Дай энергию теплице.",
      moreFarm: "Выдели теплице хотя бы два кубика.",
      harvest: "Собери урожай.",
      repair: "Выдели энергию на ремонт.",
      reduceDamage: "Закончи сол с меньшим уроном базы.",
      restorePanel: "Верни в строй хотя бы одну панель.",
      warmNight: "Поддержи тепло ночью.",
      lessFatigue: "Закончи ночь так, чтобы Марк меньше устал.",
      contactEarth: "Отправь запрос на Землю.",
      collectScience: "Выдели энергию на научный образец.",
      airAndFarm: "Дай энергию и очистителю, и теплице.",
      noDose: "Проведи сол без дополнительной дозы радиации.",
      moreFood: "Закончи сол с большим запасом еды."
    },
    end: {
      rescued: {
        title: "Спасён",
        body: "Корабль сел у базы «Заря». Марк берёт Бипа, и они идут навстречу спасателям."
      },
      emergencySleep: {
        title: "Аварийный сон",
        body: "Марк включает аварийный режим скафандра и засыпает. Когда корабль прилетает, спасатели забирают его с базы."
      },
      oxygen: "Кислород: {n} сол.",
      food: "Еда: {n} сол.",
      panels: "Рабочие панели: {n} из {total}",
      stars: "Звёзды за науку: {n} из {total}",
      review: "Какие решения повлияли на итог?",
      chain: {
        choice: "Сол {sol} · {choice}",
        effect: "Что изменилось",
        outcome: "К чему это привело"
      },
      retry: "Сыграть ещё раз"
    },
    real: {
      title: "Это было по-настоящему",
      storm: "В 2018 году пылевая буря охватила Марс и закрыла Солнце для марсохода Opportunity. Последний сигнал от него пришёл 10 июня.",
      flare: "20 мая 2024 года на Солнце произошла вспышка, которую оценили как X12. Детектор марсохода Curiosity измерил дозу около 8 100 микрогрей во время солнечной бури.",
      lettuce: "Первый салат в установке Veggie на МКС рос 33 земных дня.",
      radish: "В эксперименте Plant Habitat-02 на МКС редис созревал за 27 земных дней.",
      potato: "Международный центр картофеля испытал выращивание картофеля в камере на Земле, где воспроизвели часть условий Марса.",
      cropTiming: "В игре растения растут быстрее, чтобы урожай можно было собрать за несколько солов.",
      site: "Место твоей базы — {site}. Найди его на карте NASA Mars Trek.",
      flareRecord: "{date} · класс {class} · NASA DONKI",
      noFlares: "В этой партии не было вспышек с датой из NASA DONKI."
    },
    site: {
      gale: "кратер Гейл",
      jezero: "кратер Езеро",
      arcadia: "равнина Аркадия"
    },
    sources: {
      title: "Источники"
    },
    teachers: {
      title: "Для учителей",
      intro: "После игры предложите детям сравнить решения и рассказать, что они заметили.",
      q1: "У тебя один кубик, а энергия нужна теплице и очистителю. Что выберешь и почему?",
      q2: "Какие три вещи ты взял бы на марсианскую базу в первую очередь? Сравните списки и договоритесь об одном.",
      q3: "Что ты скажешь Земле, если можно отправить только одно короткое сообщение?",
      q4: "Вспомни решение, которое сказалось через несколько солов. Какой ранний сигнал помог бы это заметить?",
      q5: "Что заставило бы тебя изменить план, если прогноз бури пришёл с опозданием?",
      q6: "Что игра ускоряет или упрощает? Как это изменило бы твой план в настоящей экспедиции?"
    },
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

// Decision IDs match the engine's event choices and journal entries.
const decisionIds = {
  cropChoice: ["lettuce", "radish", "potato"],
  storm: ["fold", "keep"],
  flare: ["shelter", "work"],
  scrubber: ["fix", "later"],
  dustyPanels: ["clean", "live"],
  roverCrate: ["food", "oxygen", "stay"],
  coldNight: ["heat", "skip"],
};

for (const catalog of Object.values(TEXT)) {
  for (const [event, choices] of Object.entries(decisionIds)) {
    catalog.log[event] = Object.fromEntries(choices.map((choice) => [choice, catalog.ev[event][choice]]));
  }
}

// Role 2 interface strings (3D UI). Added by role 2 for role 4 to review; keys match in both languages.
TEXT.en.ui = Object.assign({
  "menu": "Menu",
  "continue": "Continue mission",
  "presentation": "Presentation mode",
  "act": "Act {n}",
  "actHint": "Starts on sol {sol} with ready reserves at ×4.",
  "sitePick": "Where will the base stand?",
  "siteNote": {
    "gale": "Curiosity's crater. +1 energy cube, but dust comes more often.",
    "jezero": "Perseverance's crater. The air scrubber needs 1 cube less, but events hit twice as hard.",
    "arcadia": "A plain with ice under the ground. Crops never wilt, but heating costs 2 cubes."
  },
  "profile": "Terrain profile · Mars Trek (MOLA)",
  "diffNote": {
    "cadet": "Ages 7–9: more air and food, 15 seconds for the storm decision.",
    "engineer": "Ages 10–12: tighter reserves, 10 seconds for the storm decision."
  },
  "rescueIn": "Rescue in {n} sols",
  "cubesFree": "{n} free",
  "pause": "Pause",
  "speed": "Speed ×{n}",
  "skip": "Skip to the next decision",
  "soundOn": "Sound on",
  "soundOff": "Sound off",
  "zoomIn": "Zoom in",
  "zoomOut": "Zoom out",
  "home": "Reset camera",
  "planet": "Planet view",
  "toBase": "Back to base",
  "orbitTitle": "Your little home on Mars",
  "orbitNote": "Surface: Viking · NASA/JPL/USGS. The outpost location is illustrative.",
  "marker": "Zarya outpost",
  "camera": "Drag to rotate · pinch or scroll to zoom",
  "sensors": "Base sensors",
  "sensor": {
    "damage": "Base damage",
    "dose": "Radiation dose",
    "fatigue": "Mark's fatigue",
    "panels": "Working panels",
    "crop": "Crop growth",
    "scrubber": "Air scrubber",
    "crates": "Supply crates",
    "temp": "Outside, average",
    "pressure": "Outside pressure"
  },
  "value": {
    "percent": "{n}%",
    "ofTotal": "{n} of {total}",
    "ok": "Working",
    "broken": "Broken: air goes twice as fast",
    "temp": "{c} °C",
    "pressure": "{mb} mbar",
    "leak": "Leak! Air goes twice as fast"
  },
  "objects": {
    "air": "Habitat",
    "farm": "Greenhouse",
    "repair": "Workshop",
    "heat": "Radiation shelter",
    "comms": "Antenna",
    "science": "NASA rover",
    "panels": "Solar panels"
  },
  "walk": "Mark is heading to: {place}",
  "pickHint": "Tap a building, then give energy to its system below.",
  "inspect": "Look closer",
  "credits": "3D scene sources",
  "credit": {
    "earth": "The Earth view uses NASA's Blue Marble image; its clouds are drawn by the game.",
    "rover": "The rover is NASA's official 3D model of Perseverance.",
    "map": "The planet view uses the Viking surface map.",
    "trek": "The map table in the workshop shows a real Mars Trek hillshade tile near Gale.",
    "donki": "The antenna screen shows a real archived flare from DONKI (May 10, 2024).",
    "radlab": "The shelter screen shows one archived dose reading from the ISS. It is not a Mars reading.",
    "moxie": "The oxygen plant is a concept inspired by MOXIE, which made oxygen from Mars air.",
    "art": "Buildings, terrain, crew and the ascent vehicle are artistic concepts, not copies of real hardware."
  },
  "webgl": "3D needs WebGL 2. Showing the simple 2D base.",
  "allocAdd": "Give energy to {system}",
  "allocRemove": "Take energy back from {system}",
  "locked": "Opens on sol {sol}",
  "earth": "Earth",
  "forecast": "Forecast for {sols} sols: storm {storm}%, flare {flare}%",
  "systemFor": "System: {system}",
  "rotateTitle": "Rotate your device",
  "rotateHint": "One Sol to Rescue is played in landscape. The mission waits while the screen is upright."
}, {"dataSource": "NASA solar data", "dataArchive": {"title": "NASA archive", "note": "Real flares from May 1–31, 2024. Works offline."}, "dataLive": {"title": "Today's Sun", "note": "Downloads flares from the last 30 days. Needs the internet."}, "loading": "Fetching NASA data…", "blockedTitle": "Closed until tomorrow: {why}", "blockedBy": {"storm": "panels are folded", "flare": "Mark is in the shelter", "dustyPanels": "Mark is cleaning panels", "roverCrate": "Mark went to the rover"}, "rangeLabel": "Day to night", "range": "{max}…{min} °C"}, {"space": {"sun": "Sun", "mercury": "Mercury", "venus": "Venus", "earth": "Earth", "mars": "Mars", "jupiter": "Jupiter", "saturn": "Saturn", "uranus": "Uranus", "neptune": "Neptune", "ship": "Sunkar"}, "focus": {"mars": "Mars", "earth": "Earth", "system": "Solar system", "ship": "Sunkar ship"}, "trip": {"ship": "Rescue cargo ship «Sunkar»", "day": "Flight day", "dayValue": "{d} of {total}", "arrival": "Arrives in", "arrivalValue": "{n} days · {s} sols", "speed": "Speed around the Sun", "speedValue": "{v} km/s", "toMars": "Distance to Mars", "fromEarth": "Distance from Earth", "million": "{d} million km", "delay": "Radio delay Earth → Mars", "delayValue": "{m} min", "note": "The ship follows a Hohmann transfer: the most fuel-efficient path from Earth to Mars, about 259 days. Game time: each sol moves the ship 7 days, so you can watch the whole flight. Real constants; orbits are drawn as circles in one plane. Inner orbits keep their true proportions; planets are drawn bigger, and the outer planets sit at 60% of their real distance. The ship is drawn enlarged."}});
TEXT.ru.ui = Object.assign({
  "menu": "Меню",
  "continue": "Продолжить миссию",
  "presentation": "Режим презентации",
  "act": "Акт {n}",
  "actHint": "Старт с сола {sol} с готовыми запасами, скорость ×4.",
  "sitePick": "Где будет стоять база?",
  "siteNote": {
    "gale": "Кратер Curiosity. +1 кубик энергии, но пыль приходит чаще.",
    "jezero": "Кратер Perseverance. Очистителю нужно на 1 кубик меньше, но события бьют вдвое сильнее.",
    "arcadia": "Равнина со льдом под грунтом. Рассада не вянет, но обогрев стоит 2 кубика."
  },
  "profile": "Профиль рельефа · Mars Trek (MOLA)",
  "diffNote": {
    "cadet": "7–9 лет: больше воздуха и еды, 15 секунд на решение в бурю.",
    "engineer": "10–12 лет: запасы меньше, 10 секунд на решение в бурю."
  },
  "rescueIn": "Помощь через {n} сол.",
  "cubesFree": "свободно {n}",
  "pause": "Пауза",
  "speed": "Скорость ×{n}",
  "skip": "До следующего решения",
  "soundOn": "Звук включён",
  "soundOff": "Звук выключен",
  "zoomIn": "Приблизить",
  "zoomOut": "Отдалить",
  "home": "Сбросить камеру",
  "planet": "Весь Марс",
  "toBase": "На базу",
  "orbitTitle": "Твой маленький дом на Марсе",
  "orbitNote": "Поверхность: Viking · NASA/JPL/USGS. Место базы условное.",
  "marker": "База «Заря»",
  "camera": "Потяни, чтобы повернуть · щипок или колесо — масштаб",
  "sensors": "Датчики базы",
  "sensor": {
    "damage": "Урон базы",
    "dose": "Доза радиации",
    "fatigue": "Усталость Марка",
    "panels": "Рабочие панели",
    "crop": "Рост рассады",
    "scrubber": "Очиститель воздуха",
    "crates": "Ящики с запасами",
    "temp": "Снаружи, в среднем",
    "pressure": "Давление снаружи"
  },
  "value": {
    "percent": "{n}%",
    "ofTotal": "{n} из {total}",
    "ok": "Работает",
    "broken": "Сломан: воздух уходит вдвое быстрее",
    "temp": "{c} °C",
    "pressure": "{mb} мбар",
    "leak": "Утечка! Воздух уходит вдвое быстрее"
  },
  "objects": {
    "air": "Жилой модуль",
    "farm": "Теплица",
    "repair": "Мастерская",
    "heat": "Радиационное убежище",
    "comms": "Антенна",
    "science": "Ровер NASA",
    "panels": "Солнечные панели"
  },
  "walk": "Марк идёт: {place}",
  "pickHint": "Нажми на здание, а потом дай энергию его системе внизу.",
  "inspect": "Осмотреть",
  "credits": "Источники 3D-сцены",
  "credit": {
    "earth": "Земля в космическом виде — снимок NASA Blue Marble; облака дорисованы игрой.",
    "rover": "Ровер — официальная 3D-модель Perseverance от NASA.",
    "map": "Вид планеты использует карту поверхности Viking.",
    "trek": "Стол с картой в мастерской показывает настоящий тайл рельефа Mars Trek у Гейла.",
    "donki": "Экран антенны показывает настоящую архивную вспышку из DONKI (10 мая 2024 года).",
    "radlab": "Экран убежища показывает одно архивное измерение дозы на МКС. Это не марсианская доза.",
    "moxie": "Кислородная установка — концепт по мотивам MOXIE, который делал кислород из воздуха Марса.",
    "art": "Здания, рельеф, экипаж и взлётный корабль — художественные концепты, а не копии настоящей техники."
  },
  "webgl": "Для 3D нужен WebGL 2. Показываем простую 2D-базу.",
  "allocAdd": "Дать энергию: {system}",
  "allocRemove": "Вернуть энергию: {system}",
  "locked": "Откроется на соле {sol}",
  "earth": "Земля",
  "forecast": "Прогноз на {sols} сол.: буря {storm}%, вспышка {flare}%",
  "systemFor": "Система: {system}",
  "rotateTitle": "Поверни устройство",
  "rotateHint": "В игру играют в горизонтальном положении. Пока экран вертикальный, миссия стоит на паузе."
}, {"dataSource": "Данные NASA о Солнце", "dataArchive": {"title": "Архив NASA", "note": "Настоящие вспышки 1–31 мая 2024 года. Работает без интернета."}, "dataLive": {"title": "Сегодняшнее Солнце", "note": "Загружает вспышки за последние 30 дней. Нужен интернет."}, "loading": "Загружаем данные NASA…", "blockedTitle": "Закрыто до завтра: {why}", "blockedBy": {"storm": "панели сложены", "flare": "Марк в убежище", "dustyPanels": "Марк чистит панели", "roverCrate": "Марк ушёл к вездеходу"}, "rangeLabel": "Днём и ночью", "range": "{max}…{min} °C"}, {"space": {"sun": "Солнце", "mercury": "Меркурий", "venus": "Венера", "earth": "Земля", "mars": "Марс", "jupiter": "Юпитер", "saturn": "Сатурн", "uranus": "Уран", "neptune": "Нептун", "ship": "Сұңқар"}, "focus": {"mars": "Марс", "earth": "Земля", "system": "Солнечная система", "ship": "Корабль Сұңқар"}, "trip": {"ship": "Спасательный грузовой корабль «Сұңқар»", "day": "День полёта", "dayValue": "{d} из {total}", "arrival": "Прилетит через", "arrivalValue": "{n} дн. · {s} сол.", "speed": "Скорость вокруг Солнца", "speedValue": "{v} км/с", "toMars": "До Марса", "fromEarth": "От Земли", "million": "{d} млн км", "delay": "Задержка радиосигнала Земля → Марс", "delayValue": "{m} мин", "note": "Корабль летит по переходной орбите Гоманна: самому экономному пути от Земли к Марсу, около 259 дней. Время в игре ускорено: каждый сол корабль пролетает 7 дней, чтобы был виден весь путь. Константы настоящие; орбиты нарисованы кругами в одной плоскости. Внутренние орбиты сохраняют настоящие пропорции; планеты нарисованы крупнее, а дальние планеты стоят на 60% от настоящего расстояния. Корабль показан увеличенным."}});

export function t(lang, key, vars = {}) {
  const catalog = Object.hasOwn(TEXT, lang) ? TEXT[lang] : TEXT.en;
  const value = key.split(".").reduce((node, part) => node && Object.hasOwn(node, part) ? node[part] : undefined, catalog);
  if (typeof value !== "string") return `[${key}]`;
  return value.replace(/\{(\w+)\}/g, (token, name) => String(vars[name] ?? token));
}

// The UI supplies the scene art and controls. Render receives a frame and its
// one-based position; call stop() when leaving the screen without finishing.
export const INTRO = [
  { art: "frame1", textKey: "intro.f1", ms: 7000 },
  { art: "frame2", textKey: "intro.f2", ms: 8000 },
  { art: "frame3", textKey: "intro.f3", ms: 8000 },
  { art: "frame4", textKey: "intro.f4", ms: 8000 },
  { art: "frame5", textKey: "intro.f5", ms: 9000 },
];

export function playIntro({ render, onFinish }) {
  let index = 0;
  let timer;
  let stopped = false;

  function stop() {
    clearTimeout(timer);
    stopped = true;
  }

  function skip() {
    if (stopped) return;
    stop();
    onFinish();
  }

  function next() {
    if (stopped) return;
    clearTimeout(timer);
    index += 1;
    if (index === INTRO.length) skip();
    else show();
  }

  function show() {
    const frame = INTRO[index];
    timer = setTimeout(next, frame.ms);
    render(frame, { n: index + 1, total: INTRO.length });
  }

  show();
  return { next, skip, stop };
}

// Evaluate at the end of the sol, using a snapshot taken before its events.
export const DAILY_TASKS = [
  { key: "task.noAirLoss", check: ({ before, after }) =>
    after.log.some((entry) => entry.sol === before.sol && entry.choice === "sol.end" && entry.cost.oxygen === 0) },
  { key: "task.powerAir", check: ({ alloc }) => alloc.air > 0 },
  { key: "task.powerFarm", check: ({ alloc }) => alloc.farm > 0 },
  { key: "task.moreFarm", check: ({ alloc }) => alloc.farm >= 2 },
  { key: "task.harvest", check: ({ before, after }) =>
    after.log.some((entry) => entry.sol === before.sol && entry.choice === "farm.harvest") },
  { key: "task.repair", check: ({ alloc }) => alloc.repair > 0 },
  { key: "task.reduceDamage", check: ({ before, after }) => after.damage < before.damage },
  { key: "task.restorePanel", check: ({ before, after }) =>
    after.panels.broken + after.panels.dusty < before.panels.broken + before.panels.dusty },
  { key: "task.warmNight", check: ({ before, after, alloc }) => alloc.heat >= CONFIG.siteRules[before.site].heatCubes && after.fatigue <= before.fatigue },
  { key: "task.lessFatigue", check: ({ before, after }) => after.fatigue < before.fatigue },
  { key: "task.contactEarth", check: ({ alloc }) => alloc.comms > 0 },
  { key: "task.collectScience", check: ({ alloc }) => alloc.science > 0 },
  { key: "task.airAndFarm", check: ({ alloc }) => alloc.air > 0 && alloc.farm > 0 },
  { key: "task.noDose", check: ({ before, after }) => after.dose === before.dose },
  { key: "task.moreFood", check: ({ before, after }) => after.food > before.food },
];

export const TRAINING_TASKS = [
  "task.noAirLoss", "task.powerFarm", "task.repair", "task.contactEarth", "task.collectScience",
];

export const STORY_SOURCES = {
  "bip.study.muscle": "https://osdr.nasa.gov/bio/repo/data/studies/OSD-195",
  "bip.study.bone": "https://osdr.nasa.gov/bio/repo/data/studies/OSD-342",
  "bip.study.sleep": "https://www.nasa.gov/missions/station/iss-research/wearable-tech-for-space-station-research/",
  "real.storm": "https://science.nasa.gov/resource/opportunitys-last-message/",
  "real.flare": "https://www.jpl.nasa.gov/news/nasa-watches-mars-light-up-during-epic-solar-storm/",
  "real.lettuce": "https://www.nasa.gov/wp-content/uploads/2023/03/veggie-fact-sheet-508.pdf",
  "real.radish": "https://www.nasa.gov/missions/station/astronauts-harvest-radish-crop-on-international-space-station/",
  "real.potato": "https://cipotato.org/blog/indicators-show-potatoes-can-grow-mars/",
  "real.site": "https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=mars",
  "teachers.intro": "https://www.asc-csa.gc.ca/eng/youth-educators/activities/teamwork-and-communication/",
};

Object.assign(TEXT.en, {sim: {
  title:"Mark’s workday", open:"Plan work", close:"Back to base",
  intro:"The base is buried. Only one array is clear; the airlock leaks and the radio is down. Clear a passage and inspect the seal before night.",
  premise:"Restore the storm-damaged outpost, prepare a surface return and reach Sunkar in 30 sols.",
  hours:"Work {used} / {total} h", battery:"Battery {n} / {total}", parts:"Spare parts {n}",
  preview:"Tonight: charge {charge}, demand {need}, left {after}. Air use today: {oxygen} sols.",
  draw:"Use battery (up to 2)", ready:"Rescue checks {n} / 3", queue:"Today’s reserved work", empty:"No extra jobs planned.",
  tip:"Click a job to reserve it. It completes at sunset. Click a reserved job to cancel. System allocations also take work time. Unused energy and heating allocations charge the battery at sunset.",
  balance:"Hours, energy units, crop growth and one-sol replies are game simplifications. Dose points are an illustrative risk model, not measured Mars doses.",
  cost:"{hours} h · {cubes} energy · {parts} parts · {oxygen} air",
  failed:"That job no longer fits today. Check time, energy, parts and prerequisites.",
  pending:"Reserved", locked:"Unavailable", harvest:"Crop {n} / {total} steps. Powered care advances growth; skipping can set it back.",
  request:"Earth reply: asked sol {sent}, received sol {received}.",
  fresh:"The recorded base condition still matches.", stale:"The base changed while Earth was answering. Recheck the advice.",
  leak:"Inspect the airlock: pressure is falling even when the scrubber has power.",
  diagnosed:"Seal fault located. A patch lasts 3 sols. Replacing the seal needs a spare.",
  patched:"Temporary seal until sol {sol}. Schedule a lasting repair.",
  fixed:"The airlock seal is repaired.", radio:"Radio fault: powered transmission cannot reach Earth yet.",
  farWarning:"A distant trip prevents greenhouse care today. A storm adds base damage on return.",
  returnPath:"EVA oxygen is reserved for the round trip. Nearby: 0.5 air, 2 h. Distant: 1 air, 3 h.",
  final:"Repair the seal and radio, test beacon and lander, survey the route. Depart on sols 27–30.",
  notes:{patchExpired:"The temporary seal expired: the leak returned.",cancelled:"Shelter or cleaning cancelled field jobs; reserved costs were refunded.",
    evaStorm:"Dust delayed the supply trip and damaged equipment.",scouted:"Beep inspected the fault while Mark stayed indoors.",
    cold:"Battery ran short overnight. Mark is tired.",notReady:"Sunkar reached Mars, but the surface return was incomplete. An assisted rescue retrieved Mark."},
  tasks:{
    inspect:"Inspect the airlock",patch:"Apply a temporary patch",seal:"Replace the airlock seal",
    panel:"Replace one broken panel",clean:"Clean one dusty panel",radio:"Repair the radio",debris:"Clear storm debris",
    near:"Retrieve the nearby crate (+2 food)",far:"Retrieve the distant crate (+4 food)",robot:"Send Beep to inspect",
    beacon:"Test the rendezvous beacon",route:"Survey the return route",lander:"Service the return vehicle",depart:"Leave for the return vehicle"
  },
  why:{
    inspect:"Find the leak before choosing a repair.",patch:"Requires inspection. Buys 3 sols, then the leak returns.",
    seal:"Requires inspection and one spare. Permanently seals this fault.",panel:"Recovers generation next sol.",
    clean:"Recovers output next sol without a spare.",radio:"Restores contact. Replies still arrive one sol later.",
    debris:"Removes loose parts from the base.",near:"One crate, one trip. Food at the cost of air and time.",
    far:"One crate, one trip. Blocks plant care. Storm risk is shown above.",robot:"One inspection trip. Uses energy while Mark stays indoors.",
    beacon:"Requires a working radio.",route:"Clear storm debris first. Air covers the outward and return walk.",
    lander:"A spare and energy for the surface return system.",depart:"Requires all three checks and repaired seal/radio. Opens on sol 27."
  }
}});
Object.assign(TEXT.ru, {sim: {
  title:"Рабочий день Марка",open:"План работ",close:"К базе",
  intro:"Базу засыпало. Открыта лишь одна панель, шлюз теряет воздух, радио молчит. Расчисти проход и проверь уплотнение до ночи.",
  premise:"Восстанови базу после бури, подготовь возвращение с поверхности и доберись до Сұңқара за 30 солов.",
  hours:"Работа {used} / {total} ч",battery:"Аккумулятор {n} / {total}",parts:"Запчасти {n}",
  preview:"Ночью: заряд {charge}, нужно {need}, останется {after}. Расход воздуха за день: {oxygen} сола.",
  draw:"Взять из аккумулятора (до 2)",ready:"Проверки спасения {n} / 3",queue:"Работы, запланированные на сегодня",empty:"Дополнительных работ пока нет.",
  tip:"Нажми на работу, чтобы запланировать её до заката. Повторное нажатие отменяет её. Энергия для систем тоже занимает рабочее время. Свободная энергия и энергия обогрева заряжают аккумулятор к закату.",
  balance:"Часы, энергия, рост растений и ответ через сол упрощены для игры. Очки дозы — условная модель риска, не измерения на Марсе.",
  cost:"{hours} ч · {cubes} энергии · {parts} запчастей · {oxygen} воздуха",
  failed:"Работа уже не помещается в этот день. Проверь время, энергию, запчасти и условия.",
  pending:"В плане",locked:"Недоступно",harvest:"Урожай {n} / {total} шагов. Уход с питанием ускоряет рост; пропуск может откатить его.",
  request:"Ответ Земли: запрос на соле {sent}, получение на соле {received}.",
  fresh:"Состояние базы всё ещё соответствует отправленным показаниям.",stale:"За время ожидания база изменилась. Перепроверь совет.",
  leak:"Проверь шлюз: давление падает даже при работающем очистителе.",
  diagnosed:"Найдена неисправность уплотнения. Заплата держится 3 сола. Для замены нужна запчасть.",
  patched:"Временная герметизация до сола {sol}. Запланируй надёжный ремонт.",
  fixed:"Уплотнение шлюза заменено.",radio:"Неисправно радио: подача энергии пока не восстановит связь.",
  farWarning:"Дальняя вылазка отменяет уход за теплицей сегодня. При буре оборудование получит урон.",
  returnPath:"Воздух зарезервирован на путь туда и обратно. Рядом: 0,5 воздуха, 2 ч. Далеко: 1 воздуха, 3 ч.",
  final:"Почини шлюз и радио, проверь маяк и аппарат, обследуй маршрут. Отправляйся на солах 27–30.",
  notes:{patchExpired:"Срок заплаты истёк: утечка вернулась.",cancelled:"Убежище или чистка отменили выездные работы; затраты возвращены.",
    evaStorm:"Пыль задержала вылазку за припасами и повредила оборудование.",scouted:"Бип осмотрел неисправность, пока Марк оставался внутри.",
    cold:"Ночью не хватило заряда. Марк устал.",notReady:"Сұңқар достиг Марса, но возвращение с поверхности не подготовлено. Марка забрала вспомогательная спасательная группа."},
  tasks:{
    inspect:"Осмотреть шлюз",patch:"Поставить временную заплату",seal:"Заменить уплотнение шлюза",
    panel:"Заменить сломанную панель",clean:"Очистить одну панель",radio:"Починить радио",debris:"Убрать обломки бури",
    near:"Забрать ближний ящик (+2 еды)",far:"Забрать дальний ящик (+4 еды)",robot:"Отправить Бипа на осмотр",
    beacon:"Проверить маяк встречи",route:"Обследовать маршрут возвращения",lander:"Обслужить возвратный аппарат",depart:"Отправиться к возвратному аппарату"
  },
  why:{
    inspect:"Найди утечку до выбора ремонта.",patch:"После осмотра. Даёт 3 сола, затем утечка возвращается.",
    seal:"После осмотра. Одна запчасть надолго устраняет эту утечку.",panel:"Возвращает выработку со следующего сола.",
    clean:"Возвращает выработку со следующего сола без запчасти.",radio:"Возвращает связь. Ответ приходит через сол.",
    debris:"Убирает свободные обломки с территории базы.",near:"Один ящик, один поход. Еда за воздух и время.",
    far:"Один ящик, один поход. Отменяет уход за растениями. Риск бури указан выше.",robot:"Один осмотр. Тратит энергию, пока Марк внутри.",
    beacon:"Нужно исправное радио.",route:"Сначала убери обломки. Воздух учитывает путь туда и обратно.",
    lander:"Запчасть и энергия для системы возвращения.",depart:"Нужны три проверки, исправные шлюз и радио. Доступно с сола 27."
  }
}});

// ---------- Engineering campaign (IMPLEMENTATION_PLAN.md) ----------
// Every step has: a name (tasks), a short reason (why) and Beep's one-line science lesson (learn).
function mergeText(target, extra) {
  for (const [key, value] of Object.entries(extra)) {
    if (value && typeof value === "object") mergeText(target[key] ??= {}, value);
    else target[key] = value;
  }
  return target;
}
mergeText(TEXT.en.sim, {
  intro:"The storm buried the base. Mark is alive. Open the work plan: every repair starts with a check, then the fix, then a test.",
  hours:"Work {used} / {total} h", water:"Water {n} sols ({change} per sol)", comms:"Link: {level}",
  ready:"Rescue checks {n} / 3",
  preview:"Tonight: charge {charge}, demand {need}, left {after}. Air use today: {oxygen} sols. Water today: {waterChange} sols.",
  tip:"Tap a step to reserve it; it is done at sunset. Tap again to cancel and get the costs back. A grey step tells you what it still needs.",
  balance:"Game simplifications: work hours, energy units, water and air in “sols of reserve”, fast plant growth, and Earth answering the next morning (the radio signal itself takes only minutes; the team on Earth needs time to answer). Dose points are a risk model, not measured Mars doses.",
  request:"Earth reply: asked on sol {sent}, answered on sol {received}. The signal travelled about {min} minutes each way.",
  delay:"Right now a radio signal takes about {min} minutes to reach Earth.",
  final:"Critical missions lead to Sunkar: power, life support, the airlock, water, the link and the rescue preparation. Optional missions make life easier. Leave on sols 27–30.",
  fixed:"The airlock seal is replaced. The cabin holds pressure.",
  doneStep:"Done", done:"Done: {step}.",
  notebook:"Mission notebook", notebookEmpty:"Nothing repaired yet. Every finished step will be written here.",
  missionsTitle:"Missions",
  priority:{critical:"Critical",optional:"Optional"},
  status:{LOCKED:"Locked",AVAILABLE:"Ready to start",IN_PROGRESS:"In progress",COMPLETED:"Completed"},
  commsLevel:{0:"no link",1:"emergency beacon",2:"basic link",3:"full link"},
  commsNow:{0:"No link with Earth: the antenna is damaged.",1:"Emergency beacon: Earth knows Mark is alive, but there is no two-way link yet.",
    2:"Basic link: short messages and forecasts go through the relay orbiter.",3:"Full link: reports and detailed instructions reach Earth."},
  rating:{exceptional:"Exceptional rescue: every system works and the science samples fly home too.",
    operational:"Rescue with a working base.",damaged:"Rescue with a damaged base: the next crew will have repairs to do.",
    limited:"Rescue just in time: the reserves were almost gone."},
  reason:{energy:"Not enough energy today.",parts:"No spare part left.",air:"Not enough air for this trip.",hours:"No work hours left today.",
    notDay:"Work is planned during the day.",queued:"Already planned.",done:"Already done.",nothing:"Nothing to do here now.",
    notYet:"Opens on sol 27.",event:"Answer the event first.",unknown:"Not available.",needs:"First: {step}."},
  missions:{power:"Restore electrical power",life:"Restore life support",pressure:"Repair the pressure leak",water:"Restore the water system",
    comms:"Restore communication with Earth",rescue:"Prepare for rescue",farm:"Restore the greenhouse",thermal:"Restore thermal control",
    rover:"Repair the rover",supplies:"Supplies",health:"Mark's health"},
  missionWhy:{power:"Dust and a broken cable cut the power. Every other system runs on electricity.",
    life:"The CO₂ cartridge is spent. Mark has to vent the cabin and use stored air.",
    pressure:"The airlock seal leaks. Air escapes into the thin Mars atmosphere.",
    water:"A pipe leaks and the water recycler is off. Mark and the plants need water.",
    comms:"The antenna lost power and pointing. Without a link nobody knows Mark is alive.",
    rescue:"Sunkar needs a beacon, a safe route and a serviced return vehicle.",
    farm:"The grow lamps are broken, so plants grow slowly.",thermal:"Damaged insulation lets heat escape at night.",
    rover:"A working rover reaches the distant crate with food and spare parts.",
    supplies:"Crates from the evacuated crew and Beep's scouting trips.",health:"A tired astronaut works fewer hours."},
  tasks:{inspectArray:"Inspect the solar array",cable:"Replace the damaged power cable",powerTest:"Test power output",
    inspectAir:"Check the air sensors",co2:"Replace the CO₂ cartridge",airTest:"Test the air quality",
    findLeak:"Find the water leak",isolate:"Close the valve to the leak",pipe:"Replace the leaking pipe",pumpTest:"Test the pump and recycler",
    inspectAntenna:"Inspect the antenna",radio:"Repair the antenna cable",actuator:"Repair the pointing motor",align:"Align the antenna on the relay",
    inspectFarm:"Inspect the greenhouse",lights:"Replace the grow lamps",nutrients:"Plant seeds and prepare the water feed",
    inspectHeat:"Find where heat escapes",insulation:"Repair the insulation",roverDiag:"Diagnose the rover",roverFix:"Repair the rover battery and wheel",
    rest:"Rest and drink water",beacon:"Turn on the rendezvous beacon",lander:"Service the return vehicle",
    near:"Fetch the nearby crate (+2 food, +1 part)",far:"Drive to the distant crate (+4 food, +2 parts)"},
  why:{inspectArray:"Tells dust from real damage before repairs.",cable:"One part. The main cable brings +2 energy every sol.",
    powerTest:"Measures the output. Unlocks the return vehicle service.",inspectAir:"Read oxygen and CO₂ sensors.",
    co2:"One part. Stops venting: saves air every sol.",airTest:"Confirms the air is safe.",
    findLeak:"Find which pipe is wet.",isolate:"Halves the water loss while you wait for a pipe.",pipe:"One part. Stops the leak.",
    pumpTest:"Starts the recycler: most used water comes back.",inspectAntenna:"Check cable, motor and controller.",
    radio:"One part. Emergency beacon: Earth learns Mark is alive.",actuator:"One part. Basic link and forecasts.",
    align:"Full link with the relay orbiter and Earth.",inspectFarm:"Check light, water, nutrients and warmth.",
    lights:"One part. Plants can grow faster again.",nutrients:"Completes the greenhouse repair.",
    inspectHeat:"Thermal check of the walls.",insulation:"One part. Saves 1 energy every night.",
    roverDiag:"Check battery, motors and wheels.",roverFix:"One part. Opens the distant crate.",
    rest:"Two hours of rest lower fatigue by one.",seal:"One part. Fixes the leak for good.",
    beacon:"Needs the basic link.",lander:"Needs the power test. Uses the vehicle's own spares.",
    depart:"Needs the beacon, route, vehicle, antenna cable and a holding airlock. Sols 27–30.",
    panel:"One part. Brings a broken panel back next sol.",clean:"Brings a dusty panel back next sol."},
  learn:{inspectArray:"Dust blocks sunlight, a crack breaks the circuit. Different faults need different fixes.",
    cable:"Voltage is like electrical pressure: it pushes current through the cable. A broken cable stops the flow.",
    panel:"A solar panel turns sunlight into electric current.",clean:"Dust on Mars blocks sunlight. Opportunity lost power in the 2018 dust storm.",
    powerTest:"Engineers always measure after a repair. A repair is not finished until it is tested.",
    inspectAir:"Mars air is 95% carbon dioxide. Inside, we need oxygen and must remove the CO₂ we breathe out.",
    co2:"A CO₂ filter removes carbon dioxide, but it does not make oxygen. On the space station, oxygen comes from splitting water.",
    airTest:"Sensors check oxygen and CO₂ so the crew notices danger before they feel it.",
    inspect:"Mars air pressure is under 1% of Earth's. A small gap lets cabin air rush out.",
    patch:"A patch is a temporary fix. It buys time until a real repair.",seal:"A good seal holds the pressure difference between inside and outside.",
    findLeak:"Water flows from high pressure to low pressure, so a leak shows where pressure escapes.",
    isolate:"A valve closes one pipe so the rest of the system keeps working.",pipe:"Replacing the damaged part fixes the cause, not just the symptom.",
    pumpTest:"The space station recycles about 98% of its water. A pump moves water through the filters.",
    inspectAntenna:"A radio link needs power, a working controller and an antenna pointed the right way.",
    radio:"Radio waves travel at the speed of light. Even so, a signal needs 3 to 22 minutes between Earth and Mars.",
    actuator:"A motor turns the antenna. Without it, the dish cannot follow the relay orbiter.",
    align:"Orbiters around Mars relay messages to the big antennas of NASA's Deep Space Network on Earth.",
    inspectFarm:"Plants need light, water, nutrients, warmth and time.",lights:"Plants use light energy to make food. This is photosynthesis.",
    nutrients:"Without soil, plants get minerals from a water solution. This is hydroponics.",
    inspectHeat:"Heat always moves from warm to cold. A thermal check shows where it escapes.",
    insulation:"Insulation slows heat transfer, like a warm jacket.",roverDiag:"A rover is a robot: motors, wheels, sensors and a battery work together.",
    roverFix:"Batteries store energy so a rover can drive away from the base.",rest:"Sleep and water help the body repair itself. Tired people make more mistakes.",
    debris:"Clearing the area makes field work safer. Broken parts can be reused.",route:"Engineers walk a route before they trust it.",
    beacon:"A beacon tells the arriving ship exactly where to land.",lander:"Before launch, every system is checked twice.",
    depart:"Mission complete: Mark leaves for the return vehicle.",near:"Supplies extend the mission, but each trip outside costs air.",
    far:"A rover carries more and saves the astronaut's air on long trips.",robot:"Robots can inspect places where it is risky to send people."},
  notes:{thirsty:"The water ran out. Mark is dehydrated and tired; the plants stopped growing."},
});
mergeText(TEXT.ru.sim, {
  intro:"Буря засыпала базу. Марк жив. Открой план работ: каждый ремонт начинается с проверки, потом идёт починка, а затем тест.",
  hours:"Работа {used} / {total} ч", water:"Вода {n} сол. ({change} в сол)", comms:"Связь: {level}",
  ready:"Проверки спасения {n} / 3",
  preview:"Ночью: заряд {charge}, нужно {need}, останется {after}. Расход воздуха за день: {oxygen} сола. Вода за день: {waterChange} сола.",
  tip:"Нажми на шаг, чтобы запланировать его до заката. Повторное нажатие отменяет его и возвращает затраты. Серый шаг подскажет, чего ему не хватает.",
  balance:"Упрощения игры: рабочие часы, единицы энергии, вода и воздух в «солах запаса», быстрый рост растений и ответ Земли на следующее утро (сам радиосигнал идёт всего несколько минут, но людям на Земле нужно время на ответ). Очки дозы — модель риска, а не измерения на Марсе.",
  request:"Ответ Земли: запрос на соле {sent}, ответ на соле {received}. Сигнал шёл около {min} мин в одну сторону.",
  delay:"Сейчас радиосигнал идёт до Земли около {min} мин.",
  final:"Критические миссии ведут к «Сұңқару»: энергия, жизнеобеспечение, шлюз, вода, связь и подготовка к спасению. Необязательные облегчают жизнь. Отлёт на солах 27–30.",
  fixed:"Уплотнение шлюза заменено. Модуль держит давление.",
  doneStep:"Готово", done:"Готово: {step}.",
  notebook:"Журнал миссии", notebookEmpty:"Пока ничего не починено. Каждый выполненный шаг появится здесь.",
  missionsTitle:"Миссии",
  priority:{critical:"Критическая",optional:"Необязательная"},
  status:{LOCKED:"Закрыта",AVAILABLE:"Можно начать",IN_PROGRESS:"В работе",COMPLETED:"Выполнена"},
  commsLevel:{0:"нет связи",1:"аварийный маяк",2:"базовая связь",3:"полная связь"},
  commsNow:{0:"Связи с Землёй нет: антенна повреждена.",1:"Аварийный маяк: Земля знает, что Марк жив, но двусторонней связи пока нет.",
    2:"Базовая связь: короткие сообщения и прогнозы идут через орбитальный ретранслятор.",3:"Полная связь: отчёты и подробные инструкции доходят до Земли."},
  rating:{exceptional:"Блестящее спасение: все системы работают, и научные образцы летят домой.",
    operational:"Спасение с работающей базой.",damaged:"Спасение с повреждённой базой: следующему экипажу придётся чинить.",
    limited:"Спасение в последний момент: запасы почти кончились."},
  reason:{energy:"Сегодня не хватает энергии.",parts:"Запчастей не осталось.",air:"Не хватит воздуха на этот выход.",hours:"Рабочие часы на сегодня кончились.",
    notDay:"Работы планируются днём.",queued:"Уже в плане.",done:"Уже сделано.",nothing:"Сейчас здесь нечего делать.",
    notYet:"Откроется на соле 27.",event:"Сначала ответь на событие.",unknown:"Недоступно.",needs:"Сначала: {step}."},
  missions:{power:"Восстановить электроснабжение",life:"Восстановить жизнеобеспечение",pressure:"Устранить утечку давления",water:"Восстановить водоснабжение",
    comms:"Восстановить связь с Землёй",rescue:"Подготовиться к спасению",farm:"Восстановить теплицу",thermal:"Восстановить терморегуляцию",
    rover:"Починить ровер",supplies:"Припасы",health:"Здоровье Марка"},
  missionWhy:{power:"Пыль и порванный кабель отрезали питание. Все остальные системы работают на электричестве.",
    life:"Патрон для удаления CO₂ исчерпан. Марку приходится проветривать модуль и тратить запас воздуха.",
    pressure:"Уплотнение шлюза пропускает воздух. Он уходит в разреженную атмосферу Марса.",
    water:"Течёт труба, а система переработки воды выключена. Вода нужна Марку и растениям.",
    comms:"Антенна потеряла питание и наведение. Без связи никто не знает, что Марк жив.",
    rescue:"«Сұңқару» нужны маяк, безопасный маршрут и подготовленный возвратный аппарат.",
    farm:"Лампы для растений сломаны, поэтому урожай растёт медленно.",thermal:"Повреждённая изоляция выпускает тепло ночью.",
    rover:"Исправный ровер доедет до дальнего ящика с едой и запчастями.",
    supplies:"Ящики, оставленные экипажем, и разведка Бипа.",health:"Уставший астронавт работает меньше часов."},
  tasks:{inspectArray:"Осмотреть солнечные панели",cable:"Заменить повреждённый кабель",powerTest:"Проверить выработку",
    inspectAir:"Проверить датчики воздуха",co2:"Заменить патрон CO₂",airTest:"Проверить качество воздуха",
    findLeak:"Найти утечку воды",isolate:"Перекрыть клапан",pipe:"Заменить трубу",pumpTest:"Проверить насос и переработку",
    inspectAntenna:"Осмотреть антенну",radio:"Починить кабель антенны",actuator:"Починить мотор наведения",align:"Навести антенну на ретранслятор",
    inspectFarm:"Осмотреть теплицу",lights:"Заменить лампы",nutrients:"Посадить семена и настроить полив",
    inspectHeat:"Найти, где уходит тепло",insulation:"Починить изоляцию",roverDiag:"Проверить ровер",roverFix:"Починить батарею и колесо ровера",
    rest:"Отдохнуть и попить воды",beacon:"Включить маяк встречи",lander:"Обслужить возвратный аппарат",
    near:"Забрать ближний ящик (+2 еды, +1 запчасть)",far:"Съездить к дальнему ящику (+4 еды, +2 запчасти)"},
  why:{inspectArray:"Отличает пыль от настоящей поломки до ремонта.",cable:"Одна запчасть. Главный кабель даёт +2 энергии каждый сол.",
    powerTest:"Измеряет выработку. Открывает обслуживание возвратного аппарата.",inspectAir:"Показания датчиков кислорода и CO₂.",
    co2:"Одна запчасть. Больше не нужно проветривать: экономит воздух каждый сол.",airTest:"Подтверждает, что воздух безопасен.",
    findLeak:"Найти мокрую трубу.",isolate:"Вдвое уменьшает потерю воды, пока нет новой трубы.",pipe:"Одна запчасть. Останавливает утечку.",
    pumpTest:"Запускает переработку: большая часть воды возвращается.",inspectAntenna:"Проверить кабель, мотор и контроллер.",
    radio:"Одна запчасть. Аварийный маяк: Земля узнаёт, что Марк жив.",actuator:"Одна запчасть. Базовая связь и прогнозы.",
    align:"Полная связь через орбитальный ретранслятор с Землёй.",inspectFarm:"Проверить свет, воду, питание и тепло.",
    lights:"Одна запчасть. Растения снова могут расти быстрее.",nutrients:"Завершает ремонт теплицы.",
    inspectHeat:"Тепловая проверка стен.",insulation:"Одна запчасть. Экономит 1 энергии каждую ночь.",
    roverDiag:"Проверить батарею, моторы и колёса.",roverFix:"Одна запчасть. Открывает дальний ящик.",
    rest:"Два часа отдыха снижают усталость на 1.",seal:"Одна запчасть. Устраняет утечку навсегда.",
    beacon:"Нужна базовая связь.",lander:"Нужна проверка выработки. Использует запчасти самого аппарата.",
    depart:"Нужны маяк, маршрут, аппарат, кабель антенны и держащий шлюз. Солы 27–30.",
    panel:"Одна запчасть. Сломанная панель заработает со следующего сола.",clean:"Пыльная панель заработает со следующего сола."},
  learn:{inspectArray:"Пыль закрывает свет, а трещина разрывает цепь. Разные поломки чинятся по-разному.",
    cable:"Напряжение похоже на давление электричества: оно толкает ток по кабелю. Порванный кабель останавливает ток.",
    panel:"Солнечная панель превращает солнечный свет в электрический ток.",clean:"Пыль на Марсе закрывает солнечный свет. Opportunity потерял питание в пыльную бурю 2018 года.",
    powerTest:"Инженеры всегда делают измерения после ремонта. Ремонт не закончен, пока его не проверили.",
    inspectAir:"Воздух Марса на 95% состоит из углекислого газа. Внутри нам нужен кислород, а выдыхаемый CO₂ надо убирать.",
    co2:"Фильтр CO₂ убирает углекислый газ, но не делает кислород. На космической станции кислород получают, расщепляя воду.",
    airTest:"Датчики следят за кислородом и CO₂, чтобы экипаж заметил опасность раньше, чем почувствует её.",
    inspect:"Давление на Марсе меньше 1% земного. Через маленькую щель воздух из модуля быстро уходит наружу.",
    patch:"Заплата — временный ремонт. Она даёт время до настоящей починки.",seal:"Хорошее уплотнение выдерживает разницу давлений внутри и снаружи.",
    findLeak:"Вода течёт оттуда, где давление выше, туда, где ниже, поэтому утечка показывает, где уходит давление.",
    isolate:"Клапан перекрывает одну трубу, а остальная система продолжает работать.",pipe:"Замена повреждённой детали устраняет причину, а не только последствия.",
    pumpTest:"Космическая станция перерабатывает около 98% воды. Насос гонит воду через фильтры.",
    inspectAntenna:"Для радиосвязи нужны питание, исправный контроллер и антенна, направленная куда надо.",
    radio:"Радиоволны летят со скоростью света. И всё равно сигналу между Землёй и Марсом нужно от 3 до 22 минут.",
    actuator:"Мотор поворачивает антенну. Без него тарелка не может следить за орбитальным ретранслятором.",
    align:"Аппараты на орбите Марса передают сообщения большим антеннам NASA Deep Space Network на Земле.",
    inspectFarm:"Растениям нужны свет, вода, питательные вещества, тепло и время.",lights:"Растения используют энергию света, чтобы делать пищу. Это фотосинтез.",
    nutrients:"Без почвы растения получают минералы из водного раствора. Это гидропоника.",
    inspectHeat:"Тепло всегда переходит от тёплого к холодному. Тепловая проверка показывает, где оно уходит.",
    insulation:"Изоляция замедляет передачу тепла, как тёплая куртка.",roverDiag:"Ровер — это робот: моторы, колёса, датчики и батарея работают вместе.",
    roverFix:"Батарея запасает энергию, чтобы ровер мог уехать от базы.",rest:"Сон и вода помогают телу восстанавливаться. Уставший человек чаще ошибается.",
    debris:"Расчищенная площадка делает работу снаружи безопаснее. Сломанные детали можно использовать снова.",route:"Инженеры проходят маршрут, прежде чем ему доверять.",
    beacon:"Маяк показывает прилетающему кораблю, где именно садиться.",lander:"Перед стартом каждую систему проверяют дважды.",
    depart:"Миссия выполнена: Марк отправляется к возвратному аппарату.",near:"Припасы продлевают миссию, но каждый выход наружу стоит воздуха.",
    far:"Ровер везёт больше и экономит воздух астронавта в дальних поездках.",robot:"Роботы могут осмотреть места, куда людям ходить опасно."},
  notes:{thirsty:"Вода кончилась. Марк обезвожен и устал, растения перестали расти."},
});
// Earth answers when the link level rises (engine events earthContact, earthLink, earthPlan).
mergeText(TEXT.en.ev, {
  earthContact:{title:"Earth hears the beacon",body:"Mission Control: “Mark, we receive your emergency beacon! We know you are alive. Restore the link so we can talk.”",ack:"Keep working",afterAck:"Earth knows Mark is alive. The signal took minutes; the answer came this morning."},
  earthLink:{title:"Basic link with Earth",body:"Mission Control: “We hear you clearly through the relay orbiter. Send power to communication and we will send forecasts.”",ack:"Understood",afterAck:"Relay orbiters pass messages between Mars and Earth."},
  earthPlan:{title:"The rescue plan",body:"Mission Control: “Full link! Sunkar is already flying to Mars and will reach orbit on sol 30. Prepare the beacon, the route and the return vehicle, then leave on sols 27–30.”",ack:"Ready",afterAck:"A ship to Mars takes months, so the rescue had to start long before the storm."},
});
mergeText(TEXT.ru.ev, {
  earthContact:{title:"Земля слышит маяк",body:"Центр управления: «Марк, мы принимаем твой аварийный маяк! Мы знаем, что ты жив. Восстанови связь, чтобы мы могли говорить».",ack:"Работать дальше",afterAck:"Земля знает, что Марк жив. Сигнал шёл минуты, а ответ пришёл этим утром."},
  earthLink:{title:"Базовая связь с Землёй",body:"Центр управления: «Слышим тебя через орбитальный ретранслятор. Дай энергию на связь, и мы пришлём прогнозы».",ack:"Понял",afterAck:"Орбитальные ретрансляторы передают сообщения между Марсом и Землёй."},
  earthPlan:{title:"План спасения",body:"Центр управления: «Полная связь! „Сұңқар“ уже летит к Марсу и выйдет на орбиту на соле 30. Подготовь маяк, маршрут и возвратный аппарат и отправляйся на солах 27–30».",ack:"Готов",afterAck:"Полёт к Марсу занимает месяцы, поэтому спасение началось задолго до бури."},
});
TEXT.en.bip.warning.water = "We have less than three sols of water. Fix the leak and start the recycler.";
TEXT.ru.bip.warning.water = "Воды меньше чем на три сола. Устрани утечку и запусти переработку.";
// Science corrections: one-way radio delay from NSSDC distances (54.6–401.4 million km) is 3–22 minutes.
TEXT.en.bip.term.delay = "A radio signal takes time to travel between Earth and Mars: about 3 to 22 minutes one way.";
TEXT.ru.bip.term.delay = "Радиосигналу нужно время на путь между Землёй и Марсом: от 3 до 22 минут в одну сторону.";
Object.assign(TEXT.en.ui.sensor, { scrubber: "CO₂ scrubber", water: "Water reserve", co2: "CO₂ removal", cabin: "Airlock seal", link: "Link with Earth" });
Object.assign(TEXT.ru.ui.sensor, { scrubber: "Удаление CO₂ (очиститель)", water: "Запас воды", co2: "Удаление CO₂", cabin: "Уплотнение шлюза", link: "Связь с Землёй" });
Object.assign(TEXT.en.ui.value, { sols: "{n} sols", co2ok: "Working", co2spent: "Cartridge spent", sealed: "Holding", patched: "Patched", leaking: "Leaking" });
Object.assign(TEXT.ru.ui.value, { sols: "{n} сол.", co2ok: "Работает", co2spent: "Патрон исчерпан", sealed: "Держит", patched: "Заплата", leaking: "Течёт" });

for(const language of ["en","ru"]){
  for(const [key,value]of Object.entries(TEXT[language].sim.tasks)){
    (TEXT[language].log.sim ??= {})[key]=value;
  }
}

Object.assign(TEXT.en.ui,{missionMenu:"Mission setup",demoStart:"Presentation · Act 3",demoExit:"Return to my mission",savedSolar:"Saved NASA solar snapshot"});
Object.assign(TEXT.ru.ui,{missionMenu:"Настройка миссии",demoStart:"Презентация · Акт 3",demoExit:"Вернуться в мою миссию",savedSolar:"Сохранённый снимок данных NASA"});

// "How to play" survival guide (src/guide.js). It describes only mechanics that exist:
// numbers in {braces} come from CONFIG and button names from the keys above.
Object.assign(TEXT.en, { guide: {
  open: "How to play",
  title: "Survival guide",
  progress: "{n}/{total}",
  otherLanguage: "Русский",
  back: "Back",
  next: "Next",
  skip: "Skip",
  finish: "Let’s go!",
  tipLabel: "Beep’s tip:",
  offer: {
    text: "Need a reminder? Beep can show you how to play and what every button does.",
    open: "Show me how",
    dismiss: "No thanks",
  },
  names: { speed: "Speed", plusMinus: "Minus and plus", sound: "Sound", language: "Language", zoom: "Zoom" },
  rows: {
    start: "Morning: begins the day. Now you can give energy and plan work.",
    end: "Day: ends the day early when your plan is ready.",
    advance: "Evening: shows what happened today. Then a new sol begins.",
    pause: "stops time, so you can think.",
    speed: "time runs normally, 2 or 4 times faster.",
    skip: "jumps to the next choice. It does not work during the day.",
    plusMinus: "on a system card: take back or give 1 energy cube. Only during the day.",
    free: "energy cubes you can still give today. Leftovers charge the battery at sunset.",
    air: "removes CO₂, so the oxygen lasts. {airFull} cubes stop the normal air loss ({airFullJezero} at Jezero).",
    farm: "grows the crop: more cubes, faster growth. It uses water and 1 work hour per cube.",
    repair: "lowers base damage; 2 cubes can fix the scrubber or a panel. Half an hour per cube.",
    heat: "keeps energy in the battery for a warm night. Unused cubes do the same.",
    comms: "asks Earth for a forecast, answered next sol. Needs the basic link. Half an hour per cube.",
    science: "collects samples for up to {stars} stars at the end. 1 work hour per cube.",
    help: "opens this guide again at any time.",
    sound: "turns the game sounds on or off.",
    language: "switches between English and Russian.",
    menu: "mission setup, this guide, the intro, presentation mode, real NASA facts, notes for teachers and sources.",
    data: "where the solar flares come from: the NASA archive or today’s Sun.",
    plan: "in Beep’s card: opens Mark’s workday.",
    sensors: "tap to see damage, water, CO₂, the airlock, the link with Earth, tiredness and more.",
    planet: "flies up to Mars, Earth, the Solar system and {ship} on its way. “{toBase}” brings you back.",
    zoom: "brings the camera closer or further away.",
    home: "puts the camera back over the base.",
    missions: "jobs are grouped into missions. “{critical}” missions lead to the rescue, “{optional}” ones make life easier.",
    status: "a mission is {locked}, {ready}, {inProgress} or {completed}.",
    job: "tap a job to plan it for today, tap again to cancel. It is done at sunset.",
    cost: "what a job costs: work hours, energy, spare parts and air.",
    reason: "a grey job tells you why it is closed and what to do first.",
    draw: "takes up to {draw} cubes from the battery for today. Keep enough for the night!",
    rest: "{restHours} hours of rest: Mark gets less tired.",
    close: "closes the window and returns to the base.",
  },
  steps: {
    mission: {
      title: "Your mission",
      l1: "You are Mark, a botanist. After a dust storm, you are alone at a base on Mars.",
      l2: "The rescue ship {ship} is flying from Earth. It reaches Mars on sol {sols}.",
      l3: "A sol is one day on Mars. Keep yourself and the base going until then!",
      tip: "Hi, I’m Beep, your robot helper! My card shows a hint and a task for every sol.",
    },
    base: {
      title: "Your base",
      l1: "Habitat, greenhouse, workshop, antenna, radiation shelter, solar panels and a NASA rover. Tap a building to look at it.",
      l2: "The top bar shows the sol, sols left until rescue, oxygen, food and energy.",
      l3: "“{sensors}” show damage, water, panels, the crop and how tired Mark is.",
      tip: "A bar turns red when less than 3 sols of it are left. Act fast!",
    },
    resources: {
      title: "Your resources",
      l1: "Oxygen: sols of air left. Power the {air}: it removes CO₂, so stored oxygen lasts. A leaking airlock and a spent CO₂ cartridge waste air.",
      l2: "Food: Mark eats 1 sol of food every sol. The {farm} and supply crates add more.",
      l3: "Water: Mark and the plants use it, and a pipe is leaking. With no water, plants stop growing and Mark gets tired.",
      l4: "Energy: solar panels make it every sol, less in dust and storms. Leftovers charge the battery (up to {battery}) for the night.",
      tip: "If oxygen or food runs out, the mission ends. Watch both bars!",
    },
    bottom: {
      title: "Buttons at the bottom",
      l1: "A sol goes morning → day → evening → night. The big gold button moves it on:",
      tip: "Every new sol: give the {air} its cubes first, then plan the work.",
    },
    systems: {
      title: "The six systems",
      l1: "Each card is a system. The dots show how many cubes it has today.",
      tip: "Not sure which system needs help? Open “{sensors}”.",
    },
    screen: {
      title: "Buttons at the top and on the side",
      tip: "Tap a building on Mars: the camera flies to it and shows which system it uses.",
    },
    work: {
      title: "The “{plan}” window",
      l1: "Mark has {hours} work hours a sol, fewer when he is very tired.",
      tip: "Every repair starts with a check: inspect first, then fix.",
    },
    survive: {
      title: "Repair and survive",
      l1: "Open the missions: power, life support, the airlock, water and the link with Earth come first. Each repair starts with a check.",
      l2: "Trips to supply crates bring food but cost air and time. Beep can inspect a fault for Mark.",
      l3: "Surprises happen: dust storms (decide in {storm} seconds, {stormCadet} on {cadet}), solar flares, a broken scrubber, cold nights. Every choice has a price.",
      l4: "An empty battery at night makes Mark tired, and you get less energy. At 100% damage the mission ends.",
      tip: "A temporary patch lasts only {patch} sols. Replace the seal when you have a spare part.",
    },
    rescue: {
      title: "Reach the rescue",
      l1: "{ship} arrives on sol {sols}. To reach it, finish 3 rescue checks:",
      l2: "turn on the beacon (needs the basic link), survey the route (clear the debris first), service the return vehicle (after the power test).",
      l3: "From sol {depart}, choose “{leave}”. The airlock must hold (a new seal or a patch that still holds) and the antenna cable must be repaired.",
      l4: "Not ready in time? Another crew still saves Mark, and Beep shows your costliest choices.",
      tip: "Start the rescue checks early. Don’t leave them for the last sols!",
    },
  },
} });
Object.assign(TEXT.ru, { guide: {
  open: "Как играть",
  title: "Как выжить",
  progress: "{n}/{total}",
  otherLanguage: "English",
  back: "Назад",
  next: "Далее",
  skip: "Пропустить",
  finish: "Вперёд!",
  tipLabel: "Совет Бипа:",
  offer: {
    text: "Забыл, как играть? Бип покажет правила и что делает каждая кнопка.",
    open: "Покажи",
    dismiss: "Не нужно",
  },
  names: { speed: "Скорость", plusMinus: "Минус и плюс", sound: "Звук", language: "Язык", zoom: "Масштаб" },
  rows: {
    start: "Утро: начинает день. Теперь можно давать энергию и планировать работу.",
    end: "День: заканчивает день раньше, когда план готов.",
    advance: "Вечер: показывает, что случилось за день. Потом начинается новый сол.",
    pause: "останавливает время, чтобы подумать.",
    speed: "время идёт обычно, в 2 или в 4 раза быстрее.",
    skip: "перематывает до следующего выбора. Днём не работает.",
    plusMinus: "на карточке системы: вернуть или дать 1 кубик энергии. Только днём.",
    free: "кубики энергии, которые ещё можно раздать сегодня. Остаток на закате уходит в аккумулятор.",
    air: "убирает CO₂, и кислород держится дольше. {airFull} кубика останавливают обычный расход воздуха (в Езеро — {airFullJezero}).",
    farm: "выращивает урожай: больше кубиков — быстрее рост. Тратит воду и 1 рабочий час на кубик.",
    repair: "уменьшает урон базы; 2 кубика чинят очиститель или панель. Полчаса на кубик.",
    heat: "сохраняет энергию в аккумуляторе для тёплой ночи. Свободные кубики делают то же самое.",
    comms: "спрашивает у Земли прогноз, ответ придёт в следующий сол. Нужна базовая связь. Полчаса на кубик.",
    science: "собирает образцы — до {stars} звёзд в конце игры. 1 рабочий час на кубик.",
    help: "в любой момент снова открывает этот гайд.",
    sound: "включает и выключает звуки игры.",
    language: "переключает английский и русский.",
    menu: "настройка миссии, этот гайд, вступление, режим презентации, настоящие факты NASA, материалы для учителей и источники.",
    data: "откуда берутся солнечные вспышки: из архива NASA или с сегодняшнего Солнца.",
    plan: "в карточке Бипа: открывает рабочий день Марка.",
    sensors: "нажми, чтобы увидеть урон, воду, CO₂, шлюз, связь с Землёй, усталость и не только.",
    planet: "поднимает камеру к Марсу, Земле, Солнечной системе и кораблю «{ship}» в пути. «{toBase}» возвращает обратно.",
    zoom: "приближает или отдаляет камеру.",
    home: "возвращает камеру к базе.",
    missions: "работы собраны в миссии. Миссии с меткой «{critical}» ведут к спасению, с меткой «{optional}» — облегчают жизнь.",
    status: "миссия бывает: «{locked}», «{ready}», «{inProgress}» или «{completed}».",
    job: "нажми на работу, чтобы запланировать её на сегодня, нажми ещё раз, чтобы отменить. Она выполнится на закате.",
    cost: "сколько стоит работа: рабочие часы, энергия, запчасти и воздух.",
    reason: "серая работа подсказывает, почему она закрыта и что сделать сначала.",
    draw: "берёт до {draw} кубиков из аккумулятора на сегодня. Оставь заряд на ночь!",
    rest: "{restHours} часа отдыха: Марк устанет меньше.",
    close: "закрывает окно и возвращает к базе.",
  },
  steps: {
    mission: {
      title: "Твоя миссия",
      l1: "Ты — Марк, ботаник. После пылевой бури ты остался один на базе на Марсе.",
      l2: "С Земли летит спасательный корабль «{ship}». Он прилетит к Марсу на сол {sols}.",
      l3: "Сол — это марсианские сутки. Продержись и сохрани базу до прилёта!",
      tip: "Привет, я Бип, твой робот-помощник! В моей карточке каждый сол есть подсказка и задача.",
    },
    base: {
      title: "Твоя база",
      l1: "Жилой модуль, теплица, мастерская, антенна, радиационное убежище, солнечные панели и ровер NASA. Нажми на здание, чтобы рассмотреть его.",
      l2: "Вверху видны сол, сколько солов до помощи, кислород, еда и энергия.",
      l3: "«{sensors}» показывают урон, воду, панели, урожай и усталость Марка.",
      tip: "Полоска краснеет, когда запаса осталось меньше 3 солов. Действуй быстро!",
    },
    resources: {
      title: "Твои запасы",
      l1: "Кислород — на сколько солов хватит воздуха. Дай энергию системе «{air}»: она убирает CO₂, и запас кислорода держится дольше. Шлюз с утечкой и исчерпанный патрон CO₂ тратят воздух.",
      l2: "Еда — Марк съедает 1 сол еды за сол. Её добавляют «{farm}» и ящики с припасами.",
      l3: "Вода — её пьют Марк и растения, а одна труба протекает. Без воды растения перестают расти, а Марк устаёт.",
      l4: "Энергия — солнечные панели дают её каждый сол, меньше при пыли и буре. Остаток заряжает аккумулятор (до {battery}) на ночь.",
      tip: "Если кончится кислород или еда, миссия закончится. Следи за обеими полосками!",
    },
    bottom: {
      title: "Кнопки внизу",
      l1: "Сол идёт так: утро → день → вечер → ночь. Большая золотая кнопка двигает его дальше:",
      tip: "Каждый новый сол сначала дай кубики системе «{air}», потом планируй работу.",
    },
    systems: {
      title: "Шесть систем",
      l1: "Каждая карточка — это система. Точки показывают, сколько у неё кубиков сегодня.",
      tip: "Не знаешь, какой системе нужна помощь? Открой «{sensors}».",
    },
    screen: {
      title: "Кнопки сверху и сбоку",
      tip: "Нажми на здание на Марсе: камера полетит к нему и покажет, какой системе оно нужно.",
    },
    work: {
      title: "Окно «{plan}»",
      l1: "У Марка {hours} рабочих часов в сол, а когда он очень устал — меньше.",
      tip: "Каждый ремонт начинается с проверки: сначала осмотри, потом чини.",
    },
    survive: {
      title: "Чини и выживай",
      l1: "Открой миссии: сначала энергия, жизнеобеспечение, шлюз, вода и связь с Землёй. Каждый ремонт начинается с проверки.",
      l2: "Вылазки за ящиками дают еду, но тратят воздух и время. Бип может осмотреть поломку вместо Марка.",
      l3: "Бывают неожиданности: пылевая буря (решай за {storm} секунд, на уровне «{cadet}» за {stormCadet}), солнечная вспышка, поломка очистителя, холодная ночь. У каждого выбора есть цена.",
      l4: "Если ночью сядет аккумулятор, Марк устанет, и энергии станет меньше. При уроне 100% миссия закончится.",
      tip: "Временная заплата держится всего {patch} сола. Замени уплотнение, когда будет запчасть.",
    },
    rescue: {
      title: "Дождись спасения",
      l1: "«{ship}» прилетит на сол {sols}. Чтобы добраться до него, пройди 3 проверки спасения:",
      l2: "включи маяк (нужна базовая связь), обследуй маршрут (сначала убери обломки), обслужи возвратный аппарат (после проверки выработки).",
      l3: "С сола {depart} выбери «{leave}». Шлюз должен держать (новое уплотнение или ещё действующая заплата), а кабель антенны — быть починен.",
      l4: "Не успел? Марка всё равно спасёт другая команда, а Бип покажет самые дорогие решения.",
      tip: "Начинай проверки спасения заранее, а не в последние солы!",
    },
  },
} });

// Role 4: remaining TZ terms, the honesty line about real flares, and the new setup/sources labels.
Object.assign(TEXT.en.bip.term, {
  panels: "Solar panels turn sunlight into electricity; dust on them means less power.",
  lifeSupport: "Life support keeps the air, water and temperature inside the base safe for people.",
});
Object.assign(TEXT.ru.bip.term, {
  panels: "Солнечные панели превращают солнечный свет в электричество; пыль на них уменьшает энергию.",
  lifeSupport: "Жизнеобеспечение поддерживает внутри базы безопасные воздух, воду и температуру.",
});
TEXT.en.real.flareAimed = "This flare was real. NASA saw it from Earth's side; in the game we pointed it at Mars.";
TEXT.ru.real.flareAimed = "Эта вспышка была настоящей. NASA видело её со стороны Земли, а в игре мы направили её на Марс.";
TEXT.en.sources.data = "NASA data and science sources";
TEXT.ru.sources.data = "Данные NASA и научные источники";
TEXT.en.ui.daily = "Mission of the day · {date}";
TEXT.ru.ui.daily = "Миссия дня · {date}";

// Text for the hands-on equipment lessons.

TEXT.en.field=FIELD_COPY.en;
TEXT.ru.field=FIELD_COPY.ru;

TEXT.en.sim.tip="Open a job and use the tools. Repairs take effect when you finish the procedure. Putting tools away refunds an unfinished job. Rest and Beep orders are planned for sunset.";
TEXT.ru.sim.tip="Открой работу и используй инструменты. Ремонт меняет базу после выполнения процедуры. Незавершённую работу можно отменить с возвратом затрат. Отдых и поручения Бипу идут в план до заката.";
TEXT.en.sim.reason.closed="Mark cannot do maintenance until the next sol after this decision.";
TEXT.ru.sim.reason.closed="После этого решения Марк не может выполнять ремонт до следующего сола.";
TEXT.en.guide.rows.job="opens the equipment. Use the tools and check the result. Hours and supplies are reserved; cancelling unfinished work returns them.";
TEXT.ru.guide.rows.job="открывает оборудование. Используй инструменты и проверь результат. Часы и припасы резервируются; отмена незавершённой работы возвращает их.";
