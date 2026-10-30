export interface GameInfo {
  id: string;
  /** i18n key for game title, e.g. 'game2048' → t.game2048.title */
  nameKey: string;
  /** i18n key for description — stored as game section key */
  descKey: string;
  icon: string;
  /** Internal category key */
  categoryKey: 'puzzle' | 'arcade' | 'strategy' | 'casual';
  path: string;
}

export type CategoryKey = 'all' | 'puzzle' | 'arcade' | 'strategy' | 'casual';

export const categoryKeys: CategoryKey[] = ['all', 'puzzle', 'arcade', 'strategy', 'casual'];

export const games: GameInfo[] = [
  { id: 'game2048',        nameKey: 'game2048',        descKey: 'game2048',        icon: '🔢', categoryKey: 'puzzle',   path: '/game/2048' },
  { id: 'tetris',          nameKey: 'tetris',          descKey: 'tetris',          icon: '🧱', categoryKey: 'arcade',   path: '/game/tetris' },
  { id: 'snake',           nameKey: 'snake',           descKey: 'snake',           icon: '🐍', categoryKey: 'arcade',   path: '/game/snake' },
  { id: 'pacman',          nameKey: 'pacman',          descKey: 'pacman',          icon: '👾', categoryKey: 'arcade',   path: '/game/pacman' },
  { id: 'minesweeper',     nameKey: 'minesweeper',     descKey: 'minesweeper',     icon: '💣', categoryKey: 'puzzle',   path: '/game/minesweeper' },
  { id: 'gomoku',          nameKey: 'gomoku',          descKey: 'gomoku',          icon: '⚫', categoryKey: 'strategy', path: '/game/gomoku' },
  { id: 'sudoku',          nameKey: 'sudoku',          descKey: 'sudoku',          icon: '🔟', categoryKey: 'puzzle',   path: '/game/sudoku' },
  { id: 'memory',          nameKey: 'memory',          descKey: 'memory',          icon: '🃏', categoryKey: 'casual',   path: '/game/memory' },
  { id: 'flappy',          nameKey: 'flappy',          descKey: 'flappy',          icon: '🐦', categoryKey: 'arcade',   path: '/game/flappy' },
  { id: 'color-find',      nameKey: 'colorFind',       descKey: 'colorFind',       icon: '🎨', categoryKey: 'casual',   path: '/game/color-find' },
  { id: 'breakout',        nameKey: 'breakout',        descKey: 'breakout',        icon: '🧱', categoryKey: 'arcade',   path: '/game/breakout' },
  { id: 'invaders',        nameKey: 'invaders',        descKey: 'invaders',        icon: '👽', categoryKey: 'arcade',   path: '/game/invaders' },
  { id: 'bubble-shooter',  nameKey: 'bubbleShooter',   descKey: 'bubbleShooter',   icon: '🫧', categoryKey: 'casual',   path: '/game/bubble-shooter' },
  { id: 'wordle',          nameKey: 'wordle',          descKey: 'wordle',          icon: '📝', categoryKey: 'puzzle',   path: '/game/wordle' },
  { id: 'match3',          nameKey: 'match3',          descKey: 'match3',          icon: '💎', categoryKey: 'casual',   path: '/game/match3' },
  { id: 'solitaire',       nameKey: 'solitaire',       descKey: 'solitaire',       icon: '🃏', categoryKey: 'strategy', path: '/game/solitaire' },
  { id: 'connect',         nameKey: 'connect',         descKey: 'connect',         icon: '🎋', categoryKey: 'casual',   path: '/game/connect' },
  { id: 'sokoban',         nameKey: 'sokoban',         descKey: 'sokoban',         icon: '📦', categoryKey: 'puzzle',   path: '/game/sokoban' },
  { id: 'nonogram',        nameKey: 'nonogram',        descKey: 'nonogram',        icon: '🧩', categoryKey: 'puzzle',   path: '/game/nonogram' },
  { id: 'micro-empire',    nameKey: 'microEmpire',     descKey: 'microEmpire',     icon: '🏰', categoryKey: 'strategy', path: '/game/micro-empire' },
];
