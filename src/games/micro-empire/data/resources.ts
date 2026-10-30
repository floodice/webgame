export type ResourceType = 'food' | 'wood' | 'stone' | 'iron' | 'gold' | 'knowledge';

export interface ResourceDef {
  id: ResourceType;
  label: string;
  labelEn: string;
  icon: string;
  color: string;
  startAmount: number;
  maxBase: number;
}

export const RESOURCE_DEFS: Record<ResourceType, ResourceDef> = {
  food: {
    id: 'food',
    label: '食物',
    labelEn: 'Food',
    icon: '🌾',
    color: '#8bc34a',
    startAmount: 100,
    maxBase: 500,
  },
  wood: {
    id: 'wood',
    label: '木材',
    labelEn: 'Wood',
    icon: '🪵',
    color: '#8d6e63',
    startAmount: 60,
    maxBase: 500,
  },
  stone: {
    id: 'stone',
    label: '石材',
    labelEn: 'Stone',
    icon: '🪨',
    color: '#9e9e9e',
    startAmount: 30,
    maxBase: 400,
  },
  iron: {
    id: 'iron',
    label: '铁矿',
    labelEn: 'Iron',
    icon: '⛏️',
    color: '#78909c',
    startAmount: 0,
    maxBase: 300,
  },
  gold: {
    id: 'gold',
    label: '金币',
    labelEn: 'Gold',
    icon: '💰',
    color: '#ffc107',
    startAmount: 50,
    maxBase: 1000,
  },
  knowledge: {
    id: 'knowledge',
    label: '知识',
    labelEn: 'Knowledge',
    icon: '📚',
    color: '#7c4dff',
    startAmount: 0,
    maxBase: 200,
  },
};

export const ALL_RESOURCES: ResourceType[] = ['food', 'wood', 'stone', 'iron', 'gold', 'knowledge'];
