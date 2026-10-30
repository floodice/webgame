import { Camera } from './Camera';
import { TILE_SIZE, MAP_W, MAP_H } from '../utils/constants';
import type { TileType } from '../world/Tile';
import { TILE_COLORS, TILE_DETAIL_COLORS } from '../world/Tile';
import type { GameMap } from '../world/GameMap';
import type { PlacedBuilding } from '../systems/BuildingSystem';
import { BUILDING_DEFS } from '../data/buildings';

export class Renderer {
  private terrainCanvas: OffscreenCanvas;
  private terrainCtx: OffscreenCanvasRenderingContext2D;
  private terrainDirty = true;
  private buildingCanvas: OffscreenCanvas;
  private buildingCtx: OffscreenCanvasRenderingContext2D;
  private buildingDirty = true;

  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.terrainCanvas = new OffscreenCanvas(MAP_W * TILE_SIZE, MAP_H * TILE_SIZE);
    this.terrainCtx = this.terrainCanvas.getContext('2d')!;
    this.buildingCanvas = new OffscreenCanvas(MAP_W * TILE_SIZE, MAP_H * TILE_SIZE);
    this.buildingCtx = this.buildingCanvas.getContext('2d')!;
  }

  markTerrainDirty() { this.terrainDirty = true; }
  markBuildingDirty() { this.buildingDirty = true; }

  private renderTerrainLayer(map: GameMap) {
    const ctx = this.terrainCtx;
    ctx.clearRect(0, 0, MAP_W * TILE_SIZE, MAP_H * TILE_SIZE);
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const tile = map.get(x, y);
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
        ctx.fillStyle = TILE_COLORS[tile];
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        this.drawTileDetail(ctx, tile, px, py, x, y);
      }
    }
    this.terrainDirty = false;
  }

  private drawTileDetail(ctx: OffscreenCanvasRenderingContext2D, tile: TileType, px: number, py: number, tx: number, ty: number) {
    const detail = TILE_DETAIL_COLORS[tile];
    if (!detail) return;
    const seed = (tx * 7 + ty * 13) % 17;
    ctx.fillStyle = detail;
    switch (tile) {
      case 'forest': {
        const cx = px + 8 + (seed % 5) * 3;
        const cy = py + 6 + (seed % 3) * 4;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - 5, cy + 10);
        ctx.lineTo(cx + 5, cy + 10);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx, cy + 3);
        ctx.lineTo(cx - 6, cy + 14);
        ctx.lineTo(cx + 6, cy + 14);
        ctx.fill();
        ctx.fillStyle = '#5d3a1a';
        ctx.fillRect(cx - 1, cy + 14, 3, 5);
        break;
      }
      case 'mountain': {
        const cx = px + 16;
        const cy = py + 4 + (seed % 4);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - 12, py + 28);
        ctx.lineTo(cx + 12, py + 28);
        ctx.fill();
        ctx.fillStyle = '#e8e8e8';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - 4, cy + 8);
        ctx.lineTo(cx + 4, cy + 8);
        ctx.fill();
        break;
      }
      case 'water': {
        ctx.globalAlpha = 0.3;
        const wy = py + 10 + (seed % 3) * 6;
        ctx.fillRect(px + 4, wy, 12, 2);
        ctx.fillRect(px + 18, wy + 4, 10, 2);
        ctx.globalAlpha = 1;
        break;
      }
      case 'desert': {
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(px + 10 + seed % 8, py + 14 + seed % 6, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        break;
      }
      case 'swamp': {
        ctx.globalAlpha = 0.4;
        ctx.fillRect(px + 6, py + 20, 8, 3);
        ctx.fillRect(px + 18, py + 12, 6, 3);
        ctx.globalAlpha = 1;
        break;
      }
      case 'snow': {
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(px + 8 + seed % 10, py + 8 + seed % 10, 2, 0, Math.PI * 2);
        ctx.arc(px + 20 + seed % 6, py + 18 + seed % 6, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        break;
      }
    }
  }

  private renderBuildingLayer(buildings: PlacedBuilding[], _now: number) {
    const ctx = this.buildingCtx;
    ctx.clearRect(0, 0, MAP_W * TILE_SIZE, MAP_H * TILE_SIZE);
    for (const b of buildings) {
      const def = BUILDING_DEFS[b.type];
      if (!def) continue;
      const px = b.x * TILE_SIZE;
      const py = b.y * TILE_SIZE;
      const sz = TILE_SIZE;

      if (b.constructionLeft > 0) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#888';
        ctx.fillRect(px + 2, py + 2, sz - 4, sz - 4);
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ff0';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('...', px + sz / 2, py + sz / 2 + 3);
        continue;
      }

      ctx.fillStyle = def.color;
      ctx.fillRect(px + 2, py + 2, sz - 4, sz - 4);

      ctx.fillStyle = def.roofColor ?? '#6b4226';
      this.drawBuildingIcon(ctx, def.icon, px, py, sz);

      if (b.level > 1) {
        ctx.fillStyle = '#ffe93e';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`★${b.level}`, px + sz - 3, py + sz - 3);
      }
    }
    this.buildingDirty = false;
  }

  private drawBuildingIcon(ctx: OffscreenCanvasRenderingContext2D, icon: string, px: number, py: number, sz: number) {
    ctx.font = '18px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, px + sz / 2, py + sz / 2);
    ctx.textBaseline = 'alphabetic';
  }

  render(camera: Camera, map: GameMap, buildings: PlacedBuilding[], now: number, hoverTile: { x: number; y: number } | null, selectedTile: { x: number; y: number } | null, placingBuilding: string | null, season: number) {
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, width, height);

    this.drawSeasonBackground(ctx, width, height, season);

    if (this.terrainDirty) this.renderTerrainLayer(map);
    if (this.buildingDirty) this.renderBuildingLayer(buildings, now);

    ctx.save();
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    ctx.drawImage(this.terrainCanvas, 0, 0);

    this.drawGrid(ctx, camera);

    ctx.drawImage(this.buildingCanvas, 0, 0);

    if (hoverTile) {
      const hx = hoverTile.x * TILE_SIZE;
      const hy = hoverTile.y * TILE_SIZE;
      if (placingBuilding) {
        const def = BUILDING_DEFS[placingBuilding];
        if (def) {
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = def.color;
          ctx.fillRect(hx + 2, hy + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          ctx.globalAlpha = 1;
          ctx.font = '18px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(def.icon, hx + TILE_SIZE / 2, hy + TILE_SIZE / 2);
          ctx.textBaseline = 'alphabetic';
        }
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(hx + 0.5, hy + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
    }

    if (selectedTile) {
      const sx = selectedTile.x * TILE_SIZE;
      const sy = selectedTile.y * TILE_SIZE;
      ctx.strokeStyle = '#ffe93e';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(sx + 1, sy + 1, TILE_SIZE - 2, TILE_SIZE - 2);
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  private drawSeasonBackground(ctx: CanvasRenderingContext2D, w: number, h: number, season: number) {
    const colors: Record<number, string[]> = {
      0: ['#1a3a1a', '#0d1f0d'],
      1: ['#1a2a10', '#0f1a08'],
      2: ['#2a1a08', '#1a1005'],
      3: ['#0d1a2a', '#080f1a'],
    };
    const [c1, c2] = colors[season] ?? colors[0];
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  private drawGrid(ctx: CanvasRenderingContext2D, camera: Camera) {
    if (camera.zoom < 0.7) return;
    ctx.strokeStyle = `rgba(255,255,255,${0.04 * Math.min(1, (camera.zoom - 0.7) / 0.3)})`;
    ctx.lineWidth = 0.5;

    const { wx: startWx, wy: startWy } = camera.screenToWorld(0, 0);
    const { wx: endWx, wy: endWy } = camera.screenToWorld(camera.viewW, camera.viewH);
    const sx = Math.max(0, Math.floor(startWx / TILE_SIZE));
    const sy = Math.max(0, Math.floor(startWy / TILE_SIZE));
    const ex = Math.min(MAP_W, Math.ceil(endWx / TILE_SIZE));
    const ey = Math.min(MAP_H, Math.ceil(endWy / TILE_SIZE));

    ctx.beginPath();
    for (let x = sx; x <= ex; x++) {
      ctx.moveTo(x * TILE_SIZE, sy * TILE_SIZE);
      ctx.lineTo(x * TILE_SIZE, ey * TILE_SIZE);
    }
    for (let y = sy; y <= ey; y++) {
      ctx.moveTo(sx * TILE_SIZE, y * TILE_SIZE);
      ctx.lineTo(ex * TILE_SIZE, y * TILE_SIZE);
    }
    ctx.stroke();
  }
}
