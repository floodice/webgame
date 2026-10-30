import type { Translations } from './en';

const hi: Translations = {
  common: {
    newGame: 'नया खेल', restart: 'पुनः आरंभ', continue: 'जारी रखें', pause: 'रुकें', paused: 'रुका हुआ', resume: 'फिर से शुरू',
    score: 'स्कोर', highScore: 'सर्वश्रेष्ठ', gameOver: 'खेल समाप्त', victory: 'जीत', back: 'वापस', backHome: '← होम',
    play: 'खेलें', enter: 'खेलें →', loading: 'लोड हो रहा है', clickToStart: 'शुरू करने के लिए क्लिक करें',
    easy: 'आसान', medium: 'मध्यम', hard: 'कठिन', beginner: 'शुरुआती', intermediate: 'मध्यवर्ती', advanced: 'उन्नत',
    level: 'स्तर', lines: 'पंक्तियाँ', time: 'समय', steps: 'कदम', moves: 'चालें', next: 'अगला',
    hint: 'संकेत', shuffle: 'फेरबदल', rules: 'नियम', closeRules: 'नियम बंद करें',
    flagMode: 'ध्वज', flagging: 'चिह्नित', fill: 'भरें', marking: 'चिह्नित',
    seconds: 'से', undo: 'पूर्ववत', nextLevel: 'अगला', timeSeconds: 'समय(से)',
  },
  cat: {
    all: 'सभी', puzzle: 'पहेली', arcade: 'आर्केड', strategy: 'रणनीति', casual: 'आरामदायक',
    puzzleDesc: 'दिमागी पहेली और तर्क', arcadeDesc: 'तेज़ प्रतिक्रिया और एक्शन',
    strategyDesc: 'गहरी सोच और योजना', casualDesc: 'आराम और मज़ा', count: '{n} खेल',
  },
  home: { subtitle: '{n} ब्राउज़र गेम · तुरंत खेलें', clickToStart: 'शुरू करने के लिए क्लिक करें', enter: 'खेलें →' },
  lb: {
    title: '🏆 लीडरबोर्ड', btn: '🏆 लीडरबोर्ड', player: 'खिलाड़ी', enterName: 'नाम दर्ज करें...', submit: '{score} भेजें',
    rank: '🎉 रैंक #{rank}/{total}', loading: 'लोड हो रहा...', noRecords: 'अभी कोई रिकॉर्ड नहीं — पहले बनें!', refresh: '🔄 रीफ्रेश',
  },
  game2048: { title: '2048', desc: 'संख्याओं को स्लाइड करें और मिलाएं', energyLevel: 'ऊर्जा स्तर', coreUnlocked: 'कोर अनलॉक', systemOverload: 'ओवरलोड', keepPlaying: 'जारी रखें', systemReboot: 'रीबूट', finalEnergy: 'अंतिम ऊर्जा: {score}', touch: 'WASD / स्वाइप' },
  tetris: { title: 'टेट्रिस', desc: 'ब्लॉक जमाएं — जितना तेज़, उतना अच्छा', drop: '⏬ गिराएं', controls: '← → चलाएं | ↑ घुमाएं | ↓ तेज़ | Space गिराएं | P रुकें', startTip: 'तीर कुंजी / टच' },
  snake: { title: 'सांप', desc: 'सांप को चलाएं, खाएं और बड़ा हों', dataLost: 'कनेक्शन टूटा', startHint: 'तीर कुंजी / स्वाइप', controls: 'तीर कुंजी / WASD' },
  pacman: { title: 'पैकमैन', desc: 'भूतों से बचें, सारे बिंदु खाएं', levelN: 'स्तर {n}', pelletsLeft: 'शेष बिंदु', levelComplete: 'स्तर पूरा!', nextLevelSoon: 'अगला स्तर...', lives: 'जीवन', controls: '← → ↑ ↓ / WASD / स्वाइप', ruleTarget: 'सारे बिंदु खाएं', rulePowerup: 'पावर: भूत नीले हो जाते हैं', ruleGhosts: '4 भूत अलग-अलग तरीकों से पीछा करते हैं', ruleFruit: 'फल: बोनस अंक', ruleSpeed: 'भूत हर स्तर पर तेज़ होते हैं' },
  minesweeper: { title: 'माइनस्वीपर', desc: 'टाइलें खोलें, बारूदी सुरंगें खोजें', mineHit: 'बारूदी सुरंग!', cleared: 'सफ़ाई हो गई!', again: 'फिर खेलें', flagBtn: '⚠ ध्वज', desktopHint: 'बायाँ क्लिक खोलें | दायाँ क्लिक ध्वज', mobileHint: 'टैप करें खोलने के लिए · लंबा दबाएं चिह्नित करने के लिए' },
  gomoku: { title: 'गोमोकू', desc: 'AI से खेलें — पाँच एक पंक्ति में जीत', again: 'फिर खेलें', undoMove: 'पूर्ववत', thinking: 'प्रतिद्वंद्वी सोच रहा...', youBlack: 'काला (आप)', wins: 'जीतें', winMsg: 'जीत!', loseMsg: 'हार', drawMsg: 'बराबरी', hint: 'काला पहले · क्लिक करें · पाँच एक पंक्ति' },
  sudoku: { title: 'सुडोकू', desc: '9×9 ग्रिड भरें', complete: 'हल हो गया!', again: 'फिर खेलें', check: 'जाँचें', hint: '9×9 को 1–9 से भरें', erase: 'मिटाएं', noteMode: 'नोट', notesOn: 'नोट चालू', notesOff: 'नोट बंद' },
  memory: { title: 'मेमोरी मैच', desc: 'कार्ड पलटें और जोड़ी खोजें', steps: 'चालें', complete: 'सब मिल गए!', result: '{moves} चालों में, {time}से में हल', reset: 'रीसेट', hint: 'कार्ड पलटकर जोड़ी खोजें' },
  flappy: { title: 'फ्लैपी बर्ड', desc: 'टैप करें, उड़ें, पाइप से बचें', scoreN: 'स्कोर: {n}', tapToStart: 'शुरू करने के लिए टैप करें', restartHint: 'क्लिक या Space से पुनः आरंभ', deepsea: 'गहरी गोता', swimHint: 'ऊपर तैरें, मूंगे से बचें', controls: 'Space / टैप से ऊपर' },
  colorFind: { title: 'रंग परीक्षा', desc: 'अलग रंग खोजें', challengeOver: 'चुनौती समाप्त', timeUp: 'समय समाप्त!', reachedLevel: 'स्तर {n} पहुँचे', finalScore: 'अंतिम स्कोर: {n}', again: 'फिर खेलें', levelLabel: 'स्तर', hint: 'अलग रंग वाला टाइल खोजें' },
  breakout: { title: 'ब्रेकआउट', desc: 'पैडल चलाएं, ईंटें तोड़ें', missionComplete: 'मिशन पूरा!', shipDown: 'जहाज़ नष्ट', scoreN: 'स्कोर: {n}', launch: 'लॉन्च!', again: 'फिर खेलें', controls: 'माउस / टच से चलाएं', hint: 'जहाज़ चलाएं, ब्लॉक तोड़ें' },
  invaders: { title: 'स्पेस इनवेडर्स', desc: 'रेट्रो शूटर — पृथ्वी की रक्षा करें', scoreN: 'स्कोर: {n}', start: 'शुरू', waveCleared: 'लहर {n} ख़त्म!', nextWave: 'अगली लहर', nextWaveFaster: 'अगली और तेज़!', controls: 'चलाएं | Space दागें', ruleAliens: 'एलियन: 5×8 फॉर्मेशन', ruleShooting: 'दागें: Space या टैप', ruleLives: 'जीवन: 3 जीवन', ruleGoal: 'लक्ष्य: सभी आक्रमणकारियों को नष्ट करें', ruleTip: 'सुझाव: किनारे वालों को पहले निशाना बनाएं', ruleUFO: 'यादृच्छिक लाल UFO — 100 बोनस' },
  bubbleShooter: { title: 'बुलबुले', desc: 'निशाना लगाएं — 3 एक जैसे रंग', caveCleared: 'गुफा साफ़!', defenseDown: 'रक्षा टूटी!', restartHint: 'पुनः आरंभ के लिए क्लिक करें', hint: 'निशाना लगाएं · 3+ एक रंग · 5 चूक = पीछे' },
  wordle: { title: 'वर्डल', desc: '5 अक्षरों का शब्द 6 प्रयासों में', won: '🎉 बधाई!', lost: 'शब्द था: {word}', again: 'फिर खेलें', notInList: 'सूची में नहीं', tooShort: '5 अक्षर चाहिए', hint: '5 अक्षरों का शब्द 6 प्रयासों में बताएं' },
  match3: { title: 'रत्न', desc: 'रत्न बदलें — 3 मिलाएं', movesLeft: 'शेष चालें', gameOverTitle: 'खेल समाप्त', finalScore: 'अंतिम ऊर्जा: {n}', again: 'फिर खेलें', hint: 'पड़ोसी रत्न बदलें · 3 एक पंक्ति' },
  solitaire: { title: 'सॉलिटेयर', desc: 'क्लासिक ताश का खेल', won: 'आपने जीता!', again: 'फिर खेलें', autoComplete: 'स्वतः पूर्ण' },
  connect: { title: 'जोड़ें', desc: 'एक जैसी टाइलें जोड़ें — बोर्ड साफ़ करें', timeUp: 'समय समाप्त!', allCleared: 'सब साफ़!', again: 'फिर खेलें', finalScore: 'अंतिम स्कोर {n}', scoreTime: 'स्कोर {score} · समय {time}से', ruleTitle: 'टाइल जोड़ें', ruleGoal: '120 सेकंड में सब हटाएं', ruleConnect: 'एक जैसी टाइलें जोड़ें (अधिकतम 2 मोड़)', ruleTime: 'हर जोड़ी +3 सेकंड', ruleShuffle: 'फेरबदल: टाइलें फिर से व्यवस्थित', ruleHint: 'संकेत: एक जोड़ी दिखाएं', hint: 'एक जैसी दो टाइलें टैप करें · अधिकतम 2 मोड़' },
  sokoban: { title: 'सोकोबन', desc: 'बक्सों को लक्ष्य तक धकेलें — 50 चरण', stageN: 'चरण {n}', complete: 'चरण पूरा!', allComplete: 'सब पूरा!', next: 'अगला', prev: 'पिछला', undoMove: 'पूर्ववत', resetLevel: 'रीसेट', stepsLabel: 'कदम', hint: 'बक्से धकेलें · तीर कुंजी / स्वाइप' },
  nonogram: { title: 'नोनोग्राम', desc: 'सुरागों से पिक्सेल कला उजागर करें', solved: 'सर्किट जुड़ गया!', newRecord: 'नया रिकॉर्ड!', bestTime: 'सर्वश्रेष्ठ: {t}से', nextPuzzle: 'अगला', ruleTitle: 'नोनोग्राम नियम', ruleGoal: 'छिपे पैटर्न को उजागर करें', ruleNumbers: 'संख्याएं लगातार भरे खानों को दर्शाती हैं', ruleFill: 'बायाँ क्लिक भरने के लिए', ruleMark: 'दायाँ क्लिक ख़ाली चिह्नित करने के लिए', ruleMode: 'भरने और चिह्नित करने में बदलें', ruleTip: 'बड़ी संख्या वाली पंक्तियों से शुरू करें', ruleRecord: 'आपका सर्वश्रेष्ठ समय सहेजा जाता है', hintText: 'क्लिक करें भरने के लिए · दायाँ क्लिक X के लिए', cellLabel: 'पंक्ति {r} स्तंभ {c}' },
  microEmpire: { title: "Micro Empire", desc: "Build a kingdom, manage resources, grow from wilderness to empire" },
};

export default hi;
