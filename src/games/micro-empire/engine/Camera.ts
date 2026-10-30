export class Camera {
  x = 0;
  y = 0;
  zoom = 1;
  private targetX = 0;
  private targetY = 0;
  private targetZoom = 1;
  readonly minZoom = 0.4;
  readonly maxZoom = 3;

  viewW: number;
  viewH: number;
  worldW: number;
  worldH: number;

  constructor(viewW: number, viewH: number, worldW: number, worldH: number) {
    this.viewW = viewW;
    this.viewH = viewH;
    this.worldW = worldW;
    this.worldH = worldH;
    this.x = (worldW - viewW) / 2;
    this.y = (worldH - viewH) / 2;
    this.targetX = this.x;
    this.targetY = this.y;
  }

  setViewSize(w: number, h: number) {
    this.viewW = w;
    this.viewH = h;
  }

  moveTo(x: number, y: number) {
    this.targetX = x - this.viewW / (2 * this.zoom);
    this.targetY = y - this.viewH / (2 * this.zoom);
  }

  pan(dx: number, dy: number) {
    this.targetX += dx / this.zoom;
    this.targetY += dy / this.zoom;
  }

  zoomAt(factor: number, screenX: number, screenY: number) {
    const worldX = this.x + screenX / this.zoom;
    const worldY = this.y + screenY / this.zoom;
    this.targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.targetZoom * factor));
    this.targetX = worldX - screenX / this.targetZoom;
    this.targetY = worldY - screenY / this.targetZoom;
  }

  setZoom(z: number) {
    this.targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, z));
  }

  update(_dt: number) {
    const lerp = 0.18;
    this.x += (this.targetX - this.x) * lerp;
    this.y += (this.targetY - this.y) * lerp;
    this.zoom += (this.targetZoom - this.zoom) * lerp;
    this.clamp();
  }

  private clamp() {
    const maxX = Math.max(0, this.worldW - this.viewW / this.zoom);
    const maxY = Math.max(0, this.worldH - this.viewH / this.zoom);
    this.x = Math.max(0, Math.min(maxX, this.x));
    this.y = Math.max(0, Math.min(maxY, this.y));
    this.targetX = Math.max(0, Math.min(maxX, this.targetX));
    this.targetY = Math.max(0, Math.min(maxY, this.targetY));
  }

  screenToWorld(sx: number, sy: number): { wx: number; wy: number } {
    return {
      wx: this.x + sx / this.zoom,
      wy: this.y + sy / this.zoom,
    };
  }

  worldToScreen(wx: number, wy: number): { sx: number; sy: number } {
    return {
      sx: (wx - this.x) * this.zoom,
      sy: (wy - this.y) * this.zoom,
    };
  }

  isVisible(wx: number, wy: number, w: number, h: number): boolean {
    const sx = (wx - this.x) * this.zoom;
    const sy = (wy - this.y) * this.zoom;
    const sw = w * this.zoom;
    const sh = h * this.zoom;
    return sx + sw > 0 && sy + sh > 0 && sx < this.viewW && sy < this.viewH;
  }
}
