import { useRef, useEffect, useState, useCallback } from 'react';
import GameWrapper from '../../components/GameWrapper';
import { useGameScore } from '../../hooks/useGameScore';
import LeaderboardPanel from '../../components/LeaderboardPanel';
import { useI18n } from '../../i18n';

const W = 400;
const H = 500;

const ROW_COLORS = ['#ff1744', '#d500f9', '#00e5ff', '#ff9100', '#ffea00'];
const ROW_POINTS = [50, 40, 30, 20, 10];

const ALIEN_ROWS = 5;
const ALIEN_COLS = 8;
const ALIEN_W = 32;
const ALIEN_H = 24;
const ALIEN_PAD_X = 12;
const ALIEN_PAD_Y = 14;
const FORMATION_LEFT = 24;
const FORMATION_TOP = 56;

const PLAYER_W = 36;
const PLAYER_H = 18;
const PLAYER_Y = H - 48;
const PLAYER_SPEED = 4.5;

const BULLET_W = 3;
const BULLET_H = 12;
const PLAYER_BULLET_SPEED = 7;
const ENEMY_BULLET_SPEED = 3.2;

const UFO_Y = 28;
const UFO_W = 40;
const UFO_H = 16;
const UFO_SPEED = 2;

const BG = '#020108';
const PLAYER_COLOR = '#76ff03';

type Alien = {
  row: number;
  col: number;
  alive: boolean;
};

type Bullet = { x: number; y: number };
type Ufo = { x: number; dir: number; blink: number };

// 8-bit style sprites (two animation frames), 11 cols x 8 rows per frame
type AlienSprite = number[][][];

const SPRITE_A: AlienSprite = [
  [
    [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0],
  ],
  [
    [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  ],
];

const SPRITE_B: AlienSprite = [
  [
    [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0],
    [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  ],
  [
    [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
    [0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0],
    [0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0],
    [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0],
  ],
];

const SPRITE_C: AlienSprite = [
  [
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
  ],
];

const ROW_SPRITES = [SPRITE_A, SPRITE_A, SPRITE_B, SPRITE_C, SPRITE_C];

function hexGlow(ctx: CanvasRenderingContext2D, color: string, blur: number) {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
}

function clearGlow(ctx: CanvasRenderingContext2D) {
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
}

function createAliens(): Alien[] {
  const aliens: Alien[] = [];
  for (let r = 0; r < ALIEN_ROWS; r++) {
    for (let c = 0; c < ALIEN_COLS; c++) {
      aliens.push({ row: r, col: c, alive: true });
    }
  }
  return aliens;
}

function alienPixelSize(row: number): number {
  return row === 0 ? 3 : 3;
}

function getFormationBounds(aliens: Alien[], formX: number, formY: number) {
  let minX = W;
  let maxX = 0;
  let maxY = 0;
  for (const a of aliens) {
    if (!a.alive) continue;
    const x = FORMATION_LEFT + a.col * (ALIEN_W + ALIEN_PAD_X) + formX;
    const y = FORMATION_TOP + a.row * (ALIEN_H + ALIEN_PAD_Y) + formY;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x + ALIEN_W);
    maxY = Math.max(maxY, y + ALIEN_H);
  }
  return { minX, maxX, maxY };
}

function countAlive(aliens: Alien[]): number {
  return aliens.filter(a => a.alive).length;
}

function bottomAliensInColumn(aliens: Alien[]): Alien[] {
  const map = new Map<number, Alien>();
  for (const a of aliens) {
    if (!a.alive) continue;
    const prev = map.get(a.col);
    if (!prev || a.row > prev.row) map.set(a.col, a);
  }
  return [...map.values()];
}

export default function Invaders() {
  const { score, highScore, addScore, resetScore } = useGameScore('invaders');
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  const [overlay, setOverlay] = useState<'idle' | 'playing' | 'paused' | 'over' | 'wave'>('idle');
  const [wave, setWave] = useState(1);
  const [lives, setLives] = useState(3);
  const [showRules, setShowRules] = useState(false);

  const pausedRef = useRef(false);
  const overlayRef = useRef<'idle' | 'playing' | 'paused' | 'over' | 'wave'>('idle');
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);

  const playerXRef = useRef(W / 2 - PLAYER_W / 2);
  const keysRef = useRef({ left: false, right: false });
  const aliensRef = useRef<Alien[]>(createAliens());
  const formXRef = useRef(0);
  const formYRef = useRef(0);
  const formDirRef = useRef(1);
  const animFrameRef = useRef(0);
  const moveTimerRef = useRef(0);
  const playerBulletRef = useRef<Bullet | null>(null);
  const enemyBulletsRef = useRef<Bullet[]>([]);
  const enemyShootTimerRef = useRef(0);
  const ufoRef = useRef<Ufo | null>(null);
  const ufoSpawnTimerRef = useRef(8 + Math.random() * 12);
  const livesRef = useRef(3);
  const waveRef = useRef(1);
  const invulnerableRef = useRef(0);

  const syncOverlay = useCallback((next: typeof overlay) => {
    overlayRef.current = next;
    setOverlay(next);
  }, []);

  const drawStars = useCallback((ctx: CanvasRenderingContext2D, t: number) => {
    for (let i = 0; i < 48; i++) {
      const sx = (i * 137 + 41) % W;
      const sy = (i * 89 + 17) % H;
      const twinkle = 0.08 + ((Math.sin(t * 0.002 + i) + 1) / 2) * 0.22;
      ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
      ctx.fillRect(sx, sy, i % 3 === 0 ? 2 : 1, 1);
    }
  }, []);

  const drawPixelSprite = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      sprite: number[][],
      x: number,
      y: number,
      color: string,
      px: number,
    ) => {
      hexGlow(ctx, color, 6);
      ctx.fillStyle = color;
      for (let r = 0; r < sprite.length; r++) {
        for (let c = 0; c < sprite[r].length; c++) {
          if (!sprite[r][c]) continue;
          ctx.fillRect(x + c * px, y + r * px, px, px);
        }
      }
      clearGlow(ctx);
    },
    [],
  );

  const drawPlayerShip = useCallback((ctx: CanvasRenderingContext2D, x: number, alpha: number) => {
    const y = PLAYER_Y;
    ctx.save();
    ctx.globalAlpha = alpha;
    hexGlow(ctx, PLAYER_COLOR, 10);
    ctx.fillStyle = PLAYER_COLOR;
    // Simple pixel ship
    const body = [
      [0, 0, 0, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 0, 1, 1, 1, 0, 1, 1],
    ];
    const px = 4;
    const ox = x + (PLAYER_W - body[0].length * px) / 2;
    for (let r = 0; r < body.length; r++) {
      for (let c = 0; c < body[r].length; c++) {
        if (!body[r][c]) continue;
        ctx.fillRect(ox + c * px, y + r * px, px, px);
      }
    }
    clearGlow(ctx);
    ctx.restore();
  }, []);

  const drawUfo = useCallback((ctx: CanvasRenderingContext2D, ufo: Ufo) => {
    const color = ufo.blink % 2 === 0 ? '#ff1744' : '#ff5252';
    hexGlow(ctx, color, 12);
    ctx.fillStyle = color;
    const x = ufo.x;
    const y = UFO_Y;
    ctx.fillRect(x + 8, y, UFO_W - 16, 4);
    ctx.fillRect(x + 4, y + 4, UFO_W - 8, 6);
    ctx.fillRect(x, y + 8, UFO_W, 4);
    ctx.fillRect(x + 6, y + 12, 6, 4);
    ctx.fillRect(x + UFO_W - 12, y + 12, 6, 4);
    clearGlow(ctx);
  }, []);

  const drawLives = useCallback((ctx: CanvasRenderingContext2D) => {
    for (let i = 0; i < livesRef.current; i++) {
      drawPlayerShip(ctx, 12 + i * 28, 0.85);
    }
  }, [drawPlayerShip]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const t = performance.now();

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);
    drawStars(ctx, t);

    const formX = formXRef.current;
    const formY = formYRef.current;
    const frame = animFrameRef.current % 2;

    for (const alien of aliensRef.current) {
      if (!alien.alive) continue;
      const sprites = ROW_SPRITES[alien.row];
      const sprite = sprites[frame];
      const px = alienPixelSize(alien.row);
      const ax = FORMATION_LEFT + alien.col * (ALIEN_W + ALIEN_PAD_X) + formX;
      const ay = FORMATION_TOP + alien.row * (ALIEN_H + ALIEN_PAD_Y) + formY;
      drawPixelSprite(ctx, sprite, ax, ay, ROW_COLORS[alien.row], px);
    }

    if (ufoRef.current) {
      drawUfo(ctx, ufoRef.current);
    }

    const pb = playerBulletRef.current;
    if (pb) {
      hexGlow(ctx, PLAYER_COLOR, 8);
      ctx.fillStyle = PLAYER_COLOR;
      ctx.fillRect(pb.x - BULLET_W / 2, pb.y, BULLET_W, BULLET_H);
      clearGlow(ctx);
    }

    for (const eb of enemyBulletsRef.current) {
      hexGlow(ctx, '#ff1744', 4);
      ctx.fillStyle = '#ff5252';
      ctx.fillRect(eb.x - 2, eb.y, 4, 8);
      clearGlow(ctx);
    }

    const blink = invulnerableRef.current > 0 && Math.floor(t / 80) % 2 === 0;
    if (!blink) {
      drawPlayerShip(ctx, playerXRef.current, 1);
    }

    drawLives(ctx);
  }, [drawStars, drawPixelSprite, drawUfo, drawPlayerShip, drawLives]);

  const firePlayerBullet = useCallback(() => {
    if (overlayRef.current !== 'playing' || pausedRef.current) return;
    if (playerBulletRef.current) return;
    playerBulletRef.current = {
      x: playerXRef.current + PLAYER_W / 2,
      y: PLAYER_Y - 4,
    };
  }, []);

  const loseLife = useCallback(() => {
    livesRef.current--;
    setLives(livesRef.current);
    playerBulletRef.current = null;
    enemyBulletsRef.current = [];
    playerXRef.current = W / 2 - PLAYER_W / 2;
    invulnerableRef.current = 1800;
    formYRef.current = 0;

    if (livesRef.current <= 0) {
      syncOverlay('over');
      return;
    }
  }, [syncOverlay]);

  const startNextWave = useCallback(() => {
    waveRef.current += 1;
    setWave(waveRef.current);
    aliensRef.current = createAliens();
    formXRef.current = 0;
    formYRef.current = 0;
    formDirRef.current = 1;
    moveTimerRef.current = 0;
    enemyBulletsRef.current = [];
    playerBulletRef.current = null;
    ufoRef.current = null;
    ufoSpawnTimerRef.current = 10 + Math.random() * 15;
    syncOverlay('playing');
  }, [syncOverlay]);

  const getMoveInterval = useCallback(() => {
    const alive = countAlive(aliensRef.current);
    const base = Math.max(280, 720 - (waveRef.current - 1) * 45);
    const speedup = (40 - alive) * 8;
    return Math.max(120, base - speedup);
  }, []);

  const moveAliensStep = useCallback(() => {
    const aliens = aliensRef.current;
    if (countAlive(aliens) === 0) return;

    animFrameRef.current += 1;
    const dir = formDirRef.current;
    const nextX = formXRef.current + dir * 8;
    const bounds = getFormationBounds(aliens, nextX, formYRef.current);

    if (bounds.minX <= 8 || bounds.maxX >= W - 8) {
      formDirRef.current = -dir;
      formYRef.current += 14;
      const afterDrop = getFormationBounds(aliens, formXRef.current, formYRef.current);
      if (afterDrop.maxY >= PLAYER_Y - 8) {
        loseLife();
      }
    } else {
      formXRef.current = nextX;
    }
  }, [loseLife]);

  const tryEnemyShot = useCallback(() => {
    const shooters = bottomAliensInColumn(aliensRef.current);
    if (shooters.length === 0) return;
    const shooter = shooters[Math.floor(Math.random() * shooters.length)];
    const ax =
      FORMATION_LEFT +
      shooter.col * (ALIEN_W + ALIEN_PAD_X) +
      formXRef.current +
      ALIEN_W / 2;
    const ay =
      FORMATION_TOP +
      shooter.row * (ALIEN_H + ALIEN_PAD_Y) +
      formYRef.current +
      ALIEN_H;
    enemyBulletsRef.current.push({ x: ax, y: ay });
  }, []);

  const hitTestAliens = useCallback((bx: number, by: number): Alien | null => {
    for (const alien of aliensRef.current) {
      if (!alien.alive) continue;
      const ax = FORMATION_LEFT + alien.col * (ALIEN_W + ALIEN_PAD_X) + formXRef.current;
      const ay = FORMATION_TOP + alien.row * (ALIEN_H + ALIEN_PAD_Y) + formYRef.current;
      if (bx >= ax && bx <= ax + ALIEN_W && by >= ay && by <= ay + ALIEN_H) {
        return alien;
      }
    }
    return null;
  }, []);

  const update = useCallback(
    (dt: number) => {
      if (overlayRef.current !== 'playing' || pausedRef.current) return;

      if (invulnerableRef.current > 0) {
        invulnerableRef.current -= dt;
      }

      const keys = keysRef.current;
      let px = playerXRef.current;
      if (keys.left) px -= PLAYER_SPEED;
      if (keys.right) px += PLAYER_SPEED;
      playerXRef.current = Math.max(4, Math.min(W - PLAYER_W - 4, px));

      moveTimerRef.current += dt;
      const interval = getMoveInterval();
      while (moveTimerRef.current >= interval) {
        moveTimerRef.current -= interval;
        moveAliensStep();
      }

      const pb = playerBulletRef.current;
      if (pb) {
        pb.y -= PLAYER_BULLET_SPEED;
        if (pb.y + BULLET_H < 0) {
          playerBulletRef.current = null;
        } else {
          const hit = hitTestAliens(pb.x, pb.y);
          if (hit) {
            hit.alive = false;
            addScore(ROW_POINTS[hit.row]);
            playerBulletRef.current = null;
            if (countAlive(aliensRef.current) === 0) {
              syncOverlay('wave');
            }
          } else if (ufoRef.current) {
            const u = ufoRef.current;
            if (
              pb.x >= u.x &&
              pb.x <= u.x + UFO_W &&
              pb.y >= UFO_Y &&
              pb.y <= UFO_Y + UFO_H
            ) {
              addScore(100);
              ufoRef.current = null;
              playerBulletRef.current = null;
            }
          }
        }
      }

      enemyShootTimerRef.current += dt;
      const shootDelay = Math.max(600, 1400 - waveRef.current * 60);
      if (enemyShootTimerRef.current >= shootDelay) {
        enemyShootTimerRef.current = 0;
        if (Math.random() < 0.55) tryEnemyShot();
      }

      enemyBulletsRef.current = enemyBulletsRef.current.filter(b => {
        b.y += ENEMY_BULLET_SPEED;
        return b.y < H;
      });

      const playerTop = PLAYER_Y;
      const playerBottom = PLAYER_Y + PLAYER_H;
      if (invulnerableRef.current <= 0) {
        for (const eb of enemyBulletsRef.current) {
          if (
            eb.x >= playerXRef.current &&
            eb.x <= playerXRef.current + PLAYER_W &&
            eb.y + 8 >= playerTop &&
            eb.y <= playerBottom
          ) {
            enemyBulletsRef.current = enemyBulletsRef.current.filter(b => b !== eb);
            loseLife();
            break;
          }
        }
      }

      ufoSpawnTimerRef.current -= dt / 1000;
      if (!ufoRef.current && ufoSpawnTimerRef.current <= 0) {
        ufoRef.current = {
          x: Math.random() > 0.5 ? -UFO_W : W,
          dir: Math.random() > 0.5 ? 1 : -1,
          blink: 0,
        };
        if (ufoRef.current.dir === 1) ufoRef.current.x = -UFO_W;
        else ufoRef.current.x = W;
        ufoSpawnTimerRef.current = 14 + Math.random() * 18;
      }

      if (ufoRef.current) {
        const u = ufoRef.current;
        u.x += u.dir * UFO_SPEED;
        u.blink += 1;
        if (u.x < -UFO_W - 10 || u.x > W + 10) {
          ufoRef.current = null;
        }
      }
    },
    [addScore, getMoveInterval, hitTestAliens, loseLife, moveAliensStep, syncOverlay, tryEnemyShot],
  );

  const loop = useCallback(
    (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = Math.min(32, time - lastTimeRef.current);
      lastTimeRef.current = time;

      update(dt);
      draw();
      rafRef.current = requestAnimationFrame(loop);
    },
    [update, draw],
  );

  const startGame = useCallback(() => {
    aliensRef.current = createAliens();
    formXRef.current = 0;
    formYRef.current = 0;
    formDirRef.current = 1;
    moveTimerRef.current = 0;
    animFrameRef.current = 0;
    playerXRef.current = W / 2 - PLAYER_W / 2;
    playerBulletRef.current = null;
    enemyBulletsRef.current = [];
    enemyShootTimerRef.current = 0;
    ufoRef.current = null;
    ufoSpawnTimerRef.current = 8 + Math.random() * 10;
    livesRef.current = 3;
    setLives(3);
    waveRef.current = 1;
    setWave(1);
    invulnerableRef.current = 0;
    pausedRef.current = false;
    setPaused(false);
    resetScore();
    syncOverlay('playing');
    lastTimeRef.current = 0;
  }, [resetScore, syncOverlay]);

  const restart = useCallback(() => {
    startGame();
  }, [startGame]);

  useEffect(() => {
    pausedRef.current = paused;
    if (paused && overlayRef.current === 'playing') {
      syncOverlay('paused');
    } else if (!paused && overlayRef.current === 'paused') {
      syncOverlay('playing');
    }
  }, [paused, syncOverlay]);

  useEffect(() => {
    draw();
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw, loop]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        keysRef.current.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        keysRef.current.right = true;
      }
      if (e.key === ' ') {
        e.preventDefault();
        firePlayerBullet();
      }
      if (e.key === 'p' || e.key === 'P') {
        if (overlayRef.current === 'playing' || overlayRef.current === 'paused') {
          setPaused(p => !p);
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [firePlayerBullet]);

  const TB = ({
    label,
    onClick,
    onHoldStart,
    onHoldEnd,
  }: {
    label: string;
    onClick?: () => void;
    onHoldStart?: () => void;
    onHoldEnd?: () => void;
  }) => (
    <button
      onClick={onClick}
      onTouchStart={(e) => {
        e.preventDefault();
        onHoldStart?.();
        onClick?.();
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        onHoldEnd?.();
      }}
      onMouseDown={() => onHoldStart?.()}
      onMouseUp={() => onHoldEnd?.()}
      onMouseLeave={() => onHoldEnd?.()}
      className="flex-1 py-4 rounded-xl text-lg font-bold select-none transition-colors border border-[rgba(118,255,3,0.15)] bg-[rgba(118,255,3,0.08)] active:bg-[rgba(118,255,3,0.2)] text-[#76ff03]"
      style={{ touchAction: 'manipulation' }}
    >
      {label}
    </button>
  );

  const showOverlay =
    overlay === 'idle' ||
    overlay === 'paused' ||
    overlay === 'over' ||
    overlay === 'wave';

  return (
    <GameWrapper
      title={t.invaders.title}
      score={score}
      highScore={highScore}
      controls={
        <div className="flex gap-2">
          <button onClick={restart} className="btn-premium">
            {t.common.newGame}
          </button>
          <button
            onClick={() => setPaused(p => !p)}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-medium transition-colors"
          >
            {paused ? t.common.continue : t.common.pause}
          </button>
          <button onClick={() => setShowRules(!showRules)} className="btn-ghost">
            {showRules ? t.common.closeRules : '❓ ' + t.common.rules}
          </button>
          <LeaderboardPanel gameId="invaders" currentScore={score} gameOver={overlay === 'over'} />
        </div>
      }
    >
      {showRules && (
        <div
          style={{
            borderRadius: 12,
            padding: '18px 24px',
            marginBottom: 12,
            background: 'rgba(118,255,3,0.08)',
            border: '1px solid rgba(118,255,3,0.15)',
            color: 'rgba(204,255,144,0.95)',
            fontSize: 13,
            lineHeight: 1.8,
            fontFamily: "'Courier New', Courier, monospace",
            width: '100%',
            maxWidth: 400,
          }}
        >
          <div>🎯 {t.invaders.ruleGoal}</div>
          <div>🔫 {t.invaders.ruleShooting}</div>
          <div>👾 {t.invaders.ruleAliens}</div>
          <div>🛸 UFO：{t.invaders.ruleUFO}</div>
          <div>❤️ {t.invaders.ruleLives}</div>
          <div>💡 {t.invaders.ruleTip}</div>
        </div>
      )}

      <div className="flex flex-col items-center gap-3 w-full max-w-[400px]">
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderRadius: 12,
            background: 'rgba(118,255,3,0.06)',
            border: '1px solid rgba(118,255,3,0.15)',
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: 13,
            color: '#76ff03',
          }}
        >
          <span style={{ fontWeight: 700, letterSpacing: 1 }}>WAVE {wave}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'rgba(118,255,3,0.55)', fontSize: 11 }}>LIVES</span>
            {Array.from({ length: 3 }, (_, i) => (
              <span
                key={i}
                style={{
                  opacity: i < lives ? 1 : 0.2,
                  fontSize: 16,
                  filter: i < lives ? 'drop-shadow(0 0 4px rgba(118,255,3,0.6))' : 'none',
                }}
              >
                ❤️
              </span>
            ))}
          </span>
        </div>

        <div className="relative w-full">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="rounded-xl w-full"
            style={{
              border: '1px solid rgba(118,255,3,0.25)',
              imageRendering: 'pixelated',
              touchAction: 'none',
            }}
            onClick={() => {
              if (overlay === 'idle') startGame();
              else firePlayerBullet();
            }}
          />
          {showOverlay && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
              style={{ background: 'rgba(0,0,0,0.18)' }}
            >
            <div
              className="flex flex-col items-center justify-center rounded-2xl backdrop-blur-xl border-3 border-[rgba(255,45,149,0.4)]"
              style={{
                background: 'rgba(26,10,46,0.82)',
                padding: '28px 24px',
                animation: 'popIn 0.4s ease-out',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                maxWidth: '90%',
              }}
            >
              <div className="text-3xl mb-3" style={{ animation: overlay === 'over' ? 'wiggle 1s ease-in-out infinite' : 'bounce 1.5s ease-in-out infinite' }}>
                {overlay === 'idle' && '👾'}
                {overlay === 'paused' && '⏸️'}
                {overlay === 'over' && '💀'}
                {overlay === 'wave' && '🎉'}
              </div>
              {overlay === 'idle' ? (
                <div
                  style={{
                    textAlign: 'center',
                    marginBottom: 16,
                    lineHeight: 1.1,
                  }}
                >
                  <div
                    style={{
                      fontSize: 'clamp(28px, 8vw, 42px)',
                      fontWeight: 900,
                      color: '#76ff03',
                      textShadow:
                        '3px 3px 0 rgba(0,80,0,0.8), 0 0 24px rgba(118,255,3,0.45)',
                      letterSpacing: 4,
                      imageRendering: 'pixelated',
                    }}
                  >
                    SPACE
                  </div>
                  <div
                    style={{
                      fontSize: 'clamp(22px, 6vw, 34px)',
                      fontWeight: 900,
                      color: '#b2ff59',
                      textShadow:
                        '2px 2px 0 rgba(0,60,0,0.75), 0 0 18px rgba(118,255,3,0.35)',
                      letterSpacing: 6,
                      marginTop: 4,
                    }}
                  >
                    INVADERS
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 14,
                      color: 'rgba(118,255,3,0.65)',
                      letterSpacing: 2,
                    }}
                  >
                    Defend Earth
                  </div>
                </div>
              ) : (
                <div className="text-xl sm:text-2xl font-black mb-2 text-white">
                  {overlay === 'paused' && t.common.paused}
                  {overlay === 'over' && t.common.gameOver}
                  {overlay === 'wave' && `Wave ${wave} cleared!`}
                </div>
              )}
              {overlay === 'over' && (
                <div className="text-sm mb-4 font-bold text-[#ffe93e]">
                  Score: {score.toLocaleString()}
                </div>
              )}
              {overlay === 'wave' && (
                <div className="text-sm mb-4 text-[#c8a0e0]">
                  {t.invaders.nextWaveFaster}
                </div>
              )}
              <button
                onClick={() => {
                  if (overlay === 'idle') startGame();
                  else if (overlay === 'paused') setPaused(false);
                  else if (overlay === 'over') restart();
                  else if (overlay === 'wave') startNextWave();
                }}
                className="btn-premium"
              >
                {overlay === 'idle' && t.invaders.start}
                {overlay === 'paused' && t.common.continue}
                {overlay === 'over' && t.common.restart}
                {overlay === 'wave' && t.invaders.nextWave}
              </button>
            </div>
            </div>
          )}
        </div>

        <div className="w-full flex gap-2" style={{ touchAction: 'none' }}>
          <TB
            label="←"
            onHoldStart={() => {
              keysRef.current.left = true;
            }}
            onHoldEnd={() => {
              keysRef.current.left = false;
            }}
          />
          <TB label="🔫" onClick={firePlayerBullet} />
          <TB
            label="→"
            onHoldStart={() => {
              keysRef.current.right = true;
            }}
            onHoldEnd={() => {
              keysRef.current.right = false;
            }}
          />
        </div>
      </div>

      <p
        className="hidden sm:block"
        style={{
          fontSize: 11,
          textAlign: 'center',
          marginTop: 10,
          color: 'rgba(118,255,3,0.25)',
          fontFamily: "'Courier New', Courier, monospace",
          letterSpacing: 1.5,
        }}
      >
        ← → {t.invaders.controls}
      </p>
    </GameWrapper>
  );
}
