const en = {
  /* ── Common UI ── */
  common: {
    newGame: 'New Game',
    restart: 'Restart',
    continue: 'Continue',
    pause: 'Pause',
    paused: 'Paused',
    resume: 'Resume',
    score: 'Score',
    highScore: 'Best',
    gameOver: 'Game Over',
    victory: 'Victory',
    back: 'Back',
    backHome: '← Home',
    play: 'Play',
    enter: 'Enter →',
    loading: 'LOADING',
    clickToStart: 'Click to start',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    level: 'Level',
    lines: 'Lines',
    time: 'Time',
    steps: 'Steps',
    moves: 'Moves',
    next: 'Next',
    hint: 'Hint',
    shuffle: 'Shuffle',
    rules: 'Rules',
    closeRules: 'Close Rules',
    flagMode: 'Flag',
    flagging: 'Flagging',
    fill: 'Fill',
    marking: 'Marking',
    seconds: 's',
    undo: 'Undo',
    nextLevel: 'Next',
    timeSeconds: 'Time(s)',
  },

  /* ── Categories ── */
  cat: {
    all: 'All',
    puzzle: 'Puzzle',
    arcade: 'Arcade',
    strategy: 'Strategy',
    casual: 'Casual',
    puzzleDesc: 'Brain teasers & logic',
    arcadeDesc: 'Fast reflexes & action',
    strategyDesc: 'Deep thinking & planning',
    casualDesc: 'Relaxing & fun',
    count: '{n} games',
  },

  /* ── Home Page ── */
  home: {
    subtitle: '{n} curated browser games · Play instantly',
    clickToStart: 'Click to start',
    enter: 'Play →',
  },

  /* ── Leaderboard ── */
  lb: {
    title: '🏆 Leaderboard',
    btn: '🏆 Leaderboard',
    player: 'Player',
    enterName: 'Enter name...',
    submit: 'Submit {score}',
    rank: '🎉 Rank #{rank}/{total}',
    loading: 'Loading...',
    noRecords: 'No records yet — be the first!',
    refresh: '🔄 Refresh',
  },

  /* ── Game: 2048 ── */
  game2048: {
    title: '2048',
    desc: 'Slide & merge numbers, chase the high score',
    energyLevel: 'ENERGY LEVEL',
    coreUnlocked: 'Core Unlocked',
    systemOverload: 'System Overload',
    keepPlaying: 'Keep Going',
    systemReboot: 'Reboot',
    finalEnergy: 'Final Energy: {score}',
    touch: 'WASD / Swipe',
  },

  /* ── Game: Tetris ── */
  tetris: {
    title: 'Tetris',
    desc: 'Classic block-stacking — the faster, the better',
    drop: '⏬ Drop',
    controls: '← → Move | ↑ Rotate | ↓ Speed up | Space Drop | P Pause',
    startTip: 'Arrow keys / Touch controls',
  },

  /* ── Game: Snake ── */
  snake: {
    title: 'Snake',
    desc: 'Guide the snake, eat food, grow longer',
    dataLost: 'Connection Lost',
    startHint: 'Arrow keys / Swipe to control',
    controls: 'Arrow keys / WASD to control',
  },

  /* ── Game: Pacman ── */
  pacman: {
    title: 'Pac-Man',
    desc: 'Navigate the neon maze, dodge ghosts, eat all pellets',
    levelN: 'Level {n}',
    pelletsLeft: 'Pellets left',
    levelComplete: 'Level Complete!',
    nextLevelSoon: 'Next level starting...',
    lives: 'Lives',
    controls: '← → ↑ ↓ / WASD / Swipe',
    ruleTarget: 'Goal: Eat all pellets while avoiding ghosts',
    rulePowerup: 'Power Pellet: Ghosts turn blue — eat them for bonus points',
    ruleGhosts: 'Ghosts: 4 ghosts with different behaviors chase you',
    ruleFruit: 'Fruit: Bonus items appear for extra points',
    ruleSpeed: 'Speed: Ghosts get faster each level',
  },

  /* ── Game: Minesweeper ── */
  minesweeper: {
    title: 'Minesweeper',
    desc: 'Carefully uncover tiles, find all mines',
    mineHit: 'Mine Hit!',
    cleared: 'Area Cleared!',
    again: 'Play Again',
    flagBtn: '⚠ Flag',
    desktopHint: 'Left-click reveal | Right-click flag | Double-click auto-reveal',
    mobileHint: 'Tap to reveal · Long press or ⚠ button to flag',
  },

  /* ── Game: Gomoku ── */
  gomoku: {
    title: 'Gomoku',
    desc: 'Play against AI — five in a row wins',
    again: 'Play Again',
    undoMove: 'Undo',
    thinking: 'Opponent thinking...',
    youBlack: 'Black (You)',
    wins: 'Wins',
    winMsg: 'Win · Brilliant!',
    loseMsg: 'Loss · So close!',
    drawMsg: 'Draw · Well matched!',
    hint: 'Play as Black · Click to place · Five in a row wins',
  },

  /* ── Game: Sudoku ── */
  sudoku: {
    title: 'Sudoku',
    desc: 'Fill the 9×9 grid — test your logic',
    complete: 'Puzzle Solved!',
    again: 'Play Again',
    check: 'Check',
    hint: 'Fill the 9×9 grid with digits 1–9 · Each row, column, and box must contain all digits',
    erase: 'Erase',
    noteMode: 'Notes',
    notesOn: 'Notes ON',
    notesOff: 'Notes OFF',
  },

  /* ── Game: Memory ── */
  memory: {
    title: 'Memory Match',
    desc: 'Flip cards and find matching pairs',
    steps: 'Steps',
    complete: 'All Matched!',
    result: 'Solved in {moves} moves, {time}s',
    reset: 'Reset',
    hint: 'Flip cards to find matching pairs',
  },

  /* ── Game: Flappy ── */
  flappy: {
    title: 'Flappy Bird',
    desc: 'Tap to fly, dodge the pipes',
    scoreN: 'Score: {n}',
    tapToStart: 'Tap to start',
    restartHint: 'Click or press Space to restart',
    deepsea: 'Deep Dive',
    swimHint: 'Swim up, dodge the coral',
    controls: 'Space / Tap / Touch to swim up',
  },

  /* ── Game: Color Find ── */
  colorFind: {
    title: 'Color Test',
    desc: 'Spot the different shade — test your eyes',
    challengeOver: 'Challenge Over',
    timeUp: 'Time\'s up!',
    reachedLevel: 'Reached Level {n}',
    finalScore: 'Final Score: {n}',
    again: 'Play Again',
    levelLabel: 'Level',
    hint: 'Find the different colored tile · Geometric visual challenge',
  },

  /* ── Game: Breakout ── */
  breakout: {
    title: 'Breakout',
    desc: 'Control the paddle and smash all bricks',
    missionComplete: 'Mission Complete!',
    shipDown: 'Ship Down',
    scoreN: 'Score: {n}',
    launch: 'Launch!',
    again: 'Play Again',
    controls: 'Mouse / Touch to move ship | ← → Thrusters',
    hint: 'Control the ship, break all blocks',
  },

  /* ── Game: Invaders ── */
  invaders: {
    title: 'Space Invaders',
    desc: 'Pixel-style classic shooter — defend Earth',
    scoreN: 'Score: {n}',
    start: 'Start Game',
    waveCleared: 'Wave {n} cleared!',
    nextWave: 'Next Wave',
    nextWaveFaster: 'Next wave is faster!',
    controls: 'Move | Space to Shoot | Destroy all invaders',
    ruleAliens: 'Aliens: 5×8 formation, move side to side and descend',
    ruleShooting: 'Shooting: Space or tap — one bullet at a time',
    ruleLives: 'Lives: 3 lives — hit by bullet or aliens reach bottom = lose a life',
    ruleGoal: 'Goal: Destroy all invading aliens to defend Earth',
    ruleTip: 'Tip: Target edge aliens first to slow their descent',
    ruleUFO: 'Random red UFO appears — hit it for 100 bonus points',
  },

  /* ── Game: Bubble Shooter ── */
  bubbleShooter: {
    title: 'Bubble Shooter',
    desc: 'Aim, shoot — match 3 same-color bubbles to pop',
    caveCleared: 'Cave Cleared!',
    defenseDown: 'Defense Breached!',
    restartHint: 'Click canvas to restart',
    hint: 'Aim & tap to shoot · Match 3+ same-color bubbles · 5 misses = push down',
  },

  /* ── Game: Wordle ── */
  wordle: {
    title: 'Wordle',
    desc: 'Guess the 5-letter word in 6 tries',
    won: '🎉 Congratulations!',
    lost: 'The word was: {word}',
    again: 'Play Again',
    notInList: 'Not in word list',
    tooShort: 'Need 5 letters',
    hint: 'Guess the 5-letter word in 6 tries',
  },

  /* ── Game: Match3 ── */
  match3: {
    title: 'Gem Match',
    desc: 'Swap adjacent gems — match 3 for combos',
    movesLeft: 'Moves left',
    gameOverTitle: 'Transmutation Over',
    finalScore: 'Final energy: {n}',
    again: 'Play Again',
    hint: 'Swap adjacent gems · Match 3 in a row to score',
  },

  /* ── Game: Solitaire ── */
  solitaire: {
    title: 'Solitaire',
    desc: 'Classic card game — sort cards by suit in order',
    won: 'You Win!',
    again: 'Play Again',
    autoComplete: 'Auto-complete',
  },

  /* ── Game: Connect ── */
  connect: {
    title: 'Tile Connect',
    desc: 'Match identical tiles with lines — clear the board',
    timeUp: 'Time\'s Up',
    allCleared: 'All Cleared!',
    again: 'Play Again',
    finalScore: 'Final score {n}',
    scoreTime: 'Score {score} · Time {time}s',
    ruleTitle: 'Bamboo Connect',
    ruleGoal: 'Goal: Clear all tiles within 120 seconds',
    ruleConnect: 'Connect: Match two identical tiles with a path having at most 2 turns',
    ruleTime: 'Time: Each match adds 3 seconds; time runs out = game over',
    ruleShuffle: 'Shuffle: Rearranges remaining tiles',
    ruleHint: 'Hint: Tap hint button to highlight a matching pair',
    hint: 'Click two matching tiles · Connect with at most 2 turns',
  },

  /* ── Game: Sokoban ── */
  sokoban: {
    title: 'Sokoban',
    desc: 'Push boxes to targets — 50 stages, 5 zones',
    stageN: 'Stage {n}',
    complete: 'Stage Complete!',
    allComplete: 'All Stages Complete!',
    next: 'Next Stage',
    prev: 'Prev Stage',
    undoMove: 'Undo',
    resetLevel: 'Reset',
    stepsLabel: 'Steps',
    hint: 'Push boxes to targets · Arrow keys / Swipe',
  },

  /* ── Game: Nonogram ── */
  nonogram: {
    title: 'Nonogram',
    desc: 'Use row/column clues to reveal pixel art',
    solved: 'Circuit Connected!',
    newRecord: 'New Record!',
    bestTime: 'Best: {t}s',
    nextPuzzle: 'Next Puzzle',
    ruleTitle: 'Nonogram Rules',
    ruleGoal: 'Goal: Reveal the hidden pixel pattern using row/column number clues',
    ruleNumbers: 'Numbers: Each number shows the length of a consecutive filled segment — e.g. [2,3] means a block of 2 and a block of 3 with at least 1 gap between',
    ruleFill: 'Fill: Left-click to fill a cell (green)',
    ruleMark: 'Mark: Right-click or long-press to mark cells you know are empty',
    ruleMode: 'Mode: Toggle between fill and mark mode',
    ruleTip: 'Tip: Start with the rows/columns having the largest numbers',
    ruleRecord: 'Your best time for each puzzle is recorded',
    hintText: 'Click to fill · Right-click/long-press to mark X · Complete the pattern',
    cellLabel: 'Row {r} Col {c}',
  },
  microEmpire: {
    title: 'Micro Empire',
    desc: 'Build a kingdom, manage resources, research tech, grow from wilderness to a thriving empire',
  },
};

export default en;
export type Translations = typeof en;
