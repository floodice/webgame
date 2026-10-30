import { MAP_W, MAP_H } from '../utils/constants';

export class FogOfWar {
  private revealed: boolean[][];

  constructor() {
    this.revealed = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(false));
    const cx = Math.floor(MAP_W / 2);
    const cy = Math.floor(MAP_H / 2);
    this.reveal(cx, cy, 8);
  }

  isRevealed(x: number, y: number): boolean {
    if (x < 0 || x >= MAP_W || y < 0 || y >= MAP_H) return false;
    return this.revealed[y][x];
  }

  reveal(cx: number, cy: number, radius: number) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= radius * radius) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx >= 0 && nx < MAP_W && ny >= 0 && ny < MAP_H) {
            this.revealed[ny][nx] = true;
          }
        }
      }
    }
  }

  revealAll() {
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        this.revealed[y][x] = true;
      }
    }
  }

  raw(): boolean[][] {
    return this.revealed;
  }
}
