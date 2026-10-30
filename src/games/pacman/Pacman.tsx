import { useState, useEffect, useCallback, useRef } from 'react';
import GameWrapper from '../../components/GameWrapper';
import { useGameScore } from '../../hooks/useGameScore';
import LeaderboardPanel from '../../components/LeaderboardPanel';
import { useI18n, fmt } from '../../i18n';

const COLS = 21;
const CELL = 22;

type Dir = 'up' | 'down' | 'left' | 'right' | 'none';
const OPPOSITE: Record<Exclude<Dir, 'none'>, Dir> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

const DIR_VEC: Record<Exclude<Dir, 'none'>, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

/** 0=豆子 1=墙 2=Power Pellet 3=Ghosts出生 4=空白 */
const BASE_MAZE: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
  [1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 0, 1, 1, 1, 1, 4, 1, 4, 1, 1, 1, 1, 0, 1, 1, 1, 1],
  [4, 4, 4, 1, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 1, 4, 4, 4],
  [1, 1, 1, 1, 0, 1, 4, 1, 1, 3, 3, 3, 1, 1, 4, 1, 0, 1, 1, 1, 1],
  [4, 4, 4, 1, 0, 4, 4, 1, 3, 3, 3, 3, 3, 1, 4, 4, 0, 1, 4, 4, 4],
  [1, 1, 1, 1, 0, 1, 4, 1, 1, 1, 1, 1, 1, 1, 4, 1, 0, 1, 1, 1, 1],
  [4, 4, 4, 1, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 1, 4, 4, 4],
  [1, 1, 1, 1, 0, 1, 1, 1, 1, 4, 1, 4, 1, 1, 1, 1, 0, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const ROWS = BASE_MAZE.length;
const CANVAS_W = COLS * CELL;
const CANVAS_H = ROWS * CELL + 30;
const MAZE_H = ROWS * CELL;

type GhostKind = 'chase' | 'random' | 'guard' | 'patrol';

interface Ghost {
  id: number;
  kind: GhostKind;
  color: string;
  x: number;
  y: number;
  dir: Dir;
  scared: boolean;
  eaten: boolean;
  patrolPhase: number;
}

interface GameState {
  maze: number[][];
  pacX: number;
  pacY: number;
  pacDir: Dir;
  pacNext: Dir;
  mouth: number;
  ghosts: Ghost[];
  scaredUntil: number;
  ghostCombo: number;
  lives: number;
  level: number;
  pelletsLeft: number;
  status: 'ready' | 'playing' | 'dying' | 'levelWin' | 'gameOver';
  dieTimer: number;
  levelWinTimer: number;
  powerFlashUntil: number;
}

const FONT = "'Inter', 'SF Pro Display', system-ui, sans-serif";
const THEME_COLOR = '#a78bfa';
const WALL_FILL = '#12102a';
const WALL_EDGE = '#6d5cce';
const BG_DARK = '#08071a';

const GHOST_COLORS = ['#f87171', '#f472b6', '#60a5fa', '#fb923c'];
const PELLETS_PER_LEVEL = countPellets(BASE_MAZE.map(row => [...row]));
const GHOST_HOME = { x: 10, y: 10 };
const GHOST_EXIT = { x: 10, y: 8 };
const GUARD_ANCHOR = { x: 2, y: 2 };
const PAC_START = { x: 10, y: 18 };

function cloneMaze(): number[][] {
  return BASE_MAZE.map(row => [...row]);
}

function countPellets(maze: number[][]): number {
  let n = 0;
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (maze[y][x] === 0 || maze[y][x] === 2) n++;
    }
  }
  return n;
}

function canEnter(maze: number[][], x: number, y: number, allowGhostHouse: boolean): boolean {
  if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
  const c = maze[y][x];
  if (c === 1) return false;
  if (c === 3 && !allowGhostHouse) return false;
  return true;
}

function isInGhostHouse(maze: number[][], x: number, y: number): boolean {
  if (y < 0 || y >= ROWS || x < 0 || x >= COLS) return false;
  return maze[y][x] === 3;
}

function gridCenter(x: number, y: number): [number, number] {
  return [x * CELL + CELL / 2, y * CELL + CELL / 2];
}

function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function getValidDirs(
  maze: number[][],
  x: number,
  y: number,
  current: Dir,
  forGhost: boolean,
): Dir[] {
  const dirs: Dir[] = ['up', 'down', 'left', 'right'];
  const allowHouse = forGhost;
  return dirs.filter(d => {
    if (d === 'none') return false;
    if (current !== 'none' && d === OPPOSITE[current as Exclude<Dir, 'none'>]) return false;
    const { dx, dy } = DIR_VEC[d];
    return canEnter(maze, x + dx, y + dy, allowHouse);
  });
}

function isIntersection(maze: number[][], x: number, y: number, dir: Dir, forGhost: boolean): boolean {
  const opts = getValidDirs(maze, x, y, 'none', forGhost);
  if (opts.length <= 2) return false;
  return dir === 'none' || opts.filter(d => d !== OPPOSITE[dir as Exclude<Dir, 'none'>]).length > 1;
}

function pickGhostDir(ghost: Ghost, pac: { x: number; y: number }, maze: number[][]): Dir {
  let options = getValidDirs(maze, ghost.x, ghost.y, ghost.dir, true);

  // If no options (dead end), allow reversing
  if (options.length === 0) {
    const allDirs: Dir[] = (['up', 'down', 'left', 'right'] as Dir[]).filter(d => {
      const { dx, dy } = DIR_VEC[d as Exclude<Dir, 'none'>];
      return canEnter(maze, ghost.x + dx, ghost.y + dy, true);
    });
    if (allDirs.length > 0) return allDirs[0];
    return ghost.dir === 'none' ? 'left' : ghost.dir;
  }

  // If inside ghost house, move toward exit instead of chasing
  if (isInGhostHouse(maze, ghost.x, ghost.y)) {
    let best = options[0];
    let bestD = Infinity;
    for (const d of options) {
      const { dx, dy } = DIR_VEC[d as Exclude<Dir, 'none'>];
      const dDist = dist(ghost.x + dx, ghost.y + dy, GHOST_EXIT.x, GHOST_EXIT.y);
      if (dDist < bestD) {
        bestD = dDist;
        best = d;
      }
    }
    return best;
  }

  if (ghost.scared) {
    let worst = options[0];
    let worstD = -1;
    for (const d of options) {
      const { dx, dy } = DIR_VEC[d as Exclude<Dir, 'none'>];
      const dDist = dist(ghost.x + dx, ghost.y + dy, pac.x, pac.y);
      if (dDist > worstD) {
        worstD = dDist;
        worst = d;
      }
    }
    return worst;
  }

  const scoreDir = (d: Dir, tx: number, ty: number) => {
    const { dx, dy } = DIR_VEC[d as Exclude<Dir, 'none'>];
    return dist(ghost.x + dx, ghost.y + dy, tx, ty);
  };

  let targetX = pac.x;
  let targetY = pac.y;

  switch (ghost.kind) {
    case 'chase':
      break;
    case 'random':
      return options[Math.floor(Math.random() * options.length)];
    case 'guard':
      targetX = GUARD_ANCHOR.x;
      targetY = GUARD_ANCHOR.y;
      if (dist(ghost.x, ghost.y, pac.x, pac.y) > 8) {
        targetX = pac.x;
        targetY = pac.y;
      }
      break;
    case 'patrol': {
      const horizontal = ghost.patrolPhase % 2 === 0;
      const pref: Dir[] = horizontal ? ['left', 'right', 'up', 'down'] : ['up', 'down', 'left', 'right'];
      for (const p of pref) {
        if (options.includes(p)) return p;
      }
      break;
    }
  }

  let best = options[0];
  let bestD = Infinity;
  for (const d of options) {
    const s = scoreDir(d, targetX, targetY);
    if (s < bestD) {
      bestD = s;
      best = d;
    }
  }
  return best;
}

function createInitialState(): GameState {
  const maze = cloneMaze();
  const ghosts: Ghost[] = [
    { id: 0, kind: 'chase', color: GHOST_COLORS[0], x: 9, y: 10, dir: 'up', scared: false, eaten: false, patrolPhase: 0 },
    { id: 1, kind: 'random', color: GHOST_COLORS[1], x: 10, y: 10, dir: 'up', scared: false, eaten: false, patrolPhase: 0 },
    { id: 2, kind: 'guard', color: GHOST_COLORS[2], x: 11, y: 10, dir: 'up', scared: false, eaten: false, patrolPhase: 0 },
    { id: 3, kind: 'patrol', color: GHOST_COLORS[3], x: 10, y: 9, dir: 'up', scared: false, eaten: false, patrolPhase: 0 },
  ];
  return {
    maze,
    pacX: PAC_START.x,
    pacY: PAC_START.y,
    pacDir: 'left',
    pacNext: 'left',
    mouth: 0,
    ghosts,
    scaredUntil: 0,
    ghostCombo: 0,
    lives: 3,
    level: 1,
    pelletsLeft: countPellets(maze),
    status: 'ready',
    dieTimer: 0,
    levelWinTimer: 0,
    powerFlashUntil: 0,
  };
}

export default function Pacman() {
  const { score, highScore, addScore, resetScore } = useGameScore('pacman');
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createInitialState());
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [overlay, setOverlay] = useState<'ready' | 'gameOver' | 'levelWin' | null>('ready');
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [pelletsLeft, setPelletsLeft] = useState(PELLETS_PER_LEVEL);
  const [showRules, setShowRules] = useState(false);
  const lastTickRef = useRef(0);

  const syncUi = useCallback((s: GameState) => {
    setLives(s.lives);
    setLevel(s.level);
    setPelletsLeft(s.pelletsLeft);
    if (s.status === 'gameOver') setOverlay('gameOver');
    else if (s.status === 'levelWin') setOverlay('levelWin');
    else if (s.status === 'ready') setOverlay('ready');
    else setOverlay(null);
  }, []);

  const draw = useCallback((now: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const s = stateRef.current;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, MAZE_H);
    bgGrad.addColorStop(0, '#0a091e');
    bgGrad.addColorStop(0.5, BG_DARK);
    bgGrad.addColorStop(1, '#0c0820');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Walls: filled blocks
    ctx.fillStyle = WALL_FILL;
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (s.maze[y][x] === 1) ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      }
    }

    // Wall edge glow - only where walls face corridors
    ctx.save();
    ctx.strokeStyle = WALL_EDGE;
    ctx.lineWidth = 1.8;
    ctx.shadowColor = WALL_EDGE;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (s.maze[y][x] !== 1) continue;
        const px = x * CELL, py = y * CELL;
        if (y === 0 || s.maze[y - 1][x] !== 1) { ctx.moveTo(px, py + 0.5); ctx.lineTo(px + CELL, py + 0.5); }
        if (y === ROWS - 1 || s.maze[y + 1][x] !== 1) { ctx.moveTo(px, py + CELL - 0.5); ctx.lineTo(px + CELL, py + CELL - 0.5); }
        if (x === 0 || s.maze[y][x - 1] !== 1) { ctx.moveTo(px + 0.5, py); ctx.lineTo(px + 0.5, py + CELL); }
        if (x === COLS - 1 || s.maze[y][x + 1] !== 1) { ctx.moveTo(px + CELL - 0.5, py); ctx.lineTo(px + CELL - 0.5, py + CELL); }
      }
    }
    ctx.stroke();
    ctx.restore();

    // Pellets
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const cell = s.maze[y][x];
        const cx = x * CELL + CELL / 2, cy = y * CELL + CELL / 2;
        if (cell === 0) {
          ctx.save();
          ctx.fillStyle = '#c7d2fe';
          ctx.shadowColor = '#a5b4fc';
          ctx.shadowBlur = 5;
          ctx.beginPath();
          ctx.arc(cx, cy, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (cell === 2) {
          const pulse = 0.5 + 0.5 * Math.sin(now / 250);
          ctx.save();
          ctx.strokeStyle = `rgba(251,191,36,${0.25 + pulse * 0.2})`;
          ctx.lineWidth = 1.5;
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 14 + pulse * 8;
          ctx.beginPath();
          ctx.arc(cx, cy, 7 + pulse * 2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#fbbf24';
          ctx.shadowBlur = 10 + pulse * 6;
          ctx.beginPath();
          ctx.arc(cx, cy, 3.5 + pulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
    }

    // Pac-Man
    const isDying = s.status === 'dying';
    const dyingProgress = isDying ? 1 - s.dieTimer / 800 : 0;
    const [pcx, pcy] = gridCenter(s.pacX, s.pacY);

    if (isDying) {
      ctx.save();
      const shrink = 1 - dyingProgress;
      const deathMouth = dyingProgress * Math.PI;
      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 20 + dyingProgress * 30;
      ctx.globalAlpha = Math.max(0, shrink);
      let rot = 0;
      if (s.pacDir === 'right') rot = 0;
      else if (s.pacDir === 'down') rot = Math.PI / 2;
      else if (s.pacDir === 'left') rot = Math.PI;
      else if (s.pacDir === 'up') rot = -Math.PI / 2;
      ctx.translate(pcx, pcy);
      ctx.rotate(rot);
      const r = (CELL / 2 - 1) * Math.max(0.08, shrink);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, deathMouth, -deathMouth, true);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else {
      ctx.save();
      const mouthAngle = 0.18 + Math.abs(Math.sin(s.mouth)) * 0.38;
      let rot = 0;
      if (s.pacDir === 'right') rot = 0;
      else if (s.pacDir === 'down') rot = Math.PI / 2;
      else if (s.pacDir === 'left') rot = Math.PI;
      else if (s.pacDir === 'up') rot = -Math.PI / 2;
      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 18;
      ctx.translate(pcx, pcy);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, CELL / 2 - 1, mouthAngle, -mouthAngle, true);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.arc(2.5, -4.5, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Ghosts
    if (!isDying) {
      for (const g of s.ghosts) {
        if (g.eaten) continue;
        const [gx, gy] = gridCenter(g.x, g.y);
        const scared = g.scared || now < s.scaredUntil;
        const timeLeft = s.scaredUntil - now;
        const flash = scared && timeLeft < 2000 && Math.floor(now / 250) % 2 === 0;
        ctx.save();
        if (scared) {
          ctx.fillStyle = flash ? '#e0e7ff' : '#6366f1';
          ctx.shadowColor = '#6366f1';
        } else {
          ctx.fillStyle = g.color;
          ctx.shadowColor = g.color;
        }
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(gx, gy - 2, CELL / 2 - 2, Math.PI, 0);
        ctx.lineTo(gx + CELL / 2 - 2, gy + CELL / 2 - 3);
        const waveT = now / 180;
        for (let i = 0; i <= 4; i++) {
          const wx = gx + (CELL / 2 - 2) - ((CELL - 4) * i / 4);
          const wy = gy + CELL / 2 - 3 + Math.sin(waveT + i * 1.8) * 2;
          ctx.lineTo(wx, wy);
        }
        ctx.closePath();
        ctx.fill();

        if (!scared) {
          ctx.fillStyle = '#fff';
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.ellipse(gx - 3.5, gy - 3, 3.2, 3.8, 0, 0, Math.PI * 2);
          ctx.ellipse(gx + 3.5, gy - 3, 3.2, 3.8, 0, 0, Math.PI * 2);
          ctx.fill();
          const ddx = s.pacX - g.x, ddy = s.pacY - g.y;
          const ang = Math.atan2(ddy, ddx);
          const po = 1.3;
          ctx.fillStyle = '#1e1b4b';
          ctx.beginPath();
          ctx.arc(gx - 3.5 + Math.cos(ang) * po, gy - 3 + Math.sin(ang) * po, 1.6, 0, Math.PI * 2);
          ctx.arc(gx + 3.5 + Math.cos(ang) * po, gy - 3 + Math.sin(ang) * po, 1.6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = flash ? '#6366f1' : '#e0e7ff';
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(gx - 3, gy - 3, 1.8, 0, Math.PI * 2);
          ctx.arc(gx + 3, gy - 3, 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = flash ? '#6366f1' : '#e0e7ff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(gx - 4, gy + 1);
          for (let i = 0; i <= 4; i++) ctx.lineTo(gx - 4 + i * 2, gy + 1 + (i % 2 === 0 ? 0 : 2));
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // Death effects
    if (isDying) {
      const flashAlpha = dyingProgress < 0.12 ? (0.12 - dyingProgress) * 4 : 0;
      if (flashAlpha > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(239,68,68,${flashAlpha})`;
        ctx.fillRect(0, 0, CANVAS_W, MAZE_H);
        ctx.restore();
      }
      ctx.save();
      ctx.font = `bold 14px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(248,113,113,${0.7 + 0.3 * Math.sin(now / 120)})`;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 14;
      ctx.fillText(`Lives −1  Left: ${s.lives}`, CANVAS_W / 2, 24);
      ctx.restore();
    }

    // Power-up flash
    if (now < s.powerFlashUntil) {
      const remain = s.powerFlashUntil - now;
      const a = Math.min(remain / 1500, 1) * (0.1 + 0.05 * Math.sin(now / 120));
      ctx.save();
      ctx.fillStyle = `rgba(99,102,241,${a})`;
      ctx.fillRect(0, 0, CANVAS_W, MAZE_H);
      ctx.font = `bold 13px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(251,191,36,${Math.min(remain / 1200, 1) * 0.92})`;
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 10;
      ctx.fillText('⚡ Power Pellet! Ghosts vulnerable! ⚡', CANVAS_W / 2, 24);
      ctx.restore();
    }

    // HUD bar
    ctx.save();
    const hudGrad = ctx.createLinearGradient(0, MAZE_H, CANVAS_W, MAZE_H + 30);
    hudGrad.addColorStop(0, 'rgba(99,102,241,0.12)');
    hudGrad.addColorStop(1, 'rgba(124,58,237,0.08)');
    ctx.fillStyle = hudGrad;
    ctx.fillRect(0, MAZE_H, CANVAS_W, 30);
    ctx.font = `11px ${FONT}`;
    ctx.fillStyle = 'rgba(167,139,250,0.85)';
    ctx.textAlign = 'left';
    ctx.fillText(`Level ${s.level}`, 10, MAZE_H + 20);
    ctx.textAlign = 'right';
    ctx.fillText('Lives', CANVAS_W - 10, MAZE_H + 20);
    for (let i = 0; i < 3; i++) {
      const lx = CANVAS_W - 30 - i * 20;
      const ly = MAZE_H + 15;
      ctx.save();
      if (i >= s.lives) ctx.globalAlpha = 0.18;
      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.arc(lx, ly, 7, 0.2, -0.2, true);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // Pause overlay
    if (pausedRef.current && s.status === 'playing') {
      ctx.save();
      ctx.fillStyle = 'rgba(8,7,26,0.82)';
      ctx.fillRect(0, 0, CANVAS_W, MAZE_H);
      ctx.font = `bold 22px ${FONT}`;
      ctx.fillStyle = '#a78bfa';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#7c3aed';
      ctx.shadowBlur = 20;
      ctx.fillText('⏸  Paused', CANVAS_W / 2, MAZE_H / 2);
      ctx.restore();
    }
  }, []);

  const moveEntity = useCallback(
    (x: number, y: number, dir: Dir, speed: number, maze: number[][], ghost: boolean): { x: number; y: number; dir: Dir } => {
      if (dir === 'none') return { x, y, dir };
      const { dx, dy } = DIR_VEC[dir];
      const nx = x + dx * speed;
      const ny = y + dy * speed;
      const tcx = Math.round(x);
      const tcy = Math.round(y);
      const ncx = Math.round(nx);
      const ncy = Math.round(ny);

      if (ncx !== tcx || ncy !== tcy) {
        if (!canEnter(maze, ncx, ncy, ghost)) {
          return { x: tcx, y: tcy, dir };
        }
      }
      return { x: nx, y: ny, dir };
    },
    [],
  );

  const tick = useCallback(
    (now: number) => {
      const s = stateRef.current;
      if (pausedRef.current || s.status === 'ready' || s.status === 'gameOver') return;

      if (s.status === 'levelWin') {
        s.levelWinTimer -= 16;
        if (s.levelWinTimer <= 0) {
          s.level += 1;
          s.maze = cloneMaze();
          s.pelletsLeft = countPellets(s.maze);
          s.pacX = PAC_START.x;
          s.pacY = PAC_START.y;
          s.pacDir = 'left';
          s.pacNext = 'left';
          s.scaredUntil = 0;
          s.ghostCombo = 0;
          s.ghosts = s.ghosts.map((g, i) => ({
            ...g,
            x: i === 3 ? 10 : 9 + i,
            y: i === 3 ? 9 : 10,
            dir: 'up' as Dir,
            scared: false,
            eaten: false,
          }));
          s.status = 'playing';
          syncUi(s);
        }
        return;
      }

      if (s.status === 'dying') {
        s.dieTimer -= 16;
        if (s.dieTimer <= 0) {
          if (s.lives <= 0) {
            s.status = 'gameOver';
            syncUi(s);
          } else {
            s.pacX = PAC_START.x;
            s.pacY = PAC_START.y;
            s.pacDir = 'left';
            s.pacNext = 'left';
            s.scaredUntil = 0;
            s.powerFlashUntil = 0;
            s.ghostCombo = 0;
            s.ghosts = s.ghosts.map((g, i) => ({
              ...g,
              x: i === 3 ? 10 : 9 + i,
              y: i === 3 ? 9 : 10,
              dir: 'up' as Dir,
              scared: false,
              eaten: false,
            }));
            s.status = 'ready';
            syncUi(s);
          }
        }
        return;
      }

      const levelSpeed = 1 + (s.level - 1) * 0.12;
      const pacSpeed = 0.08 * levelSpeed;
      const ghostSpeed = 0.065 * levelSpeed;

      const pacGridX = Math.round(s.pacX);
      const pacGridY = Math.round(s.pacY);

      // Mouth animation: only when actually moving, stops when hitting wall
      const betweenCells = Math.abs(s.pacX - pacGridX) > 0.05 || Math.abs(s.pacY - pacGridY) > 0.05;
      let canGoFwd = false;
      if (s.pacDir !== 'none') {
        const { dx, dy } = DIR_VEC[s.pacDir as Exclude<Dir, 'none'>];
        canGoFwd = canEnter(s.maze, pacGridX + dx, pacGridY + dy, false);
      }
      if (betweenCells || canGoFwd) {
        s.mouth += 0.18;
      }

      const atPacCenter =
        Math.abs(s.pacX - pacGridX) < 0.05 && Math.abs(s.pacY - pacGridY) < 0.05;

      if (atPacCenter) {
        s.pacX = pacGridX;
        s.pacY = pacGridY;
        const tryDir = s.pacNext !== 'none' ? s.pacNext : s.pacDir;
        if (tryDir !== 'none') {
          const { dx, dy } = DIR_VEC[tryDir];
          if (canEnter(s.maze, pacGridX + dx, pacGridY + dy, false)) {
            s.pacDir = tryDir;
          }
        }
        const cell = s.maze[pacGridY][pacGridX];
        if (cell === 0) {
          s.maze[pacGridY][pacGridX] = 4;
          s.pelletsLeft--;
          setPelletsLeft(s.pelletsLeft);
          addScore(10);
        } else if (cell === 2) {
          s.maze[pacGridY][pacGridX] = 4;
          s.pelletsLeft--;
          setPelletsLeft(s.pelletsLeft);
          addScore(10);
          s.scaredUntil = now + 8000;
          s.ghostCombo = 0;
          s.powerFlashUntil = now + 1500;
          s.ghosts.forEach(g => {
            g.scared = true;
            g.eaten = false;
          });
        }
        if (s.pelletsLeft <= 0) {
          s.status = 'levelWin';
          s.levelWinTimer = 2000;
          syncUi(s);
          return;
        }
      }

      const moved = moveEntity(s.pacX, s.pacY, s.pacDir, pacSpeed, s.maze, false);
      s.pacX = moved.x;
      s.pacY = moved.y;

      const pacGX = Math.round(s.pacX);
      const pacGY = Math.round(s.pacY);

      s.ghosts.forEach(g => {
        if (g.eaten) {
          const homeDist = dist(g.x, g.y, GHOST_HOME.x, GHOST_HOME.y);
          if (homeDist < 0.15) {
            g.eaten = false;
            g.scared = now < s.scaredUntil;
            g.x = GHOST_HOME.x;
            g.y = GHOST_HOME.y;
          } else {
            const toHome = pickGhostDir(
              { ...g, scared: true, kind: 'chase' },
              GHOST_HOME,
              s.maze,
            );
            g.dir = toHome;
            const gm = moveEntity(g.x, g.y, g.dir, ghostSpeed * 1.4, s.maze, true);
            g.x = gm.x;
            g.y = gm.y;
          }
          return;
        }

        g.scared = now < s.scaredUntil;
        const ggx = Math.round(g.x);
        const ggy = Math.round(g.y);
        const gCenter = Math.abs(g.x - ggx) < 0.05 && Math.abs(g.y - ggy) < 0.05;
        if (gCenter) {
          g.x = ggx;
          g.y = ggy;
          // Check if current direction is blocked by a wall
          const fwd = g.dir !== 'none' ? DIR_VEC[g.dir as Exclude<Dir, 'none'>] : null;
          const canContinue = fwd && canEnter(s.maze, ggx + fwd.dx, ggy + fwd.dy, true);
          if (!canContinue || isIntersection(s.maze, ggx, ggy, g.dir, true) || g.dir === 'none') {
            g.dir = pickGhostDir(g, { x: pacGX, y: pacGY }, s.maze);
          }
          if (g.kind === 'patrol' && Math.random() < 0.02) g.patrolPhase++;
        }
        const gm = moveEntity(g.x, g.y, g.dir, ghostSpeed, s.maze, true);
        g.x = gm.x;
        g.y = gm.y;

        const hit =
          Math.abs(g.x - s.pacX) < 0.55 &&
          Math.abs(g.y - s.pacY) < 0.55;
        if (hit) {
          if (g.scared) {
            g.eaten = true;
            const points = 200 * Math.pow(2, s.ghostCombo);
            s.ghostCombo++;
            addScore(points);
          } else if (s.status === 'playing') {
            s.lives--;
            s.status = 'dying';
            s.dieTimer = 800;
            syncUi(s);
            return;
          }
        }
      });
    },
    [addScore, moveEntity, syncUi],
  );

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    let raf: number;
    const loop = (t: number) => {
      if (t - lastTickRef.current > 16) {
        tick(t);
        lastTickRef.current = t;
      }
      draw(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [draw, tick]);

  const setDirection = useCallback((dir: Dir) => {
    const s = stateRef.current;
    if (s.status === 'ready') {
      s.status = 'playing';
      setOverlay(null);
    }
    if (s.status !== 'playing' || dir === 'none') return;
    s.pacNext = dir;
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const keyMap: Record<string, Dir> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
        W: 'up',
        S: 'down',
        A: 'left',
        D: 'right',
      };
      const dir = keyMap[e.key];
      if (dir) {
        e.preventDefault();
        setDirection(dir);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setDirection]);

  const restart = useCallback(() => {
    stateRef.current = createInitialState();
    resetScore();
    pausedRef.current = false;
    setPaused(false);
    syncUi(stateRef.current);
  }, [resetScore, syncUi]);

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      setDirection(dx > 0 ? 'right' : 'left');
    } else {
      setDirection(dy > 0 ? 'down' : 'up');
    }
    touchStart.current = null;
  };

  const DirBtn = ({ label, dir }: { label: string; dir: Exclude<Dir, 'none'> }) => (
    <button
      type="button"
      onClick={() => setDirection(dir)}
      onTouchStart={e => {
        e.preventDefault();
        setDirection(dir);
      }}
      style={{
        width: 56,
        height: 56,
        borderRadius: 14,
        fontSize: 20,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        touchAction: 'manipulation',
        fontFamily: FONT,
        background: 'rgba(99,102,241,0.08)',
        border: '1px solid rgba(139,92,246,0.2)',
        color: THEME_COLOR,
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );

  const pelletPct = Math.round((pelletsLeft / PELLETS_PER_LEVEL) * 100);

  return (
    <GameWrapper
      title={t.pacman.title}
      score={score}
      highScore={highScore}
      scoreLabel={t.common.score}
      controls={
        <div className="flex gap-2">
          <button type="button" onClick={restart} className="btn-premium">
            {t.common.newGame}
          </button>
          <button
            type="button"
            onClick={() => setPaused(p => !p)}
            className="px-5 py-2.5 bg-white/8 hover:bg-white/15 rounded-xl text-white/80 text-sm font-medium transition-colors"
          >
            {paused ? t.common.continue : t.common.pause}
          </button>
          <button type="button" onClick={() => setShowRules(!showRules)} className="btn-ghost">
            {showRules ? t.common.closeRules : '❓ ' + t.common.rules}
          </button>
          <LeaderboardPanel gameId="pacman" currentScore={score} gameOver={overlay === 'gameOver'} />
        </div>
      }
    >
      <div className="flex flex-col items-center gap-3">
        {showRules && (
          <div
            style={{
              width: '100%',
              maxWidth: 'min(95vw, 500px)',
              borderRadius: 16,
              padding: '20px 24px',
              fontFamily: FONT,
              color: '#c4b5fd',
              background: 'rgba(99,102,241,0.05)',
              border: '1px solid rgba(139,92,246,0.15)',
              lineHeight: 1.9,
              marginBottom: 10,
            }}
          >
            <p style={{ fontWeight: 700, marginBottom: 10, fontSize: 14, color: '#a78bfa' }}>{t.common.rules}</p>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div>🎯 {t.pacman.ruleTarget}</div>
              <div>👻 {t.pacman.ruleGhosts}</div>
              <div>⚡ {t.pacman.rulePowerup}</div>
              <div>🏆 Pellet +10, Ghost combo 200→400→800→1600</div>
              <div>💡 Use corners to lose ghosts; counter-attack after Power Pellet</div>
            </div>
          </div>
        )}

        <div
          style={{
            width: 'min(95vw, 500px)',
            padding: '14px 20px',
            borderRadius: 12,
            fontFamily: FONT,
            background: 'rgba(99,102,241,0.06)',
            border: '1px solid rgba(139,92,246,0.18)',
            boxShadow: '0 0 20px rgba(124,58,237,0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 12,
              color: 'rgba(167,139,250,0.9)',
              marginBottom: 6,
              letterSpacing: 0.3,
            }}
          >
            <span>{t.pacman.levelN.replace('{n}', '')} <strong style={{ color: '#fbbf24' }}>{level}</strong></span>
            <span>
              {t.pacman.pelletsLeft} <strong style={{ color: THEME_COLOR }}>{pelletPct}%</strong>
            </span>
          </div>
          <div
            style={{
              height: 6,
              borderRadius: 4,
              background: 'rgba(99,102,241,0.12)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${pelletPct}%`,
                height: '100%',
                borderRadius: 4,
                background: 'linear-gradient(90deg, rgba(139,92,246,0.5), #a78bfa)',
                boxShadow: '0 0 12px rgba(139,92,246,0.5)',
                transition: 'width 0.15s ease-out',
              }}
            />
          </div>
        </div>

        <div
          className="relative"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={e => e.preventDefault()}
          style={{ touchAction: 'none' }}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="rounded-2xl border border-[rgba(139,92,246,0.25)]"
            style={{
              width: 'min(95vw, 500px)',
              height: 'auto',
              boxShadow: '0 0 30px rgba(124,58,237,0.12)',
            }}
          />
          {overlay === 'ready' && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl"
              style={{ background: 'rgba(0,0,0,0.18)' }}>
              <div
                className="flex items-center justify-center rounded-2xl backdrop-blur-xl border border-[rgba(139,92,246,0.3)] overflow-hidden"
                style={{
                  background: 'rgba(8,7,26,0.82)',
                  fontFamily: FONT,
                  padding: '28px 24px',
                  animation: 'popIn 0.4s ease-out',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  position: 'relative',
                }}
              >
                <div className="text-center px-4 relative z-10">
                  <div
                    className="text-3xl sm:text-4xl font-bold mb-3"
                    style={{ color: '#facc15', textShadow: '0 0 20px rgba(251,191,36,0.4)' }}
                  >
                    PAC
                  </div>
                  <div className="text-[#a78bfa] text-sm sm:text-base mb-4 font-medium">Arrow keys or WASD to start</div>
                  <div
                    className="inline-flex items-center gap-3 px-4 py-2 rounded-full text-xs"
                    style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: 'rgba(167,139,250,0.8)' }}
                  >
                    <span>{fmt(t.pacman.levelN, { n: level })}</span>
                    <span style={{ color: 'rgba(139,92,246,0.3)' }}>|</span>
                    <span>Lives {lives}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {overlay === 'levelWin' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
              style={{ background: 'rgba(0,0,0,0.18)' }}>
              <div className="text-center px-8 py-6 rounded-2xl backdrop-blur-xl border border-[rgba(251,191,36,0.3)]"
                style={{ background: 'rgba(8,7,26,0.82)', fontFamily: FONT, animation: 'popIn 0.4s ease-out', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                <div className="text-3xl font-bold text-[#fbbf24] mb-2" style={{ textShadow: '0 0 20px rgba(251,191,36,0.4)' }}>
                  🎉 {t.pacman.levelComplete}
                </div>
                <div className="text-sm text-[#a78bfa]">{t.pacman.nextLevelSoon}</div>
              </div>
            </div>
          )}
          {overlay === 'gameOver' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
              style={{ background: 'rgba(0,0,0,0.18)' }}>
              <div className="text-center px-8 py-6 rounded-2xl backdrop-blur-xl border border-[rgba(239,68,68,0.3)]"
                style={{ background: 'rgba(8,7,26,0.82)', fontFamily: FONT, animation: 'popIn 0.4s ease-out', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                <div
                  className="text-4xl sm:text-5xl font-bold mb-3"
                  style={{ color: '#f87171', textShadow: '0 0 24px rgba(239,68,68,0.4)' }}
                >
                  {t.common.gameOver}
                </div>
                <div className="text-lg mb-6" style={{ color: '#a78bfa' }}>
                  Final Score <strong style={{ color: '#fbbf24' }}>{score.toLocaleString()}</strong>
                </div>
                <button type="button" onClick={restart} className="btn-premium">
                  {t.common.restart}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-2" style={{ touchAction: 'none' }}>
          <DirBtn label="↑" dir="up" />
          <div className="flex gap-2">
            <DirBtn label="←" dir="left" />
            <div style={{ width: 56, height: 56 }} />
            <DirBtn label="→" dir="right" />
          </div>
          <DirBtn label="↓" dir="down" />
        </div>
      </div>
      <p
        style={{
          fontSize: 11,
          textAlign: 'center',
          marginTop: 10,
          color: 'rgba(167,139,250,0.3)',
          fontFamily: FONT,
          letterSpacing: 0.5,
        }}
      >
        {t.pacman.controls}
      </p>
    </GameWrapper>
  );
}
