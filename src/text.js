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
        s1: "A sol is a day on Mars, about 40 minutes longer than an Earth day. Power the air scrubber to save oxygen.",
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
        s1: "Сол — это сутки на Марсе, примерно на 40 минут длиннее земных. Дай энергию очистителю, чтобы сберечь кислород.",
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
    text: "First time on Mars? Beep can show you how to play in 1–2 minutes.",
    open: "Show me how",
    dismiss: "No thanks",
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
      l3: "“{sensors}” show damage, broken or dusty panels, the crop and how tired Mark is.",
      tip: "A bar turns red when less than 3 sols of it are left. Act fast!",
    },
    resources: {
      title: "Your resources",
      l1: "Oxygen: sols of air left. Power the {air} to keep it. A leaking airlock wastes air.",
      l2: "Food: Mark eats 1 sol of food every sol. The {farm} and supply crates add more.",
      l3: "Energy: solar panels make it every sol, less in dust and storms. Leftovers charge the battery (up to {battery}) for the night.",
      tip: "If oxygen or food runs out, the mission ends. Watch both bars!",
    },
    plan: {
      title: "Plan your sol",
      l1: "Press “{start}”. Give energy to the systems with + and −.",
      l2: "Open “{plan}”. Mark has {hours} work hours a sol. Jobs take hours, and some need energy, air or spare parts. Most systems use hours too.",
      l3: "Some jobs open only after another: first inspect the airlock, then seal it.",
      l4: "Pause or run time at ×1, ×2, ×4. When the plan is ready, press “{end}”, then “{advance}”.",
      tip: "Air and the leaking airlock come first. Science can wait.",
    },
    survive: {
      title: "Repair and survive",
      l1: "Fix the leaking airlock, broken and dusty panels, the radio and the storm debris.",
      l2: "Trips to supply crates bring food but cost air and time. Beep can inspect a fault for Mark.",
      l3: "Surprises happen: dust storms (decide in {storm} seconds, {stormCadet} on Cadet), solar flares, a broken scrubber, cold nights. Every choice has a price.",
      l4: "An empty battery at night makes Mark tired, and you get less energy. At 100% damage the mission ends.",
      tip: "A temporary patch lasts only {patch} sols. Replace the seal when you have a spare part.",
    },
    rescue: {
      title: "Reach the rescue",
      l1: "{ship} arrives on sol {sols}. To reach it, finish 3 rescue checks:",
      l2: "test the beacon (needs the radio), survey the route (clear the debris first), service the return vehicle.",
      l3: "From sol {depart}, choose “{leave}”. The airlock seal must be replaced and the radio fixed.",
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
    text: "Впервые на Марсе? Бип за 1–2 минуты покажет, как играть.",
    open: "Покажи",
    dismiss: "Не нужно",
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
      l3: "«{sensors}» показывают урон, сломанные и пыльные панели, урожай и усталость Марка.",
      tip: "Полоска краснеет, когда запаса осталось меньше 3 солов. Действуй быстро!",
    },
    resources: {
      title: "Твои запасы",
      l1: "Кислород — на сколько солов хватит воздуха. Дай энергию системе «{air}», чтобы его не терять. Шлюз с утечкой тратит воздух.",
      l2: "Еда — Марк съедает 1 сол еды за сол. Её добавляют «{farm}» и ящики с припасами.",
      l3: "Энергия — солнечные панели дают её каждый сол, меньше при пыли и буре. Остаток заряжает аккумулятор (до {battery}) на ночь.",
      tip: "Если кончится кислород или еда, миссия закончится. Следи за обеими полосками!",
    },
    plan: {
      title: "Планируй сол",
      l1: "Нажми «{start}». Дай энергию системам кнопками + и −.",
      l2: "Открой «{plan}». У Марка {hours} рабочих часов в сол. Работы занимают часы, некоторым нужны энергия, воздух или запчасти. Большинство систем тоже занимает часы.",
      l3: "Некоторые работы открываются только после других: сначала осмотри шлюз, потом загерметизируй.",
      l4: "Останови время паузой или включи ×1, ×2, ×4. Когда план готов, нажми «{end}», потом «{advance}».",
      tip: "Сначала воздух и шлюз с утечкой. Наука подождёт.",
    },
    survive: {
      title: "Чини и выживай",
      l1: "Чини шлюз с утечкой, сломанные и пыльные панели, радио и обломки после бури.",
      l2: "Вылазки за ящиками дают еду, но тратят воздух и время. Бип может осмотреть поломку вместо Марка.",
      l3: "Бывают неожиданности: пылевая буря (решай за {storm} секунд, на «Курсанте» за {stormCadet}), солнечная вспышка, поломка очистителя, холодная ночь. У каждого выбора есть цена.",
      l4: "Если ночью сядет аккумулятор, Марк устанет, и энергии станет меньше. При уроне 100% миссия закончится.",
      tip: "Временная заплата держится всего {patch} сола. Замени уплотнение, когда будет запчасть.",
    },
    rescue: {
      title: "Дождись спасения",
      l1: "«{ship}» прилетит на сол {sols}. Чтобы добраться до него, пройди 3 проверки спасения:",
      l2: "проверь маяк (нужно радио), обследуй маршрут (сначала убери обломки), обслужи возвратный аппарат.",
      l3: "С сола {depart} выбери «{leave}». Уплотнение шлюза должно быть заменено, а радио починено.",
      l4: "Не успел? Марка всё равно спасёт другая команда, а Бип покажет самые дорогие решения.",
      tip: "Начинай проверки спасения заранее, а не в последние солы!",
    },
  },
} });
