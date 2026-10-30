import type { Translations } from './en';

const de: Translations = {
  common: {
    newGame: 'Neues Spiel', restart: 'Neustart', continue: 'Weiter', pause: 'Pause', paused: 'Pausiert', resume: 'Fortsetzen',
    score: 'Punkte', highScore: 'Rekord', gameOver: 'Spiel vorbei', victory: 'Sieg', back: 'Zurück', backHome: '← Startseite',
    play: 'Spielen', enter: 'Spielen →', loading: 'LADEN', clickToStart: 'Zum Starten klicken',
    easy: 'Leicht', medium: 'Mittel', hard: 'Schwer', beginner: 'Anfänger', intermediate: 'Fortgeschritten', advanced: 'Experte',
    level: 'Level', lines: 'Zeilen', time: 'Zeit', steps: 'Schritte', moves: 'Züge', next: 'Weiter',
    hint: 'Tipp', shuffle: 'Mischen', rules: 'Regeln', closeRules: 'Regeln schließen',
    flagMode: 'Flagge', flagging: 'Markieren', fill: 'Füllen', marking: 'Markieren',
    seconds: 's', undo: 'Rückgängig', nextLevel: 'Weiter', timeSeconds: 'Zeit(s)',
  },
  cat: {
    all: 'Alle', puzzle: 'Rätsel', arcade: 'Arcade', strategy: 'Strategie', casual: 'Gelegenheit',
    puzzleDesc: 'Denksport & Logik', arcadeDesc: 'Schnelle Reflexe & Action',
    strategyDesc: 'Tiefes Denken & Planen', casualDesc: 'Entspannung & Spaß', count: '{n} Spiele',
  },
  home: { subtitle: '{n} Browser-Spiele · Sofort spielen', clickToStart: 'Zum Starten klicken', enter: 'Spielen →' },
  lb: {
    title: '🏆 Bestenliste', btn: '🏆 Bestenliste', player: 'Spieler', enterName: 'Dein Name...', submit: '{score} einreichen',
    rank: '🎉 Platz #{rank}/{total}', loading: 'Laden...', noRecords: 'Sei der Erste in der Bestenliste!', refresh: '🔄 Aktualisieren',
  },
  game2048: { title: '2048', desc: 'Zahlen schieben und kombinieren', energyLevel: 'ENERGIELEVEL', coreUnlocked: 'Kern freigeschaltet', systemOverload: 'Überlastung', keepPlaying: 'Weiterspielen', systemReboot: 'Neustart', finalEnergy: 'Endenergie: {score}', touch: 'WASD / Wischen' },
  tetris: { title: 'Tetris', desc: 'Blöcke stapeln — je schneller, desto besser', drop: '⏬ Fallen', controls: '← → Bewegen | ↑ Drehen | ↓ Schneller | Leertaste Fallen | P Pause', startTip: 'Pfeiltasten / Touch-Steuerung' },
  snake: { title: 'Snake', desc: 'Steuere die Schlange, friss und wachse', dataLost: 'Verbindung verloren', startHint: 'Pfeiltasten / Wischen', controls: 'Pfeiltasten / WASD' },
  pacman: { title: 'Pac-Man', desc: 'Weiche Geistern aus, friss alle Punkte', levelN: 'Level {n}', pelletsLeft: 'Punkte übrig', levelComplete: 'Level geschafft!', nextLevelSoon: 'Nächstes Level...', lives: 'Leben', controls: '← → ↑ ↓ / WASD / Wischen', ruleTarget: 'Friss alle Punkte', rulePowerup: 'Kraftpille: Geister werden blau', ruleGhosts: '4 Geister mit unterschiedlichem Verhalten', ruleFruit: 'Früchte: Bonuspunkte', ruleSpeed: 'Geister werden jedes Level schneller' },
  minesweeper: { title: 'Minesweeper', desc: 'Felder aufdecken, Minen finden', mineHit: 'Mine!', cleared: 'Alles geräumt!', again: 'Nochmal', flagBtn: '⚠ Flagge', desktopHint: 'Linksklick aufdecken | Rechtsklick Flagge', mobileHint: 'Tippen zum Aufdecken · Halten zum Markieren' },
  gomoku: { title: 'Gomoku', desc: 'Gegen KI spielen — Fünf in einer Reihe gewinnt', again: 'Nochmal', undoMove: 'Rückgängig', thinking: 'Gegner denkt...', youBlack: 'Schwarz (Du)', wins: 'Siege', winMsg: 'Sieg!', loseMsg: 'Niederlage', drawMsg: 'Unentschieden', hint: 'Schwarz zuerst · Klicken zum Setzen' },
  sudoku: { title: 'Sudoku', desc: 'Fülle das 9×9-Gitter', complete: 'Gelöst!', again: 'Nochmal', check: 'Prüfen', hint: '9×9 mit Ziffern 1–9 füllen', erase: 'Löschen', noteMode: 'Notizen', notesOn: 'Notizen AN', notesOff: 'Notizen AUS' },
  memory: { title: 'Memory', desc: 'Karten umdrehen und Paare finden', steps: 'Züge', complete: 'Alle gefunden!', result: 'In {moves} Zügen und {time}s gelöst', reset: 'Zurücksetzen', hint: 'Karten umdrehen, Paare finden' },
  flappy: { title: 'Flappy Bird', desc: 'Tippe zum Fliegen, weiche Rohren aus', scoreN: 'Punkte: {n}', tapToStart: 'Tippe zum Starten', restartHint: 'Klick oder Leertaste zum Neustart', deepsea: 'Tieftauchen', swimHint: 'Nach oben schwimmen, Korallen ausweichen', controls: 'Leertaste / Tippen zum Steigen' },
  colorFind: { title: 'Farbtest', desc: 'Finde den anderen Farbton', challengeOver: 'Herausforderung vorbei', timeUp: 'Zeit abgelaufen!', reachedLevel: 'Level {n} erreicht', finalScore: 'Endpunktzahl: {n}', again: 'Nochmal', levelLabel: 'Level', hint: 'Finde das andersfarbige Feld' },
  breakout: { title: 'Breakout', desc: 'Steuere den Schläger, zerstöre Blöcke', missionComplete: 'Mission geschafft!', shipDown: 'Schiff zerstört', scoreN: 'Punkte: {n}', launch: 'Start!', again: 'Nochmal', controls: 'Maus / Touch zum Bewegen', hint: 'Steuere das Schiff, zerstöre Blöcke' },
  invaders: { title: 'Space Invaders', desc: 'Retro-Shooter — verteidige die Erde', scoreN: 'Punkte: {n}', start: 'Start', waveCleared: 'Welle {n} besiegt!', nextWave: 'Nächste Welle', nextWaveFaster: 'Die nächste ist schneller!', controls: 'Bewegen | Leertaste Schießen', ruleAliens: 'Aliens: 5×8-Formation', ruleShooting: 'Schuss: Leertaste oder Tippen', ruleLives: 'Leben: 3 Leben', ruleGoal: 'Ziel: Alle Invasoren zerstören', ruleTip: 'Tipp: Rand-Aliens zuerst treffen', ruleUFO: 'Zufälliges rotes UFO — 100 Bonuspunkte' },
  bubbleShooter: { title: 'Bubble Shooter', desc: 'Ziele und schieße — 3 gleiche Farben', caveCleared: 'Höhle geräumt!', defenseDown: 'Verteidigung gefallen!', restartHint: 'Klicken zum Neustart', hint: 'Zielen & schießen · 3+ gleiche Farbe · 5 Fehlschüsse = Rückschlag' },
  wordle: { title: 'Wordle', desc: 'Errate das 5-Buchstaben-Wort in 6 Versuchen', won: '🎉 Gratulation!', lost: 'Das Wort war: {word}', again: 'Nochmal', notInList: 'Nicht in der Wortliste', tooShort: '5 Buchstaben nötig', hint: 'Errate das 5-Buchstaben-Wort in 6 Versuchen' },
  match3: { title: 'Juwelen', desc: 'Edelsteine tauschen — 3 kombinieren', movesLeft: 'Züge übrig', gameOverTitle: 'Spiel vorbei', finalScore: 'Endenergie: {n}', again: 'Nochmal', hint: 'Edelsteine tauschen · 3 in einer Reihe' },
  solitaire: { title: 'Solitär', desc: 'Klassisches Kartenspiel', won: 'Gewonnen!', again: 'Nochmal', autoComplete: 'Auto-vervollständigen' },
  connect: { title: 'Verbinden', desc: 'Gleiche Steine verbinden — Brett räumen', timeUp: 'Zeit abgelaufen!', allCleared: 'Alles geräumt!', again: 'Nochmal', finalScore: 'Endpunktzahl {n}', scoreTime: 'Punkte {score} · Zeit {time}s', ruleTitle: 'Steine verbinden', ruleGoal: 'Alles in 120 Sekunden räumen', ruleConnect: 'Gleiche Steine mit max. 2 Knicken verbinden', ruleTime: 'Jedes Paar +3 Sekunden', ruleShuffle: 'Mischen: Steine neu anordnen', ruleHint: 'Tipp: Ein mögliches Paar hervorheben', hint: 'Zwei gleiche Steine antippen · Max. 2 Knicke' },
  sokoban: { title: 'Sokoban', desc: 'Kisten zum Ziel schieben — 50 Level', stageN: 'Level {n}', complete: 'Level geschafft!', allComplete: 'Alle geschafft!', next: 'Weiter', prev: 'Zurück', undoMove: 'Rückgängig', resetLevel: 'Zurücksetzen', stepsLabel: 'Schritte', hint: 'Kisten schieben · Pfeiltasten / Wischen' },
  nonogram: { title: 'Nonogramm', desc: 'Enthülle Pixelkunst mit Hinweisen', solved: 'Schaltkreis verbunden!', newRecord: 'Neuer Rekord!', bestTime: 'Bestzeit: {t}s', nextPuzzle: 'Weiter', ruleTitle: 'Nonogramm-Regeln', ruleGoal: 'Enthülle das versteckte Muster', ruleNumbers: 'Zahlen zeigen aufeinanderfolgende Blöcke', ruleFill: 'Linksklick zum Füllen', ruleMark: 'Rechtsklick zum Markieren', ruleMode: 'Zwischen Füllen und Markieren wechseln', ruleTip: 'Beginne mit den Reihen mit den größten Zahlen', ruleRecord: 'Bestzeit wird gespeichert', hintText: 'Klicken zum Füllen · Rechtsklick für X', cellLabel: 'Zeile {r} Spalte {c}' },
  microEmpire: { title: "Micro Empire", desc: "Build a kingdom, manage resources, grow from wilderness to empire" },
};

export default de;
