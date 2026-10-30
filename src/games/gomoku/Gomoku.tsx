import { useState, useCallback } from 'react';
import GameWrapper from '../../components/GameWrapper';
import LeaderboardPanel from '../../components/LeaderboardPanel';
import { useI18n } from '../../i18n';

const SIZE = 15;
type Stone = 0 | 1 | 2; // 0=empty, 1=black(player), 2=white(AI)
type Board = Stone[][];

function createBoard(): Board {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0) as Stone[]);
}

function checkWin(board: Board, r: number, c: number, stone: Stone): boolean {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const [dr, dc] of dirs) {
    let count = 1;
    for (let i = 1; i < 5; i++) {
      const nr = r + dr * i, nc = c + dc * i;
      if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE || board[nr][nc] !== stone) break;
      count++;
    }
    for (let i = 1; i < 5; i++) {
      const nr = r - dr * i, nc = c - dc * i;
      if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE || board[nr][nc] !== stone) break;
      count++;
    }
    if (count >= 5) return true;
  }
  return false;
}

// Simple scoring-based AI with pattern evaluation
function evaluateLine(board: Board, r: number, c: number, dr: number, dc: number, stone: Stone): number {
  let count = 1;
  let openEnds = 0;

  // forward
  let i = 1;
  while (i < 5) {
    const nr = r + dr * i, nc = c + dc * i;
    if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) break;
    if (board[nr][nc] === stone) { count++; i++; }
    else {
      if (board[nr][nc] === 0) openEnds++;
      break;
    }
  }

  // backward
  i = 1;
  while (i < 5) {
    const nr = r - dr * i, nc = c - dc * i;
    if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) break;
    if (board[nr][nc] === stone) { count++; i++; }
    else {
      if (board[nr][nc] === 0) openEnds++;
      break;
    }
  }

  if (count >= 5) return 100000;
  if (count === 4 && openEnds === 2) return 10000;
  if (count === 4 && openEnds === 1) return 5000;
  if (count === 3 && openEnds === 2) return 3000;
  if (count === 3 && openEnds === 1) return 500;
  if (count === 2 && openEnds === 2) return 200;
  if (count === 2 && openEnds === 1) return 50;
  return 0;
}

function evaluatePosition(board: Board, r: number, c: number, stone: Stone): number {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  let score = 0;
  for (const [dr, dc] of dirs) {
    score += evaluateLine(board, r, c, dr, dc, stone);
  }
  return score;
}

type AiDifficulty = 'easy' | 'medium' | 'hard';

const ATTACK_WEIGHT: Record<AiDifficulty, number> = {
  easy: 0.8,
  medium: 1.1,
  hard: 1.5,
};

function gatherCandidates(board: Board): [number, number][] {
  const candidates = new Set<string>();
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] !== 0) {
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr][nc] === 0) {
              candidates.add(`${nr},${nc}`);
            }
          }
        }
      }
    }
  }
  return Array.from(candidates).map(key => {
    const [r, c] = key.split(',').map(Number);
    return [r, c] as [number, number];
  });
}

function scoreCandidate(board: Board, r: number, c: number, attackWeight: number): number {
  const newBoard = board.map(row => [...row]) as Board;
  newBoard[r][c] = 2;
  const attackScore = evaluatePosition(newBoard, r, c, 2);
  newBoard[r][c] = 1;
  const defenseScore = evaluatePosition(newBoard, r, c, 1);
  return attackScore * attackWeight + defenseScore;
}

/** 下完该步后，AI 下一步有多少个高分落点（两步连击潜力） */
function countStrongFollowUps(board: Board, attackWeight: number): number {
  const candidates = gatherCandidates(board);
  if (candidates.length === 0) return 0;

  let best = -1;
  const scores: number[] = [];
  for (const [r, c] of candidates) {
    const total = scoreCandidate(board, r, c, attackWeight);
    scores.push(total);
    if (total > best) best = total;
  }
  if (best < 200) return 0;

  const threshold = best * 0.75;
  return scores.filter(s => s >= threshold).length;
}

function aiMove(board: Board, difficulty: AiDifficulty): [number, number] | null {
  const candidates = gatherCandidates(board);
  if (candidates.length === 0) return [7, 7];

  if (difficulty === 'easy' && Math.random() < 0.3) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  const attackWeight = ATTACK_WEIGHT[difficulty];
  let bestScore = -1;
  let bestMoves: [number, number][] = [];

  for (const [r, c] of candidates) {
    let totalScore = scoreCandidate(board, r, c, attackWeight);

    if (difficulty === 'hard') {
      const afterBoard = board.map(row => [...row]) as Board;
      afterBoard[r][c] = 2;
      const followUps = countStrongFollowUps(afterBoard, attackWeight);
      if (followUps >= 2) {
        totalScore += 1500 + followUps * 300;
      }
    }

    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestMoves = [[r, c]];
    } else if (totalScore === bestScore) {
      bestMoves.push([r, c]);
    }
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

export default function Gomoku() {
  const { t } = useI18n();
  const [board, setBoard] = useState<Board>(createBoard);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string>('');
  const [history, setHistory] = useState<Board[]>([]);
  const [thinking, setThinking] = useState(false);
  const [lastMove, setLastMove] = useState<[number, number] | null>(null);
  const [aiDifficulty, setAiDifficulty] = useState<AiDifficulty>('medium');

  const AI_DIFFICULTY_OPTIONS: { key: AiDifficulty; label: string }[] = [
    { key: 'easy', label: t.common.easy },
    { key: 'medium', label: t.common.medium },
    { key: 'hard', label: t.common.hard },
  ];

  const handleClick = useCallback((r: number, c: number) => {
    if (gameOver || thinking || board[r][c] !== 0) return;

    const newBoard = board.map(row => [...row]) as Board;
    newBoard[r][c] = 1;
    setHistory(prev => [...prev, board]);
    setBoard(newBoard);
    setLastMove([r, c]);

    if (checkWin(newBoard, r, c, 1)) {
      setGameOver(true);
      setWinner('win');
      return;
    }

    // check draw
    if (newBoard.every(row => row.every(cell => cell !== 0))) {
      setGameOver(true);
      setWinner('draw');
      return;
    }

    // AI turn
    setThinking(true);
    setTimeout(() => {
      const move = aiMove(newBoard, aiDifficulty);
      if (move) {
        const [ar, ac] = move;
        const aiBoard = newBoard.map(row => [...row]) as Board;
        aiBoard[ar][ac] = 2;
        setBoard(aiBoard);
        setLastMove([ar, ac]);

        if (checkWin(aiBoard, ar, ac, 2)) {
          setGameOver(true);
          setWinner('lose');
        } else if (aiBoard.every(row => row.every(cell => cell !== 0))) {
          setGameOver(true);
          setWinner('draw');
        }
      }
      setThinking(false);
    }, 200);
  }, [board, gameOver, thinking, aiDifficulty]);

  const undo = useCallback(() => {
    if (history.length < 1 || thinking || gameOver) return;
    // Undo both player and AI moves
    const prev = history[history.length - 1];
    setBoard(prev);
    setHistory(h => h.slice(0, -1));
    setLastMove(null);
  }, [history, thinking, gameOver]);

  const restart = useCallback(() => {
    setBoard(createBoard());
    setGameOver(false);
    setWinner('');
    setHistory([]);
    setThinking(false);
    setLastMove(null);
  }, []);

  const selectAiDifficulty = (key: AiDifficulty) => {
    setAiDifficulty(key);
    restart();
  };

  const cellSize = 'min(calc((95vw - 2rem) / 15), 32px)';

  return (
    <GameWrapper
      title={t.gomoku.title}
      controls={
        <div className="flex flex-wrap gap-2 items-center">
          {AI_DIFFICULTY_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => selectAiDifficulty(key)}
              className={
                aiDifficulty === key
                  ? 'rounded-lg px-4 py-2 text-sm bg-amber-600 text-white'
                  : 'rounded-lg px-4 py-2 text-sm bg-white/10 text-gray-300 hover:bg-white/20'
              }
            >
              {label}
            </button>
          ))}
          <button onClick={restart} className="btn-premium">
            {t.common.newGame}
          </button>
          <button onClick={undo} disabled={history.length === 0 || thinking || gameOver}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-30">
            {t.gomoku.undoMove}
          </button>
          {thinking && <span className="text-amber-200/70 text-sm flex items-center">{t.gomoku.thinking}</span>}
          <LeaderboardPanel gameId="gomoku" currentScore={winner === 'win' ? 1 : 0} gameOver={gameOver && winner === 'win'} scoreLabel={t.gomoku.wins} detail={aiDifficulty} />
        </div>
      }
    >
      <div className="relative" style={{
        touchAction: 'manipulation',
        padding: '10px',
        borderRadius: 22,
        background: 'linear-gradient(145deg, rgba(40,30,15,0.3) 0%, rgba(26,20,10,0.5) 100%)',
        border: '3px dashed rgba(218,165,32,0.2)',
        boxShadow: '0 8px 32px rgba(218,165,32,0.06)',
      }}>
        <div
          className="inline-grid p-2 rounded-xl"
          style={{
            gridTemplateColumns: `repeat(${SIZE}, ${cellSize})`,
            background: '#1a1512',
            gap: '0px',
          }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className="relative flex items-center justify-center cursor-pointer"
                style={{ width: cellSize, height: cellSize }}
                onClick={() => handleClick(r, c)}
              >
                {/* Grid lines */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute bg-amber-900/60" style={{
                    left: '50%', top: r === 0 ? '50%' : 0, bottom: r === SIZE - 1 ? '50%' : 0, width: '1px', transform: 'translateX(-0.5px)',
                  }} />
                  <div className="absolute bg-amber-900/60" style={{
                    top: '50%', left: c === 0 ? '50%' : 0, right: c === SIZE - 1 ? '50%' : 0, height: '1px', transform: 'translateY(-0.5px)',
                  }} />
                </div>

                {/* Star points */}
                {((r === 3 || r === 7 || r === 11) && (c === 3 || c === 7 || c === 11)) && cell === 0 && (
                  <div className="absolute w-1.5 h-1.5 bg-amber-800/80 rounded-full" />
                )}

                {/* Stone */}
                {cell !== 0 && (
                  <div
                    className={`absolute rounded-full z-10 ${
                      lastMove && lastMove[0] === r && lastMove[1] === c ? 'ring-2 ring-amber-500' : ''
                    }`}
                    style={{
                      width: '85%', height: '85%',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                      background: cell === 1
                        ? 'radial-gradient(circle at 30% 30%, #4a4a4a, #1a1a1a, #000)'
                        : 'radial-gradient(circle at 30% 30%, #fff, #e8e4d8, #c8c0b0)',
                    }}
                  />
                )}
              </div>
            ))
          )}
        </div>

        {gameOver && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl z-20"
            style={{ background: 'rgba(0,0,0,0.18)' }}
          >
            <div className="text-center px-8 py-6 rounded-2xl backdrop-blur-xl border-3 border-[rgba(255,45,149,0.4)]"
              style={{ background: 'rgba(26,10,46,0.82)', animation: 'popIn 0.4s ease-out', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
              <div className="text-4xl mb-2" style={{ animation: 'bounce 1s ease-in-out infinite' }}>
                {winner === 'win' ? '🏆' : winner === 'lose' ? '😢' : '🤝'}
              </div>
              <div className="text-2xl font-black mb-4 text-white">
                {winner === 'win' ? t.gomoku.winMsg : winner === 'lose' ? t.gomoku.loseMsg : t.gomoku.drawMsg}
              </div>
              <button
                onClick={restart}
                className="btn-premium"
              >
                {t.gomoku.again}
              </button>
            </div>
          </div>
        )}
      </div>
      <p style={{
        fontSize: 11,
        textAlign: 'center',
        marginTop: 10,
        color: 'rgba(217,188,140,0.35)',
        letterSpacing: 2,
      }}>
        {t.gomoku.hint}
      </p>
    </GameWrapper>
  );
}
