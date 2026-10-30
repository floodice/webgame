export type TileType = 'grass' | 'forest' | 'mountain' | 'water' | 'desert' | 'swamp' | 'snow';

export const TILE_COLORS: Record<TileType, string> = {
  grass: '#4a8c3f',
  forest: '#2d6b2e',
  mountain: '#7a7a7a',
  water: '#2a6fb8',
  desert: '#c8b560',
  swamp: '#5a6b3a',
  snow: '#dce8f0',
};

export const TILE_DETAIL_COLORS: Record<TileType, string> = {
  grass: '',
  forest: '#1a5a20',
  mountain: '#9a9a9a',
  water: '#4a9ae8',
  desert: '#d8c880',
  swamp: '#3a4a2a',
  snow: '#ffffff',
};

export interface TileInfo {
  type: TileType;
  buildable: boolean;
  resourceYield: Partial<Record<string, number>>;
  moveCost: number;
  label: string;
  labelEn: string;
}

export const TILE_INFO: Record<TileType, TileInfo> = {
  grass: {
    type: 'grass',
    buildable: true,
    resourceYield: { food: 1 },
    moveCost: 1,
    label: '草地',
    labelEn: 'Grassland',
  },
  forest: {
    type: 'forest',
    buildable: true,
    resourceYield: { wood: 2 },
    moveCost: 1.5,
    label: '森林',
    labelEn: 'Forest',
  },
  mountain: {
    type: 'mountain',
    buildable: true,
    resourceYield: { stone: 2, iron: 1 },
    moveCost: 3,
    label: '山地',
    labelEn: 'Mountain',
  },
  water: {
    type: 'water',
    buildable: false,
    resourceYield: { food: 2 },
    moveCost: Infinity,
    label: '水域',
    labelEn: 'Water',
  },
  desert: {
    type: 'desert',
    buildable: true,
    resourceYield: { gold: 1 },
    moveCost: 2,
    label: '沙漠',
    labelEn: 'Desert',
  },
  swamp: {
    type: 'swamp',
    buildable: true,
    resourceYield: {},
    moveCost: 2.5,
    label: '沼泽',
    labelEn: 'Swamp',
  },
  snow: {
    type: 'snow',
    buildable: true,
    resourceYield: {},
    moveCost: 2,
    label: '雪地',
    labelEn: 'Snow',
  },
};
