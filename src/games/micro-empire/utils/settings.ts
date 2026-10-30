const STORAGE_KEY = 'micro_empire_settings';

export interface GameSettings {
  /** Base tick interval in ms. Lower = faster game. Default 500 */
  tickSpeed: number;
  /** Show tile grid overlay. Default true */
  showGrid: boolean;
  /** Auto-save interval in seconds. 0 = disabled. Default 120 */
  autoSaveInterval: number;
  /** Show minimap. Default true */
  showMinimap: boolean;
  /** Show toast notifications. Default true */
  showToasts: boolean;
}

export const DEFAULT_SETTINGS: GameSettings = {
  tickSpeed: 500,
  showGrid: true,
  autoSaveInterval: 120,
  showMinimap: true,
  showToasts: true,
};

/** Tick speed range: 500ms (fastest, 0.5s/day) to 10000ms (slowest, 10s/day) */
export const TICK_SPEED_MIN = 500;
export const TICK_SPEED_MAX = 10000;
export const TICK_SPEED_STEP = 50;

export const AUTOSAVE_OPTIONS = [
  { value: 0, label: '关闭' },
  { value: 60, label: '1 分钟' },
  { value: 120, label: '2 分钟' },
  { value: 300, label: '5 分钟' },
];

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(s: GameSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}
