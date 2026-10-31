import { EventBus } from '../engine/EventBus';
import { ACHIEVEMENT_DEFS } from '../data/achievements';
import { TECH_DEFS } from '../data/technologies';
import type { ResourceSystem } from './ResourceSystem';
import type { BuildingSystem } from './BuildingSystem';
import type { PopulationSystem } from './PopulationSystem';
import type { TechSystem } from './TechSystem';

export class AchievementSystem {
  private unlocked = new Set<string>();
  private victoryCount = 0;

  private bus: EventBus;
  constructor(bus: EventBus) {
    this.bus = bus;
    bus.on('building:placed', () => this.check('first_building', true));
    bus.on('military:victory', () => {
      this.victoryCount++;
      this.check('first_victory', true);
      this.check('victory_5', this.victoryCount >= 5);
    });
    bus.on('trade:executed', () => this.check('first_trade', true));
  }

  private check(id: string, condition: boolean) {
    if (condition && !this.unlocked.has(id)) {
      this.unlocked.add(id);
      this.bus.emit('achievement:unlocked', id);
    }
  }

  tick(
    resources: ResourceSystem,
    buildings: BuildingSystem,
    population: PopulationSystem,
    tech: TechSystem,
    time: { day: number; year: number },
  ) {
    this.check('pop_10', population.total >= 10);
    this.check('pop_50', population.total >= 50);
    this.check('pop_100', population.total >= 100);
    this.check('pop_200', population.total >= 200);
    this.check('gold_500', resources.get('gold') >= 500);
    this.check('gold_2000', resources.get('gold') >= 2000);
    const techSnap = tech.snapshot();
    this.check('tech_5', techSnap.researched.length >= 5);
    this.check('tech_all', techSnap.researched.length >= Object.keys(TECH_DEFS).length);
    const builtCount = buildings.getAll().filter(b => b.constructionLeft === 0).length;
    this.check('buildings_10', builtCount >= 10);
    this.check('buildings_25', builtCount >= 25);
    this.check('buildings_50', builtCount >= 50);
    this.check('survive_year', time.year >= 2);
    this.check('survive_5years', time.year >= 6);
    this.check('survive_10years', time.year >= 11);
    this.check('survive_20years', time.year >= 21);
    this.check('happiness_90', population.happiness >= 90);
    this.check('monument', buildings.getAll().some(b => b.type === 'monument' && b.constructionLeft === 0));
  }

  isUnlocked(id: string): boolean { return this.unlocked.has(id); }
  getUnlocked(): string[] { return [...this.unlocked]; }

  snapshot() {
    return {
      unlocked: [...this.unlocked],
      total: ACHIEVEMENT_DEFS.length,
    };
  }

  serialize() {
    return { unlocked: [...this.unlocked], victoryCount: this.victoryCount };
  }

  deserialize(data: any) {
    if (data.unlocked) this.unlocked = new Set(data.unlocked);
    if (typeof data.victoryCount === 'number') this.victoryCount = data.victoryCount;
  }
}
