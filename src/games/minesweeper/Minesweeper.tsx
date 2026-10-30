import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import GameWrapper from '../../components/GameWrapper';
import { getHighScore, setHighScore as saveHighScore } from '../../utils/storage';
import LeaderboardPanel from '../../components/LeaderboardPanel';
import { useIdleHint } from '../../hooks/useIdleHint';
import { useI18n } from '../../i18n';

type CellState = {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
};

type Difficulty = { name: string; rows: number; cols: number; mines: number };

const DIFFICULTY_CONFIGS = [
  { rows: 9, cols: 9, mines: 10 },
  { rows: 16, cols: 16, mines: 40 },
  { rows: 16, cols: 30, mines: 99 },
] as const;

function createBoard(rows: number, cols: number, mines: number, safeR: number, safeC: number): CellState[][] {
  const board: CellState[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      mine: false, revealed: false, flagged: false, adjacent: 0,
    }))
  );

  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (board[r][c].mine) continue;
    if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
    board[r][c].mine = true;
    placed++;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].mine) count++;
        }
      }
      board[r][c].adjacent = count;
    }
  }

  return board;
}

function revealCell(board: CellState[][], r: number, c: number, rows: number, cols: number): CellState[][] {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  const queue: [number, number][] = [[r, c]];
  while (queue.length > 0) {
    const [cr, cc] = queue.shift()!;
    if (cr < 0 || cr >= rows || cc < 0 || cc >= cols) continue;
    if (newBoard[cr][cc].revealed || newBoard[cr][cc].flagged) continue;
    newBoard[cr][cc].revealed = true;
    if (newBoard[cr][cc].adjacent === 0 && !newBoard[cr][cc].mine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          queue.push([cr + dr, cc + dc]);
        }
      }
    }
  }
  return newBoard;
}

const NUMBER_COLORS = [
  '', '#ff2d95', '#39ff14', '#ff6b2b', '#00f0ff',
  '#bf5af2', '#ffe93e', '#ff6baf', '#ff2d95',
];

export default function Minesweeper() {
  const { t } = useI18n();
  const DIFFICULTIES = useMemo(() => [
    { name: t.common.beginner, ...DIFFICULTY_CONFIGS[0] },
    { name: t.common.intermediate, ...DIFFICULTY_CONFIGS[1] },
    { name: t.common.advanced, ...DIFFICULTY_CONFIGS[2] },
  ], [t]);
  const [diffIdx, setDiffIdx] = useState(0);
  const diff = DIFFICULTIES[diffIdx];
  const [board, setBoard] = useState<CellState[][] | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [firstClick, setFirstClick] = useState(true);
  const [time, setTime] = useState(0);
  const [flagCount, setFlagCount] = useState(0);
  const [flagMode, setFlagMode] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressedRef = useRef(false);
  const bestTime = getHighScore(`minesweeper_${diffIdx}`);
  const { showHint: mineIdleHint, resetHint: resetMineIdle } = useIdleHint(10000, !gameOver && !firstClick);

  const idleHintCell = useMemo(() => {
    if (!mineIdleHint || !board) return null;
    for (let r = 0; r < diff.rows; r++) {
      for (let c = 0; c < diff.cols; c++) {
        const cell = board[r][c];
        if (!cell.revealed || cell.mine) continue;
        for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < diff.rows && nc >= 0 && nc < diff.cols) {
            const neighbor = board[nr][nc];
            if (!neighbor.revealed && !neighbor.flagged) return `${nr},${nc}`;
          }
        }
      }
    }
    return null;
  }, [mineIdleHint, board, diff]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => () => stopTimer(), [stopTimer]);

  const restart = useCallback(() => {
    setBoard(null);
    setGameOver(false);
    setWon(false);
    setFirstClick(true);
    setTime(0);
    setFlagCount(0);
    stopTimer();
  }, [stopTimer]);

  useEffect(() => { restart(); }, [diffIdx, restart]);

  const checkWin = useCallback((b: CellState[][]) => {
    const allRevealed = b.every(row => row.every(cell => cell.revealed || cell.mine));
    if (allRevealed) {
      setWon(true);
      setGameOver(true);
      stopTimer();
      const key = `minesweeper_${diffIdx}`;
      const best = getHighScore(key);
      if (best === 0 || time < best) { saveHighScore(key, time); }
    }
  }, [diffIdx, time, stopTimer]);

  const handleClick = useCallback((r: number, c: number) => {
    if (gameOver) return;

    if (firstClick) {
      const b = createBoard(diff.rows, diff.cols, diff.mines, r, c);
      const revealed = revealCell(b, r, c, diff.rows, diff.cols);
      setBoard(revealed);
      setFirstClick(false);
      startTimer();
      checkWin(revealed);
      return;
    }

    if (!board) return;
    const cell = board[r][c];

    // Flag mode (for mobile)
    if (flagMode) {
      if (cell.revealed) return;
      const newBoard = board.map(row => row.map(c => ({ ...c })));
      newBoard[r][c].flagged = !cell.flagged;
      setBoard(newBoard);
      setFlagCount(prev => cell.flagged ? prev - 1 : prev + 1);
      return;
    }

    if (cell.revealed || cell.flagged) return;

    if (cell.mine) {
      const newBoard = board.map(row => row.map(c => ({ ...c, revealed: c.mine ? true : c.revealed })));
      setBoard(newBoard);
      setGameOver(true);
      stopTimer();
      return;
    }

    const newBoard = revealCell(board, r, c, diff.rows, diff.cols);
    setBoard(newBoard);
    checkWin(newBoard);
  }, [board, gameOver, firstClick, diff, startTimer, stopTimer, checkWin, flagMode]);

  const handleRightClick = useCallback((e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameOver || firstClick || !board) return;
    const cell = board[r][c];
    if (cell.revealed) return;
    const newBoard = board.map(row => row.map(c => ({ ...c })));
    newBoard[r][c].flagged = !cell.flagged;
    setBoard(newBoard);
    setFlagCount(prev => cell.flagged ? prev - 1 : prev + 1);
  }, [board, gameOver, firstClick]);

  // Long press for flag on mobile
  const handleTouchStart = useCallback((r: number, c: number) => {
    longPressedRef.current = false;
    longPressRef.current = setTimeout(() => {
      longPressedRef.current = true;
      if (gameOver || firstClick || !board) return;
      const cell = board[r][c];
      if (cell.revealed) return;
      const newBoard = board.map(row => row.map(c => ({ ...c })));
      newBoard[r][c].flagged = !cell.flagged;
      setBoard(newBoard);
      setFlagCount(prev => cell.flagged ? prev - 1 : prev + 1);
    }, 400);
  }, [board, gameOver, firstClick]);

  const handleTouchEnd = useCallback(() => {
    if (longPressRef.current) { clearTimeout(longPressRef.current); longPressRef.current = null; }
  }, []);

  const handleDoubleClick = useCallback((r: number, c: number) => {
    if (gameOver || !board) return;
    const cell = board[r][c];
    if (!cell.revealed || cell.adjacent === 0) return;

    let flagsAround = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < diff.rows && nc >= 0 && nc < diff.cols && board[nr][nc].flagged) flagsAround++;
      }
    }
    if (flagsAround !== cell.adjacent) return;

    let newBoard = board.map(row => row.map(c => ({ ...c })));
    let hitMine = false;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < diff.rows && nc >= 0 && nc < diff.cols) {
          const neighbor = newBoard[nr][nc];
          if (!neighbor.revealed && !neighbor.flagged) {
            if (neighbor.mine) {
              hitMine = true;
              newBoard = newBoard.map(row => row.map(c => ({ ...c, revealed: c.mine ? true : c.revealed })));
            } else {
              newBoard = revealCell(newBoard, nr, nc, diff.rows, diff.cols);
            }
          }
        }
      }
    }
    setBoard(newBoard);
    if (hitMine) { setGameOver(true); stopTimer(); } else { checkWin(newBoard); }
  }, [board, gameOver, diff, stopTimer, checkWin]);

  // Compute cell size based on screen width
  const getCellSize = () => {
    if (diffIdx === 2) return 'min(calc((95vw - 1rem) / 30), 24px)';
    if (diffIdx === 1) return 'min(calc((95vw - 1rem) / 16), 28px)';
    return 'min(calc((95vw - 1rem) / 9), 36px)';
  };

  const cellSz = getCellSize();

  const mineIdleStyle = `@keyframes mineIdleHint { 0%,100% { box-shadow: 0 0 8px rgba(255,45,149,0.4); } 50% { box-shadow: 0 0 18px rgba(255,45,149,0.7), inset 0 0 8px rgba(255,45,149,0.2); } }`;

  const renderBoard = () => {
    const rows = diff.rows;
    const cols = diff.cols;
    const cells: CellState[][] = board || Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({ mine: false, revealed: false, flagged: false, adjacent: 0 }))
    );

    return (
      <div
        className="inline-grid gap-px p-3 rounded-2xl border-3 border-[rgba(255,45,149,0.3)]"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${cellSz})`,
          background: 'rgba(40,15,80,0.5)',
        }}
      >
        {cells.map((row, r) =>
          row.map((cell, c) => {
            let content = '';
            let cellStyle: React.CSSProperties = {
              width: cellSz,
              height: cellSz,
              fontSize: diffIdx === 2 ? '10px' : undefined,
              background: 'rgba(60,20,110,0.6)',
              border: '1.5px solid rgba(255,45,149,0.15)',
              borderRadius: '6px',
            };
            let textColor = '';
            let cellClass =
              'flex items-center justify-center font-black select-none transition-colors text-xs sm:text-sm cursor-pointer hover:!bg-[rgba(255,45,149,0.15)]';

            if (cell.revealed) {
              cellClass = 'flex items-center justify-center font-black select-none transition-colors text-xs sm:text-sm';
              cellStyle.background = 'rgba(26,10,46,0.7)';
              cellStyle.border = '1.5px solid rgba(255,45,149,0.08)';
              if (cell.mine) content = '💣';
              else if (cell.adjacent > 0) {
                content = String(cell.adjacent);
                textColor = NUMBER_COLORS[cell.adjacent] || '#ff2d95';
              }
            } else if (cell.flagged) {
              content = '🚩';
            }

            const isIdleHinted = idleHintCell === `${r},${c}`;
            if (isIdleHinted) {
              cellStyle.boxShadow = '0 0 10px rgba(255,45,149,0.6), inset 0 0 6px rgba(255,45,149,0.2)';
              cellStyle.animation = 'mineIdleHint 1.2s ease-in-out infinite';
            }

            return (
              <button
                key={`${r}-${c}`}
                className={cellClass}
                style={{ ...cellStyle, color: textColor || undefined }}
                onClick={() => { resetMineIdle(); if (!longPressedRef.current) handleClick(r, c); }}
                onContextMenu={(e) => handleRightClick(e, r, c)}
                onDoubleClick={() => handleDoubleClick(r, c)}
                onTouchStart={() => handleTouchStart(r, c)}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
              >
                {content}
              </button>
            );
          })
        )}
      </div>
    );
  };

  return (
    <GameWrapper
      title={t.minesweeper.title}
      controls={
        <div className="flex flex-wrap gap-2 items-center">
          {DIFFICULTIES.map((d, i) => (
            <button
              key={d.name}
              onClick={() => setDiffIdx(i)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                diffIdx === i ? 'bg-green-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {d.name}
            </button>
          ))}
          <button onClick={restart} className="btn-premium">
            {t.common.restart}
          </button>
          {/* Flag mode toggle for mobile */}
          <button
            onClick={() => setFlagMode(f => !f)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              flagMode ? 'bg-orange-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            ⚠ {flagMode ? t.common.flagging : t.common.flagMode}
          </button>
          <div className="flex items-center gap-3 text-sm font-bold text-[#ff6baf]">
            <span>💣 {diff.mines - flagCount}</span>
            <span>⏱ {String(time).padStart(3, '0')}s</span>
            {bestTime > 0 && <span className="text-[#ffe93e]">🏆 {String(bestTime).padStart(3, '0')}s</span>}
          </div>
          <LeaderboardPanel gameId="minesweeper" currentScore={won ? time : 0} gameOver={gameOver && won} scoreLabel={t.common.timeSeconds} detail={DIFFICULTIES[diffIdx].name} />
        </div>
      }
    >
      <style>{mineIdleStyle}</style>
      <div className="relative overflow-x-auto" style={{
        WebkitOverflowScrolling: 'touch',
        borderRadius: 24,
        padding: 4,
        background: 'linear-gradient(135deg, rgba(255,45,149,0.1) 0%, rgba(191,90,242,0.05) 50%, rgba(0,240,255,0.08) 100%)',
        border: '3px dashed rgba(255,45,149,0.2)',
        animation: 'candyPulse 6s ease-in-out infinite',
        boxShadow: '0 8px 32px rgba(255,45,149,0.1)',
      }}>
        {renderBoard()}
        {gameOver && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
            style={{ background: 'rgba(0,0,0,0.18)' }}
          >
            <div className="text-center px-8 py-6 rounded-2xl backdrop-blur-xl border-3 border-[rgba(255,45,149,0.4)]"
              style={{ background: 'rgba(26,10,46,0.82)', animation: 'popIn 0.4s ease-out', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
              <div className="text-4xl mb-2" style={{ animation: won ? 'bounce 1s ease-in-out infinite' : 'wiggle 1s ease-in-out infinite' }}>
                {won ? '🎉' : '💥'}
              </div>
              <div className="text-center mb-4">
                <div className="text-lg sm:text-xl font-black text-white">
                  {won ? t.minesweeper.cleared : t.minesweeper.mineHit}
                </div>
              </div>
              {won && (
                <div className="text-[#ffe93e] mb-4 font-bold text-sm">
                  ⏱ {String(time).padStart(3, '0')}s
                </div>
              )}
              <button
                onClick={restart}
                className="btn-premium"
              >
                {t.minesweeper.again}
              </button>
            </div>
          </div>
        )}
      </div>
      <div style={{
        fontSize: 12,
        textAlign: 'center',
        marginTop: 14,
        color: '#c8a0e0',
        fontWeight: 700,
        opacity: 0.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}>
        <span style={{ animation: 'wiggle 2s ease-in-out infinite', display: 'inline-block' }}>💡</span>
        <span className="hidden sm:inline">{t.minesweeper.desktopHint}</span>
        <span className="sm:hidden">{t.minesweeper.mobileHint}</span>
      </div>
    </GameWrapper>
  );
}
