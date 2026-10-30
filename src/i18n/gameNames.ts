import type { Translations } from './en';

type GameSection = {
  title: string;
  desc: string;
  [k: string]: string;
};

const GAME_KEYS: Record<string, keyof Translations> = {
  game2048: 'game2048',
  tetris: 'tetris',
  snake: 'snake',
  pacman: 'pacman',
  minesweeper: 'minesweeper',
  gomoku: 'gomoku',
  sudoku: 'sudoku',
  memory: 'memory',
  flappy: 'flappy',
  colorFind: 'colorFind',
  breakout: 'breakout',
  invaders: 'invaders',
  bubbleShooter: 'bubbleShooter',
  wordle: 'wordle',
  match3: 'match3',
  solitaire: 'solitaire',
  connect: 'connect',
  sokoban: 'sokoban',
  nonogram: 'nonogram',
  microEmpire: 'microEmpire',
};

export function getGameName(t: Translations, nameKey: string): string {
  const section = t[GAME_KEYS[nameKey] as keyof Translations] as GameSection | undefined;
  return section?.title ?? nameKey;
}

export function getGameDesc(t: Translations, descKey: string): string {
  const section = t[GAME_KEYS[descKey] as keyof Translations] as GameSection | undefined;
  return section?.desc ?? '';
}

const CAT_LABEL_MAP: Record<string, keyof Translations['cat']> = {
  puzzle: 'puzzle',
  arcade: 'arcade',
  strategy: 'strategy',
  casual: 'casual',
  all: 'all',
};

export function getCatLabel(t: Translations, key: string): string {
  const k = CAT_LABEL_MAP[key];
  return k ? t.cat[k] : key;
}

const CAT_DESC_MAP: Record<string, keyof Translations['cat']> = {
  puzzle: 'puzzleDesc',
  arcade: 'arcadeDesc',
  strategy: 'strategyDesc',
  casual: 'casualDesc',
};

export function getCatDesc(t: Translations, key: string): string {
  const k = CAT_DESC_MAP[key];
  return k ? t.cat[k as keyof Translations['cat']] : '';
}
