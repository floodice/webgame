import { EventBus } from '../engine/EventBus';
import { BUILDING_DEFS } from '../data/buildings';
import type { ResourceType } from '../data/resources';
import type { GameMap } from '../world/GameMap';
import { TILE_INFO } from '../world/Tile';
import type { ResourceSystem } from './ResourceSystem';
import type { TechSystem } from './TechSystem';

export interface PlacedBuilding {
  type: string;
  x: number;
  y: number;
  level: number;
  constructionLeft: number;
}

export class BuildingSystem {
  private buildings: PlacedBuilding[] = [];

  private bus: EventBus;
  private map: GameMap;
  constructor(bus: EventBus, map: GameMap) {
    this.bus = bus;
    this.map = map;
  }

  getAll(): PlacedBuilding[] { return this.buildings; }

  getAt(x: number, y: number): PlacedBuilding | undefined {
    return this.buildings.find(b => b.x === x && b.y === y);
  }

  canPlace(type: string, x: number, y: number, resources: ResourceSystem, tech: TechSystem): { ok: boolean; reason: string } {
    const def = BUILDING_DEFS[type];
    if (!def) return { ok: false, reason: '未知建筑' };

    if (def.requiredTech && !tech.isResearched(def.requiredTech)) {
      return { ok: false, reason: '需要先研究科技' };
    }

    const tile = this.map.get(x, y);
    const tileInfo = TILE_INFO[tile];
    if (!tileInfo.buildable) return { ok: false, reason: '该地形不可建造' };
    if (!def.allowedTerrain.includes(tile)) return { ok: false, reason: `不能建在${tileInfo.label}上` };

    if (this.getAt(x, y)) return { ok: false, reason: '已有建筑' };

    if (!resources.canAfford(def.cost)) return { ok: false, reason: '资源不足' };

    return { ok: true, reason: '' };
  }

  place(type: string, x: number, y: number, resources: ResourceSystem, tech: TechSystem): boolean {
    const check = this.canPlace(type, x, y, resources, tech);
    if (!check.ok) return false;

    const def = BUILDING_DEFS[type];
    resources.spend(def.cost);
    this.buildings.push({
      type,
      x,
      y,
      level: 1,
      constructionLeft: def.constructionTime,
    });
    this.bus.emit('building:placed', type, x, y);
    return true;
  }

  upgrade(x: number, y: number, resources: ResourceSystem): boolean {
    const b = this.getAt(x, y);
    if (!b) return false;
    const def = BUILDING_DEFS[b.type];
    if (!def || b.level >= def.maxLevel) return false;
    if (b.constructionLeft > 0) return false;

    const cost: Partial<Record<ResourceType, number>> = {};
    for (const [r, amt] of Object.entries(def.cost)) {
      cost[r as ResourceType] = Math.ceil((amt ?? 0) * Math.pow(def.upgradeCostMul, b.level));
    }
    if (!resources.canAfford(cost)) return false;
    resources.spend(cost);

    b.level++;
    b.constructionLeft = Math.ceil(def.constructionTime * 0.5);
    this.bus.emit('building:upgraded', b.type, x, y, b.level);
    return true;
  }

  remove(x: number, y: number): boolean {
    const idx = this.buildings.findIndex(b => b.x === x && b.y === y);
    if (idx < 0) return false;
    const [removed] = this.buildings.splice(idx, 1);
    this.bus.emit('building:removed', removed.type, x, y);
    return true;
  }

  tick() {
    for (const b of this.buildings) {
      if (b.constructionLeft > 0) {
        b.constructionLeft--;
        if (b.constructionLeft === 0) {
          this.bus.emit('building:completed', b.type, b.x, b.y);
        }
      }
    }
  }

  countByType(type: string): number {
    return this.buildings.filter(b => b.type === type && b.constructionLeft === 0).length;
  }

  totalDefense(): number {
    let def = 0;
    for (const b of this.buildings) {
      if (b.constructionLeft > 0) continue;
      const d = BUILDING_DEFS[b.type];
      if (d) def += d.defenseBonus * b.level;
    }
    return def;
  }

  totalHappiness(): number {
    let h = 0;
    for (const b of this.buildings) {
      if (b.constructionLeft > 0) continue;
      const d = BUILDING_DEFS[b.type];
      if (d) h += d.happinessBonus * b.level;
    }
    return h;
  }

  totalPopulationCap(): number {
    let cap = 0;
    for (const b of this.buildings) {
      if (b.constructionLeft > 0) continue;
      const d = BUILDING_DEFS[b.type];
      if (d) cap += d.populationCapacity * b.level;
    }
    return cap;
  }

  serialize() {
    return this.buildings.map(b => ({ ...b }));
  }

  deserialize(data: any[]) {
    this.buildings = data.map(b => ({ ...b }));
  }
}
