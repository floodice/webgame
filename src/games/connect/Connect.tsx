import { useState, useCallback, useEffect, useRef, type RefObject } from 'react';
import GameWrapper from '../../components/GameWrapper';
import { useGameScore } from '../../hooks/useGameScore';
import LeaderboardPanel from '../../components/LeaderboardPanel';
import { useIdleHint } from '../../hooks/useIdleHint';
import { useI18n, fmt } from '../../i18n';

const ROWS = 8;
const COLS = 12;
const INITIAL_TIME = 120;
const MATCH_POINTS = 100;

const TILE_EMOJIS = [
  '🐼', '🎋', '🍃', '🌿', '🎍', '🦎', '🐸', '🦉',
  '🍵', '🏮', '🎐', '🪷', '🌸', '🍊', '🥢', '🎎',
  '🐉', '🧧', '🪴', '🌾', '🍡', '🎭', '🪨', '⛩️',
];

type Cell = string | null;
type Pos = { r: number; c: number };
type ExtPos = { er: number; ec: number };

function buildTilePool(): string[] {
  // 20 types × 4 tiles + 4 types × 4 tiles = 96 (each count is even, ≥20 types)
  const pool: string[] = [];
  for (let i = 0; i < 24; i++) {
    const emoji = TILE_EMOJIS[i % TILE_EMOJIS.length];
    for (let k = 0; k < 4; k++) pool.push(emoji);
  }
  return pool;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function toExt(r: number, c: number): ExtPos {
  return { er: r + 1, ec: c + 1 };
}

function fromExt(er: number, ec: number): Pos | null {
  if (er < 1 || er > ROWS || ec < 1 || ec > COLS) return null;
  return { r: er - 1, c: ec - 1 };
}

function isExtEmpty(grid: Cell[][], er: number, ec: number): boolean {
  const rows = ROWS + 2;
  const cols = COLS + 2;
  if (er < 0 || ec < 0 || er >= rows || ec >= cols) return false;
  if (er === 0 || ec === 0 || er === rows - 1 || ec === cols - 1) return true;
  const pos = fromExt(er, ec);
  if (!pos) return false;
  return grid[pos.r][pos.c] === null;
}

function lineClearH(grid: Cell[][], er: number, ec1: number, ec2: number): boolean {
  const lo = Math.min(ec1, ec2);
  const hi = Math.max(ec1, ec2);
  for (let ec = lo + 1; ec < hi; ec++) {
    if (!isExtEmpty(grid, er, ec)) return false;
  }
  return true;
}

function lineClearV(grid: Cell[][], ec: number, er1: number, er2: number): boolean {
  const lo = Math.min(er1, er2);
  const hi = Math.max(er1, er2);
  for (let er = lo + 1; er < hi; er++) {
    if (!isExtEmpty(grid, er, ec)) return false;
  }
  return true;
}

function findConnectPath(grid: Cell[][], r1: number, c1: number, r2: number, c2: number): ExtPos[] | null {
  if (r1 === r2 && c1 === c2) return null;
  const a = toExt(r1, c1);
  const b = toExt(r2, c2);
  const { er: er1, ec: ec1 } = a;
  const { er: er2, ec: ec2 } = b;

  if (grid[r1][c1] !== grid[r2][c2] || grid[r1][c1] === null) return null;

  // 0 turns
  if (er1 === er2 && lineClearH(grid, er1, ec1, ec2)) {
    return [a, b];
  }
  if (ec1 === ec2 && lineClearV(grid, ec1, er1, er2)) {
    return [a, b];
  }

  // 1 turn
  const corner1 = { er: er1, ec: ec2 };
  if (isExtEmpty(grid, corner1.er, corner1.ec)
    && lineClearV(grid, ec1, er1, er2)
    && lineClearH(grid, er1, ec1, ec2)) {
    return [a, corner1, b];
  }
  const corner2 = { er: er2, ec: ec1 };
  if (isExtEmpty(grid, corner2.er, corner2.ec)
    && lineClearH(grid, er1, ec1, ec2)
    && lineClearV(grid, ec2, er1, er2)) {
    return [a, corner2, b];
  }

  // 2 turns — scan horizontal bridge rows
  for (let er = 0; er <= ROWS + 1; er++) {
    const p1 = { er, ec: ec1 };
    const p2 = { er, ec: ec2 };
    if (isExtEmpty(grid, p1.er, p1.ec) && isExtEmpty(grid, p2.er, p2.ec)
      && lineClearV(grid, ec1, er1, er)
      && lineClearH(grid, er, ec1, ec2)
      && lineClearV(grid, ec2, er, er2)) {
      return [a, p1, p2, b];
    }
  }

  // 2 turns — scan vertical bridge columns
  for (let ec = 0; ec <= COLS + 1; ec++) {
    const p1 = { er: er1, ec };
    const p2 = { er: er2, ec };
    if (isExtEmpty(grid, p1.er, p1.ec) && isExtEmpty(grid, p2.er, p2.ec)
      && lineClearH(grid, er1, ec1, ec)
      && lineClearV(grid, ec, er1, er2)
      && lineClearH(grid, er2, ec, ec2)) {
      return [a, p1, p2, b];
    }
  }

  return null;
}

function findAnyPair(grid: Cell[][]): [Pos, Pos] | null {
  const tiles: Pos[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c]) tiles.push({ r, c });
    }
  }
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      const p1 = tiles[i];
      const p2 = tiles[j];
      if (grid[p1.r][p1.c] === grid[p2.r][p2.c] && findConnectPath(grid, p1.r, p1.c, p2.r, p2.c)) {
        return [p1, p2];
      }
    }
  }
  return null;
}

function hasRemainingTiles(grid: Cell[][]): boolean {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c]) return true;
    }
  }
  return false;
}

function createSolvableGrid(): Cell[][] {
  const pool = buildTilePool();
  for (let attempt = 0; attempt < 400; attempt++) {
    const flat = shuffleArray(pool);
    const grid: Cell[][] = [];
    for (let r = 0; r < ROWS; r++) {
      grid.push(flat.slice(r * COLS, (r + 1) * COLS));
    }
    if (findAnyPair(grid)) return grid;
  }
  // fallback: still playable after first shuffle hint
  const flat = shuffleArray(pool);
  const grid: Cell[][] = [];
  for (let r = 0; r < ROWS; r++) {
    grid.push(flat.slice(r * COLS, (r + 1) * COLS));
  }
  return grid;
}

function shuffleRemaining(grid: Cell[][]): Cell[][] {
  const values: string[] = [];
  const positions: Pos[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c]) {
        values.push(grid[r][c]!);
        positions.push({ r, c });
      }
    }
  }
  for (let attempt = 0; attempt < 200; attempt++) {
    const shuffled = shuffleArray(values);
    const next = grid.map(row => [...row]);
    positions.forEach((pos, i) => {
      next[pos.r][pos.c] = shuffled[i];
    });
    if (findAnyPair(next) || shuffled.length <= 2) return next;
  }
  const shuffled = shuffleArray(values);
  const next = grid.map(row => [...row]);
  positions.forEach((pos, i) => {
    next[pos.r][pos.c] = shuffled[i];
  });
  return next;
}

const GAP = 3;

const FONT = "'Noto Serif SC', 'Songti SC', 'STSong', serif";
const THEME_COLOR = 'rgba(150,220,150,0.95)';
const THEME_R = 100;
const THEME_G = 200;
const THEME_B = 100;
const THEME_BG = 'rgba(100,200,100,0.06)';
const THEME_BORDER = 'rgba(100,200,100,0.18)';

export default function Connect() {
  const { t } = useI18n();
  const { score, highScore, addScore, resetScore } = useGameScore('connect');
  const [grid, setGrid] = useState<Cell[][]>(() => createSolvableGrid());
  const [selected, setSelected] = useState<Pos | null>(null);
  const [hintCells, setHintCells] = useState<[Pos, Pos] | null>(null);
  const [linePath, setLinePath] = useState<ExtPos[] | null>(null);
  const [removing, setRemoving] = useState<[Pos, Pos] | null>(null);
  const [time, setTime] = useState(INITIAL_TIME);
  const [won, setWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const lockRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cellSize = 'min(calc((95vw - 2rem) / 12), 48px)';

  const running = !won && !gameOver;
  const { showHint: idleTriggered, resetHint: resetIdle } = useIdleHint(8000, running);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setTime(t => {
          if (t <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setGameOver(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running]);

  const gridRef = useRef<HTMLDivElement>(null);

  const restart = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    lockRef.current = false;
    resetScore();
    setGrid(createSolvableGrid());
    setSelected(null);
    setHintCells(null);
    setLinePath(null);
    setRemoving(null);
    setTime(INITIAL_TIME);
    setWon(false);
    setGameOver(false);
  }, [resetScore]);

  const doShuffle = useCallback(() => {
    if (!running || lockRef.current) return;
    setSelected(null);
    setHintCells(null);
    setLinePath(null);
    setGrid(g => shuffleRemaining(g));
  }, [running]);

  const hint = useCallback(() => {
    if (!running || lockRef.current) return;
    const pair = findAnyPair(grid);
    if (!pair) {
      setGrid(g => shuffleRemaining(g));
      return;
    }
    setHintCells(pair);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => setHintCells(null), 2000);
  }, [grid, running]);

  useEffect(() => {
    if (idleTriggered && running) hint();
  }, [idleTriggered, running, hint]);

  const clearSelection = useCallback(() => setSelected(null), []);

  const handleCellClick = useCallback((r: number, c: number) => {
    if (!running || lockRef.current) return;
    resetIdle();
    const tile = grid[r][c];
    if (!tile) return;

    setHintCells(null);

    if (!selected) {
      setSelected({ r, c });
      return;
    }

    if (selected.r === r && selected.c === c) {
      setSelected(null);
      return;
    }

    if (grid[selected.r][selected.c] !== tile) {
      setSelected({ r, c });
      return;
    }

    const path = findConnectPath(grid, selected.r, selected.c, r, c);
    if (!path) {
      setSelected({ r, c });
      return;
    }

    lockRef.current = true;
    const first = selected;
    const second = { r, c };
    setSelected(null);
    setLinePath(path);
    setRemoving([first, second]);

    setTimeout(() => {
      addScore(MATCH_POINTS);
      setTime(t => t + 3);
      setLinePath(null);
      setRemoving(null);
      lockRef.current = false;

      setGrid(prev => {
        const next = prev.map(row => [...row]);
        next[first.r][first.c] = null;
        next[second.r][second.c] = null;

        if (!hasRemainingTiles(next)) {
          setWon(true);
          if (timerRef.current) clearInterval(timerRef.current);
          return next;
        }
        if (!findAnyPair(next)) {
          return shuffleRemaining(next);
        }
        return next;
      });
    }, 420);
  }, [grid, selected, running, addScore]);

  const isHint = (r: number, c: number) =>
    hintCells?.some(p => p.r === r && p.c === c) ?? false;

  const isSelected = (r: number, c: number) =>
    selected?.r === r && selected?.c === c;

  const isRemoving = (r: number, c: number) =>
    removing?.some(p => p.r === r && p.c === c) ?? false;

  return (
    <GameWrapper
      title={t.connect.title}
      score={score}
      highScore={highScore}
      controls={
        <div className="flex flex-wrap gap-2 items-center">
          <button type="button" onClick={restart} className="btn-premium">{t.common.newGame}</button>
          <button
            type="button"
            onClick={hint}
            disabled={!running}
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 disabled:opacity-40"
          >
            💡 {t.common.hint}
          </button>
          <button
            type="button"
            onClick={doShuffle}
            disabled={!running}
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors bg-white/10 hover:bg-white/20 text-gray-300 disabled:opacity-40"
          >
            🔀 {t.common.shuffle}
          </button>
          <button type="button" onClick={() => setShowRules(!showRules)} className="btn-ghost">
            {showRules ? t.common.closeRules : '❓ ' + t.common.rules}
          </button>
          <span
            style={{
              fontFamily: FONT,
              fontSize: 20,
              fontWeight: 700,
              color: time <= 15 ? '#ff8a80' : THEME_COLOR,
              textShadow:
                time <= 15
                  ? '0 0 12px rgba(255,138,128,0.8), 0 0 24px rgba(255,87,34,0.35)'
                  : '0 0 10px rgba(100,200,100,0.45)',
              padding: '10px 18px',
              borderRadius: 10,
              border: `1px solid ${time <= 15 ? 'rgba(255,138,128,0.45)' : THEME_BORDER}`,
              background: time <= 15 ? 'rgba(255,87,34,0.12)' : `rgba(${THEME_R},${THEME_G},${THEME_B},0.1)`,
              letterSpacing: 1,
              animation: time <= 10 && running ? 'connectTimePulse 1s ease-in-out infinite' : undefined,
            }}
          >
            ⏱ {time}s
          </span>
          <LeaderboardPanel gameId="connect" currentScore={score} gameOver={won || gameOver} />
        </div>
      }
    >
      <div className="flex flex-col items-center w-full" style={{ maxWidth: 'min(95vw, 640px)', margin: '0 auto' }}>
        {showRules && (
          <div
            style={{
              width: '100%',
              maxWidth: 'min(95vw, 500px)',
              borderRadius: 12,
              padding: '18px 24px',
              fontFamily: FONT,
              color: THEME_COLOR,
              background: THEME_BG,
              border: `1px solid ${THEME_BORDER}`,
              lineHeight: 1.8,
              marginBottom: 10,
            }}
          >
            <p style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>🎋 {t.connect.ruleTitle}</p>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div>🎯 <strong>{t.connect.ruleGoal}</strong></div>
              <div>🔗 <strong>{t.connect.ruleConnect}</strong></div>
              <div>💡 <strong>{t.connect.ruleHint}</strong></div>
              <div>🔀 <strong>{t.connect.ruleShuffle}</strong></div>
              <div>⏱ <strong>{t.connect.ruleTime}</strong></div>
            </div>
          </div>
        )}

      <div
        style={{
          background: '#0a0f0a',
          borderRadius: 16,
          padding: '18px 20px',
          border: '1px solid rgba(100,200,100,0.15)',
          width: '100%',
        }}
      >
        <div className="relative mx-auto overflow-visible" style={{ width: 'fit-content' }}>
          <div
            ref={gridRef}
            data-connect-grid
            className="inline-grid"
            style={{
              gridTemplateColumns: `repeat(${COLS}, ${cellSize})`,
              gridTemplateRows: `repeat(${ROWS}, ${cellSize})`,
              gap: GAP,
              position: 'relative',
              zIndex: 10,
            }}
            onMouseLeave={clearSelection}
          >
            {grid.map((row, r) =>
              row.map((tile, c) => {
                const empty = tile === null;
                const sel = isSelected(r, c);
                const hintOn = isHint(r, c);
                const flash = isRemoving(r, c);

                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    disabled={empty || !running}
                    onClick={() => handleCellClick(r, c)}
                    className="flex items-center justify-center transition-all duration-200"
                    style={{
                      width: cellSize,
                      height: cellSize,
                      padding: 0,
                      borderRadius: 8,
                      border: empty
                        ? '1px solid transparent'
                        : sel
                          ? '3px solid #81c784'
                          : hintOn
                            ? '2px solid rgba(102,187,106,0.9)'
                            : '1px solid rgba(100,200,100,0.3)',
                      background: empty
                        ? 'transparent'
                        : flash
                          ? 'radial-gradient(circle at 50% 50%, rgba(80,120,80,0.5) 0%, #1a2a1a 70%)'
                          : '#1a2a1a',
                      boxShadow: sel
                        ? '0 0 20px rgba(129,199,132,0.95), 0 0 36px rgba(76,175,80,0.55), inset 0 0 12px rgba(129,199,132,0.35)'
                        : hintOn
                          ? '0 0 14px rgba(102,187,106,0.5)'
                          : flash
                            ? '0 0 16px rgba(60,90,60,0.6)'
                            : undefined,
                      opacity: empty ? 0 : 1,
                      transform: flash ? undefined : sel ? 'scale(1.04)' : 'scale(1)',
                      cursor: empty || !running ? 'default' : 'pointer',
                      animation: flash ? 'connectInkFade 0.42s ease forwards' : undefined,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {!empty && (
                      <span
                        style={{
                          fontSize: 'clamp(18px, 4.5vw, 28px)',
                          lineHeight: 1,
                          userSelect: 'none',
                          position: 'relative',
                          zIndex: 1,
                        }}
                      >
                        {tile}
                      </span>
                    )}
                    {flash && (
                      <span
                        aria-hidden
                        style={{
                          position: 'absolute',
                          inset: 0,
                          borderRadius: 8,
                          background: 'radial-gradient(ellipse at center, rgba(120,160,120,0.55) 0%, transparent 70%)',
                          pointerEvents: 'none',
                        }}
                      />
                    )}
                  </button>
                );
              }),
            )}
          </div>

          <ConnectLineOverlay path={linePath} gridRef={gridRef} gap={GAP} />

          {won && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
              style={{ background: 'rgba(0,0,0,0.18)', zIndex: 30 }}
            >
              <div className="text-center px-8 py-6 rounded-2xl backdrop-blur-xl border-3 border-[rgba(255,45,149,0.4)]"
                style={{ background: 'rgba(26,10,46,0.82)', animation: 'popIn 0.4s ease-out', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                <div className="text-4xl mb-2" style={{ animation: 'bounce 1s ease-in-out infinite' }}>🎉</div>
                <div className="text-2xl font-black mb-2 text-white">
                  {t.connect.allCleared}
                </div>
                <div className="mb-4 text-sm text-[#c8a0e0]">
                  {fmt(t.connect.scoreTime, { score, time })}
                </div>
                <button type="button" onClick={restart} className="btn-premium">
                  {t.connect.again}
                </button>
              </div>
            </div>
          )}

          {gameOver && !won && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
              style={{ background: 'rgba(0,0,0,0.18)', zIndex: 30 }}
            >
              <div className="text-center px-8 py-6 rounded-2xl backdrop-blur-xl border-3 border-[rgba(255,45,149,0.4)]"
                style={{ background: 'rgba(26,10,46,0.82)', animation: 'popIn 0.4s ease-out', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                <div className="text-4xl mb-2" style={{ animation: 'wiggle 1s ease-in-out infinite' }}>⏰</div>
                <div className="text-2xl font-black mb-2 text-white">
                  {t.connect.timeUp}
                </div>
                <div className="mb-4 text-sm text-[#c8a0e0]">
                  {fmt(t.connect.finalScore, { n: score })}
                </div>
                <button type="button" onClick={restart} className="btn-premium">
                  {t.connect.again}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>

      <p
        style={{
          fontSize: 11,
          textAlign: 'center',
          marginTop: 10,
          color: 'rgba(100,200,100,0.25)',
          fontFamily: FONT,
          letterSpacing: 2,
        }}
      >
        {t.connect.hint}
      </p>

      <style>{`
        @keyframes connectInkFade {
          0% {
            opacity: 1;
            filter: blur(0);
            transform: scale(1);
          }
          35% {
            opacity: 0.85;
            filter: blur(1px);
            transform: scale(1.06);
          }
          100% {
            opacity: 0;
            filter: blur(10px);
            transform: scale(1.18);
          }
        }
        @keyframes connectTimePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </GameWrapper>
  );
}

function ConnectLineOverlay({
  path,
  gridRef,
  gap,
}: {
  path: ExtPos[] | null;
  gridRef: RefObject<HTMLDivElement | null>;
  gap: number;
}) {
  const [size, setSize] = useState({ w: 0, h: 0, step: 48 + gap });

  useEffect(() => {
    const target = gridRef.current;
    if (!target) return;
    const measure = () => {
      const rect = target.getBoundingClientRect();
      const firstCell = target.querySelector('button') as HTMLElement | null;
      const cs = firstCell?.offsetWidth ?? 48;
      setSize({ w: rect.width, h: rect.height, step: cs + gap });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(target);
    return () => ro.disconnect();
  }, [gridRef, gap, path]);

  if (!path || path.length < 2) return null;

  const step = size.step;
  const cs = step - gap;

  const toXY = (er: number, ec: number) => ({
    x: (ec - 1) * step + cs / 2,
    y: (er - 1) * step + cs / 2,
  });

  const points = path.map(p => toXY(p.er, p.ec));
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0 overflow-visible"
      width={size.w}
      height={size.h}
      style={{ zIndex: 25 }}
    >
      <path
        d={d}
        fill="none"
        stroke="#66bb6a"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          filter: 'drop-shadow(0 0 6px rgba(102,187,106,0.85))',
          strokeDasharray: 1000,
          animation: 'connectDraw 0.35s ease forwards',
        }}
      />
      <style>{`
        @keyframes connectDraw {
          from { stroke-dashoffset: 120; opacity: 0.6; }
          to { stroke-dashoffset: 0; opacity: 1; }
        }
      `}</style>
    </svg>
  );
}
