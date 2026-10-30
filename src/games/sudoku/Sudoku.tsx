import { useState, useCallback, useMemo, useEffect } from 'react';
import GameWrapper from '../../components/GameWrapper';
import LeaderboardPanel from '../../components/LeaderboardPanel';
import { useIdleHint } from '../../hooks/useIdleHint';
import { useI18n } from '../../i18n';

type Grid = (number | null)[][];
type Difficulty = 'easy' | 'medium' | 'hard';

function createSolvedGrid(): Grid {
  const grid: Grid = Array.from({ length: 9 }, () => Array(9).fill(null));

  function isValid(grid: Grid, r: number, c: number, num: number): boolean {
    for (let i = 0; i < 9; i++) {
      if (grid[r][i] === num || grid[i][c] === num) return false;
    }
    const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
    for (let dr = 0; dr < 3; dr++) {
      for (let dc = 0; dc < 3; dc++) {
        if (grid[br + dr][bc + dc] === num) return false;
      }
    }
    return true;
  }

  function fill(pos: number): boolean {
    if (pos === 81) return true;
    const r = Math.floor(pos / 9), c = pos % 9;
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
    for (const num of nums) {
      if (isValid(grid, r, c, num)) {
        grid[r][c] = num;
        if (fill(pos + 1)) return true;
        grid[r][c] = null;
      }
    }
    return false;
  }

  fill(0);
  return grid;
}

function generatePuzzle(difficulty: Difficulty): { puzzle: Grid; solution: Grid } {
  const solution = createSolvedGrid();
  const puzzle = solution.map(row => [...row]);

  const cellsToRemove: Record<Difficulty, number> = {
    easy: 35,
    medium: 45,
    hard: 55,
  };

  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c]);
    }
  }
  positions.sort(() => Math.random() - 0.5);

  let removed = 0;
  for (const [r, c] of positions) {
    if (removed >= cellsToRemove[difficulty]) break;
    puzzle[r][c] = null;
    removed++;
  }

  return { puzzle, solution };
}

export default function Sudoku() {
  const { t } = useI18n();
  const DIFF_LABELS: Record<Difficulty, string> = { easy: t.common.easy, medium: t.common.medium, hard: t.common.hard };
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [{ puzzle, solution }, setGame] = useState(() => generatePuzzle('easy'));
  const [grid, setGrid] = useState<Grid>(() => puzzle.map(row => [...row]));
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState(false);
  const [_showHint, _setShowHint] = useState(false);
  const { showHint: idleHint, resetHint: resetIdle } = useIdleHint(10000, !completed);
  const [idleHighlight, setIdleHighlight] = useState<[number, number] | null>(null);

  const fixed = useMemo(() => {
    const s = new Set<string>();
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (puzzle[r][c] !== null) s.add(`${r},${c}`);
      }
    }
    return s;
  }, [puzzle]);

  const checkErrors = useCallback((g: Grid) => {
    const errs = new Set<string>();
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = g[r][c];
        if (val === null) continue;
        if (val !== solution[r][c]) {
          errs.add(`${r},${c}`);
        }
      }
    }
    return errs;
  }, [solution]);

  const handleInput = useCallback((num: number | null) => {
    if (!selected || completed) return;
    resetIdle();
    setIdleHighlight(null);
    const [r, c] = selected;
    if (fixed.has(`${r},${c}`)) return;

    const newGrid = grid.map(row => [...row]);
    newGrid[r][c] = num;
    setGrid(newGrid);

    const errs = checkErrors(newGrid);
    setErrors(errs);

    // check completion
    if (num !== null && errs.size === 0) {
      const isFull = newGrid.every(row => row.every(cell => cell !== null));
      if (isFull) setCompleted(true);
    }
  }, [selected, grid, fixed, completed, checkErrors]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!selected) return;
    const [r, c] = selected;
    if (e.key >= '1' && e.key <= '9') {
      handleInput(parseInt(e.key));
    } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
      handleInput(null);
    } else if (e.key === 'ArrowUp' && r > 0) setSelected([r - 1, c]);
    else if (e.key === 'ArrowDown' && r < 8) setSelected([r + 1, c]);
    else if (e.key === 'ArrowLeft' && c > 0) setSelected([r, c - 1]);
    else if (e.key === 'ArrowRight' && c < 8) setSelected([r, c + 1]);
  }, [selected, handleInput]);

  useEffect(() => {
    if (idleHint && !completed) {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (grid[r][c] === null && !fixed.has(`${r},${c}`)) {
            setIdleHighlight([r, c]);
            setSelected([r, c]);
            return;
          }
        }
      }
    } else {
      setIdleHighlight(null);
    }
  }, [idleHint, completed, grid, fixed]);

  const hint = useCallback(() => {
    if (!selected || completed) return;
    const [r, c] = selected;
    if (fixed.has(`${r},${c}`) || grid[r][c] === solution[r][c]) return;
    const newGrid = grid.map(row => [...row]);
    newGrid[r][c] = solution[r][c];
    setGrid(newGrid);
    setErrors(checkErrors(newGrid));
    const isFull = newGrid.every(row => row.every(cell => cell !== null));
    if (isFull && checkErrors(newGrid).size === 0) setCompleted(true);
  }, [selected, grid, fixed, solution, completed, checkErrors]);

  const newGame = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    const game = generatePuzzle(diff);
    setGame(game);
    setGrid(game.puzzle.map(row => [...row]));
    setSelected(null);
    setErrors(new Set());
    setCompleted(false);
  }, []);

  const isHighlighted = (r: number, c: number) => {
    if (!selected) return false;
    const [sr, sc] = selected;
    return r === sr || c === sc ||
      (Math.floor(r / 3) === Math.floor(sr / 3) && Math.floor(c / 3) === Math.floor(sc / 3));
  };

  const isSameNumber = (r: number, c: number) => {
    if (!selected) return false;
    const [sr, sc] = selected;
    const selectedVal = grid[sr][sc];
    return selectedVal !== null && grid[r][c] === selectedVal;
  };

  return (
    <GameWrapper
      title={t.sudoku.title}
      controls={
        <div className="flex flex-wrap gap-2 items-center">
          {(Object.keys(DIFF_LABELS) as Difficulty[]).map(d => (
            <button
              key={d}
              onClick={() => newGame(d)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                difficulty === d ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {DIFF_LABELS[d]}
            </button>
          ))}
          <button onClick={hint} className="px-5 py-2.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg text-sm font-medium transition-colors border border-blue-400/50">
            💡 {t.common.hint}
          </button>
          <LeaderboardPanel gameId="sudoku" currentScore={completed ? 1 : 0} gameOver={completed} scoreLabel={t.common.score} detail={DIFF_LABELS[difficulty]} />
        </div>
      }
    >
      <style>{`
        @keyframes sudokuIdleHint {
          0%, 100% { box-shadow: 0 0 10px rgba(255,45,149,0.4), inset 0 0 6px rgba(255,45,149,0.1); }
          50% { box-shadow: 0 0 20px rgba(255,45,149,0.7), inset 0 0 12px rgba(255,45,149,0.25); }
        }
      `}</style>
      <div className="relative" onKeyDown={handleKeyDown} tabIndex={0} style={{
        touchAction: 'manipulation',
        padding: '10px',
        borderRadius: 24,
        background: 'linear-gradient(145deg, rgba(40,15,80,0.3) 0%, rgba(26,10,46,0.5) 100%)',
        border: '3px dashed rgba(255,45,149,0.2)',
        boxShadow: '0 8px 32px rgba(255,45,149,0.08)',
        animation: 'candyPulse 6s ease-in-out infinite',
      }}>
        <div
          className="inline-grid rounded-2xl overflow-hidden"
          style={{
            gridTemplateColumns: 'repeat(9, 1fr)',
            border: '3px solid rgba(255,45,149,0.4)',
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const isFixed = fixed.has(`${r},${c}`);
              const isError = errors.has(`${r},${c}`);
              const isSelected = selected?.[0] === r && selected?.[1] === c;
              const highlighted = isHighlighted(r, c);
              const sameNum = isSameNumber(r, c);

              const borderThick = 'rgba(255,45,149,0.35)';
              const borderThin = 'rgba(255,45,149,0.1)';

              const isIdleHinted = idleHighlight?.[0] === r && idleHighlight?.[1] === c;
              let backgroundColor = 'rgba(40,15,80,0.5)';
              let boxShadow: string | undefined;
              let animation: string | undefined;
              if (isSelected) {
                backgroundColor = 'rgba(255,45,149,0.25)';
                boxShadow = 'inset 0 0 10px rgba(255,45,149,0.35), 0 0 6px rgba(255,45,149,0.3)';
              } else if (sameNum) {
                backgroundColor = 'rgba(255,45,149,0.1)';
              } else if (highlighted) {
                backgroundColor = 'rgba(60,20,110,0.4)';
              }
              if (isIdleHinted) {
                boxShadow = '0 0 14px rgba(255,45,149,0.6), inset 0 0 8px rgba(255,45,149,0.2)';
                animation = 'sudokuIdleHint 1.2s ease-in-out infinite';
              }

              return (
                <button
                  key={`${r}-${c}`}
                  className="w-[min(10vw,2.75rem)] h-[min(10vw,2.75rem)] sm:w-11 sm:h-11 flex items-center justify-center font-bold text-sm sm:text-base transition-colors cursor-pointer select-none"
                  style={{
                    fontWeight: 800,
                    color: isError ? '#ef4444' : isFixed ? '#c8a0e0' : '#ff6baf',
                    borderRight: (c + 1) % 3 === 0 && c < 8 ? `2px solid ${borderThick}` : `1px solid ${borderThin}`,
                    borderBottom: (r + 1) % 3 === 0 && r < 8 ? `2px solid ${borderThick}` : `1px solid ${borderThin}`,
                    backgroundColor,
                    boxShadow,
                    animation,
                  }}
                  onClick={() => { setSelected([r, c]); resetIdle(); setIdleHighlight(null); }}
                >
                  {cell || ''}
                </button>
              );
            })
          )}
        </div>

        {/* Number pad */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mt-4 max-w-xs mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button
              key={n}
              onClick={() => handleInput(n)}
              className="h-11 sm:h-12 hover:bg-[rgba(255,45,149,0.2)] active:bg-[rgba(255,45,149,0.3)] rounded-xl font-black text-lg transition-colors border-2 border-dashed border-[rgba(255,45,149,0.15)]"
              style={{ background: 'rgba(40,15,80,0.5)', color: '#ff6baf' }}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => handleInput(null)}
            className="h-11 sm:h-12 hover:bg-red-500/25 active:bg-red-500/35 rounded-xl text-red-300 font-black text-lg transition-colors border-2 border-dashed border-red-400/20"
            style={{ background: 'rgba(255,50,50,0.1)' }}
          >
            ✕
          </button>
        </div>

        {completed && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
            style={{ background: 'rgba(0,0,0,0.18)' }}
          >
            <div className="text-center px-8 py-6 rounded-2xl backdrop-blur-xl border-3 border-[rgba(255,45,149,0.4)]"
              style={{ background: 'rgba(26,10,46,0.82)', animation: 'popIn 0.4s ease-out', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
              <div className="text-4xl mb-2" style={{ animation: 'bounce 1s ease-in-out infinite' }}>🧩</div>
              <div className="text-2xl font-black mb-4 text-white">
                {t.sudoku.complete}
              </div>
              <button
                onClick={() => newGame(difficulty)}
                className="btn-premium"
              >
                {t.sudoku.again}
              </button>
            </div>
          </div>
        )}
      </div>
      <p style={{
        fontSize: 11,
        textAlign: 'center',
        marginTop: 10,
        color: '#c8a0e0',
        fontWeight: 600,
        opacity: 0.5,
      }}>
        Click cell to select | Number keys to fill | Arrow keys to move
      </p>
    </GameWrapper>
  );
}
