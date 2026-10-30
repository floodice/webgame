import { EventBus } from '../engine/EventBus';
import { SEASON_DAYS, Season } from '../utils/constants';

export class TimeSystem {
  day = 1;
  season: Season = Season.Spring;
  year = 1;
  private lastSeason: Season = Season.Spring;

  private bus: EventBus;
  constructor(bus: EventBus) {
    this.bus = bus;
  }

  tick() {
    this.day++;
    const totalDays = (this.year - 1) * SEASON_DAYS * 4 + this.seasonIndex() * SEASON_DAYS + this.dayInSeason();
    this.year = Math.floor(totalDays / (SEASON_DAYS * 4)) + 1;
    const dayInYear = totalDays % (SEASON_DAYS * 4);
    this.season = Math.floor(dayInYear / SEASON_DAYS) as Season;

    if (this.season !== this.lastSeason) {
      this.bus.emit('season:changed', this.season, this.lastSeason);
      this.lastSeason = this.season;
    }
  }

  dayInSeason(): number {
    return ((this.day - 1) % SEASON_DAYS) + 1;
  }

  private seasonIndex(): number {
    return this.season as number;
  }

  snapshot() {
    return {
      day: this.day,
      dayInSeason: this.dayInSeason(),
      season: this.season as number,
      year: this.year,
      seasonProgress: this.dayInSeason() / SEASON_DAYS,
    };
  }

  serialize() {
    return { day: this.day };
  }

  deserialize(data: any) {
    if (typeof data.day === 'number') {
      this.day = data.day;
      const totalDays = this.day - 1;
      this.year = Math.floor(totalDays / (SEASON_DAYS * 4)) + 1;
      const dayInYear = totalDays % (SEASON_DAYS * 4);
      this.season = Math.floor(dayInYear / SEASON_DAYS) as Season;
      this.lastSeason = this.season;
    }
  }
}
