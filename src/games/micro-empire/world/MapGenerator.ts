import { GameMap } from './GameMap';
import type { TileType } from './Tile';
import { SimplexNoise } from '../utils/noise';

export class MapGenerator {
  static generate(w: number, h: number, seed?: number): GameMap {
    const s = seed ?? (Date.now() % 100000);
    const heightNoise = new SimplexNoise(s);
    const moistNoise = new SimplexNoise(s + 1000);
    const tempNoise = new SimplexNoise(s + 2000);

    const map = new GameMap(w, h);
    const cx = w / 2;
    const cy = h / 2;
    const maxDist = Math.hypot(cx, cy);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const nx = x / w;
        const ny = y / h;

        const elev = heightNoise.fbm(nx * 4, ny * 4, 5) * 0.5 + 0.5;
        const moist = moistNoise.fbm(nx * 3 + 10, ny * 3 + 10, 4) * 0.5 + 0.5;
        const temp = tempNoise.fbm(nx * 2 + 20, ny * 2 + 20, 3) * 0.5 + 0.5;

        const dist = Math.hypot(x - cx, y - cy) / maxDist;
        const edgeFalloff = Math.max(0, 1 - dist * 1.4);
        const adj = elev * edgeFalloff;

        map.set(x, y, MapGenerator.classify(adj, moist, temp));
      }
    }

    MapGenerator.ensureStartArea(map, cx, cy);
    return map;
  }

  private static classify(elev: number, moist: number, temp: number): TileType {
    if (elev < 0.22) return 'water';
    if (elev > 0.72) return 'mountain';
    if (temp < 0.25 && elev > 0.45) return 'snow';
    if (moist > 0.62 && elev < 0.35) return 'swamp';
    if (moist < 0.3 && temp > 0.55) return 'desert';
    if (moist > 0.45 && elev > 0.3) return 'forest';
    return 'grass';
  }

  private static ensureStartArea(map: GameMap, cx: number, cy: number) {
    const icx = Math.round(cx);
    const icy = Math.round(cy);
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const d = Math.hypot(dx, dy);
        if (d <= 3) {
          map.set(icx + dx, icy + dy, 'grass');
        }
      }
    }
    for (const [ox, oy] of [[4, 0], [-4, 0], [0, 4], [0, -4], [3, 3], [-3, -3]]) {
      const tx = icx + ox;
      const ty = icy + oy;
      if (map.isInBounds(tx, ty) && map.get(tx, ty) !== 'water') {
        map.set(tx, ty, 'forest');
      }
    }
    for (const [ox, oy] of [[5, 2], [-5, -2]]) {
      const tx = icx + ox;
      const ty = icy + oy;
      if (map.isInBounds(tx, ty)) {
        map.set(tx, ty, 'mountain');
      }
    }
  }
}
