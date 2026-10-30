/**
 * Micro Empire — Cloudflare Workers cloud API client.
 *
 * Token-based auth (stored in localStorage). No passwords.
 * All methods are safe (never throw, return null on error).
 */

const API = '/api/me';
const TOKEN_KEY = 'micro_empire_cloud_token';
const NAME_KEY = 'micro_empire_cloud_name';

// ── Token management ──

export function getCloudToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function getCloudName(): string | null {
  try { return localStorage.getItem(NAME_KEY); } catch { return null; }
}

export function clearCloudSession(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(NAME_KEY);
  } catch { /* */ }
}

function headers(): Record<string, string> {
  const token = getCloudToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'x-me-token': token } : {}),
  };
}

// ── Register / Login ──

export interface RegisterResult {
  token: string;
  name: string;
}

export async function cloudRegister(name: string): Promise<RegisterResult | null> {
  try {
    const res = await fetch(`${API}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) return null;
    const data = await res.json() as RegisterResult;
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(NAME_KEY, data.name);
    return data;
  } catch { return null; }
}

export async function cloudGetProfile(): Promise<{ name: string; created: number } | null> {
  try {
    const res = await fetch(`${API}/profile`, { headers: headers() });
    if (!res.ok) return null;
    return await res.json() as { name: string; created: number };
  } catch { return null; }
}

// ── Cloud Saves ──

export interface CloudSaveMeta {
  slot: string;
  name: string;
  year: number;
  population: number;
  buildings: number;
  achievements: number;
  updatedAt: number;
}

export async function cloudListSaves(): Promise<CloudSaveMeta[]> {
  try {
    const res = await fetch(`${API}/saves`, { headers: headers() });
    if (!res.ok) return [];
    const data = await res.json() as { slots: CloudSaveMeta[] };
    return data.slots ?? [];
  } catch { return []; }
}

export async function cloudSave(
  slot: string,
  data: string,
  meta: { year: number; population: number; buildings: number; achievements: number },
): Promise<boolean> {
  try {
    const res = await fetch(`${API}/save`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ slot, data, meta }),
    });
    return res.ok;
  } catch { return false; }
}

export async function cloudLoad(slot: string): Promise<{ data: string; meta: CloudSaveMeta } | null> {
  try {
    const res = await fetch(`${API}/save?slot=${encodeURIComponent(slot)}`, { headers: headers() });
    if (!res.ok) return null;
    return await res.json() as { data: string; meta: CloudSaveMeta };
  } catch { return null; }
}

export async function cloudDeleteSave(slot: string): Promise<boolean> {
  try {
    const res = await fetch(`${API}/save?slot=${encodeURIComponent(slot)}`, {
      method: 'DELETE',
      headers: headers(),
    });
    return res.ok;
  } catch { return false; }
}

// ── Leaderboard ──

export interface LeaderboardEntry {
  name: string;
  score: number;
  year: number;
  population: number;
  buildings: number;
  techs: number;
  achievements: number;
  victories: number;
  ts: number;
}

export async function cloudSubmitScore(stats: {
  year: number;
  population: number;
  buildings: number;
  techs: number;
  achievements: number;
  victories: number;
}): Promise<{ rank: number; score: number; total: number } | null> {
  try {
    const res = await fetch(`${API}/score`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(stats),
    });
    if (!res.ok) return null;
    return await res.json() as { rank: number; score: number; total: number };
  } catch { return null; }
}

export async function cloudGetLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch(`${API}/leaderboard`);
    if (!res.ok) return [];
    const data = await res.json() as { entries: LeaderboardEntry[] };
    return data.entries ?? [];
  } catch { return []; }
}

// ── Global Stats ──

export async function cloudGetStats(): Promise<{ totalSaves: number; totalLoads: number; totalScoreSubmits: number } | null> {
  try {
    const res = await fetch(`${API}/stats`);
    if (!res.ok) return null;
    return await res.json() as { totalSaves: number; totalLoads: number; totalScoreSubmits: number };
  } catch { return null; }
}

// ── Helper: check if logged in ──

export function isCloudLoggedIn(): boolean {
  return !!getCloudToken();
}
