import { EventBus } from '../engine/EventBus';
import { TECH_DEFS, type TechEffect } from '../data/technologies';
import type { ResourceType } from '../data/resources';
import type { ResourceSystem } from './ResourceSystem';

export class TechSystem {
  private researched = new Set<string>();
  private currentResearch: string | null = null;
  private researchProgress = 0;

  private bus: EventBus;
  constructor(bus: EventBus) {
    this.bus = bus;
  }

  isResearched(id: string): boolean { return this.researched.has(id); }
  getCurrent(): string | null { return this.currentResearch; }
  getProgress(): number { return this.researchProgress; }

  canResearch(id: string): { ok: boolean; reason: string } {
    const def = TECH_DEFS[id];
    if (!def) return { ok: false, reason: '未知科技' };
    if (this.researched.has(id)) return { ok: false, reason: '已研究' };
    if (this.currentResearch) return { ok: false, reason: '正在研究其他科技' };
    for (const pre of def.prerequisites) {
      if (!this.researched.has(pre)) return { ok: false, reason: `需要先研究: ${TECH_DEFS[pre]?.label ?? pre}` };
    }
    return { ok: true, reason: '' };
  }

  startResearch(id: string, resources: ResourceSystem): boolean {
    const check = this.canResearch(id);
    if (!check.ok) return false;
    const def = TECH_DEFS[id];
    if (!resources.canAfford(def.cost)) return false;
    resources.spend(def.cost);
    this.currentResearch = id;
    this.researchProgress = 0;
    return true;
  }

  tick() {
    if (!this.currentResearch) return;
    const def = TECH_DEFS[this.currentResearch];
    if (!def) return;
    this.researchProgress++;
    if (this.researchProgress >= def.researchTime) {
      this.researched.add(this.currentResearch);
      this.bus.emit('tech:researched', this.currentResearch);
      this.currentResearch = null;
      this.researchProgress = 0;
    }
  }

  getProductionMul(resource: ResourceType): number {
    let mul = 1;
    for (const id of this.researched) {
      const def = TECH_DEFS[id];
      if (!def) continue;
      for (const eff of def.effects) {
        if (eff.type === 'production_mul' && eff.target === resource) {
          mul *= eff.value;
        }
      }
    }
    return mul;
  }

  getDefenseBonus(): number {
    let bonus = 0;
    for (const id of this.researched) {
      const def = TECH_DEFS[id];
      if (!def) continue;
      for (const eff of def.effects) {
        if (eff.type === 'defense') bonus += eff.value;
      }
    }
    return bonus;
  }

  getHappinessBonus(): number {
    let bonus = 0;
    for (const id of this.researched) {
      const def = TECH_DEFS[id];
      if (!def) continue;
      for (const eff of def.effects) {
        if (eff.type === 'happiness') bonus += eff.value;
      }
    }
    return bonus;
  }

  getTradeBonus(): number {
    let bonus = 0;
    for (const id of this.researched) {
      const def = TECH_DEFS[id];
      if (!def) continue;
      for (const eff of def.effects) {
        if (eff.type === 'trade_bonus') bonus += eff.value;
      }
    }
    return bonus;
  }

  getPopGrowthBonus(): number {
    let bonus = 0;
    for (const id of this.researched) {
      const def = TECH_DEFS[id];
      if (!def) continue;
      for (const eff of def.effects) {
        if (eff.type === 'pop_growth') bonus += eff.value;
      }
    }
    return bonus;
  }

  getAllEffects(): TechEffect[] {
    const effects: TechEffect[] = [];
    for (const id of this.researched) {
      const def = TECH_DEFS[id];
      if (def) effects.push(...def.effects);
    }
    return effects;
  }

  snapshot() {
    return {
      researched: [...this.researched],
      currentResearch: this.currentResearch,
      researchProgress: this.researchProgress,
      researchTotal: this.currentResearch ? TECH_DEFS[this.currentResearch]?.researchTime ?? 0 : 0,
    };
  }

  serialize() {
    return {
      researched: [...this.researched],
      currentResearch: this.currentResearch,
      researchProgress: this.researchProgress,
    };
  }

  deserialize(data: any) {
    if (data.researched) this.researched = new Set(data.researched);
    if (data.currentResearch != null) this.currentResearch = data.currentResearch;
    if (data.researchProgress != null) this.researchProgress = data.researchProgress;
  }
}
