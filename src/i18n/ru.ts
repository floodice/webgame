import type { Translations } from './en';

const ru: Translations = {
  common: {
    newGame: 'Новая игра', restart: 'Заново', continue: 'Продолжить', pause: 'Пауза', paused: 'Пауза', resume: 'Продолжить',
    score: 'Очки', highScore: 'Рекорд', gameOver: 'Игра окончена', victory: 'Победа', back: 'Назад', backHome: '← Главная',
    play: 'Играть', enter: 'Играть →', loading: 'ЗАГРУЗКА', clickToStart: 'Нажмите для старта',
    easy: 'Легко', medium: 'Средне', hard: 'Сложно', beginner: 'Новичок', intermediate: 'Средний', advanced: 'Продвинутый',
    level: 'Уровень', lines: 'Линии', time: 'Время', steps: 'Шаги', moves: 'Ходы', next: 'Далее',
    hint: 'Подсказка', shuffle: 'Перемешать', rules: 'Правила', closeRules: 'Закрыть правила',
    flagMode: 'Флаг', flagging: 'Пометка', fill: 'Заполнить', marking: 'Пометка',
    seconds: 'с', undo: 'Отмена', nextLevel: 'Далее', timeSeconds: 'Время(с)',
  },
  cat: {
    all: 'Все', puzzle: 'Головоломки', arcade: 'Аркады', strategy: 'Стратегии', casual: 'Казуальные',
    puzzleDesc: 'Головоломки и логика', arcadeDesc: 'Быстрые рефлексы и экшен',
    strategyDesc: 'Глубокое мышление и планирование', casualDesc: 'Расслабление и веселье', count: '{n} игр',
  },
  home: { subtitle: '{n} браузерных игр · Играйте сразу', clickToStart: 'Нажмите для старта', enter: 'Играть →' },
  lb: {
    title: '🏆 Рейтинг', btn: '🏆 Рейтинг', player: 'Игрок', enterName: 'Ваше имя...', submit: 'Отправить {score}',
    rank: '🎉 Место #{rank}/{total}', loading: 'Загрузка...', noRecords: 'Будьте первым в рейтинге!', refresh: '🔄 Обновить',
  },
  game2048: { title: '2048', desc: 'Сдвигайте и соединяйте числа', energyLevel: 'УРОВЕНЬ ЭНЕРГИИ', coreUnlocked: 'Ядро разблокировано', systemOverload: 'Перегрузка', keepPlaying: 'Продолжить', systemReboot: 'Перезагрузка', finalEnergy: 'Финальная энергия: {score}', touch: 'WASD / Свайп' },
  tetris: { title: 'Тетрис', desc: 'Складывай блоки — чем быстрее, тем лучше', drop: '⏬ Сброс', controls: '← → Движение | ↑ Поворот | ↓ Ускорение | Пробел Сброс | P Пауза', startTip: 'Стрелки / Сенсорное управление' },
  snake: { title: 'Змейка', desc: 'Управляй змейкой, ешь и расти', dataLost: 'Соединение потеряно', startHint: 'Стрелки / Свайп', controls: 'Стрелки / WASD' },
  pacman: { title: 'Пакман', desc: 'Уклоняйся от призраков, ешь все точки', levelN: 'Уровень {n}', pelletsLeft: 'Осталось точек', levelComplete: 'Уровень пройден!', nextLevelSoon: 'Следующий уровень...', lives: 'Жизни', controls: '← → ↑ ↓ / WASD / Свайп', ruleTarget: 'Съешь все точки', rulePowerup: 'Суперточка: Призраки становятся синими', ruleGhosts: '4 призрака с разным поведением', ruleFruit: 'Фрукты: Бонусные очки', ruleSpeed: 'Призраки ускоряются каждый уровень' },
  minesweeper: { title: 'Сапёр', desc: 'Открывай клетки, находи мины', mineHit: 'Мина!', cleared: 'Всё чисто!', again: 'Ещё раз', flagBtn: '⚠ Флаг', desktopHint: 'ЛКМ открыть | ПКМ флаг', mobileHint: 'Нажмите, чтобы открыть · Удерживайте для флага' },
  gomoku: { title: 'Гомоку', desc: 'Играй против ИИ — пять в ряд побеждает', again: 'Ещё раз', undoMove: 'Отмена', thinking: 'Противник думает...', youBlack: 'Чёрные (Вы)', wins: 'Победы', winMsg: 'Победа!', loseMsg: 'Поражение', drawMsg: 'Ничья', hint: 'Чёрные ходят первыми · Нажмите для хода' },
  sudoku: { title: 'Судоку', desc: 'Заполните сетку 9×9', complete: 'Решено!', again: 'Ещё раз', check: 'Проверить', hint: 'Заполните 9×9 цифрами 1–9', erase: 'Стереть', noteMode: 'Заметки', notesOn: 'Заметки ВКЛ', notesOff: 'Заметки ВЫКЛ' },
  memory: { title: 'Память', desc: 'Переворачивай карты, ищи пары', steps: 'Ходы', complete: 'Все найдены!', result: 'Решено за {moves} ходов, {time}с', reset: 'Сброс', hint: 'Переворачивайте карты, ищите пары' },
  flappy: { title: 'Flappy Bird', desc: 'Нажимай, чтобы лететь, уклоняйся от труб', scoreN: 'Очки: {n}', tapToStart: 'Нажмите для старта', restartHint: 'Клик или пробел для рестарта', deepsea: 'Глубокое погружение', swimHint: 'Плыви вверх, уклоняйся от кораллов', controls: 'Пробел / Нажатие для подъёма' },
  colorFind: { title: 'Тест цветов', desc: 'Найди другой оттенок', challengeOver: 'Испытание окончено', timeUp: 'Время вышло!', reachedLevel: 'Достигнут уровень {n}', finalScore: 'Итого: {n}', again: 'Ещё раз', levelLabel: 'Уровень', hint: 'Найди клетку другого цвета' },
  breakout: { title: 'Арканоид', desc: 'Управляй ракеткой, разбивай блоки', missionComplete: 'Миссия выполнена!', shipDown: 'Корабль уничтожен', scoreN: 'Очки: {n}', launch: 'Старт!', again: 'Ещё раз', controls: 'Мышь / Касание для движения', hint: 'Управляй кораблём, разрушай блоки' },
  invaders: { title: 'Space Invaders', desc: 'Ретро-шутер — защити Землю', scoreN: 'Очки: {n}', start: 'Старт', waveCleared: 'Волна {n} уничтожена!', nextWave: 'Следующая волна', nextWaveFaster: 'Следующая быстрее!', controls: 'Движение | Пробел Стрельба', ruleAliens: 'Пришельцы: строй 5×8', ruleShooting: 'Стрельба: Пробел или касание', ruleLives: 'Жизни: 3 жизни', ruleGoal: 'Цель: Уничтожить всех захватчиков', ruleTip: 'Совет: Сначала крайних пришельцев', ruleUFO: 'Случайный красный НЛО — 100 бонус' },
  bubbleShooter: { title: 'Пузыри', desc: 'Целься и стреляй — 3 одного цвета', caveCleared: 'Пещера очищена!', defenseDown: 'Оборона пробита!', restartHint: 'Нажмите для рестарта', hint: 'Целься и стреляй · 3+ одного цвета · 5 промахов = сдвиг' },
  wordle: { title: 'Wordle', desc: 'Угадай слово из 5 букв за 6 попыток', won: '🎉 Поздравляем!', lost: 'Слово было: {word}', again: 'Ещё раз', notInList: 'Слова нет в списке', tooShort: 'Нужно 5 букв', hint: 'Угадайте слово из 5 букв за 6 попыток' },
  match3: { title: 'Камни', desc: 'Меняй камни — собери 3 в ряд', movesLeft: 'Ходов осталось', gameOverTitle: 'Конец игры', finalScore: 'Финальная энергия: {n}', again: 'Ещё раз', hint: 'Меняй соседние камни · 3 в ряд' },
  solitaire: { title: 'Пасьянс', desc: 'Классическая карточная игра', won: 'Победа!', again: 'Ещё раз', autoComplete: 'Автозавершение' },
  connect: { title: 'Соединение', desc: 'Соедини одинаковые плитки', timeUp: 'Время вышло!', allCleared: 'Всё очищено!', again: 'Ещё раз', finalScore: 'Итого {n}', scoreTime: 'Очки {score} · Время {time}с', ruleTitle: 'Соединение плиток', ruleGoal: 'Убери всё за 120 секунд', ruleConnect: 'Соедини одинаковые (макс. 2 поворота)', ruleTime: 'Каждая пара +3 секунды', ruleShuffle: 'Перемешать: Перестановка плиток', ruleHint: 'Подсказка: Подсветить пару', hint: 'Нажми две одинаковые · Макс. 2 поворота' },
  sokoban: { title: 'Сокобан', desc: 'Толкай ящики к целям — 50 уровней', stageN: 'Уровень {n}', complete: 'Уровень пройден!', allComplete: 'Все уровни пройдены!', next: 'Далее', prev: 'Назад', undoMove: 'Отмена', resetLevel: 'Сброс', stepsLabel: 'Шаги', hint: 'Толкай ящики · Стрелки / Свайп' },
  nonogram: { title: 'Нонограмма', desc: 'Разгадай пиксель-арт по подсказкам', solved: 'Цепь замкнута!', newRecord: 'Новый рекорд!', bestTime: 'Лучшее: {t}с', nextPuzzle: 'Далее', ruleTitle: 'Правила нонограммы', ruleGoal: 'Раскрой скрытый узор', ruleNumbers: 'Числа — длины последовательных блоков', ruleFill: 'ЛКМ для заполнения', ruleMark: 'ПКМ для пометки пустых', ruleMode: 'Переключение заполнения и пометки', ruleTip: 'Начни с рядов с большими числами', ruleRecord: 'Лучшее время сохраняется', hintText: 'Клик для заполнения · ПКМ для X', cellLabel: 'Ряд {r} Столбец {c}' },
  microEmpire: { title: "Micro Empire", desc: "Build a kingdom, manage resources, grow from wilderness to empire" },
};

export default ru;
