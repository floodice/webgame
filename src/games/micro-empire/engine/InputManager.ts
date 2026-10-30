import { Camera } from './Camera';
import { EventBus } from './EventBus';

export class InputManager {
  private dragging = false;
  private lastMX = 0;
  private lastMY = 0;
  private keys = new Set<string>();
  private disposed = false;
  private cleanups: (() => void)[] = [];

  private canvas: HTMLCanvasElement;
  private camera: Camera;
  private bus: EventBus;

  constructor(canvas: HTMLCanvasElement, camera: Camera, bus: EventBus) {
    this.canvas = canvas;
    this.camera = camera;
    this.bus = bus;
    this.bind();
  }

  private bind() {
    const c = this.canvas;
    const on = <K extends keyof HTMLElementEventMap>(
      el: HTMLElement | Window,
      ev: K,
      fn: (e: HTMLElementEventMap[K]) => void,
      opts?: AddEventListenerOptions,
    ) => {
      el.addEventListener(ev as string, fn as EventListener, opts);
      this.cleanups.push(() => el.removeEventListener(ev as string, fn as EventListener, opts));
    };

    on(c, 'mousedown', (e: MouseEvent) => {
      if (e.button === 0 || e.button === 2) {
        this.dragging = true;
        this.lastMX = e.clientX;
        this.lastMY = e.clientY;
      }
    });

    on(window as any, 'mousemove', (e: MouseEvent) => {
      if (this.dragging) {
        const dx = e.clientX - this.lastMX;
        const dy = e.clientY - this.lastMY;
        this.camera.pan(-dx, -dy);
        this.lastMX = e.clientX;
        this.lastMY = e.clientY;
      }
      const rect = c.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      this.bus.emit('mouse:move', sx, sy);
    });

    on(window as any, 'mouseup', () => {
      this.dragging = false;
    });

    on(c, 'click', (e: MouseEvent) => {
      const rect = c.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const { wx, wy } = this.camera.screenToWorld(sx, sy);
      this.bus.emit('click', wx, wy, sx, sy);
    });

    on(c, 'contextmenu', (e: MouseEvent) => {
      e.preventDefault();
      const rect = c.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const { wx, wy } = this.camera.screenToWorld(sx, sy);
      this.bus.emit('rightclick', wx, wy, sx, sy);
    });

    on(c, 'wheel', (e: WheelEvent) => {
      e.preventDefault();
      const rect = c.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.12 : 0.89;
      this.camera.zoomAt(factor, sx, sy);
    }, { passive: false });

    on(window as any, 'keydown', (e: KeyboardEvent) => {
      this.keys.add(e.key.toLowerCase());
      this.bus.emit('keydown', e.key.toLowerCase());
    });
    on(window as any, 'keyup', (e: KeyboardEvent) => {
      this.keys.delete(e.key.toLowerCase());
    });

    let lastTouchDist = 0;
    let lastTouchX = 0;
    let lastTouchY = 0;

    on(c, 'touchstart', (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        this.dragging = true;
        this.lastMX = e.touches[0].clientX;
        this.lastMY = e.touches[0].clientY;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        this.dragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastTouchDist = Math.hypot(dx, dy);
      }
    }, { passive: false });

    on(c, 'touchmove', (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1 && this.dragging) {
        const dx = e.touches[0].clientX - this.lastMX;
        const dy = e.touches[0].clientY - this.lastMY;
        this.camera.pan(-dx, -dy);
        this.lastMX = e.touches[0].clientX;
        this.lastMY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (lastTouchDist > 0) {
          const factor = dist / lastTouchDist;
          const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
          const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
          const rect = c.getBoundingClientRect();
          this.camera.zoomAt(factor, cx - rect.left, cy - rect.top);
        }
        lastTouchDist = dist;
      }
    }, { passive: false });

    on(c, 'touchend', (e: TouchEvent) => {
      if (e.touches.length === 0) {
        if (this.dragging) {
          const moved = Math.hypot(
            e.changedTouches[0].clientX - lastTouchX,
            e.changedTouches[0].clientY - lastTouchY,
          );
          if (moved < 12) {
            const rect = c.getBoundingClientRect();
            const sx = e.changedTouches[0].clientX - rect.left;
            const sy = e.changedTouches[0].clientY - rect.top;
            const { wx, wy } = this.camera.screenToWorld(sx, sy);
            this.bus.emit('click', wx, wy, sx, sy);
          }
        }
        this.dragging = false;
        lastTouchDist = 0;
      }
    });
  }

  updateKeyboard(speed: number) {
    if (this.keys.has('w') || this.keys.has('arrowup')) this.camera.pan(0, -speed);
    if (this.keys.has('s') || this.keys.has('arrowdown')) this.camera.pan(0, speed);
    if (this.keys.has('a') || this.keys.has('arrowleft')) this.camera.pan(-speed, 0);
    if (this.keys.has('d') || this.keys.has('arrowright')) this.camera.pan(speed, 0);
  }

  isKeyDown(key: string) {
    return this.keys.has(key.toLowerCase());
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.cleanups.forEach(fn => fn());
    this.cleanups.length = 0;
  }
}
