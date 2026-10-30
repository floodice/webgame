export const TILE_SIZE = 32;
export const MAP_W = 80;
export const MAP_H = 80;
export const WORLD_PX_W = MAP_W * TILE_SIZE;
export const WORLD_PX_H = MAP_H * TILE_SIZE;

export const TICK_MS = 200;

export const SEASON_DAYS = 30;
export const YEAR_DAYS = SEASON_DAYS * 4;

export const Season = { Spring: 0, Summer: 1, Autumn: 2, Winter: 3 } as const;
export type Season = (typeof Season)[keyof typeof Season];

export const SEASON_NAMES: Record<Season, string> = {
  [Season.Spring]: '春',
  [Season.Summer]: '夏',
  [Season.Autumn]: '秋',
  [Season.Winter]: '冬',
};

export const SEASON_FOOD_MOD: Record<Season, number> = {
  [Season.Spring]: 1.2,
  [Season.Summer]: 1.0,
  [Season.Autumn]: 1.3,
  [Season.Winter]: 0.5,
};

export const SEASON_WOOD_MOD: Record<Season, number> = {
  [Season.Spring]: 1.0,
  [Season.Summer]: 1.0,
  [Season.Autumn]: 1.0,
  [Season.Winter]: 0.7,
};
