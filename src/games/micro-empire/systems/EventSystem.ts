import { EventBus } from '../engine/EventBus';
import { EVENT_DEFS, type GameEventDef, type EventEffect } from '../data/events';
import type { ResourceSystem } from './ResourceSystem';
import type { PopulationSystem } from './PopulationSystem';
import type { BuildingSystem } from './BuildingSystem';

export interface ActiveEvent {
  def: GameEventDef;
  resolved: boolean;
}

export class EventSystem {
  private activeEvent: ActiveEvent | null = null;
  private cooldown = 0;

  private bus: EventBus;
  constructor(bus: EventBus) {
    this.bus = bus;
  }

  getActiveEvent(): ActiveEvent | null {
    return this.activeEvent;
  }

  tick(
    time: { day: number; season: number; year: number },
    _resources: ResourceSystem,
    population: PopulationSystem,
    _buildings: BuildingSystem,
  ) {
    if (this.activeEvent && !this.activeEvent.resolved) return;

    if (this.cooldown > 0) {
      this.cooldown--;
      return;
    }

    const ctx = { season: time.season, population: population.total, year: time.year };

    for (const evt of EVENT_DEFS) {
      if (time.day < evt.minDay) continue;
      if (evt.condition && !evt.condition(ctx)) continue;
      if (Math.random() < evt.probability) {
        this.activeEvent = { def: evt, resolved: false };
        this.cooldown = 150 + Math.floor(Math.random() * 100);
        this.bus.emit('event:triggered', evt.id);
        return;
      }
    }
  }

  resolve(choiceIndex: number, resources: ResourceSystem, population: PopulationSystem) {
    if (!this.activeEvent || this.activeEvent.resolved) return;
    const choice = this.activeEvent.def.choices[choiceIndex];
    if (!choice) return;

    for (const eff of choice.effects) {
      this.applyEffect(eff, resources, population);
    }

    this.activeEvent.resolved = true;
    this.bus.emit('event:resolved', this.activeEvent.def.id, choiceIndex);
    this.activeEvent = null;
  }

  private applyEffect(eff: EventEffect, resources: ResourceSystem, population: PopulationSystem) {
    switch (eff.type) {
      case 'resource':
        if (eff.target) {
          if (eff.value >= 0) resources.add(eff.target as any, eff.value);
          else resources.remove(eff.target as any, -eff.value);
        }
        break;
      case 'population':
        if (eff.value >= 0) population.addPopulation(eff.value);
        else population.removePopulation(-eff.value);
        break;
      case 'happiness':
        population.happiness = Math.max(0, Math.min(100, population.happiness + eff.value));
        break;
    }
  }
}
