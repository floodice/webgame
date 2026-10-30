export type EventCallback = (...args: any[]) => void;

export class EventBus {
  private listeners = new Map<string, Set<EventCallback>>();

  on(event: string, cb: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(cb);
    return () => this.off(event, cb);
  }

  off(event: string, cb: EventCallback) {
    this.listeners.get(event)?.delete(cb);
  }

  emit(event: string, ...args: any[]) {
    this.listeners.get(event)?.forEach(cb => {
      try { cb(...args); } catch (e) { console.error(`EventBus [${event}]:`, e); }
    });
  }

  clear() {
    this.listeners.clear();
  }
}
