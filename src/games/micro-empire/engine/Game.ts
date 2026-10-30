import { Camera } from './Camera';
import { EventBus } from './EventBus';
import { InputManager } from './InputManager';
import { Renderer } from './Renderer';
import { GameMap } from '../world/GameMap';
import { MapGenerator } from '../world/MapGenerator';
import { ResourceSystem } from '../systems/ResourceSystem';
import { BuildingSystem, type PlacedBuilding } from '../systems/BuildingSystem';
import { PopulationSystem } from '../systems/PopulationSystem';
import { TimeSystem } from '../systems/TimeSystem';
import { TechSystem } from '../systems/TechSystem';
import { EventSystem } from '../systems/EventSystem';
import { TradeSystem } from '../systems/TradeSystem';
import { MilitarySystem } from '../systems/MilitarySystem';
import { AchievementSystem } from '../systems/AchievementSystem';
import { BUILDING_DEFS } from '../data/buildings';
import { TILE_SIZE, MAP_W, MAP_H, WORLD_PX_W, WORLD_PX_H } from '../utils/constants';
import { loadSettings, type GameSettings } from '../utils/settings';
import type { TileType } from '../world/Tile';

export interface GameSnapshot {
  resources: ReturnType<ResourceSystem['snapshot']>;
  buildings: PlacedBuilding[];
  population: ReturnType<PopulationSystem['snapshot']>;
  time: ReturnType<TimeSystem['snapshot']>;
  tech: ReturnType<TechSystem['snapshot']>;
  military: ReturnType<MilitarySystem['snapshot']>;
  achievements: ReturnType<AchievementSystem['snapshot']>;
  map: TileType[][];
  selectedTile: { x: number; y: number } | null;
  hoverTile: { x: number; y: number } | null;
  placingBuilding: string | null;
  paused: boolean;
  speed: number;
  activeEvent: ReturnType<EventSystem['getActiveEvent']>;
  tradeOffers: ReturnType<TradeSystem['getOffers']>;
  tradeAvailable: boolean;
  victory: boolean;
}

export type GameUpdateCallback = (snap: GameSnapshot) => void;

export class Game {
  readonly bus = new EventBus();
  readonly camera: Camera;
  readonly map: GameMap;
  readonly resources: ResourceSystem;
  readonly buildings: BuildingSystem;
  readonly population: PopulationSystem;
  readonly time: TimeSystem;
  readonly tech: TechSystem;
  readonly events: EventSystem;
  readonly trade: TradeSystem;
  readonly military: MilitarySystem;
  readonly achievements: AchievementSystem;

  private renderer!: Renderer;
  private input!: InputManager;
  private rafId = 0;
  private lastTime = 0;
  private accumulator = 0;
  private running = false;
  tickMs: number;

  selectedTile: { x: number; y: number } | null = null;
  hoverTile: { x: number; y: number } | null = null;
  placingBuilding: string | null = null;
  paused = false;
  speed = 1;

  private onUpdate: GameUpdateCallback = () => {};

  constructor() {
    const settings = loadSettings();
    this.tickMs = settings.tickSpeed;
    this.camera = new Camera(800, 600, WORLD_PX_W, WORLD_PX_H);
    this.map = MapGenerator.generate(MAP_W, MAP_H);
    this.resources = new ResourceSystem(this.bus);
    this.buildings = new BuildingSystem(this.bus, this.map);
    this.population = new PopulationSystem(this.bus);
    this.time = new TimeSystem(this.bus);
    this.tech = new TechSystem(this.bus);
    this.events = new EventSystem(this.bus);
    this.trade = new TradeSystem(this.bus);
    this.military = new MilitarySystem(this.bus);
    this.achievements = new AchievementSystem(this.bus);

    this.camera.moveTo(WORLD_PX_W / 2, WORLD_PX_H / 2);

    this.bus.on('click', (wx: number, wy: number) => {
      const tx = Math.floor(wx / TILE_SIZE);
      const ty = Math.floor(wy / TILE_SIZE);
      if (tx < 0 || tx >= MAP_W || ty < 0 || ty >= MAP_H) return;

      if (this.placingBuilding) {
        const check = this.buildings.canPlace(this.placingBuilding, tx, ty, this.resources, this.tech);
        if (check.ok) {
          this.buildings.place(this.placingBuilding, tx, ty, this.resources, this.tech);
          this.renderer.markBuildingDirty();
          this.emitSnapshot();
        } else {
          this.bus.emit('building:placeFail', check.reason);
        }
        return;
      }
      this.selectedTile = { x: tx, y: ty };
      this.emitSnapshot();
    });

    this.bus.on('rightclick', () => {
      if (this.placingBuilding) {
        this.placingBuilding = null;
        this.emitSnapshot();
      } else if (this.selectedTile) {
        this.selectedTile = null;
        this.emitSnapshot();
      }
    });

    this.bus.on('mouse:move', (sx: number, sy: number) => {
      const { wx, wy } = this.camera.screenToWorld(sx, sy);
      const tx = Math.floor(wx / TILE_SIZE);
      const ty = Math.floor(wy / TILE_SIZE);
      if (tx >= 0 && tx < MAP_W && ty >= 0 && ty < MAP_H) {
        this.hoverTile = { x: tx, y: ty };
      } else {
        this.hoverTile = null;
      }
    });

    this.bus.on('building:placed', () => this.renderer?.markBuildingDirty());
    this.bus.on('building:completed', () => this.renderer?.markBuildingDirty());
    this.bus.on('building:upgraded', () => this.renderer?.markBuildingDirty());
    this.bus.on('building:removed', () => this.renderer?.markBuildingDirty());
  }

  setOnUpdate(cb: GameUpdateCallback) {
    this.onUpdate = cb;
  }

  private emitSnapshot() {
    this.onUpdate(this.snapshot());
  }

  snapshot(): GameSnapshot {
    return {
      resources: this.resources.snapshot(),
      buildings: this.buildings.getAll(),
      population: this.population.snapshot(),
      time: this.time.snapshot(),
      tech: this.tech.snapshot(),
      military: this.military.snapshot(),
      achievements: this.achievements.snapshot(),
      map: this.map.raw(),
      selectedTile: this.selectedTile,
      hoverTile: this.hoverTile,
      placingBuilding: this.placingBuilding,
      paused: this.paused,
      speed: this.speed,
      activeEvent: this.events.getActiveEvent(),
      tradeOffers: this.trade.getOffers(),
      tradeAvailable: this.trade.isAvailable(),
      victory: this.buildings.getAll().some(b => b.type === 'monument' && b.constructionLeft === 0),
    };
  }

  attachCanvas(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')!;
    this.renderer = new Renderer(ctx, canvas);
    this.input = new InputManager(canvas, this.camera, this.bus);
    this.camera.setViewSize(canvas.width, canvas.height);
  }

  resizeCanvas(w: number, h: number) {
    this.camera.setViewSize(w, h);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
    this.emitSnapshot();
  }

  stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  private loop = (now: number) => {
    if (!this.running) return;
    const dt = now - this.lastTime;
    this.lastTime = now;

    this.input.updateKeyboard(6);
    this.camera.update(dt);

    if (!this.paused) {
      this.accumulator += dt * this.speed;
      let ticked = false;
      while (this.accumulator >= this.tickMs) {
        this.accumulator -= this.tickMs;
        this.tick();
        ticked = true;
      }
      if (ticked) this.emitSnapshot();
    }

    let hoverCanPlace = false;
    if (this.placingBuilding && this.hoverTile) {
      const chk = this.buildings.canPlace(this.placingBuilding, this.hoverTile.x, this.hoverTile.y, this.resources, this.tech);
      hoverCanPlace = chk.ok;
    }

    this.renderer.render(
      this.camera,
      this.map,
      this.buildings.getAll(),
      now,
      this.hoverTile,
      this.selectedTile,
      this.placingBuilding,
      this.time.snapshot().season,
      hoverCanPlace,
    );

    this.rafId = requestAnimationFrame(this.loop);
  };

  private tick() {
    this.time.tick();
    const timeSn = this.time.snapshot();
    this.tech.tick();
    this.resources.tick(this.buildings.getAll(), timeSn.season, this.population.snapshot(), this.tech);
    this.population.tick(this.resources, this.buildings.getAll(), this.tech);
    this.buildings.tick(this.population.workers.worker);
    this.events.tick(timeSn, this.resources, this.population, this.buildings);
    if (this.events.getActiveEvent() && !this.events.getActiveEvent()!.resolved) {
      this.paused = true;
    }
    this.trade.setTradeBonus(this.tech.getTradeBonus());
    this.trade.tick(timeSn);
    this.military.tick(timeSn, this.resources, this.population, this.buildings, this.tech);
    this.achievements.tick(this.resources, this.buildings, this.population, this.tech, timeSn);
  }

  setPlacingBuilding(type: string | null) {
    this.placingBuilding = type;
    this.emitSnapshot();
  }

  togglePause() {
    this.paused = !this.paused;
    this.emitSnapshot();
  }

  setSpeed(s: number) {
    this.speed = Math.max(0, Math.min(3, s));
    this.emitSnapshot();
  }

  upgradeBuilding(bx: number, by: number) {
    const ok = this.buildings.upgrade(bx, by, this.resources);
    if (!ok) {
      const b = this.buildings.getAt(bx, by);
      if (b) {
        const def = BUILDING_DEFS[b.type];
        if (def && b.level >= def.maxLevel) {
          this.bus.emit('building:placeFail', '已达最高等级');
        } else if (b.constructionLeft > 0) {
          this.bus.emit('building:placeFail', '建筑尚在建造中');
        } else {
          this.bus.emit('building:placeFail', '升级资源不足');
        }
      }
    }
    this.renderer.markBuildingDirty();
    this.emitSnapshot();
  }

  removeBuilding(bx: number, by: number) {
    this.buildings.remove(bx, by, this.resources);
    this.renderer.markBuildingDirty();
    this.emitSnapshot();
  }

  applySettings(s: GameSettings) {
    this.tickMs = s.tickSpeed;
    if (this.renderer) {
      this.renderer.showGrid = s.showGrid;
    }
  }

  resolveEvent(choiceIndex: number) {
    this.events.resolve(choiceIndex, this.resources, this.population, this.buildings);
    this.paused = false;
    this.emitSnapshot();
  }

  executeTrade(offerIndex: number) {
    this.trade.executeTrade(offerIndex, this.resources);
    this.emitSnapshot();
  }

  researchTech(techId: string) {
    this.tech.startResearch(techId, this.resources);
    this.emitSnapshot();
  }

  assignWorkers(job: string, count: number) {
    this.population.assign(job as any, count);
    this.emitSnapshot();
  }

  dispose() {
    this.stop();
    this.input?.dispose();
    this.bus.clear();
  }

  serialize(): string {
    return JSON.stringify({
      map: this.map.raw(),
      resources: this.resources.serialize(),
      buildings: this.buildings.serialize(),
      population: this.population.serialize(),
      time: this.time.serialize(),
      tech: this.tech.serialize(),
      achievements: this.achievements.serialize(),
      military: this.military.serialize(),
      events: this.events.serialize(),
      trade: this.trade.serialize(),
    });
  }

  deserialize(json: string) {
    try {
      const d = JSON.parse(json);
      if (d.map) this.map.load(d.map);
      if (d.resources) this.resources.deserialize(d.resources);
      if (d.buildings) this.buildings.deserialize(d.buildings);
      if (d.population) this.population.deserialize(d.population);
      if (d.time) this.time.deserialize(d.time);
      if (d.tech) this.tech.deserialize(d.tech);
      if (d.achievements) this.achievements.deserialize(d.achievements);
      if (d.military) this.military.deserialize(d.military);
      if (d.events) this.events.deserialize(d.events);
      if (d.trade) this.trade.deserialize(d.trade);
      this.renderer?.markTerrainDirty();
      this.renderer?.markBuildingDirty();
      this.emitSnapshot();
    } catch (e) {
      console.error('Failed to deserialize game state:', e);
    }
  }
}
