import { EventBus } from '../engine/EventBus';
import type { ResourceType } from '../data/resources';
import type { ResourceSystem } from './ResourceSystem';

export interface TradeOffer {
  sellResource: ResourceType;
  sellAmount: number;
  buyResource: ResourceType;
  buyAmount: number;
}

export class TradeSystem {
  private offers: TradeOffer[] = [];
  private available = false;
  private nextVisit = 120;
  private visitDuration = 0;

  private bus: EventBus;
  constructor(bus: EventBus) {
    this.bus = bus;
  }

  isAvailable(): boolean { return this.available; }
  getOffers(): TradeOffer[] { return this.offers; }

  tick(time: { day: number; season: number }) {
    if (this.available) {
      this.visitDuration--;
      if (this.visitDuration <= 0) {
        this.available = false;
        this.offers = [];
        this.nextVisit = 90 + Math.floor(Math.random() * 60);
      }
      return;
    }

    this.nextVisit--;
    if (this.nextVisit <= 0) {
      this.generateOffers(time.season);
      this.available = true;
      this.visitDuration = 30 + Math.floor(Math.random() * 20);
      this.bus.emit('trade:merchant_arrived');
    }
  }

  private generateOffers(season: number) {
    this.offers = [];
    const tradeable: ResourceType[] = ['food', 'wood', 'stone', 'iron', 'gold'];
    const numOffers = 3 + Math.floor(Math.random() * 2);

    for (let i = 0; i < numOffers; i++) {
      const sell = tradeable[Math.floor(Math.random() * tradeable.length)];
      let buy: ResourceType;
      do {
        buy = tradeable[Math.floor(Math.random() * tradeable.length)];
      } while (buy === sell);

      const baseRate = this.getBaseRate(sell, buy);
      const seasonMod = season === 2 ? 0.85 : season === 3 ? 1.15 : 1.0;
      const randMod = 0.8 + Math.random() * 0.4;

      const sellAmount = Math.floor((15 + Math.random() * 25) * randMod);
      const buyAmount = Math.ceil(sellAmount * baseRate * seasonMod);

      this.offers.push({ sellResource: sell, sellAmount, buyResource: buy, buyAmount });
    }
  }

  private getBaseRate(sell: ResourceType, buy: ResourceType): number {
    const values: Record<ResourceType, number> = {
      food: 1, wood: 1.2, stone: 1.5, iron: 2.5, gold: 3, knowledge: 4,
    };
    return values[buy] / values[sell];
  }

  executeTrade(offerIndex: number, resources: ResourceSystem): boolean {
    if (!this.available || offerIndex < 0 || offerIndex >= this.offers.length) return false;
    const offer = this.offers[offerIndex];
    if (resources.get(offer.sellResource) < offer.sellAmount) return false;

    resources.remove(offer.sellResource, offer.sellAmount);
    resources.add(offer.buyResource, offer.buyAmount);
    this.offers.splice(offerIndex, 1);
    this.bus.emit('trade:executed');
    return true;
  }
}
