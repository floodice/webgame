import { useState, useEffect, useCallback, useRef } from 'react';
import GameWrapper from '../../components/GameWrapper';
import { useGameScore } from '../../hooks/useGameScore';
import LeaderboardPanel from '../../components/LeaderboardPanel';
import { useIdleHint } from '../../hooks/useIdleHint';
import { useI18n, fmt } from '../../i18n';

type Grid = number[][];
type Direction = 'up' | 'down' | 'left' | 'right';

const SIZE = 4;

function createEmptyGrid(): Grid {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function addRandomTile(grid: Grid): Grid {
  const newGrid = grid.map(row => [...row]);
  const empty: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (newGrid[r][c] === 0) empty.push([r, c]);
    }
  }
  if (empty.length === 0) return newGrid;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
  return newGrid;
}

function rotateGrid(grid: Grid, times: number): Grid {
  let g = grid.map(row => [...row]);
  for (let t = 0; t < times; t++) {
    const rotated = createEmptyGrid();
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        rotated[c][SIZE - 1 - r] = g[r][c];
      }
    }
    g = rotated;
  }
  return g;
}

function slideLeft(grid: Grid): { grid: Grid; scoreGained: number; moved: boolean } {
  let scoreGained = 0;
  let moved = false;
  const newGrid = createEmptyGrid();

  for (let r = 0; r < SIZE; r++) {
    const row = grid[r].filter(v => v !== 0);
    const merged: number[] = [];
    let i = 0;
    while (i < row.length) {
      if (i + 1 < row.length && row[i] === row[i + 1]) {
        const val = row[i] * 2;
        merged.push(val);
        scoreGained += val;
        i += 2;
      } else {
        merged.push(row[i]);
        i++;
      }
    }
    for (let c = 0; c < SIZE; c++) {
      newGrid[r][c] = merged[c] || 0;
      if (newGrid[r][c] !== grid[r][c]) moved = true;
    }
  }

  return { grid: newGrid, scoreGained, moved };
}

function move(grid: Grid, direction: Direction): { grid: Grid; scoreGained: number; moved: boolean } {
  const rotations: Record<Direction, number> = { left: 0, up: 3, right: 2, down: 1 };
  const reverseRotations: Record<Direction, number> = { left: 0, up: 1, right: 2, down: 3 };

  const rotated = rotateGrid(grid, rotations[direction]);
  const result = slideLeft(rotated);
  const finalGrid = rotateGrid(result.grid, reverseRotations[direction]);

  return { grid: finalGrid, scoreGained: result.scoreGained, moved: result.moved };
}

function canMove(grid: Grid): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) return true;
      if (c + 1 < SIZE && grid[r][c] === grid[r][c + 1]) return true;
      if (r + 1 < SIZE && grid[r][c] === grid[r + 1][c]) return true;
    }
  }
  return false;
}

function hasWon(grid: Grid): boolean {
  return grid.some(row => row.some(v => v >= 2048));
}

/* ── Wacky Candy Tile Styles ── */

interface TileStyle {
  bg: string;
  border: string;
  glow: string;
  text: string;
  label: string;
  emoji: string;
}

const wackyTiles: Record<number, TileStyle> = {
  0:    { bg: 'rgba(60,20,100,0.3)', border: 'rgba(120,60,180,0.2)', glow: 'none', text: 'transparent', label: '', emoji: '' },
  2:    { bg: 'linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%)', border: '#ff2d95', glow: '0 4px 12px rgba(255,45,149,0.3)', text: '#fff', label: '2', emoji: '😊' },
  4:    { bg: 'linear-gradient(135deg, #ffa06b 0%, #ffb88f 100%)', border: '#ff6b2b', glow: '0 4px 12px rgba(255,107,43,0.3)', text: '#fff', label: '4', emoji: '😄' },
  8:    { bg: 'linear-gradient(135deg, #ffe93e 0%, #fff176 100%)', border: '#ffc107', glow: '0 4px 14px rgba(255,193,7,0.4)', text: '#6d4c00', label: '8', emoji: '😎' },
  16:   { bg: 'linear-gradient(135deg, #39ff14 0%, #76ff6b 100%)', border: '#00c853', glow: '0 4px 14px rgba(0,200,83,0.4)', text: '#004d00', label: '16', emoji: '🤩' },
  32:   { bg: 'linear-gradient(135deg, #00f0ff 0%, #80f8ff 100%)', border: '#00bcd4', glow: '0 4px 16px rgba(0,188,212,0.4)', text: '#004d56', label: '32', emoji: '🥳' },
  64:   { bg: 'linear-gradient(135deg, #bf5af2 0%, #d494ff 100%)', border: '#9c27b0', glow: '0 4px 16px rgba(156,39,176,0.4)', text: '#fff', label: '64', emoji: '🤪' },
  128:  { bg: 'linear-gradient(135deg, #ff2d95 0%, #ff6baf 100%)', border: '#c51162', glow: '0 4px 18px rgba(197,17,98,0.5)', text: '#fff', label: '128', emoji: '🔥' },
  256:  { bg: 'linear-gradient(135deg, #ff6b2b 0%, #ff9a6b 100%)', border: '#dd2c00', glow: '0 4px 18px rgba(221,44,0,0.5)', text: '#fff', label: '256', emoji: '💥' },
  512:  { bg: 'linear-gradient(135deg, #ffd700 0%, #ffe93e 100%)', border: '#ff8f00', glow: '0 4px 20px rgba(255,143,0,0.5)', text: '#5d4037', label: '512', emoji: '⚡' },
  1024: { bg: 'linear-gradient(135deg, #e040fb 0%, #ea80fc 100%)', border: '#aa00ff', glow: '0 4px 24px rgba(170,0,255,0.5)', text: '#fff', label: '1K', emoji: '🌈' },
  2048: { bg: 'linear-gradient(135deg, #ffd700 0%, #ff2d95 50%, #00f0ff 100%)', border: '#ffd700', glow: '0 6px 30px rgba(255,215,0,0.6), 0 0 0 3px rgba(255,45,149,0.3)', text: '#fff', label: '2K', emoji: '👑' },
};

function getNeonStyle(value: number): TileStyle {
  return wackyTiles[value] || {
    bg: 'linear-gradient(135deg, #ff2d95 0%, #ffd700 50%, #39ff14 100%)',
    border: '#ff2d95',
    glow: '0 6px 30px rgba(255,45,149,0.5)',
    text: '#fff',
    label: value >= 1000 ? `${(value / 1024).toFixed(0)}K+` : String(value),
    emoji: '🤯',
  };
}

function getTileLevel(value: number): number {
  if (value === 0) return 0;
  return Math.log2(value);
}

function getBestDirection(grid: Grid): Direction | null {
  let best: Direction | null = null;
  let bestScore = -1;
  for (const dir of ['up', 'down', 'left', 'right'] as Direction[]) {
    const result = move(grid, dir);
    if (result.moved && result.scoreGained > bestScore) {
      bestScore = result.scoreGained;
      best = dir;
    }
  }
  if (!best) {
    for (const dir of ['left', 'down', 'up', 'right'] as Direction[]) {
      const result = move(grid, dir);
      if (result.moved) return dir;
    }
  }
  return best;
}

const ARROW_MAP: Record<Direction, string> = { up: '↑', down: '↓', left: '←', right: '→' };
const ARROW_OFFSET: Record<Direction, React.CSSProperties> = {
  up:    { top: '12%',  left: '50%', transform: 'translateX(-50%)' },
  down:  { bottom: '12%', left: '50%', transform: 'translateX(-50%)' },
  left:  { left: '12%',  top: '50%',  transform: 'translateY(-50%)' },
  right: { right: '12%', top: '50%',  transform: 'translateY(-50%)' },
};

export default function Game2048() {
  const { score, highScore, updateScore, resetScore } = useGameScore('game2048');
  const [grid, setGrid] = useState<Grid>(() => {
    let g = createEmptyGrid();
    g = addRandomTile(g);
    g = addRandomTile(g);
    return g;
  });
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [keepPlaying, setKeepPlaying] = useState(false);
  const [lastMerged, setLastMerged] = useState<Set<number>>(new Set());
  const scoreRef = useRef(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const prevGrid = useRef<number[]>([]);
  const { showHint, resetHint } = useIdleHint(8000, !gameOver && !(won && !keepPlaying));
  const hintDir = showHint ? getBestDirection(grid) : null;

  const handleMove = useCallback((direction: Direction) => {
    if (gameOver) return;
    resetHint();

    setGrid(prev => {
      const result = move(prev, direction);
      if (!result.moved) return prev;

      const newScore = scoreRef.current + result.scoreGained;
      scoreRef.current = newScore;
      updateScore(newScore);

      const newGrid = addRandomTile(result.grid);

      const oldFlat = prev.flat();
      const newFlat = newGrid.flat();
      const merged = new Set<number>();
      for (let i = 0; i < newFlat.length; i++) {
        if (newFlat[i] > 0 && newFlat[i] !== oldFlat[i] && newFlat[i] > 2) {
          merged.add(i);
        }
      }
      prevGrid.current = oldFlat;
      setLastMerged(merged);

      if (!keepPlaying && hasWon(newGrid)) {
        setWon(true);
      }
      if (!canMove(newGrid)) {
        setGameOver(true);
      }

      return newGrid;
    });
  }, [gameOver, keepPlaying, updateScore]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const keyMap: Record<string, Direction> = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', s: 'down', a: 'left', d: 'right',
      };
      const dir = keyMap[e.key];
      if (dir) {
        e.preventDefault();
        handleMove(dir);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleMove]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    if (Math.max(absDx, absDy) < 30) return;

    if (absDx > absDy) {
      handleMove(dx > 0 ? 'right' : 'left');
    } else {
      handleMove(dy > 0 ? 'down' : 'up');
    }
    touchStart.current = null;
  };

  const restart = () => {
    let g = createEmptyGrid();
    g = addRandomTile(g);
    g = addRandomTile(g);
    setGrid(g);
    setGameOver(false);
    setWon(false);
    setKeepPlaying(false);
    setLastMerged(new Set());
    prevGrid.current = [];
    scoreRef.current = 0;
    resetScore();
  };

  const { t } = useI18n();
  const maxTile = Math.max(...grid.flat());
  const progress = maxTile > 0 ? Math.min((getTileLevel(maxTile) / 11) * 100, 100) : 0;

  return (
    <GameWrapper
      title={t.game2048.title}
      score={score}
      highScore={highScore}
      controls={
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={restart} className="btn-premium">
            {t.common.newGame}
          </button>
          <LeaderboardPanel gameId="game2048" currentScore={score} gameOver={gameOver} />
        </div>
      }
    >
      {/* Inject keyframe animations */}
      <style>{`
        @keyframes idleHintPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes neonPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes tilePop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes tileMerge {
          0% { transform: scale(1); }
          30% { transform: scale(1.25); }
          100% { transform: scale(1); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes glowShift {
          0%, 100% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(15deg); }
        }
        .neon-tile-new {
          animation: tilePop 0.2s ease-out;
        }
        .neon-tile-merged {
          animation: tileMerge 0.25s ease-out;
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {/* Progress bar - wacky energy */}
        <div style={{
          width: 'min(90vw, 400px)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{
            fontSize: 11,
            color: '#ff6baf',
            letterSpacing: 1,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            fontWeight: 800,
          }}>
            {t.game2048.energyLevel}
          </span>
          <div style={{
            flex: 1,
            height: 8,
            background: 'rgba(255,45,149,0.1)',
            borderRadius: 10,
            overflow: 'hidden',
            border: '2px solid rgba(255,45,149,0.2)',
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #ff2d95, #ff6b2b, #ffe93e, #39ff14, #00f0ff, #bf5af2)',
              borderRadius: 8,
              transition: 'width 0.3s ease',
              boxShadow: '0 2px 8px rgba(255,45,149,0.4)',
            }} />
          </div>
          <span style={{
            fontSize: 18,
            animation: 'bounce 1.5s ease-in-out infinite',
          }}>
            {getNeonStyle(maxTile).emoji || '🎪'}
          </span>
        </div>

        {/* Game board */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={(e) => e.preventDefault()}
          style={{
            touchAction: 'none',
            position: 'relative',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
              gap: 8,
              padding: 14,
              borderRadius: 20,
              width: 'min(90vw, 400px)',
              aspectRatio: '1',
              background: 'linear-gradient(145deg, rgba(40,15,80,0.9) 0%, rgba(60,20,110,0.9) 100%)',
              border: '3px solid rgba(255,45,149,0.3)',
              boxShadow: '0 8px 32px rgba(255,45,149,0.15), inset 0 0 30px rgba(0,0,0,0.3)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >

            {grid.flat().map((value, i) => {
              const ns = getNeonStyle(value);
              const isNew = value > 0 && prevGrid.current.length > 0 && prevGrid.current[i] === 0 && value <= 4;
              const isMerged = lastMerged.has(i);
              const level = getTileLevel(value);

              return (
                <div
                  key={i}
                  className={isNew ? 'neon-tile-new' : isMerged ? 'neon-tile-merged' : ''}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    background: ns.bg,
                    border: `2.5px solid ${ns.border}`,
                    boxShadow: ns.glow,
                    transition: 'all 0.15s ease',
                    zIndex: value > 0 ? 3 : 0,
                    overflow: 'hidden',
                    transform: value > 0 ? `rotate(${(i % 3 - 1) * 1.5}deg)` : 'none',
                  }}
                >
                  {/* Shine effect for tiles */}
                  {value > 0 && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 100%)',
                      borderRadius: '12px 12px 50% 50%',
                      pointerEvents: 'none',
                    }} />
                  )}

                  {/* Emoji face */}
                  {value > 0 && (
                    <span style={{
                      fontSize: value >= 512 ? 18 : 22,
                      lineHeight: 1,
                      zIndex: 4,
                      filter: level >= 7 ? 'none' : 'none',
                      animation: level >= 8 ? 'wiggle 1s ease-in-out infinite' : 'none',
                    }}>
                      {ns.emoji}
                    </span>
                  )}

                  {/* Number display */}
                  {value > 0 && (
                    <span style={{
                      fontWeight: 900,
                      fontSize: value >= 1024 ? 13 : value >= 128 ? 14 : value >= 16 ? 16 : 18,
                      color: ns.text,
                      textShadow: `0 1px 2px rgba(0,0,0,0.3)`,
                      letterSpacing: value >= 100 ? -0.5 : 0.5,
                      zIndex: 4,
                      lineHeight: 1,
                      marginTop: 1,
                    }}>
                      {ns.label || value}
                    </span>
                  )}

                  {/* Dots for empty cells */}
                  {value === 0 && (
                    <span style={{
                      fontSize: 16,
                      opacity: 0.15,
                      zIndex: 4,
                    }}>
                      ·
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Idle hint arrow */}
          {hintDir && (
            <div style={{
              position: 'absolute',
              ...ARROW_OFFSET[hintDir],
              fontSize: 36,
              zIndex: 8,
              pointerEvents: 'none',
              animation: 'idleHintPulse 1.2s ease-in-out infinite',
            }}>
              {hintDir === 'up' ? '👆' : hintDir === 'down' ? '👇' : hintDir === 'left' ? '👈' : '👉'}
            </div>
          )}

          {/* Game Over / Win overlay */}
          {(gameOver || (won && !keepPlaying)) && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.18)',
              borderRadius: 20,
              zIndex: 10,
            }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(26,10,46,0.82)',
              borderRadius: 20,
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: `3px solid ${won ? 'rgba(255,215,0,0.5)' : 'rgba(255,45,149,0.5)'}`,
              animation: 'popIn 0.4s ease-out',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              padding: '24px 32px',
            }}>
              <div style={{
                fontSize: 48,
                marginBottom: 8,
                animation: 'bounce 1s ease-in-out infinite',
              }}>
                {won ? '🎉' : '💀'}
              </div>
              <div style={{
                fontSize: 28,
                fontWeight: 900,
                color: '#fff',
                marginBottom: 6,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}>
                {won ? t.game2048.coreUnlocked : t.game2048.systemOverload}
              </div>
              <div style={{
                fontSize: 14,
                color: '#c8a0e0',
                marginBottom: 24,
                fontWeight: 600,
              }}>
                {fmt(t.game2048.finalEnergy, { score })}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {won && !keepPlaying && (
                  <button
                    onClick={() => { setKeepPlaying(true); setWon(false); }}
                    className="btn-premium"
                    style={{ padding: '12px 26px', fontSize: 14 }}
                  >
                    {t.game2048.keepPlaying}
                  </button>
                )}
                <button
                  onClick={restart}
                  className="btn-secondary"
                  style={{ padding: '12px 26px', fontSize: 14, fontWeight: 800 }}
                >
                  {t.game2048.systemReboot}
                </button>
              </div>
            </div>
            </div>
          )}
        </div>

        {/* Control hints */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          opacity: 0.5,
          marginTop: 4,
        }}>
          {['👆', '👇', '👈', '👉'].map(k => (
            <span key={k} style={{
              fontSize: 16,
              border: '2px dashed rgba(255,45,149,0.2)',
              padding: '4px 8px',
              borderRadius: 8,
              lineHeight: 1,
            }}>{k}</span>
          ))}
          <span style={{
            fontSize: 11,
            color: '#c8a0e0',
            fontWeight: 600,
          }}>
            {t.game2048.touch}
          </span>
        </div>
      </div>
    </GameWrapper>
  );
}
