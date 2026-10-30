import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import GameWrapper from '../../components/GameWrapper';
import { useGameScore } from '../../hooks/useGameScore';
import LeaderboardPanel from '../../components/LeaderboardPanel';
import { useI18n, fmt } from '../../i18n';

type CellState = 0 | 1 | 2; // empty, filled, marked X

type Puzzle = { name: string; size: 5 | 10 | 15; grid: boolean[][] };

const SCORE_BASE = 99999;

function parseArt(size: number, rows: string[]): boolean[][] {
  const padded = [...rows];
  while (padded.length < size) padded.push('.'.repeat(size));
  return padded.slice(0, size).map((row) =>
    row.padEnd(size, '.').slice(0, size).split('').map((ch) => ch === '#' || ch === '1'),
  );
}

const PUZZLES: Puzzle[] = [
  {
    name: 'Heart',
    size: 5,
    grid: [
      [false, true, false, true, false],
      [true, true, true, true, true],
      [true, true, true, true, true],
      [false, true, true, true, false],
      [false, false, true, false, false],
    ],
  },
  {
    name: 'Star',
    size: 5,
    grid: parseArt(5, ['..#..', '.###.', '#####', '.###.', '..#..']),
  },
  {
    name: 'Arrow',
    size: 5,
    grid: parseArt(5, ['..#..', '..##.', '#####', '..##.', '..#..']),
  },
  {
    name: 'Smiley',
    size: 5,
    grid: parseArt(5, ['.###.', '#.#.#', '#...#', '#.#.#', '.###.']),
  },
  {
    name: 'House',
    size: 10,
    grid: parseArt(10, [
      '....####..',
      '...######.',
      '..########',
      '.###....##',
      '.###....##',
      '.###....##',
      '.#########',
      '.#########',
      '..########',
      '...######.',
    ]),
  },
  {
    name: 'Tree',
    size: 10,
    grid: parseArt(10, [
      '....##....',
      '...####...',
      '..######..',
      '.########.',
      '...####...',
      '..######..',
      '.########.',
      '....##....',
      '....##....',
      '...####...',
    ]),
  },
  {
    name: 'Fish',
    size: 10,
    grid: parseArt(10, [
      '....##....',
      '...####...',
      '..######..',
      '.########.',
      '##.####.##',
      '#..####..#',
      '...####...',
      '..##..##..',
      '.##....##.',
      '..........',
    ]),
  },
  {
    name: 'Sailboat',
    size: 10,
    grid: parseArt(10, [
      '.....#....',
      '....###...',
      '...#.#.#..',
      '..#..#..#.',
      '.########.',
      '...#####..',
      '..#######.',
      '.#########',
    ]),
  },
  {
    name: 'Invader',
    size: 15,
    grid: parseArt(15, [
      '.....#####.....',
      '...#########...',
      '..###########..',
      '.#####.#.#####.',
      '###############',
      '###.#######.###',
      '###.#######.###',
      '..###.....###..',
      '.###.......###.',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
    ]),
  },
  {
    name: 'Butterfly',
    size: 15,
    grid: parseArt(15, [
      '#..........#...',
      '##........##...',
      '###......###...',
      '####....####...',
      '#####..#####...',
      '..#########....',
      '...#######.....',
      '....#####......',
      '...#######.....',
      '..#########....',
      '#####..#####...',
      '####....####...',
      '###......###...',
      '##........##...',
      '#..........#...',
    ]),
  },
];

function computeLineClues(line: boolean[]): number[] {
  const clues: number[] = [];
  let run = 0;
  for (const filled of line) {
    if (filled) run++;
    else if (run > 0) {
      clues.push(run);
      run = 0;
    }
  }
  if (run > 0) clues.push(run);
  return clues;
}

function computeClues(grid: boolean[][]): { rows: number[][]; cols: number[][] } {
  const n = grid.length;
  const rows = grid.map((row) => computeLineClues(row));
  const cols: number[][] = [];
  for (let c = 0; c < n; c++) {
    const col = grid.map((row) => row[c]);
    cols.push(computeLineClues(col));
  }
  return { rows, cols };
}

function runsFromPlayer(line: boolean[]): number[] {
  return computeLineClues(line);
}

function lineSatisfied(playerLine: boolean[], clues: number[]): boolean {
  const a = runsFromPlayer(playerLine);
  const b = clues;
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

function emptyGrid(n: number): CellState[][] {
  return Array.from({ length: n }, () => Array.from({ length: n }, () => 0 as CellState));
}

function cellSizeExpr(size: 5 | 10 | 15): string {
  if (size === 5) return 'min(calc((90vw - 4rem) / 5), 56px)';
  if (size === 10) return 'min(calc((90vw - 6rem) / 10), 36px)';
  return 'min(calc((90vw - 8rem) / 15), 28px)';
}

const mono = "'Courier New', Courier, monospace";

export default function Nonogram() {
  const { highScore, updateScore } = useGameScore('nonogram');
  const sizes = [5, 10, 15] as const;
  const [size, setSize] = useState<5 | 10 | 15>(5);
  const { t } = useI18n();
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [cells, setCells] = useState<CellState[][]>(() => emptyGrid(5));
  const [markMode, setMarkMode] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [time, setTime] = useState(0);
  const [started, setStarted] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeRef = useRef(0);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressedRef = useRef(false);

  useEffect(() => {
    timeRef.current = time;
  }, [time]);

  const puzzlesForSize = useMemo(
    () => PUZZLES.filter((p) => p.size === size),
    [size],
  );

  const puzzle = puzzlesForSize[puzzleIdx % puzzlesForSize.length];
  const solution = puzzle.grid;
  const n = solution.length;

  const { rows: rowClues, cols: colClues } = useMemo(
    () => computeClues(solution),
    [solution],
  );

  const maxRowClueNums = useMemo(
    () => Math.max(1, ...rowClues.map((r) => r.length)),
    [rowClues],
  );
  const maxColClueNums = useMemo(
    () => Math.max(1, ...colClues.map((c) => c.length)),
    [colClues],
  );

  const bestTime = highScore > 0 ? SCORE_BASE - highScore : null;

  const totalFillCells = useMemo(
    () => solution.flat().filter(Boolean).length,
    [solution],
  );

  const correctFillCount = useMemo(() => {
    let count = 0;
    for (let r = 0; r < n; r++) {
      if (!cells[r]) break;
      for (let c = 0; c < n; c++) {
        if (solution[r][c] && cells[r][c] === 1) count++;
      }
    }
    return count;
  }, [cells, solution, n]);

  const progressPct =
    totalFillCells > 0 ? Math.round((correctFillCount / totalFillCells) * 100) : 0;

  const loadPuzzle = useCallback(
    (newSize: 5 | 10 | 15, idx: number) => {
      const list = PUZZLES.filter((p) => p.size === newSize);
      const p = list[idx % list.length];
      setCells(emptyGrid(p.grid.length));
      setCompleted(false);
      setTime(0);
      setStarted(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    },
    [],
  );

  useEffect(() => {
    loadPuzzle(size, puzzleIdx);
  }, [size, puzzleIdx, loadPuzzle]);

  useEffect(() => {
    if (started && !completed) {
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [started, completed]);

  const playerFilled = useCallback(
    (r: number, c: number, grid: CellState[][]) => grid[r][c] === 1,
    [],
  );

  const checkComplete = useCallback(
    (grid: CellState[][]) => {
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (solution[r][c] && grid[r][c] !== 1) return false;
        }
      }
      return true;
    },
    [n, solution],
  );

  const applyCell = useCallback(
    (r: number, c: number, mode: 'fill' | 'mark') => {
      if (completed) return;
      if (!started) setStarted(true);

      setCells((prev) => {
        const next = prev.map((row) => [...row]);
        const cur = next[r][c];
        if (mode === 'mark') {
          next[r][c] = cur === 2 ? 0 : 2;
        } else {
          next[r][c] = cur === 1 ? 0 : 1;
        }

        if (checkComplete(next)) {
          queueMicrotask(() => {
            setCompleted(true);
            updateScore(SCORE_BASE - timeRef.current);
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
          });
        }
        return next;
      });
    },
    [completed, started, checkComplete, updateScore],
  );

  const handleCellClick = useCallback(
    (r: number, c: number) => {
      applyCell(r, c, markMode ? 'mark' : 'fill');
    },
    [applyCell, markMode],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, r: number, c: number) => {
      e.preventDefault();
      applyCell(r, c, 'mark');
    },
    [applyCell],
  );

  const handleTouchStart = useCallback(
    (r: number, c: number) => {
      longPressedRef.current = false;
      longPressRef.current = setTimeout(() => {
        longPressedRef.current = true;
        applyCell(r, c, 'mark');
      }, 400);
    },
    [applyCell],
  );

  const handleTouchEnd = useCallback(
    (r: number, c: number) => {
      if (longPressRef.current) {
        clearTimeout(longPressRef.current);
        longPressRef.current = null;
      }
      if (!longPressedRef.current) {
        handleCellClick(r, c);
      }
    },
    [handleCellClick],
  );

  const changeSize = (s: 5 | 10 | 15) => {
    const list = PUZZLES.filter((p) => p.size === s);
    const p = list[0];
    setCells(emptyGrid(p.grid.length));
    setCompleted(false);
    setTime(0);
    setStarted(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setSize(s);
    setPuzzleIdx(0);
  };

  const nextPuzzle = () => {
    setPuzzleIdx((i) => (i + 1) % puzzlesForSize.length);
  };

  const cellSz = cellSizeExpr(size);
  const clueColW = maxRowClueNums * 22 + 8;
  const clueRowH = maxColClueNums * 18 + 8;

  const rowSatisfied = rowClues.map((clues, r) => {
    const line = Array.from({ length: n }, (_, c) => playerFilled(r, c, cells));
    return lineSatisfied(line, clues);
  });

  const colSatisfied = colClues.map((clues, c) => {
    const line = Array.from({ length: n }, (_, r) => playerFilled(r, c, cells));
    return lineSatisfied(line, clues);
  });

  const thick = size !== 5;

  return (
    <GameWrapper
      title={t.nonogram.title}
      score={completed ? time : undefined}
      highScore={bestTime ?? undefined}
      scoreLabel={t.common.timeSeconds}
      controls={
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2 items-center">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => changeSize(s)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  size === s ? 'bg-green-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {s}x{s}
              </button>
            ))}
            <button type="button" onClick={nextPuzzle} className="btn-premium">
              {t.common.nextLevel}
            </button>
            <button
              type="button"
              onClick={() => setShowRules(!showRules)}
              className="btn-ghost"
            >
              {showRules ? t.common.closeRules : '❓ ' + t.common.rules}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <button
              type="button"
              onClick={() => setMarkMode(!markMode)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                markMode ? 'bg-red-500/30 text-red-300' : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {markMode ? `✕ ${t.common.marking}` : `■ ${t.common.fill}`}
            </button>
            <span
              style={{
                color: 'rgba(0,200,83,0.5)',
                fontSize: 13,
                fontFamily: mono,
              }}
            >
              ⏱ {time}s
            </span>
            <LeaderboardPanel gameId="nonogram" currentScore={completed ? time : 0} gameOver={completed} scoreLabel={t.common.timeSeconds} detail={`${size}x${size}`} />
          </div>
        </div>
      }
    >
      <style>{`
        @keyframes nonogramPreviewPulse {
          0%, 100% { box-shadow: 0 0 12px rgba(0,200,83,0.35), inset 0 0 8px rgba(0,200,83,0.08); }
          50% { box-shadow: 0 0 32px rgba(105,240,174,0.75), 0 0 48px rgba(0,200,83,0.35), inset 0 0 12px rgba(105,240,174,0.15); }
        }
        @keyframes nonogramTitleGlow {
          0%, 100% { text-shadow: 0 0 16px rgba(105,240,174,0.85), 0 0 32px rgba(0,200,83,0.45); }
          50% { text-shadow: 0 0 24px rgba(105,240,174,1), 0 0 48px rgba(0,200,83,0.65); }
        }
      `}</style>
      <div
        className="flex flex-col items-center w-full"
        style={{ maxWidth: 'min(95vw, 640px)', margin: '0 auto', fontFamily: mono }}
      >
        {showRules && (
          <div
            style={{
              width: '100%',
              maxWidth: 'min(95vw, 520px)',
              borderRadius: 12,
              padding: '18px 24px',
              fontFamily: mono,
              color: '#69f0ae',
              background: 'rgba(0,200,83,0.03)',
              border: '1px solid rgba(0,200,83,0.12)',
              lineHeight: 1.8,
              marginBottom: 10,
            }}
          >
            <p style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>📟 {t.nonogram.ruleTitle}</p>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div>🎯 {t.nonogram.ruleGoal}</div>
              <div>🔢 {t.nonogram.ruleNumbers}</div>
              <div style={{ paddingLeft: 8, color: 'rgba(105,240,174,0.85)' }}>
                
              </div>
              <div>■ {t.nonogram.ruleFill}</div>
              <div>✕ {t.nonogram.ruleMark}</div>
              <div>🎚️ {t.nonogram.ruleMode}</div>
              <div>💡 {t.nonogram.ruleTip}</div>
            </div>
          </div>
        )}

        <div
          style={{
            width: '100%',
            maxWidth: 'min(95vw, 520px)',
            borderRadius: 10,
            padding: '14px 20px',
            marginBottom: 10,
            background: 'rgba(0,200,83,0.04)',
            border: '1px solid rgba(0,200,83,0.14)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              fontSize: 12,
              color: '#69f0ae',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 13 }}>{puzzle.name}</span>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: '1px solid rgba(0,200,83,0.2)',
                background: 'rgba(0,200,83,0.06)',
                color: 'rgba(105,240,174,0.9)',
              }}
            >
              {size}×{size}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                flex: 1,
                height: 8,
                borderRadius: 4,
                background: 'rgba(0,200,83,0.08)',
                border: '1px solid rgba(0,200,83,0.12)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progressPct}%`,
                  height: '100%',
                  borderRadius: 3,
                  background: 'linear-gradient(90deg, #00c853, #69f0ae)',
                  boxShadow: '0 0 10px rgba(0,200,83,0.55)',
                  transition: 'width 0.25s ease',
                }}
              />
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'rgba(105,240,174,0.85)',
                minWidth: 72,
                textAlign: 'right',
              }}
            >
              {correctFillCount}/{totalFillCells} · {progressPct}%
            </span>
          </div>
        </div>

      <div className="relative" style={{
        fontFamily: mono,
        padding: '8px',
        borderRadius: 20,
        background: 'linear-gradient(145deg, rgba(40,15,80,0.3) 0%, rgba(26,10,46,0.5) 100%)',
        border: '3px dashed rgba(0,200,83,0.15)',
        boxShadow: '0 8px 32px rgba(0,200,83,0.06)',
        animation: 'candyPulse 6s ease-in-out infinite',
      }}>
        <div
          style={{
            display: 'inline-grid',
            gridTemplateColumns: `${clueColW}px repeat(${n}, ${cellSz})`,
            gridTemplateRows: `${clueRowH}px repeat(${n}, ${cellSz})`,
            background: '#060e1a',
            padding: '18px 20px',
            borderRadius: 14,
            border: '2px solid rgba(0,200,83,0.15)',
            boxShadow: '0 0 24px rgba(0,200,83,0.08)',
          }}
        >
          {/* corner */}
          <div style={{ gridRow: 1, gridColumn: 1 }} />

          {/* column clues */}
          {colClues.map((clues, c) => (
            <div
              key={`col-clue-${c}`}
              style={{
                gridRow: 1,
                gridColumn: c + 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 2,
                paddingBottom: 4,
              }}
            >
              {(clues.length ? clues : [0]).map((num, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: size === 15 ? 10 : 12,
                    fontWeight: 700,
                    lineHeight: 1,
                    color: colSatisfied[c] ? 'rgba(0,200,83,0.2)' : '#69f0ae',
                  }}
                >
                  {num}
                </span>
              ))}
            </div>
          ))}

          {/* row clues + cells */}
          {Array.from({ length: n }, (_, r) => (
            <div key={`row-${r}`} style={{ display: 'contents' }}>
              <div
                style={{
                  gridRow: r + 2,
                  gridColumn: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 6,
                  paddingRight: 6,
                }}
              >
                {(rowClues[r].length ? rowClues[r] : [0]).map((num, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: size === 15 ? 10 : 12,
                      fontWeight: 700,
                      color: rowSatisfied[r] ? 'rgba(0,200,83,0.2)' : '#69f0ae',
                    }}
                  >
                    {num}
                  </span>
                ))}
              </div>

              {Array.from({ length: n }, (_, c) => {
                const state = cells[r][c];
                const shouldFill = solution[r][c];
                const wrong = state === 1 && !shouldFill;
                const correctFill = state === 1 && shouldFill;

                let bg = 'rgba(0,200,83,0.04)';
                let borderColor = 'rgba(0,200,83,0.15)';
                let boxShadow: string | undefined;

                if (state === 2) {
                  bg = 'rgba(255,50,50,0.3)';
                } else if (wrong) {
                  bg = 'rgba(255,50,50,0.55)';
                  boxShadow = 'inset 0 0 8px rgba(255,80,80,0.6)';
                } else if (correctFill) {
                  bg = '#00c853';
                  boxShadow = '0 0 8px rgba(0,200,83,0.45), inset 0 0 4px rgba(105,240,174,0.35)';
                }

                const thickLine = '3px solid rgba(0,200,83,0.58)';
                const borderRight =
                  thick && (c + 1) % 5 === 0 && c < n - 1
                    ? thickLine
                    : `1px solid ${borderColor}`;
                const borderBottom =
                  thick && (r + 1) % 5 === 0 && r < n - 1
                    ? thickLine
                    : `1px solid ${borderColor}`;

                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onClick={() => handleCellClick(r, c)}
                    onContextMenu={(e) => handleContextMenu(e, r, c)}
                    onTouchStart={() => handleTouchStart(r, c)}
                    onTouchEnd={() => handleTouchEnd(r, c)}
                    onTouchCancel={() => {
                      if (longPressRef.current) clearTimeout(longPressRef.current);
                    }}
                    style={{
                      gridRow: r + 2,
                      gridColumn: c + 2,
                      width: '100%',
                      height: '100%',
                      minWidth: 0,
                      minHeight: 0,
                      padding: 0,
                      margin: 0,
                      cursor: completed ? 'default' : 'pointer',
                      background: bg,
                      border: 'none',
                      borderRight,
                      borderBottom,
                      borderTop: r === 0 ? `1px solid ${borderColor}` : undefined,
                      borderLeft: c === 0 ? `1px solid ${borderColor}` : undefined,
                      boxShadow,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'rgba(255,100,100,0.95)',
                      fontSize: size === 15 ? 22 : size === 10 ? 24 : 28,
                      fontWeight: 800,
                      lineHeight: 1,
                      textShadow: state === 2 ? '0 0 6px rgba(255,80,80,0.5)' : undefined,
                      fontFamily: mono,
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      touchAction: 'manipulation',
                    }}
                    aria-label={`Row ${r + 1} Col ${c + 1}`}
                  >
                    {state === 2 ? '✕' : null}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {completed && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{
              background: 'rgba(0,0,0,0.18)',
              borderRadius: 12,
            }}
          >
          <div
            className="flex flex-col items-center justify-center backdrop-blur-xl border border-[rgba(0,200,83,0.3)]"
            style={{
              background: 'rgba(6,14,26,0.82)',
              borderRadius: 12,
              padding: '28px 24px',
              animation: 'popIn 0.4s ease-out',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              maxWidth: '90%',
            }}
          >
            <div
              style={{
                fontSize: 34,
                fontWeight: 900,
                color: '#69f0ae',
                marginBottom: 10,
                fontFamily: mono,
                letterSpacing: 2,
                animation: 'nonogramTitleGlow 2.2s ease-in-out infinite',
              }}
            >
              {t.nonogram.solved}
            </div>
            <div style={{ color: 'rgba(105,240,174,0.75)', marginBottom: 8, fontFamily: mono, fontSize: 14 }}>
              {puzzle.name} · {time} s
            </div>
            <div
              style={{
                display: 'inline-grid',
                gap: 1,
                marginBottom: 16,
                padding: 14,
                background: 'rgba(0,200,83,0.06)',
                borderRadius: 10,
                border: '1px solid rgba(0,200,83,0.25)',
                gridTemplateColumns: `repeat(${n}, ${Math.min(parseInt(cellSz) || 12, size === 5 ? 14 : size === 10 ? 10 : 8)}px)`,
                animation: 'nonogramPreviewPulse 2s ease-in-out infinite',
              }}
            >
              {solution.map((row, r) =>
                row.map((filled, c) => (
                  <div
                    key={`preview-${r}-${c}`}
                    style={{
                      width: size === 5 ? 14 : size === 10 ? 10 : 8,
                      height: size === 5 ? 14 : size === 10 ? 10 : 8,
                      background: filled ? '#00c853' : 'rgba(0,200,83,0.04)',
                      boxShadow: filled ? '0 0 4px rgba(0,200,83,0.5)' : undefined,
                    }}
                  />
                )),
              )}
            </div>
            <div
              style={{
                color: bestTime !== null && time <= bestTime ? '#69f0ae' : 'rgba(105,240,174,0.65)',
                fontSize: 13,
                marginBottom: 12,
                fontFamily: mono,
                fontWeight: bestTime !== null && time <= bestTime ? 700 : 400,
              }}
            >
              {bestTime !== null ? (
                <>
                  🏆 {fmt(t.nonogram.bestTime, { t: bestTime })}
                  {time <= bestTime ? ` · ${t.nonogram.newRecord}` : ''}
                </>
              ) : (
                <>📋 {t.nonogram.ruleRecord}</>
              )}
            </div>
            <button type="button" onClick={nextPuzzle} className="btn-premium">
              {t.common.nextLevel}
            </button>
          </div>
          </div>
        )}
      </div>
      </div>

      <p
        style={{
          fontSize: 11,
          textAlign: 'center',
          marginTop: 10,
          color: 'rgba(0,200,83,0.2)',
          fontFamily: mono,
          letterSpacing: 1.5,
        }}
      >
        {t.nonogram.hintText}
      </p>
    </GameWrapper>
  );
}
