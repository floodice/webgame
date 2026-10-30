import { EventBus } from '../engine/EventBus';
import type { ResourceSystem } from './ResourceSystem';
import type { PopulationSystem } from './PopulationSystem';
import type { BuildingSystem } from './BuildingSystem';
import type { TechSystem } from './TechSystem';

export interface InvasionRecord {
  day: number;
  strength: number;
  defense: number;
  won: boolean;
}

export class MilitarySystem {
  private nextInvasion = 300;
  private invasionHistory: InvasionRecord[] = [];
  private lastResult: InvasionRecord | null = null;

  private bus: EventBus;
  constructor(bus: EventBus) {
    this.bus = bus;
  }

  tick(
    time: { day: number; season: number },
    resources: ResourceSystem,
    population: PopulationSystem,
    buildings: BuildingSystem,
    tech?: TechSystem,
  ) {
    this.nextInvasion--;
    if (this.nextInvasion > 0) return;

    const yearFactor = Math.floor(time.day / 240) + 1;
    const scaleFactor = 1 + yearFactor * 0.15;
    const strength = Math.floor((10 + yearFactor * 10 + Math.floor(Math.random() * yearFactor * 6)) * scaleFactor);
    const techDefense = tech ? tech.getDefenseBonus() : 0;
    const defense = buildings.totalDefense() + population.workers.soldier * 3 + techDefense;

    const won = defense >= strength;
    const record: InvasionRecord = { day: time.day, strength, defense, won };
    this.invasionHistory.push(record);
    this.lastResult = record;

    if (won) {
      const loot = Math.floor(strength * 0.5);
      resources.add('gold', loot);
      this.bus.emit('military:victory', record);
    } else {
      const deficit = strength - defense;
      const foodLoss = Math.floor(deficit * 2);
      const goldLoss = Math.floor(deficit * 1.5);
      const popLoss = Math.max(1, Math.floor(deficit / 10));
      resources.remove('food', foodLoss);
      resources.remove('gold', goldLoss);
      population.removePopulation(popLoss);
      population.happiness = Math.max(0, population.happiness - 10);
      this.bus.emit('military:defeat', record);
    }

    this.nextInvasion = 180 + Math.floor(Math.random() * 120);
    if (time.season === 1) this.nextInvasion = Math.floor(this.nextInvasion * 0.7);
  }

  getLastResult(): InvasionRecord | null { return this.lastResult; }
  getHistory(): InvasionRecord[] { return this.invasionHistory; }
  getNextInvasion(): number { return this.nextInvasion; }

  snapshot() {
    return {
      nextInvasion: this.nextInvasion,
      lastResult: this.lastResult,
      totalBattles: this.invasionHistory.length,
      totalWins: this.invasionHistory.filter(r => r.won).length,
    };
  }

  serialize() {
    return {
      nextInvasion: this.nextInvasion,
      invasionHistory: this.invasionHistory,
    };
  }

  deserialize(data: any) {
    if (data.nextInvasion != null) this.nextInvasion = data.nextInvasion;
    if (data.invasionHistory) {
      this.invasionHistory = data.invasionHistory;
      this.lastResult = this.invasionHistory.length > 0 ? this.invasionHistory[this.invasionHistory.length - 1] : null;
    }
  }
}
