import type { TileType } from './Tile';

export class GameMap {
  private tiles: TileType[][];
  readonly width: number;
  readonly height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.tiles = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => 'grass' as TileType),
    );
  }

  get(x: number, y: number): TileType {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return 'water';
    return this.tiles[y][x];
  }

  set(x: number, y: number, type: TileType) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.tiles[y][x] = type;
    }
  }

  raw(): TileType[][] {
    return this.tiles.map(row => [...row]);
  }

  load(data: TileType[][]) {
    for (let y = 0; y < this.height && y < data.length; y++) {
      for (let x = 0; x < this.width && x < data[y].length; x++) {
        this.tiles[y][x] = data[y][x];
      }
    }
  }

  isInBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  countAdjacent(x: number, y: number, type: TileType): number {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        if (this.get(x + dx, y + dy) === type) count++;
      }
    }
    return count;
  }
}
