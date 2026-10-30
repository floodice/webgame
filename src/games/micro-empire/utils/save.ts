const SAVE_PREFIX = 'micro_empire_save_';

export function saveGame(slot: string, data: string) {
  try {
    const meta = {
      timestamp: Date.now(),
      slot,
    };
    localStorage.setItem(SAVE_PREFIX + slot, JSON.stringify({ meta, data }));
  } catch {
    console.error('Failed to save game');
  }
}

export function loadGame(slot: string): string | null {
  try {
    const raw = localStorage.getItem(SAVE_PREFIX + slot);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.data ?? null;
  } catch {
    return null;
  }
}

export function autoSave(data: string) {
  saveGame('auto', data);
}

export function loadAutoSave(): string | null {
  return loadGame('auto');
}

export function hasSave(slot: string): boolean {
  return localStorage.getItem(SAVE_PREFIX + slot) !== null;
}

export function deleteSave(slot: string) {
  localStorage.removeItem(SAVE_PREFIX + slot);
}

export function getSaveMeta(slot: string): { timestamp: number } | null {
  try {
    const raw = localStorage.getItem(SAVE_PREFIX + slot);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.meta ?? null;
  } catch {
    return null;
  }
}

export function getAllSlots(): string[] {
  return ['auto', '1', '2', '3'];
}
