import { EventBus } from '../engine/EventBus';
import type { ResourceSystem } from './ResourceSystem';
import type { PlacedBuilding } from './BuildingSystem';
import type { TechSystem } from './TechSystem';
import { BUILDING_DEFS } from '../data/buildings';

export type JobType = 'farmer' | 'worker' | 'scholar' | 'soldier' | 'merchant' | 'idle';
export const ALL_JOBS: JobType[] = ['farmer', 'worker', 'scholar', 'soldier', 'merchant', 'idle'];
export const JOB_LABELS: Record<JobType, string> = {
  farmer: '农民',
  worker: '工人',
  scholar: '学者',
  soldier: '士兵',
  merchant: '商人',
  idle: '闲置',
};

export class PopulationSystem {
  total = 5;
  maxPop = 10;
  happiness = 60;
  workers: Record<JobType, number> = { farmer: 3, worker: 1, scholar: 0, soldier: 0, merchant: 0, idle: 1 };
  private growthAccum = 0;

  private bus: EventBus;
  constructor(bus: EventBus) {
    this.bus = bus;
  }

  tick(resources: ResourceSystem, buildings: PlacedBuilding[], tech?: TechSystem) {
    this.maxPop = 10;
    let buildingHappiness = 0;
    for (const b of buildings) {
      if (b.constructionLeft > 0) continue;
      const def = BUILDING_DEFS[b.type];
      if (!def) continue;
      this.maxPop += def.populationCapacity * b.level;
      buildingHappiness += def.happinessBonus * b.level;
    }

    const techHappiness = tech ? tech.getHappinessBonus() : 0;

    const foodAmount = resources.get('food');
    const foodPerPop = this.total > 0 ? foodAmount / this.total : 100;
    const foodHappiness = Math.min(20, foodPerPop * 2);
    const crowdPenalty = this.total > this.maxPop ? (this.total - this.maxPop) * 3 : 0;

    this.happiness = Math.max(0, Math.min(100,
      30 + foodHappiness + buildingHappiness + techHappiness - crowdPenalty
    ));

    const techGrowth = tech ? tech.getPopGrowthBonus() : 0;
    if (foodPerPop >= 2 && this.total < this.maxPop && this.happiness >= 30) {
      const growthRate = 0.02 * (1 + this.happiness / 100) * (1 + techGrowth);
      this.growthAccum += growthRate;
      if (this.growthAccum >= 1) {
        this.growthAccum -= 1;
        this.total++;
        this.workers.idle++;
        this.bus.emit('population:changed', this.total);
      }
    }

    if (foodAmount <= 0 && this.total > 1) {
      this.growthAccum -= 0.05;
      if (this.growthAccum <= -1) {
        this.growthAccum += 1;
        this.total = Math.max(1, this.total - 1);
        this.rebalanceWorkers();
        this.bus.emit('population:changed', this.total);
      }
    }
  }

  assign(job: JobType, delta: number) {
    if (delta > 0) {
      const avail = this.workers.idle;
      const actual = Math.min(delta, avail);
      if (actual > 0) {
        this.workers.idle -= actual;
        this.workers[job] += actual;
      }
    } else if (delta < 0) {
      const actual = Math.min(-delta, this.workers[job]);
      if (actual > 0) {
        this.workers[job] -= actual;
        this.workers.idle += actual;
      }
    }
  }

  addPopulation(n: number) {
    this.total += n;
    this.workers.idle += n;
    this.bus.emit('population:changed', this.total);
  }

  removePopulation(n: number) {
    this.total = Math.max(1, this.total - n);
    this.rebalanceWorkers();
    this.bus.emit('population:changed', this.total);
  }

  private rebalanceWorkers() {
    let assigned = 0;
    for (const j of ALL_JOBS) {
      if (j === 'idle') continue;
      assigned += this.workers[j];
    }
    if (assigned > this.total) {
      let excess = assigned - this.total;
      for (const j of [...ALL_JOBS].reverse()) {
        if (j === 'idle') continue;
        const remove = Math.min(this.workers[j], excess);
        this.workers[j] -= remove;
        excess -= remove;
        if (excess <= 0) break;
      }
    }
    let usedSlots = 0;
    for (const j of ALL_JOBS) {
      if (j === 'idle') continue;
      usedSlots += this.workers[j];
    }
    this.workers.idle = Math.max(0, this.total - usedSlots);
  }

  snapshot() {
    return {
      total: this.total,
      maxPop: this.maxPop,
      happiness: Math.round(this.happiness),
      workers: { ...this.workers },
    };
  }

  serialize() {
    return { total: this.total, workers: { ...this.workers }, happiness: this.happiness, growthAccum: this.growthAccum };
  }

  deserialize(data: any) {
    if (data.total != null) this.total = data.total;
    if (data.workers) this.workers = { ...this.workers, ...data.workers };
    if (data.happiness != null) this.happiness = data.happiness;
    if (data.growthAccum != null) this.growthAccum = data.growthAccum;
  }
}
