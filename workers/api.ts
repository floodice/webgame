/**
 * GameHub Cloudflare Worker — Global Leaderboard + Daily Challenge
 *
 * KV keys:
 *   lb:{gameId}        → top 50 all-time high scores
 *   daily:{date}       → sokoban daily challenge leaderboard
 *   stats:global       → total plays, total scores submitted
 */

interface Env {
  GAME_KV: KVNamespace;
}

interface ScoreEntry {
  name: string;
  score: number;
  ts: number;
  detail?: string; // e.g. difficulty, level info
}

interface LeaderboardData {
  entries: ScoreEntry[];
}

interface StatsData {
  totalPlays: number;
  totalSubmissions: number;
}

// Sokoban daily challenge: deterministic level selection from date
function getDailyLevel(dateStr: string): { zoneIndex: number; levelIndex: number } {
  let hash = 0;
  for (const ch of dateStr) hash = (hash * 31 + ch.charCodeAt(0)) & 0x7fffffff;
  const pool = 40;
  const idx = (hash % pool) + 10; // levels 11-50
  return { zoneIndex: Math.floor(idx / 10), levelIndex: idx % 10 };
}

function getUtcDateString(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Allowed game IDs for score submission
const VALID_GAMES = new Set([
  'game2048', 'tetris', 'snake', 'pacman', 'minesweeper',
  'gomoku', 'sudoku', 'memory', 'flappy', 'color-find',
  'breakout', 'invaders', 'bubble-shooter', 'wordle',
  'match3', 'solitaire', 'connect', 'sokoban', 'nonogram',
  'micro-empire',
]);

// Games where lower score is better (steps, time, etc.)
const LOWER_IS_BETTER = new Set([
  'sokoban', 'minesweeper', 'memory', 'nonogram',
]);

const MAX_ENTRIES = 50;

function corsHeaders(request: Request): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-me-token',
    'Access-Control-Max-Age': '86400',
  };
}

function json(request: Request, data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(request) },
  });
}

function sortEntries(entries: ScoreEntry[], lowerBetter: boolean): ScoreEntry[] {
  return [...entries].sort((a, b) => {
    const diff = lowerBetter ? a.score - b.score : b.score - a.score;
    return diff !== 0 ? diff : a.ts - b.ts;
  });
}

// ── GET /api/leaderboard?game=xxx ──
async function handleGetLeaderboard(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const gameId = url.searchParams.get('game');
  if (!gameId || !VALID_GAMES.has(gameId)) {
    return json(request, { error: 'Invalid game ID' }, 400);
  }

  const raw = await env.GAME_KV.get(`lb:${gameId}`);
  const entries: ScoreEntry[] = raw
    ? (JSON.parse(raw) as LeaderboardData).entries ?? []
    : [];

  return json(request, {
    game: gameId,
    lowerIsBetter: LOWER_IS_BETTER.has(gameId),
    entries,
  });
}

// ── POST /api/score ── { game, name, score, detail? }
async function handlePostScore(request: Request, env: Env): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json(request, { error: 'Invalid JSON' }, 400);
  }

  const { game, name, score, detail } = body;

  if (typeof game !== 'string' || !VALID_GAMES.has(game)) {
    return json(request, { error: 'Invalid game ID' }, 400);
  }
  if (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 20) {
    return json(request, { error: 'Name must be 1-20 chars' }, 400);
  }
  if (typeof score !== 'number' || !Number.isFinite(score) || score < 0) {
    return json(request, { error: 'Score must be a non-negative number' }, 400);
  }

  const lowerBetter = LOWER_IS_BETTER.has(game);
  const key = `lb:${game}`;
  const raw = await env.GAME_KV.get(key);
  let entries: ScoreEntry[] = raw
    ? (JSON.parse(raw) as LeaderboardData).entries ?? []
    : [];

  const entry: ScoreEntry = {
    name: name.trim(),
    score: Math.floor(score),
    ts: Date.now(),
    ...(typeof detail === 'string' && detail.length <= 50 ? { detail } : {}),
  };

  entries.push(entry);
  entries = sortEntries(entries, lowerBetter).slice(0, MAX_ENTRIES);

  await env.GAME_KV.put(key, JSON.stringify({ entries } satisfies LeaderboardData));

  // Update global stats
  const statsRaw = await env.GAME_KV.get('stats:global');
  const stats: StatsData = statsRaw
    ? JSON.parse(statsRaw)
    : { totalPlays: 0, totalSubmissions: 0 };
  stats.totalSubmissions += 1;
  await env.GAME_KV.put('stats:global', JSON.stringify(stats));

  const rank = entries.findIndex(
    (e) => e.ts === entry.ts && e.name === entry.name && e.score === entry.score,
  ) + 1;

  return json(request, { rank, total: entries.length });
}

// ── GET /api/sokoban/daily ──
async function handleSokobanDaily(request: Request): Promise<Response> {
  const date = getUtcDateString();
  const { zoneIndex, levelIndex } = getDailyLevel(date);
  return json(request, { date, zoneIndex, levelIndex });
}

// ── GET /api/sokoban/daily/leaderboard?date=YYYY-MM-DD ──
async function handleDailyLeaderboard(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const date = url.searchParams.get('date') ?? getUtcDateString();
  if (!DATE_RE.test(date)) {
    return json(request, { error: 'Invalid date' }, 400);
  }

  const raw = await env.GAME_KV.get(`daily:${date}`);
  const entries: ScoreEntry[] = raw
    ? (JSON.parse(raw) as LeaderboardData).entries ?? []
    : [];

  return json(request, { date, entries });
}

// ── POST /api/sokoban/daily/score ── { date, name, steps }
async function handleDailyScore(request: Request, env: Env): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json(request, { error: 'Invalid JSON' }, 400);
  }

  const { date, name, steps } = body;

  if (typeof date !== 'string' || !DATE_RE.test(date)) {
    return json(request, { error: 'Invalid date' }, 400);
  }
  if (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 20) {
    return json(request, { error: 'Name must be 1-20 chars' }, 400);
  }
  if (typeof steps !== 'number' || !Number.isFinite(steps) || steps <= 0) {
    return json(request, { error: 'Steps must be positive' }, 400);
  }

  const key = `daily:${date}`;
  const raw = await env.GAME_KV.get(key);
  let entries: ScoreEntry[] = raw
    ? (JSON.parse(raw) as LeaderboardData).entries ?? []
    : [];

  const entry: ScoreEntry = { name: name.trim(), score: Math.floor(steps), ts: Date.now() };
  entries.push(entry);
  entries = sortEntries(entries, true).slice(0, MAX_ENTRIES);

  await env.GAME_KV.put(key, JSON.stringify({ entries } satisfies LeaderboardData));

  const rank = entries.findIndex(
    (e) => e.ts === entry.ts && e.name === entry.name && e.score === entry.score,
  ) + 1;

  return json(request, { rank, total: entries.length });
}

// ── GET /api/stats ──
async function handleStats(request: Request, env: Env): Promise<Response> {
  const statsRaw = await env.GAME_KV.get('stats:global');
  const stats: StatsData = statsRaw
    ? JSON.parse(statsRaw)
    : { totalPlays: 0, totalSubmissions: 0 };
  return json(request, stats);
}

// ─────────────────────────────────────────────────────────
// ── Micro Empire backend ─────────────────────────────────
// ─────────────────────────────────────────────────────────
//
// KV keys:
//   me:save:{token}:{slot}     → cloud save data (game JSON + meta)
//   me:saves:{token}           → list of save slots for a player
//   me:lb                      → empire leaderboard (top 100)
//   me:stats                   → global micro-empire play stats
//   me:player:{token}          → player profile (name, created)

const ME_MAX_SAVE_SIZE = 512_000; // 500 KB per save
const ME_MAX_SLOTS = 5;
const ME_LB_MAX = 100;

interface MeSaveMeta {
  slot: string;
  name: string;
  year: number;
  population: number;
  buildings: number;
  achievements: number;
  updatedAt: number;
}

interface MeLeaderboardEntry {
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

interface MeStatsData {
  totalSaves: number;
  totalLoads: number;
  totalScoreSubmits: number;
}

function meToken(request: Request): string | null {
  const h = request.headers.get('x-me-token');
  if (h && h.length >= 8 && h.length <= 64) return h;
  return null;
}

function generateToken(): string {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

// ── POST /api/me/register ── { name } → { token, name }
async function handleMeRegister(request: Request, env: Env): Promise<Response> {
  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; } catch {
    return json(request, { error: 'Invalid JSON' }, 400);
  }
  const { name } = body;
  if (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 20) {
    return json(request, { error: 'Name must be 1-20 chars' }, 400);
  }
  const token = generateToken();
  await env.GAME_KV.put(`me:player:${token}`, JSON.stringify({
    name: name.trim(),
    created: Date.now(),
  }));
  return json(request, { token, name: name.trim() });
}

// ── GET /api/me/profile ── (token header) → { name, created }
async function handleMeProfile(request: Request, env: Env): Promise<Response> {
  const token = meToken(request);
  if (!token) return json(request, { error: 'Missing token' }, 401);
  const raw = await env.GAME_KV.get(`me:player:${token}`);
  if (!raw) return json(request, { error: 'Player not found' }, 404);
  return json(request, JSON.parse(raw));
}

// ── PUT /api/me/save ── (token header) { slot, data, meta } → { ok }
async function handleMeSave(request: Request, env: Env): Promise<Response> {
  const token = meToken(request);
  if (!token) return json(request, { error: 'Missing token' }, 401);

  const playerRaw = await env.GAME_KV.get(`me:player:${token}`);
  if (!playerRaw) return json(request, { error: 'Player not found' }, 404);

  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; } catch {
    return json(request, { error: 'Invalid JSON' }, 400);
  }

  const { slot, data, meta } = body;
  if (typeof slot !== 'string' || !slot.match(/^[a-z0-9_-]{1,30}$/)) {
    return json(request, { error: 'Invalid slot name' }, 400);
  }
  if (typeof data !== 'string' || data.length > ME_MAX_SAVE_SIZE) {
    return json(request, { error: `Save data too large (max ${ME_MAX_SAVE_SIZE} bytes)` }, 400);
  }
  if (!meta || typeof meta !== 'object') {
    return json(request, { error: 'Missing meta' }, 400);
  }

  const player = JSON.parse(playerRaw);
  const saveMeta: MeSaveMeta = {
    slot,
    name: player.name,
    year: typeof (meta as any).year === 'number' ? (meta as any).year : 0,
    population: typeof (meta as any).population === 'number' ? (meta as any).population : 0,
    buildings: typeof (meta as any).buildings === 'number' ? (meta as any).buildings : 0,
    achievements: typeof (meta as any).achievements === 'number' ? (meta as any).achievements : 0,
    updatedAt: Date.now(),
  };

  await env.GAME_KV.put(`me:save:${token}:${slot}`, JSON.stringify({ meta: saveMeta, data }));

  const slotsRaw = await env.GAME_KV.get(`me:saves:${token}`);
  const slots: string[] = slotsRaw ? JSON.parse(slotsRaw) : [];
  if (!slots.includes(slot)) {
    if (slots.length >= ME_MAX_SLOTS) {
      return json(request, { error: `Max ${ME_MAX_SLOTS} cloud slots` }, 400);
    }
    slots.push(slot);
    await env.GAME_KV.put(`me:saves:${token}`, JSON.stringify(slots));
  }

  const statsRaw = await env.GAME_KV.get('me:stats');
  const stats: MeStatsData = statsRaw ? JSON.parse(statsRaw) : { totalSaves: 0, totalLoads: 0, totalScoreSubmits: 0 };
  stats.totalSaves++;
  await env.GAME_KV.put('me:stats', JSON.stringify(stats));

  return json(request, { ok: true, meta: saveMeta });
}

// ── GET /api/me/saves ── (token header) → { slots: MeSaveMeta[] }
async function handleMeListSaves(request: Request, env: Env): Promise<Response> {
  const token = meToken(request);
  if (!token) return json(request, { error: 'Missing token' }, 401);

  const slotsRaw = await env.GAME_KV.get(`me:saves:${token}`);
  const slots: string[] = slotsRaw ? JSON.parse(slotsRaw) : [];

  const metas: MeSaveMeta[] = [];
  for (const slot of slots) {
    const raw = await env.GAME_KV.get(`me:save:${token}:${slot}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      metas.push(parsed.meta);
    }
  }

  return json(request, { slots: metas });
}

// ── GET /api/me/save?slot=xxx ── (token header) → { meta, data }
async function handleMeLoadSave(request: Request, env: Env): Promise<Response> {
  const token = meToken(request);
  if (!token) return json(request, { error: 'Missing token' }, 401);

  const url = new URL(request.url);
  const slot = url.searchParams.get('slot');
  if (!slot) return json(request, { error: 'Missing slot param' }, 400);

  const raw = await env.GAME_KV.get(`me:save:${token}:${slot}`);
  if (!raw) return json(request, { error: 'Save not found' }, 404);

  const statsRaw = await env.GAME_KV.get('me:stats');
  const stats: MeStatsData = statsRaw ? JSON.parse(statsRaw) : { totalSaves: 0, totalLoads: 0, totalScoreSubmits: 0 };
  stats.totalLoads++;
  await env.GAME_KV.put('me:stats', JSON.stringify(stats));

  return json(request, JSON.parse(raw));
}

// ── DELETE /api/me/save?slot=xxx ── (token header) → { ok }
async function handleMeDeleteSave(request: Request, env: Env): Promise<Response> {
  const token = meToken(request);
  if (!token) return json(request, { error: 'Missing token' }, 401);

  const url = new URL(request.url);
  const slot = url.searchParams.get('slot');
  if (!slot) return json(request, { error: 'Missing slot param' }, 400);

  await env.GAME_KV.delete(`me:save:${token}:${slot}`);

  const slotsRaw = await env.GAME_KV.get(`me:saves:${token}`);
  const slots: string[] = slotsRaw ? JSON.parse(slotsRaw) : [];
  const filtered = slots.filter(s => s !== slot);
  await env.GAME_KV.put(`me:saves:${token}`, JSON.stringify(filtered));

  return json(request, { ok: true });
}

// ── POST /api/me/score ── (token header) { year, population, buildings, techs, achievements, victories } → { rank }
async function handleMeSubmitScore(request: Request, env: Env): Promise<Response> {
  const token = meToken(request);
  if (!token) return json(request, { error: 'Missing token' }, 401);

  const playerRaw = await env.GAME_KV.get(`me:player:${token}`);
  if (!playerRaw) return json(request, { error: 'Player not found' }, 404);

  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; } catch {
    return json(request, { error: 'Invalid JSON' }, 400);
  }

  const player = JSON.parse(playerRaw);
  const year = typeof body.year === 'number' ? body.year : 0;
  const population = typeof body.population === 'number' ? body.population : 0;
  const buildings = typeof body.buildings === 'number' ? body.buildings : 0;
  const techs = typeof body.techs === 'number' ? body.techs : 0;
  const achievements = typeof body.achievements === 'number' ? body.achievements : 0;
  const victories = typeof body.victories === 'number' ? body.victories : 0;

  // Composite score formula:
  // population × 10 + buildings × 5 + techs × 20 + achievements × 50 + victories × 30 + year × 2
  const score = population * 10 + buildings * 5 + techs * 20 + achievements * 50 + victories * 30 + year * 2;

  const entry: MeLeaderboardEntry = {
    name: player.name,
    score,
    year,
    population,
    buildings,
    techs,
    achievements,
    victories,
    ts: Date.now(),
  };

  const raw = await env.GAME_KV.get('me:lb');
  let entries: MeLeaderboardEntry[] = raw ? JSON.parse(raw) : [];

  // Only keep best score per player name
  entries = entries.filter(e => e.name !== player.name);
  entries.push(entry);
  entries.sort((a, b) => b.score - a.score);
  entries = entries.slice(0, ME_LB_MAX);

  await env.GAME_KV.put('me:lb', JSON.stringify(entries));

  const statsRaw = await env.GAME_KV.get('me:stats');
  const stats: MeStatsData = statsRaw ? JSON.parse(statsRaw) : { totalSaves: 0, totalLoads: 0, totalScoreSubmits: 0 };
  stats.totalScoreSubmits++;
  await env.GAME_KV.put('me:stats', JSON.stringify(stats));

  const rank = entries.findIndex(e => e.name === player.name) + 1;
  return json(request, { rank, score, total: entries.length });
}

// ── GET /api/me/leaderboard ── → { entries: MeLeaderboardEntry[] }
async function handleMeLeaderboard(request: Request, env: Env): Promise<Response> {
  const raw = await env.GAME_KV.get('me:lb');
  const entries: MeLeaderboardEntry[] = raw ? JSON.parse(raw) : [];
  return json(request, { entries });
}

// ── GET /api/me/stats ── → { totalSaves, totalLoads, totalScoreSubmits }
async function handleMeStats(request: Request, env: Env): Promise<Response> {
  const statsRaw = await env.GAME_KV.get('me:stats');
  const stats: MeStatsData = statsRaw ? JSON.parse(statsRaw) : { totalSaves: 0, totalLoads: 0, totalScoreSubmits: 0 };
  return json(request, stats);
}

// ─────────────────────────────────────────────────────────
// ── Router ───────────────────────────────────────────────
// ─────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Global leaderboard
      if (request.method === 'GET' && path === '/api/leaderboard') {
        return await handleGetLeaderboard(request, env);
      }
      if (request.method === 'POST' && path === '/api/score') {
        return await handlePostScore(request, env);
      }

      // Sokoban daily challenge
      if (request.method === 'GET' && path === '/api/sokoban/daily') {
        return await handleSokobanDaily(request);
      }
      if (request.method === 'GET' && path === '/api/sokoban/daily/leaderboard') {
        return await handleDailyLeaderboard(request, env);
      }
      if (request.method === 'POST' && path === '/api/sokoban/daily/score') {
        return await handleDailyScore(request, env);
      }

      // Global stats
      if (request.method === 'GET' && path === '/api/stats') {
        return await handleStats(request, env);
      }

      // ── Micro Empire routes ──
      if (request.method === 'POST' && path === '/api/me/register') {
        return await handleMeRegister(request, env);
      }
      if (request.method === 'GET' && path === '/api/me/profile') {
        return await handleMeProfile(request, env);
      }
      if (request.method === 'PUT' && path === '/api/me/save') {
        return await handleMeSave(request, env);
      }
      if (request.method === 'GET' && path === '/api/me/saves') {
        return await handleMeListSaves(request, env);
      }
      if (request.method === 'GET' && path === '/api/me/save') {
        return await handleMeLoadSave(request, env);
      }
      if (request.method === 'DELETE' && path === '/api/me/save') {
        return await handleMeDeleteSave(request, env);
      }
      if (request.method === 'POST' && path === '/api/me/score') {
        return await handleMeSubmitScore(request, env);
      }
      if (request.method === 'GET' && path === '/api/me/leaderboard') {
        return await handleMeLeaderboard(request, env);
      }
      if (request.method === 'GET' && path === '/api/me/stats') {
        return await handleMeStats(request, env);
      }
    } catch (err) {
      return json(request, { error: 'Internal server error' }, 500);
    }

    return json(request, { error: 'Not found' }, 404);
  },
};
