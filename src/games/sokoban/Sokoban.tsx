import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import GameWrapper from '../../components/GameWrapper';
import { useGameScore } from '../../hooks/useGameScore';
import LeaderboardPanel from '../../components/LeaderboardPanel';
import { useIdleHint } from '../../hooks/useIdleHint';
import { LEVELS, ZONE_INFO } from './levels';
import { useI18n, fmt } from '../../i18n';

/** 0=empty, 1=wall, 2=floor, 3=target, 4=box, 5=player, 6=box-on-target, 7=player-on-target */

const TOTAL_LEVELS = LEVELS.flat().length;

function getLevelCols(level: number[][]): number {
  return Math.max(...level.map(r => r.length));
}

function normalizeLevel(level: number[][]): number[][] {
  const cols = getLevelCols(level);
  return level.map(row =>
    row.length >= cols ? row : [...row, ...Array(cols - row.length).fill(0)],
  );
}

function getLevel(zone: number, idx: number): number[][] {
  return LEVELS[zone]?.[idx] ?? LEVELS[0][0];
}

type Dir = 'up' | 'down' | 'left' | 'right';
const DIR_DELTA: Record<Dir, [number, number]> = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };

function cloneGrid(g: number[][]): number[][] { return g.map(r => [...r]); }

function getTargetCells(t: number[][]): [number, number][] {
  const targets: [number, number][] = [];
  t.forEach((row, r) => row.forEach((c, ci) => { if (c === 3) targets.push([r, ci]); }));
  return targets;
}

function findPlayer(g: number[][]): [number, number] | null {
  for (let r = 0; r < g.length; r++)
    for (let c = 0; c < g[r].length; c++)
      if (g[r][c] === 5 || g[r][c] === 7) return [r, c];
  return null;
}

function isWin(g: number[][], targets: [number, number][]): boolean {
  return targets.every(([r, c]) => g[r][c] === 6);
}

function tryMove(grid: number[][], dir: Dir): number[][] | null {
  const player = findPlayer(grid);
  if (!player) return null;
  const [pr, pc] = player;
  const [dr, dc] = DIR_DELTA[dir];
  const nr = pr + dr, nc = pc + dc;
  if (nr < 0 || nc < 0 || nr >= grid.length || nc >= grid[nr].length) return null;
  const next = grid[nr][nc];
  if (next === 0 || next === 1) return null;
  const ng = cloneGrid(grid);
  if (next === 2 || next === 3) {
    ng[pr][pc] = ng[pr][pc] === 7 ? 3 : 2;
    ng[nr][nc] = next === 3 ? 7 : 5;
    return ng;
  }
  if (next === 4 || next === 6) {
    const br = nr + dr, bc = nc + dc;
    if (br < 0 || bc < 0 || br >= grid.length || bc >= grid[br].length) return null;
    const beyond = grid[br][bc];
    if (beyond !== 2 && beyond !== 3) return null;
    ng[pr][pc] = ng[pr][pc] === 7 ? 3 : 2;
    ng[nr][nc] = next === 6 ? 7 : 5;
    ng[br][bc] = beyond === 3 ? 6 : 4;
    return ng;
  }
  return null;
}

function dirFromKey(key: string): Dir | null {
  switch (key) {
    case 'ArrowUp': case 'w': case 'W': return 'up';
    case 'ArrowDown': case 's': case 'S': return 'down';
    case 'ArrowLeft': case 'a': case 'A': return 'left';
    case 'ArrowRight': case 'd': case 'D': return 'right';
    default: return null;
  }
}

function dirFromSwipe(dx: number, dy: number): Dir | null {
  if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return null;
  return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
}

// ── Progress persistence ──
const STORAGE_KEY = 'sokoban_progress';
interface Progress { completed: Set<string>; bestSteps: Record<string, number>; }

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completed: new Set(), bestSteps: {} };
    const data = JSON.parse(raw);
    return { completed: new Set(data.completed || []), bestSteps: data.bestSteps || {} };
  } catch { return { completed: new Set(), bestSteps: {} }; }
}

function saveProgress(p: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      completed: [...p.completed],
      bestSteps: p.bestSteps,
    }));
  } catch { /* */ }
}

function levelKey(z: number, i: number) { return `${z}-${i}`; }

/** Find the first uncompleted level, or fallback to 0-0 */
function getResumeLevel(progress: Progress): [number, number] {
  for (let z = 0; z < 5; z++)
    for (let i = 0; i < 10; i++)
      if (!progress.completed.has(levelKey(z, i))) return [z, i];
  return [0, 0];
}

/** Find the first uncompleted level in a zone */
function getZoneResumeLevel(progress: Progress, z: number): number {
  for (let i = 0; i < 10; i++)
    if (!progress.completed.has(levelKey(z, i))) return i;
  return 0;
}

// ── Components ──
function DirBtn({ label, onClick }: { label: string; onClick: () => void }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button type="button" onClick={onClick}
      onTouchStart={e => { e.preventDefault(); onClick(); }}
      onPointerDown={() => setPressed(true)} onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)} onPointerCancel={() => setPressed(false)}
      aria-label={label}
      style={{
        width: 48, height: 48, borderRadius: 10, fontSize: 18, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        userSelect: 'none', touchAction: 'manipulation',
        background: pressed ? 'rgba(255,152,0,0.2)' : 'rgba(255,152,0,0.08)',
        border: '1px solid rgba(255,152,0,0.15)', color: '#ff9800', cursor: 'pointer',
      }}
    >{label}</button>
  );
}

function CellView({ cell, hint }: { cell: number; hint?: boolean }) {
  if (cell === 0) return <div className="soko-cell soko-empty" />;
  if (cell === 1) return (
    <div className="soko-cell soko-wall" style={{
      background: 'linear-gradient(135deg, #7a5548 0%, #5d4037 38%, #4e342e 72%, #3e2723 100%)',
      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.5), inset 3px 3px 6px rgba(255,255,255,0.06)',
      border: '1px solid #3e2723',
    }} />
  );
  const isTarget = cell === 3 || cell === 6 || cell === 7;
  const hasBox = cell === 4 || cell === 6;
  const hasPlayer = cell === 5 || cell === 7;
  const boxOnGoal = cell === 6;
  return (
    <div className="soko-cell soko-floor" style={{
      background: '#1a1a24', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.03)', position: 'relative',
    }}>
      {isTarget && <div style={{
        position: 'absolute', inset: '22%', background: '#ff7043', transform: 'rotate(45deg)',
        borderRadius: 2, opacity: hasBox ? 0.35 : 0.85, boxShadow: '0 0 8px rgba(255,112,67,0.45)',
      }} />}
      {hasBox && <div style={{
        position: 'absolute', inset: '12%', borderRadius: 4,
        background: boxOnGoal
          ? 'linear-gradient(145deg, #66bb6a 0%, #4caf50 50%, #388e3c 100%)'
          : 'linear-gradient(145deg, #a1887f 0%, #8d6e63 45%, #6d4c41 100%)',
        boxShadow: '0 3px 6px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.15)',
        border: boxOnGoal ? '1px solid #2e7d32' : '1px solid #5d4037', zIndex: 2,
      }} />}
      {hasPlayer && <div style={{
        position: 'absolute', inset: '18%', borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 30%, #ffb74d, #ff9800 55%, #ef6c00)',
        boxShadow: hint
          ? '0 0 16px rgba(255,152,0,0.8), 0 0 32px rgba(255,152,0,0.4)'
          : '0 2px 8px rgba(255,152,0,0.55)',
        border: '2px solid rgba(255,255,255,0.25)',
        zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '55%',
        animation: hint ? 'sokoPlayerHint 1s ease-in-out infinite' : undefined,
      }} title="Worker">👷</div>}
    </div>
  );
}

export default function Sokoban() {
  const { score, highScore, addScore, resetScore, updateScore } = useGameScore('sokoban');
  const [progress, setProgress] = useState<Progress>(loadProgress);

  // Compute initial level from saved progress
  const [initZ, initI] = useMemo(() => getResumeLevel(progress), []); // eslint-disable-line react-hooks/exhaustive-deps

  const [zone, setZone] = useState(initZ);
  const { t } = useI18n();
  const [levelIdx, setLevelIdx] = useState(initI);
  const [grid, setGrid] = useState<number[][]>(() => cloneGrid(normalizeLevel(getLevel(initZ, initI))));
  const [history, setHistory] = useState<{ grid: number[][]; steps: number }[]>([]);
  const [levelComplete, setLevelComplete] = useState(false);
  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const { showHint: sokoHint, resetHint: resetSokoHint } = useIdleHint(10000, !levelComplete);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scoreRef = useRef(0);

  useEffect(() => { scoreRef.current = score; }, [score]);

  const targets = useMemo(() => getTargetCells(getLevel(zone, levelIdx)), [zone, levelIdx]);
  const cols = useMemo(() => getLevelCols(getLevel(zone, levelIdx)), [zone, levelIdx]);
  const cellSize = `min(calc((95vw - 2rem) / ${cols}), 40px)`;
  const globalIdx = zone * 10 + levelIdx;
  const zoneInfo = ZONE_INFO[zone];
  const zoneCompleted = useMemo(
    () => Array.from({ length: 10 }, (_, i) => progress.completed.has(levelKey(zone, i))).filter(Boolean).length,
    [progress, zone],
  );

  const loadLevel = useCallback((z: number, i: number) => {
    if (advanceTimer.current) { clearTimeout(advanceTimer.current); advanceTimer.current = null; }
    setZone(z);
    setLevelIdx(i);
    setGrid(cloneGrid(normalizeLevel(getLevel(z, i))));
    setHistory([]);
    resetScore();
    setLevelComplete(false);
    setShowLevelPicker(false);
  }, [resetScore]);

  const restart = useCallback(() => loadLevel(zone, levelIdx), [zone, levelIdx, loadLevel]);

  const undo = useCallback(() => {
    if (levelComplete) return;
    setHistory(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setGrid(cloneGrid(last.grid));
      updateScore(last.steps);
      return prev.slice(0, -1);
    });
  }, [updateScore, levelComplete]);

  const markComplete = useCallback((z: number, i: number, steps: number) => {
    setProgress(prev => {
      const next = { completed: new Set(prev.completed), bestSteps: { ...prev.bestSteps } };
      const key = levelKey(z, i);
      next.completed.add(key);
      const prevBest = next.bestSteps[key];
      if (!prevBest || steps < prevBest) next.bestSteps[key] = steps;
      saveProgress(next);
      return next;
    });
  }, []);

  const move = useCallback((dir: Dir) => {
    if (levelComplete) return;
    resetSokoHint();
    setGrid(current => {
      const next = tryMove(current, dir);
      if (!next) return current;
      setHistory(h => [...h, { grid: cloneGrid(current), steps: scoreRef.current }]);
      addScore(1);
      if (isWin(next, targets)) {
        setLevelComplete(true);
        markComplete(zone, levelIdx, scoreRef.current + 1);
        const hasNext = levelIdx < 9 || zone < 4;
        if (hasNext) {
          advanceTimer.current = setTimeout(() => {
            if (levelIdx < 9) loadLevel(zone, levelIdx + 1);
            else if (zone < 4) loadLevel(zone + 1, 0);
          }, 1500);
        }
      }
      return next;
    });
  }, [addScore, levelComplete, levelIdx, loadLevel, markComplete, targets, zone]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const dir = dirFromKey(e.key);
      if (!dir) return;
      e.preventDefault();
      move(dir);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move]);

  useEffect(() => () => { if (advanceTimer.current) clearTimeout(advanceTimer.current); }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dir = dirFromSwipe(t.clientX - touchStart.current.x, t.clientY - touchStart.current.y);
    touchStart.current = null;
    if (dir) move(dir);
  };

  const allDone = zone === 4 && levelIdx === 9 && levelComplete;

  return (
    <GameWrapper title={t.sokoban.title} score={score} highScore={highScore} scoreLabel={t.sokoban.stepsLabel}
      controls={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          {/* Row 1: zone tabs + action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {/* Zone selector tabs */}
            <div style={{ display: 'flex', gap: 3, marginRight: 'auto' }}>
              {ZONE_INFO.map((z, zi) => {
                const isActive = zi === zone;
                const zCount = Array.from({ length: 10 }, (_, i) => progress.completed.has(levelKey(zi, i))).filter(Boolean).length;
                return (
                  <button key={zi} type="button"
                    onClick={() => {
                      const resumeIdx = getZoneResumeLevel(progress, zi);
                      loadLevel(zi, resumeIdx);
                    }}
                    title={`${z.name} (${zCount}/10)`}
                    style={{
                      padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
                      border: isActive ? `1.5px solid ${z.color}` : '1px solid rgba(255,255,255,0.08)',
                      background: isActive ? `${z.color}20` : 'rgba(255,255,255,0.04)',
                      color: isActive ? z.color : 'rgba(255,255,255,0.45)',
                    }}
                  >
                    {z.emoji} {zi + 1}
                    {zCount > 0 && <span style={{ marginLeft: 3, fontSize: 10, opacity: 0.7 }}>{zCount === 10 ? '✓' : `${zCount}`}</span>}
                  </button>
                );
              })}
            </div>

            {/* Action buttons */}
            <button type="button" onClick={restart} className="btn-premium" style={{ fontSize: 12, padding: '5px 14px' }}>
              {t.sokoban.resetLevel}
            </button>
            <button type="button" onClick={undo} disabled={history.length === 0}
              style={{
                fontSize: 12, padding: '5px 14px', borderRadius: 8, cursor: 'pointer',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)',
                color: history.length > 0 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)',
                opacity: history.length > 0 ? 1 : 0.5,
              }}>
              ↩ {t.sokoban.undoMove}
            </button>
            <button type="button"
              onClick={() => setShowLevelPicker(p => !p)}
              title="Select Stage"
              style={{
                fontSize: 12, padding: '5px 14px', borderRadius: 8, cursor: 'pointer',
                background: showLevelPicker ? `${zoneInfo.color}20` : 'rgba(255,255,255,0.08)',
                border: showLevelPicker ? `1px solid ${zoneInfo.color}55` : '1px solid rgba(255,255,255,0.08)',
                color: showLevelPicker ? zoneInfo.color : 'rgba(255,255,255,0.5)',
              }}>
              📋 Select
            </button>
            <LeaderboardPanel gameId="sokoban" currentScore={score} gameOver={levelComplete} scoreLabel={t.sokoban.stepsLabel} detail={`${zoneInfo.name} L${levelIdx + 1}`} />
          </div>

          {/* Row 2: Collapsible level picker */}
          {showLevelPicker && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4,
              padding: '10px 0 2px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              animation: 'fadeIn 0.2s ease both',
            }}>
              {Array.from({ length: 10 }, (_, i) => {
                const key = levelKey(zone, i);
                const done = progress.completed.has(key);
                const best = progress.bestSteps[key];
                const isCurrent = i === levelIdx;
                return (
                  <button key={i} type="button" onClick={() => loadLevel(zone, i)}
                    title={done && best ? `Best: ${best}` : `Stage ${zone * 10 + i + 1}`}
                    style={{
                      padding: '6px 0', borderRadius: 6, fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center',
                      border: isCurrent
                        ? `1.5px solid ${zoneInfo.color}`
                        : done ? `1px solid ${zoneInfo.color}55` : '1px solid rgba(255,255,255,0.06)',
                      background: isCurrent
                        ? `${zoneInfo.color}30`
                        : done ? `${zoneInfo.color}12` : 'rgba(255,255,255,0.03)',
                      color: isCurrent ? zoneInfo.color : done ? `${zoneInfo.color}cc` : 'rgba(255,255,255,0.35)',
                    }}
                  >
                    {zone * 10 + i + 1}
                    {done && <span style={{ display: 'block', fontSize: 8, opacity: 0.65, marginTop: 1 }}>
                      {best ? best : '✓'}
                    </span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      }>

      {/* Progress bar */}
      <div style={{ marginBottom: 10, width: '100%', maxWidth: `calc(${cols} * ${cellSize})` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, fontSize: 11 }}>
          <span style={{ color: zoneInfo.color + '99', fontWeight: 600 }}>
            {zoneInfo.emoji} {zoneInfo.name} · {zoneCompleted}/10
          </span>
          <span style={{ color: 'rgba(255,152,0,0.5)' }}>
            Stage {globalIdx + 1} / {TOTAL_LEVELS}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          {ZONE_INFO.map((z, zi) => (
            <div key={zi} style={{
              flex: 1, height: 4, borderRadius: 2, overflow: 'hidden',
              background: 'rgba(255,255,255,0.06)',
            }}>
              <div style={{
                height: '100%', borderRadius: 2,
                width: zi < zone ? '100%' : zi === zone ? `${((levelIdx + (levelComplete ? 1 : 0)) / 10) * 100}%` : '0%',
                background: z.color,
                transition: 'width 0.4s ease',
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* Game grid */}
      <div style={{
        position: 'relative', background: '#0d0d12', padding: '18px 20px', borderRadius: 12,
        border: `1px solid ${zoneInfo.color}22`, boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
      }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cellSize})`, gap: 0 }}>
          {grid.map((row, r) => row.map((cell, c) => (
            <div key={`${r}-${c}`} style={{ width: cellSize, height: cellSize, minWidth: 0, minHeight: 0 }}>
              <CellView cell={cell} hint={sokoHint && (cell === 5 || cell === 7)} />
            </div>
          )))}
        </div>

        {levelComplete && !allDone && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.18)', borderRadius: 12,
          }}>
            <div style={{
              textAlign: 'center', background: 'rgba(13,13,18,0.82)', borderRadius: 12,
              padding: '24px 28px', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(168,85,247,0.3)', animation: 'fadeIn 0.35s ease both',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 10, fontSize: 28 }}>
                <span className="soko-gear soko-gear-left">⚙️</span>
                <span className="soko-gear soko-gear-right">⚙️</span>
              </div>
              <p className="soko-complete-text" style={{
                fontSize: 20, fontWeight: 800, color: zoneInfo.color,
                textShadow: `0 0 20px ${zoneInfo.color}80`, margin: 0,
              }}>
                Stage {globalIdx + 1} Complete!
              </p>
              <p style={{ color: 'rgba(255,224,178,0.5)', fontSize: 12, marginTop: 6 }}>
                {score} steps · {progress.bestSteps[levelKey(zone, levelIdx)] ? `Best: ${progress.bestSteps[levelKey(zone, levelIdx)]}` : ''}
              </p>
            </div>
          </div>
        )}

        {allDone && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.18)', borderRadius: 12,
          }}>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              background: 'rgba(13,13,18,0.82)', borderRadius: 12, padding: '24px 28px',
              backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(168,85,247,0.3)', animation: 'fadeIn 0.35s ease both',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}>
              <p style={{ fontSize: 32 }}>🏆</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#a855f7', textShadow: '0 0 24px rgba(168,85,247,0.5)' }}>
                {t.sokoban.allComplete}
              </p>
              <p style={{ color: 'rgba(255,224,178,0.5)', fontSize: 13 }}>
                {progress.completed.size}/{TOTAL_LEVELS} cleared
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5 w-fit mx-auto mt-2" style={{ maxWidth: 160 }}>
        <div />
        <DirBtn label="↑" onClick={() => move('up')} />
        <div />
        <DirBtn label="←" onClick={() => move('left')} />
        <DirBtn label="↓" onClick={() => move('down')} />
        <DirBtn label="→" onClick={() => move('right')} />
      </div>
      <p style={{ fontSize: 11, textAlign: 'center', marginTop: 8, color: 'rgba(255,152,0,0.2)', letterSpacing: 1.5 }}>
        Arrow / WASD to move · ↩ Undo
      </p>
      <style>{`
        .soko-cell { width: 100%; height: 100%; box-sizing: border-box; }
        .soko-empty { background: transparent; }
        @keyframes sokoPlayerHint { 0%, 100% { transform: scale(1); box-shadow: 0 0 16px rgba(255,152,0,0.8); } 50% { transform: scale(1.12); box-shadow: 0 0 28px rgba(255,152,0,1), 0 0 48px rgba(255,152,0,0.4); } }
        @keyframes sokoGearSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes sokoGearSpinRev { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes sokoCompletePulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); filter: brightness(1.15); } }
        .soko-gear { display: inline-block; filter: drop-shadow(0 0 8px rgba(255,152,0,0.55)); }
        .soko-gear-left { animation: sokoGearSpin 2.2s linear infinite; }
        .soko-gear-right { animation: sokoGearSpinRev 1.6s linear infinite; }
        .soko-complete-text { animation: sokoCompletePulse 1.2s ease-in-out infinite; }
      `}</style>
    </GameWrapper>
  );
}
