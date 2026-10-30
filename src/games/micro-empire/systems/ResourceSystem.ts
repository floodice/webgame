import { EventBus } from '../engine/EventBus';
import { RESOURCE_DEFS, ALL_RESOURCES, type ResourceType } from '../data/resources';
import { BUILDING_DEFS } from '../data/buildings';
import { SEASON_FOOD_MOD, SEASON_WOOD_MOD, TICK_MS } from '../utils/constants';
import type { PlacedBuilding } from './BuildingSystem';
import type { TechSystem } from './TechSystem';

export class ResourceSystem {
  private amounts: Record<ResourceType, number> = {} as any;
  private maxAmounts: Record<ResourceType, number> = {} as any;
  private rates: Record<ResourceType, number> = {} as any;

  private bus: EventBus;
  constructor(bus: EventBus) {
    this.bus = bus;
    for (const r of ALL_RESOURCES) {
      this.amounts[r] = RESOURCE_DEFS[r].startAmount;
      this.maxAmounts[r] = RESOURCE_DEFS[r].maxBase;
      this.rates[r] = 0;
    }
  }

  get(r: ResourceType): number { return this.amounts[r]; }
  getMax(r: ResourceType): number { return this.maxAmounts[r]; }
  getRate(r: ResourceType): number { return this.rates[r]; }

  canAfford(cost: Partial<Record<ResourceType, number>>): boolean {
    for (const [r, amt] of Object.entries(cost)) {
      if ((this.amounts[r as ResourceType] ?? 0) < (amt ?? 0)) return false;
    }
    return true;
  }

  spend(cost: Partial<Record<ResourceType, number>>): boolean {
    if (!this.canAfford(cost)) return false;
    for (const [r, amt] of Object.entries(cost)) {
      this.amounts[r as ResourceType] -= amt ?? 0;
    }
    this.bus.emit('resource:changed');
    return true;
  }

  add(r: ResourceType, amount: number) {
    this.amounts[r] = Math.min(this.maxAmounts[r], this.amounts[r] + amount);
    this.bus.emit('resource:changed');
  }

  remove(r: ResourceType, amount: number) {
    this.amounts[r] = Math.max(0, this.amounts[r] - amount);
    if (this.amounts[r] === 0) this.bus.emit('resource:depleted', r);
    this.bus.emit('resource:changed');
  }

  tick(buildings: PlacedBuilding[], season: number, pop: { happiness: number; workers: Record<string, number> }, tech: TechSystem) {
    const newRates: Record<ResourceType, number> = { food: 0, wood: 0, stone: 0, iron: 0, gold: 0, knowledge: 0 };

    let storageBonus = 0;
    for (const b of buildings) {
      if (b.constructionLeft > 0) continue;
      const def = BUILDING_DEFS[b.type];
      if (!def) continue;

      if (b.type === 'warehouse') {
        storageBonus += 200 * b.level;
        continue;
      }

      const levelMul = 1 + (b.level - 1) * 0.5;
      for (const [r, amt] of Object.entries(def.production)) {
        let prod = (amt ?? 0) * levelMul;
        if (r === 'food') prod *= (SEASON_FOOD_MOD as Record<number, number>)[season] ?? 1;
        if (r === 'wood') prod *= (SEASON_WOOD_MOD as Record<number, number>)[season] ?? 1;
        prod *= tech.getProductionMul(r as ResourceType);
        newRates[r as ResourceType] += prod;
      }

      for (const [r, amt] of Object.entries(def.upkeep)) {
        newRates[r as ResourceType] -= amt ?? 0;
      }
    }

    const happinessMod = Math.max(0.5, Math.min(1.5, 0.5 + pop.happiness / 100));
    for (const r of ALL_RESOURCES) {
      if (newRates[r] > 0) newRates[r] *= happinessMod;
    }

    this.rates = newRates;

    for (const r of ALL_RESOURCES) {
      this.maxAmounts[r] = RESOURCE_DEFS[r].maxBase + storageBonus;
    }

    const ticksPerSec = 1000 / TICK_MS;
    for (const r of ALL_RESOURCES) {
      const tickRate = newRates[r] / ticksPerSec;
      if (tickRate > 0) {
        this.amounts[r] = Math.min(this.maxAmounts[r], this.amounts[r] + tickRate);
      } else if (tickRate < 0) {
        this.amounts[r] = Math.max(0, this.amounts[r] + tickRate);
        if (this.amounts[r] === 0) this.bus.emit('resource:depleted', r);
      }
    }

    this.bus.emit('resource:changed');
  }

  snapshot() {
    const res: Record<string, { amount: number; max: number; rate: number }> = {};
    for (const r of ALL_RESOURCES) {
      res[r] = { amount: Math.floor(this.amounts[r]), max: this.maxAmounts[r], rate: Math.round(this.rates[r] * 10) / 10 };
    }
    return res;
  }

  serialize() {
    return { amounts: { ...this.amounts } };
  }

  deserialize(data: any) {
    if (data.amounts) {
      for (const r of ALL_RESOURCES) {
        if (typeof data.amounts[r] === 'number') this.amounts[r] = data.amounts[r];
      }
    }
  }
}
