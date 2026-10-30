import { useState, useCallback, useRef, useMemo } from 'react';
import GameWrapper from '../../components/GameWrapper';
import { useGameScore } from '../../hooks/useGameScore';
import LeaderboardPanel from '../../components/LeaderboardPanel';
import { useIdleHint } from '../../hooks/useIdleHint';
import { useI18n, fmt } from '../../i18n';

const ROWS = 8;
const COLS = 8;
const GEMS = ['🔥', '💧', '🌿', '⚡', '💨', '🌙', '❄️'];

type Cell = { gem: string; key: number };
type Pos = { r: number; c: number };

let keyCounter = 0;
function newCell(gem?: string): Cell {
  return { gem: gem || GEMS[Math.floor(Math.random() * GEMS.length)], key: keyCounter++ };
}

function createBoard(): Cell[][] {
  const board: Cell[][] = [];
  for (let r = 0; r < ROWS; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < COLS; c++) {
      let cell: Cell;
      do {
        cell = newCell();
      } while (
        (c >= 2 && row[c - 1].gem === cell.gem && row[c - 2].gem === cell.gem) ||
        (r >= 2 && board[r - 1][c].gem === cell.gem && board[r - 2][c].gem === cell.gem)
      );
      row.push(cell);
    }
    board.push(row);
  }
  return board;
}

function cloneBoard(board: Cell[][]): Cell[][] {
  return board.map(row => row.map(cell => ({ ...cell })));
}

function findMatches(board: Cell[][]): Set<string> {
  const matched = new Set<string>();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 2; c++) {
      if (board[r][c].gem && board[r][c].gem === board[r][c + 1].gem && board[r][c].gem === board[r][c + 2].gem) {
        let end = c + 2;
        while (end + 1 < COLS && board[r][end + 1].gem === board[r][c].gem) end++;
        for (let i = c; i <= end; i++) matched.add(`${r},${i}`);
      }
    }
  }
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 2; r++) {
      if (board[r][c].gem && board[r][c].gem === board[r + 1][c].gem && board[r][c].gem === board[r + 2][c].gem) {
        let end = r + 2;
        while (end + 1 < ROWS && board[end + 1][c].gem === board[r][c].gem) end++;
        for (let i = r; i <= end; i++) matched.add(`${i},${c}`);
      }
    }
  }
  return matched;
}

function removeAndFill(board: Cell[][]): Cell[][] {
  const matched = findMatches(board);
  if (matched.size === 0) return board;

  const newBoard = cloneBoard(board);
  for (const key of matched) {
    const [r, c] = key.split(',').map(Number);
    newBoard[r][c] = { gem: '', key: -1 };
  }
  for (let c = 0; c < COLS; c++) {
    let writeRow = ROWS - 1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (newBoard[r][c].gem !== '') {
        if (writeRow !== r) {
          newBoard[writeRow][c] = newBoard[r][c];
          newBoard[r][c] = { gem: '', key: -1 };
        }
        writeRow--;
      }
    }
    for (let r = writeRow; r >= 0; r--) {
      newBoard[r][c] = newCell();
    }
  }
  return newBoard;
}

function findValidSwap(board: Cell[][]): [number, number, number, number] | null {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (c + 1 < COLS) {
        const test = cloneBoard(board);
        const tmp = test[r][c];
        test[r][c] = test[r][c + 1];
        test[r][c + 1] = tmp;
        if (findMatches(test).size > 0) return [r, c, r, c + 1];
      }
      if (r + 1 < ROWS) {
        const test = cloneBoard(board);
        const tmp = test[r][c];
        test[r][c] = test[r + 1][c];
        test[r + 1][c] = tmp;
        if (findMatches(test).size > 0) return [r, c, r + 1, c];
      }
    }
  }
  return null;
}

function hasValidMove(board: Cell[][]): boolean {
  return findValidSwap(board) !== null;
  return false;
}

function cascadeBoard(board: Cell[][]): { board: Cell[][]; totalPopped: number } {
  let b = cloneBoard(board);
  let totalPopped = 0;
  let iteration = 0;
  while (iteration < 20) {
    const m = findMatches(b);
    if (m.size === 0) break;
    totalPopped += m.size;
    b = removeAndFill(b);
    iteration++;
  }
  return { board: b, totalPopped };
}

export default function Match3() {
  const { t } = useI18n();
  const { score, highScore, updateScore, resetScore } = useGameScore('match3');
  const [board, setBoard] = useState<Cell[][]>(() => {
    const b = createBoard();
    const { board: cascaded } = cascadeBoard(b);
    return cascaded;
  });
  const [selected, setSelected] = useState<Pos | null>(null);
  const [moves, setMoves] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [combo, setCombo] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [matchedCells, setMatchedCells] = useState<Set<string>>(new Set());
  const scoreRef = useRef(0);
  const touchStartPos = useRef<{ x: number; y: number; r: number; c: number } | null>(null);
  const { showHint, resetHint } = useIdleHint(6000, !gameOver && !animating);
  const hintSwap = useMemo(() => showHint ? findValidSwap(board) : null, [showHint, board]);

  const processChain = useCallback((b: Cell[][], comboLevel: number) => {
    const m = findMatches(b);
    if (m.size > 0) {
      setMatchedCells(m);
      setAnimating(true);
      setTimeout(() => {
        const pts = m.size * 10 * (comboLevel + 1);
        scoreRef.current += pts;
        updateScore(scoreRef.current);
        setCombo(comboLevel);

        const newBoard = removeAndFill(b);
        setBoard(newBoard);
        setMatchedCells(new Set());

        setTimeout(() => processChain(newBoard, comboLevel + 1), 250);
      }, 350);
    } else {
      setAnimating(false);
      setCombo(0);
      if (!hasValidMove(b)) {
        const fresh = createBoard();
        const { board: cascaded } = cascadeBoard(fresh);
        setBoard(cascaded);
      }
    }
  }, [updateScore]);

  const doSwap = useCallback((from: Pos, to: Pos) => {
    if (animating || gameOver) return;
    if (Math.abs(from.r - to.r) + Math.abs(from.c - to.c) !== 1) {
      setSelected(null);
      return;
    }

    const newBoard = cloneBoard(board);
    const temp = newBoard[from.r][from.c];
    newBoard[from.r][from.c] = newBoard[to.r][to.c];
    newBoard[to.r][to.c] = temp;

    if (findMatches(newBoard).size > 0) {
      setBoard(newBoard);
      setSelected(null);
      const newMoves = moves - 1;
      setMoves(newMoves);
      processChain(newBoard, 0);
      if (newMoves <= 0) {
        setTimeout(() => setGameOver(true), 1000);
      }
    } else {
      setSelected(null);
    }
  }, [board, animating, gameOver, processChain, moves]);

  const handleCellClick = useCallback((r: number, c: number) => {
    if (animating || gameOver) return;
    resetHint();
    if (selected) {
      if (selected.r === r && selected.c === c) {
        setSelected(null);
      } else {
        doSwap(selected, { r, c });
      }
    } else {
      setSelected({ r, c });
    }
  }, [selected, animating, gameOver, doSwap]);

  const handleTouchStart = useCallback((r: number, c: number, e: React.TouchEvent) => {
    e.preventDefault();
    const t = e.touches[0];
    touchStartPos.current = { x: t.clientX, y: t.clientY, r, c };
    if (!selected) {
      setSelected({ r, c });
    }
  }, [selected]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const start = touchStartPos.current;
    if (!start || !selected) return;

    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 20) {
      // Swipe detected
      let dr = 0, dc = 0;
      if (Math.abs(dx) > Math.abs(dy)) {
        dc = dx > 0 ? 1 : -1;
      } else {
        dr = dy > 0 ? 1 : -1;
      }
      const to = { r: selected.r + dr, c: selected.c + dc };
      if (to.r >= 0 && to.r < ROWS && to.c >= 0 && to.c < COLS) {
        doSwap(selected, to);
      }
    } else {
      // Tap - use click logic
      const tapR = start.r, tapC = start.c;
      if (selected.r === tapR && selected.c === tapC) {
        // tapped same cell, deselect
      } else {
        doSwap(selected, { r: tapR, c: tapC });
      }
    }
    touchStartPos.current = null;
  }, [selected, doSwap]);

  const restart = () => {
    const b = createBoard();
    const { board: cascaded } = cascadeBoard(b);
    setBoard(cascaded);
    setSelected(null);
    setMoves(30);
    setGameOver(false);
    setCombo(0);
    setAnimating(false);
    setMatchedCells(new Set());
    scoreRef.current = 0;
    resetScore();
  };

  const cellSize = `min(calc((95vw - 2rem) / ${COLS}), 48px)`;

  return (
    <GameWrapper title={t.match3.title} score={score} highScore={highScore}
      controls={
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={restart}
            className="btn-premium"
          >
            {t.common.newGame}
          </button>
          <span className="text-gray-400 text-sm">
            {t.match3.movesLeft}: <span className={`font-bold ${moves <= 5 ? 'text-red-400' : 'text-white'}`}>{moves}</span>
          </span>
          {combo > 1 && (
            <span className="text-amber-400 text-sm font-bold animate-pulse">
              {combo}x Match!
            </span>
          )}
          <LeaderboardPanel gameId="match3" currentScore={score} gameOver={gameOver} />
        </div>
      }
    >
      <style>{`
        @keyframes hintGlow {
          0%, 100% { box-shadow: 0 0 8px rgba(255,45,149,0.3), inset 0 0 4px rgba(255,45,149,0.1); }
          50% { box-shadow: 0 0 16px rgba(255,45,149,0.6), inset 0 0 10px rgba(255,45,149,0.25); }
        }
      `}</style>
      <div className="relative" style={{ touchAction: 'none' }}>
        <div
          className="inline-grid gap-0.5 p-2 rounded-2xl"
          style={{
            gridTemplateColumns: `repeat(${COLS}, ${cellSize})`,
            background: 'rgba(40,15,80,0.6)',
            border: '3px solid rgba(255,45,149,0.25)',
          }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isSelected = selected?.r === r && selected?.c === c;
              const isMatched = matchedCells.has(`${r},${c}`);
              const isHinted = hintSwap && ((r === hintSwap[0] && c === hintSwap[1]) || (r === hintSwap[2] && c === hintSwap[3]));

              return (
                <button
                  key={`${r}-${c}-${cell.key}`}
                  data-row={r}
                  data-col={c}
                  className={`flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200
                    ${isSelected ? 'ring-2 ring-amber-400 scale-110 z-10' : ''}
                    ${isMatched ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
                  `}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    fontSize: `calc(${cellSize} * 0.6)`,
                    background: isSelected ? 'rgba(255,45,149,0.2)' : isHinted ? 'rgba(255,45,149,0.15)' : 'rgba(26,10,46,0.6)',
                    boxShadow: isHinted ? '0 0 12px rgba(255,45,149,0.5), inset 0 0 8px rgba(255,45,149,0.2)' : undefined,
                    animation: isHinted ? 'hintGlow 1.2s ease-in-out infinite' : undefined,
                  }}
                  onClick={() => handleCellClick(r, c)}
                  onTouchStart={(e) => handleTouchStart(r, c, e)}
                  onTouchEnd={handleTouchEnd}
                >
                  {cell.gem}
                </button>
              );
            })
          )}
        </div>

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
            style={{ background: 'rgba(0,0,0,0.18)' }}>
            <div className="text-center px-8 py-6 rounded-2xl backdrop-blur-xl border-3 border-[rgba(255,45,149,0.4)]"
              style={{ background: 'rgba(26,10,46,0.82)', animation: 'popIn 0.4s ease-out', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
              <div className="text-4xl mb-2" style={{ animation: 'bounce 1s ease-in-out infinite' }}>💎</div>
              <div className="text-2xl font-black mb-2 text-white">{t.match3.gameOverTitle}</div>
              <div className="text-[#ffe93e] mb-1 font-bold">{fmt(t.match3.finalScore, { n: score })}</div>
              <button onClick={restart} className="btn-premium mt-3">
                {t.match3.again}
              </button>
            </div>
          </div>
        )}
      </div>

      <p style={{
        fontSize: 11,
        textAlign: 'center',
        marginTop: 10,
        color: 'rgba(212,175,55,0.3)',
        letterSpacing: 1,
      }}>
        {t.match3.hint}
      </p>
    </GameWrapper>
  );
}
