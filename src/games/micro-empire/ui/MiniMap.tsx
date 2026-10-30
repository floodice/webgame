import { useRef, useEffect, useMemo } from 'react';
import { MAP_W, MAP_H, TILE_SIZE } from '../utils/constants';
import { TILE_COLORS, type TileType } from '../world/Tile';
import type { Camera } from '../engine/Camera';

interface Props {
  mapData: TileType[][];
  camera: Camera;
  buildings: { x: number; y: number }[];
  onJump: (worldX: number, worldY: number) => void;
}

const MINI_SCALE = 2;
const MINI_W = MAP_W * MINI_SCALE;
const MINI_H = MAP_H * MINI_SCALE;

export default function MiniMap({ mapData, camera, buildings, onJump }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cache terrain as ImageData — only rebuild when map changes (rare)
  const terrainImage = useMemo(() => {
    const offscreen = new OffscreenCanvas(MINI_W, MINI_H);
    const ctx = offscreen.getContext('2d')!;
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        ctx.fillStyle = TILE_COLORS[mapData[y]?.[x] ?? 'grass'];
        ctx.fillRect(x * MINI_SCALE, y * MINI_SCALE, MINI_SCALE, MINI_SCALE);
      }
    }
    return offscreen;
  }, [mapData]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;

    // Draw cached terrain
    ctx.drawImage(terrainImage, 0, 0);

    // Draw buildings
    ctx.fillStyle = '#ffe93e';
    for (const b of buildings) {
      ctx.fillRect(b.x * MINI_SCALE, b.y * MINI_SCALE, MINI_SCALE, MINI_SCALE);
    }

    // Draw viewport rect
    const vx = camera.x / TILE_SIZE * MINI_SCALE;
    const vy = camera.y / TILE_SIZE * MINI_SCALE;
    const vw = camera.viewW / camera.zoom / TILE_SIZE * MINI_SCALE;
    const vh = camera.viewH / camera.zoom / TILE_SIZE * MINI_SCALE;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(vx, vy, vw, vh);
  });

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const worldX = (mx / MINI_SCALE) * TILE_SIZE;
    const worldY = (my / MINI_SCALE) * TILE_SIZE;
    onJump(worldX, worldY);
  };

  return (
    <div style={{
      position: 'absolute',
      right: 8,
      top: 110,
      borderRadius: 8,
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.15)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
      zIndex: 9,
    }}>
      <canvas
        ref={canvasRef}
        width={MINI_W}
        height={MINI_H}
        onClick={handleClick}
        style={{ display: 'block', cursor: 'pointer', width: MINI_W, height: MINI_H }}
      />
    </div>
  );
}
