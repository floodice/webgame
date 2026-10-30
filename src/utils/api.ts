/**
 * GameHub API client — communicates with Cloudflare Worker backend.
 * All methods are fire-and-forget safe (never throw, log errors quietly).
 */

const API_BASE = '/api';

interface ScoreEntry {
  name: string;
  score: number;
  ts: number;
  detail?: string;
}

interface LeaderboardResponse {
  game: string;
  lowerIsBetter: boolean;
  entries: ScoreEntry[];
}

interface SubmitResult {
  rank: number;
  total: number;
}

interface DailyChallenge {
  date: string;
  zoneIndex: number;
  levelIndex: number;
}

interface DailyLeaderboardResponse {
  date: string;
  entries: ScoreEntry[];
}

// ── Player name (persisted in localStorage) ──
const NAME_KEY = 'gamehub_player_name';

export function getPlayerName(): string {
  try {
    return localStorage.getItem(NAME_KEY) || '';
  } catch {
    return '';
  }
}

export function setPlayerName(name: string): void {
  try {
    localStorage.setItem(NAME_KEY, name.trim().slice(0, 20));
  } catch { /* */ }
}

// ── Global leaderboard ──
export async function fetchLeaderboard(gameId: string): Promise<LeaderboardResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/leaderboard?game=${encodeURIComponent(gameId)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function submitScore(
  gameId: string,
  score: number,
  detail?: string,
): Promise<SubmitResult | null> {
  const name = getPlayerName();
  if (!name) return null;
  try {
    const res = await fetch(`${API_BASE}/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game: gameId, name, score, detail }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ── Sokoban daily challenge ──
export async function fetchDailyChallenge(): Promise<DailyChallenge | null> {
  try {
    const res = await fetch(`${API_BASE}/sokoban/daily`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchDailyLeaderboard(date?: string): Promise<DailyLeaderboardResponse | null> {
  try {
    const qs = date ? `?date=${date}` : '';
    const res = await fetch(`${API_BASE}/sokoban/daily/leaderboard${qs}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function submitDailyScore(
  date: string,
  steps: number,
): Promise<SubmitResult | null> {
  const name = getPlayerName();
  if (!name) return null;
  try {
    const res = await fetch(`${API_BASE}/sokoban/daily/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, name, steps }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export type { ScoreEntry, LeaderboardResponse, SubmitResult, DailyChallenge };
