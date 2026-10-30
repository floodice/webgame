import type { Translations } from './en';

const ar: Translations = {
  common: {
    newGame: 'لعبة جديدة', restart: 'إعادة', continue: 'متابعة', pause: 'إيقاف', paused: 'متوقف', resume: 'استئناف',
    score: 'النقاط', highScore: 'الأفضل', gameOver: 'انتهت اللعبة', victory: 'فوز', back: 'رجوع', backHome: '← الرئيسية',
    play: 'العب', enter: 'العب ←', loading: 'جاري التحميل', clickToStart: 'انقر للبدء',
    easy: 'سهل', medium: 'متوسط', hard: 'صعب', beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم',
    level: 'المستوى', lines: 'خطوط', time: 'الوقت', steps: 'خطوات', moves: 'حركات', next: 'التالي',
    hint: 'تلميح', shuffle: 'خلط', rules: 'القواعد', closeRules: 'إغلاق القواعد',
    flagMode: 'علم', flagging: 'تعليم', fill: 'تعبئة', marking: 'تحديد',
    seconds: 'ث', undo: 'تراجع', nextLevel: 'التالي', timeSeconds: 'الوقت(ث)',
  },
  cat: {
    all: 'الكل', puzzle: 'ألغاز', arcade: 'أركيد', strategy: 'استراتيجية', casual: 'ترفيهية',
    puzzleDesc: 'ألغاز وتفكير منطقي', arcadeDesc: 'سرعة وحركة',
    strategyDesc: 'تفكير عميق وتخطيط', casualDesc: 'استرخاء ومرح', count: '{n} لعبة',
  },
  home: { subtitle: '{n} لعبة في المتصفح · العب فوراً', clickToStart: 'انقر للبدء', enter: 'العب ←' },
  lb: {
    title: '🏆 لوحة المتصدرين', btn: '🏆 المتصدرين', player: 'اللاعب', enterName: 'اسمك...', submit: 'إرسال {score}',
    rank: '🎉 المرتبة #{rank}/{total}', loading: 'جاري التحميل...', noRecords: 'كن أول من يسجل!', refresh: '🔄 تحديث',
  },
  game2048: { title: '2048', desc: 'حرّك وادمج الأرقام', energyLevel: 'مستوى الطاقة', coreUnlocked: 'تم فتح النواة', systemOverload: 'حمل زائد', keepPlaying: 'تابع', systemReboot: 'إعادة تشغيل', finalEnergy: 'الطاقة النهائية: {score}', touch: 'WASD / سحب' },
  tetris: { title: 'تتريس', desc: 'رص الكتل — الأسرع يفوز', drop: '⏬ إسقاط', controls: '← → تحريك | ↑ تدوير | ↓ تسريع | مسافة إسقاط | P إيقاف', startTip: 'الأسهم / اللمس' },
  snake: { title: 'الأفعى', desc: 'قُد الأفعى وكُل لتكبر', dataLost: 'انقطع الاتصال', startHint: 'الأسهم / السحب', controls: 'الأسهم / WASD' },
  pacman: { title: 'باكمان', desc: 'تجنب الأشباح وكُل كل النقاط', levelN: 'المستوى {n}', pelletsLeft: 'نقاط متبقية', levelComplete: 'اكتمل المستوى!', nextLevelSoon: 'المستوى التالي...', lives: 'أرواح', controls: '← → ↑ ↓ / WASD / سحب', ruleTarget: 'كُل كل النقاط', rulePowerup: 'نقطة القوة: الأشباح تصبح زرقاء', ruleGhosts: '4 أشباح بسلوكيات مختلفة', ruleFruit: 'فاكهة: نقاط إضافية', ruleSpeed: 'الأشباح تتسارع كل مستوى' },
  minesweeper: { title: 'كاسحة الألغام', desc: 'اكشف البلاط وابحث عن الألغام', mineHit: 'لغم!', cleared: 'تم التنظيف!', again: 'مرة أخرى', flagBtn: '⚠ علم', desktopHint: 'يسار كشف | يمين علم', mobileHint: 'انقر للكشف · اضغط مطولاً للتعليم' },
  gomoku: { title: 'غوموكو', desc: 'العب ضد الذكاء الاصطناعي — خمسة في صف', again: 'مرة أخرى', undoMove: 'تراجع', thinking: 'الخصم يفكر...', youBlack: 'أسود (أنت)', wins: 'انتصارات', winMsg: 'فوز!', loseMsg: 'خسارة', drawMsg: 'تعادل', hint: 'الأسود أولاً · انقر لوضع الحجر' },
  sudoku: { title: 'سودوكو', desc: 'املأ الشبكة 9×9', complete: 'تم الحل!', again: 'مرة أخرى', check: 'تحقق', hint: 'املأ 9×9 بالأرقام 1–9', erase: 'مسح', noteMode: 'ملاحظات', notesOn: 'ملاحظات مفعلة', notesOff: 'ملاحظات معطلة' },
  memory: { title: 'لعبة الذاكرة', desc: 'اقلب البطاقات وابحث عن الأزواج', steps: 'خطوات', complete: 'تم العثور على الكل!', result: 'حُلت في {moves} حركة، {time}ث', reset: 'إعادة', hint: 'اقلب البطاقات للعثور على الأزواج' },
  flappy: { title: 'فلابي بيرد', desc: 'انقر لتطير وتجنب الأنابيب', scoreN: 'النقاط: {n}', tapToStart: 'انقر للبدء', restartHint: 'انقر أو مسافة لإعادة البدء', deepsea: 'غوص عميق', swimHint: 'اسبح للأعلى وتجنب المرجان', controls: 'مسافة / لمس للصعود' },
  colorFind: { title: 'اختبار الألوان', desc: 'اعثر على اللون المختلف', challengeOver: 'انتهى التحدي', timeUp: 'انتهى الوقت!', reachedLevel: 'وصلت للمستوى {n}', finalScore: 'النتيجة: {n}', again: 'مرة أخرى', levelLabel: 'المستوى', hint: 'اعثر على المربع المختلف اللون' },
  breakout: { title: 'بريك أوت', desc: 'تحكم بالمضرب وحطّم الكتل', missionComplete: 'اكتملت المهمة!', shipDown: 'تحطمت السفينة', scoreN: 'النقاط: {n}', launch: 'انطلق!', again: 'مرة أخرى', controls: 'فأرة / لمس للتحريك', hint: 'تحكم بالسفينة ودمّر الكتل' },
  invaders: { title: 'غزاة الفضاء', desc: 'إطلاق نار كلاسيكي — دافع عن الأرض', scoreN: 'النقاط: {n}', start: 'ابدأ', waveCleared: 'الموجة {n} مُحيت!', nextWave: 'الموجة التالية', nextWaveFaster: 'التالية أسرع!', controls: 'تحريك | مسافة إطلاق', ruleAliens: 'الكائنات: تشكيل 5×8', ruleShooting: 'إطلاق: مسافة أو لمس', ruleLives: 'أرواح: 3 أرواح', ruleGoal: 'الهدف: تدمير كل الغزاة', ruleTip: 'نصيحة: استهدف الأطراف أولاً', ruleUFO: 'صحن أحمر عشوائي — 100 نقطة إضافية' },
  bubbleShooter: { title: 'الفقاعات', desc: 'صوّب وأطلق — 3 من نفس اللون', caveCleared: 'تم تنظيف الكهف!', defenseDown: 'سقط الدفاع!', restartHint: 'انقر لإعادة البدء', hint: 'صوّب وأطلق · 3+ نفس اللون · 5 أخطاء = دفع' },
  wordle: { title: 'وردل', desc: 'خمّن الكلمة من 5 أحرف في 6 محاولات', won: '🎉 مبروك!', lost: 'الكلمة كانت: {word}', again: 'مرة أخرى', notInList: 'ليست في القائمة', tooShort: 'تحتاج 5 أحرف', hint: 'خمّن الكلمة من 5 أحرف في 6 محاولات' },
  match3: { title: 'الأحجار', desc: 'بدّل الأحجار — طابق 3 للنقاط', movesLeft: 'حركات متبقية', gameOverTitle: 'انتهت اللعبة', finalScore: 'الطاقة النهائية: {n}', again: 'مرة أخرى', hint: 'بدّل الأحجار المتجاورة · 3 في صف' },
  solitaire: { title: 'سوليتير', desc: 'لعبة ورق كلاسيكية', won: 'فزت!', again: 'مرة أخرى', autoComplete: 'إكمال تلقائي' },
  connect: { title: 'توصيل', desc: 'وصّل البلاطات المتشابهة', timeUp: 'انتهى الوقت!', allCleared: 'تم التنظيف!', again: 'مرة أخرى', finalScore: 'النتيجة النهائية {n}', scoreTime: 'النقاط {score} · الوقت {time}ث', ruleTitle: 'توصيل البلاطات', ruleGoal: 'أزل الكل في 120 ثانية', ruleConnect: 'وصّل بلاطتين متشابهتين (حد أقصى منعطفان)', ruleTime: 'كل زوج +3 ثوان', ruleShuffle: 'خلط: إعادة ترتيب البلاطات', ruleHint: 'تلميح: إبراز زوج ممكن', hint: 'انقر بلاطتين متشابهتين · حد أقصى منعطفان' },
  sokoban: { title: 'سوكوبان', desc: 'ادفع الصناديق إلى الأهداف — 50 مرحلة', stageN: 'المرحلة {n}', complete: 'اكتملت المرحلة!', allComplete: 'اكتملت جميع المراحل!', next: 'التالي', prev: 'السابق', undoMove: 'تراجع', resetLevel: 'إعادة', stepsLabel: 'خطوات', hint: 'ادفع الصناديق · الأسهم / السحب' },
  nonogram: { title: 'نونوغرام', desc: 'اكشف الصورة باستخدام الأدلة', solved: 'اكتمل الدائرة!', newRecord: 'رقم قياسي جديد!', bestTime: 'الأفضل: {t}ث', nextPuzzle: 'التالي', ruleTitle: 'قواعد النونوغرام', ruleGoal: 'اكشف النمط المخفي', ruleNumbers: 'الأرقام تدل على كتل متتالية', ruleFill: 'انقر يسار لتعبئة', ruleMark: 'انقر يمين لتحديد الفارغة', ruleMode: 'التبديل بين التعبئة والتحديد', ruleTip: 'ابدأ بالصفوف ذات الأرقام الكبيرة', ruleRecord: 'يتم حفظ أفضل وقت', hintText: 'انقر لتعبئة · يمين لتحديد X', cellLabel: 'صف {r} عمود {c}' },
  microEmpire: { title: "Micro Empire", desc: "Build a kingdom, manage resources, grow from wilderness to empire" },
};

export default ar;
