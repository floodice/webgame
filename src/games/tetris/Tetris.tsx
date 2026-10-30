import { useState, useEffect, useCallback, useRef } from 'react';
import GameWrapper from '../../components/GameWrapper';
import { useGameScore } from '../../hooks/useGameScore';
import LeaderboardPanel from '../../components/LeaderboardPanel';
import { useI18n } from '../../i18n';

const COLS = 10;
const ROWS = 20;
const CELL = 28;

type Board = number[][];
type Piece = { shape: number[][]; color: number; x: number; y: number };

const SHAPES = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[0, 1, 0], [1, 1, 1]],
  [[1, 0, 0], [1, 1, 1]],
  [[0, 0, 1], [1, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
  [[1, 1, 0], [0, 1, 1]],
];

const COLORS = [
  '#ff2d95', '#39ff14', '#ffe93e', '#ff6b2b',
  '#00f0ff', '#bf5af2', '#ff6baf',
];

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function drawCandyCell(
  ctx: CanvasRenderingContext2D,
  col: number,
  row: number,
  cellSize: number,
  color: string,
  inset = 1,
) {
  const x = col * cellSize + inset;
  const y = row * cellSize + inset;
  const w = cellSize - inset * 2;
  const h = cellSize - inset * 2;
  const r = Math.min(w, h) * 0.25;
  ctx.save();
  ctx.shadowColor = hexToRgba(color, 0.4);
  ctx.shadowBlur = 10;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  // Glossy highlight
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.roundRect(x + 2, y + 1, w - 4, h * 0.35, r * 0.6);
  ctx.fill();
  // Bottom edge
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.roundRect(x, y + h - 3, w, 3, [0, 0, r, r]);
  ctx.fill();
  ctx.restore();
}

function createBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function randomPiece(): Piece {
  const idx = Math.floor(Math.random() * SHAPES.length);
  return {
    shape: SHAPES[idx].map(r => [...r]),
    color: idx + 1,
    x: Math.floor((COLS - SHAPES[idx][0].length) / 2),
    y: 0,
  };
}

function rotate(shape: number[][]): number[][] {
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rotated[c][rows - 1 - r] = shape[r][c];
    }
  }
  return rotated;
}

function collides(board: Board, piece: Piece): boolean {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue;
      const nr = piece.y + r;
      const nc = piece.x + c;
      if (nc < 0 || nc >= COLS || nr >= ROWS) return true;
      if (nr >= 0 && board[nr][nc]) return true;
    }
  }
  return false;
}

function merge(board: Board, piece: Piece): Board {
  const newBoard = board.map(r => [...r]);
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue;
      const nr = piece.y + r;
      const nc = piece.x + c;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
        newBoard[nr][nc] = piece.color;
      }
    }
  }
  return newBoard;
}

function clearLines(board: Board): { board: Board; cleared: number } {
  const newBoard = board.filter(row => row.some(v => v === 0));
  const cleared = ROWS - newBoard.length;
  while (newBoard.length < ROWS) {
    newBoard.unshift(Array(COLS).fill(0));
  }
  return { board: newBoard, cleared };
}

const LINE_SCORES = [0, 100, 300, 500, 800];

export default function Tetris() {
  const { score, highScore, updateScore, resetScore } = useGameScore('tetris');
  const [board, setBoard] = useState<Board>(createBoard);
  const [piece, setPiece] = useState<Piece>(randomPiece);
  const [nextPiece, setNextPiece] = useState<Piece>(randomPiece);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const scoreRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextCanvasRef = useRef<HTMLCanvasElement>(null);

  const drop = useCallback(() => {
    if (gameOver || paused) return;

    setPiece(prev => {
      const moved = { ...prev, y: prev.y + 1 };
      if (!collides(board, moved)) return moved;

      const merged = merge(board, prev);
      const { board: cleared, cleared: linesCleared } = clearLines(merged);
      setBoard(cleared);

      const addedScore = LINE_SCORES[linesCleared] * level;
      scoreRef.current += addedScore;
      updateScore(scoreRef.current);

      setLines(l => {
        const newLines = l + linesCleared;
        setLevel(Math.floor(newLines / 10) + 1);
        return newLines;
      });

      const np = nextPiece;
      if (collides(cleared, np)) {
        setGameOver(true);
        return prev;
      }
      setNextPiece(randomPiece());
      return np;
    });
  }, [board, gameOver, paused, nextPiece, level, updateScore]);

  useEffect(() => {
    if (gameOver || paused) return;
    const speed = Math.max(100, 800 - (level - 1) * 70);
    const timer = setInterval(drop, speed);
    return () => clearInterval(timer);
  }, [drop, gameOver, paused, level]);

  const movePiece = useCallback((dx: number) => {
    if (gameOver || paused) return;
    setPiece(prev => {
      const moved = { ...prev, x: prev.x + dx };
      return collides(board, moved) ? prev : moved;
    });
  }, [board, gameOver, paused]);

  const rotatePiece = useCallback(() => {
    if (gameOver || paused) return;
    setPiece(prev => {
      const rotated = { ...prev, shape: rotate(prev.shape) };
      if (!collides(board, rotated)) return rotated;
      for (const kick of [-1, 1, -2, 2]) {
        const kicked = { ...rotated, x: rotated.x + kick };
        if (!collides(board, kicked)) return kicked;
      }
      return prev;
    });
  }, [board, gameOver, paused]);

  const hardDrop = useCallback(() => {
    if (gameOver || paused) return;
    setPiece(prev => {
      let p = { ...prev };
      while (!collides(board, { ...p, y: p.y + 1 })) {
        p = { ...p, y: p.y + 1 };
      }
      return p;
    });
    setTimeout(drop, 10);
  }, [board, gameOver, paused, drop]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft': case 'a': e.preventDefault(); movePiece(-1); break;
        case 'ArrowRight': case 'd': e.preventDefault(); movePiece(1); break;
        case 'ArrowDown': case 's': e.preventDefault(); drop(); break;
        case 'ArrowUp': case 'w': e.preventDefault(); rotatePiece(); break;
        case ' ': e.preventDefault(); hardDrop(); break;
        case 'p': case 'P': setPaused(p => !p); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [movePiece, rotatePiece, drop, hardDrop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#1a0a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255,45,149,0.015)';
    for (let y = 0; y < canvas.height; y += 4) {
      ctx.fillRect(0, y, canvas.width, 1);
    }

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c]) {
          drawCandyCell(ctx, c, r, CELL, COLORS[board[r][c] - 1]);
        } else {
          ctx.strokeStyle = 'rgba(255,45,149,0.04)';
          ctx.lineWidth = 1;
          ctx.strokeRect(c * CELL + 0.5, r * CELL + 0.5, CELL - 1, CELL - 1);
        }
      }
    }

    let ghost = { ...piece };
    while (!collides(board, { ...ghost, y: ghost.y + 1 })) {
      ghost = { ...ghost, y: ghost.y + 1 };
    }
    const ghostColor = COLORS[piece.color - 1];
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    for (let r = 0; r < ghost.shape.length; r++) {
      for (let c = 0; c < ghost.shape[r].length; c++) {
        if (!ghost.shape[r][c]) continue;
        const nr = ghost.y + r;
        const nc = ghost.x + c;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
          ctx.strokeStyle = hexToRgba(ghostColor, 0.15);
          ctx.strokeRect(nc * CELL + 1.5, nr * CELL + 1.5, CELL - 3, CELL - 3);
        }
      }
    }
    ctx.setLineDash([]);

    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (!piece.shape[r][c]) continue;
        const nr = piece.y + r;
        const nc = piece.x + c;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
          drawCandyCell(ctx, nc, nr, CELL, COLORS[piece.color - 1]);
        }
      }
    }

    ctx.strokeStyle = 'rgba(0,255,255,0.04)';
    ctx.lineWidth = 0.5;
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(COLS * CELL, r * CELL); ctx.stroke();
    }
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, ROWS * CELL); ctx.stroke();
    }
  }, [board, piece]);

  useEffect(() => {
    const canvas = nextCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const s = 18;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const shape = nextPiece.shape;
    const ox = (canvas.width - shape[0].length * s) / 2;
    const oy = (canvas.height - shape.length * s) / 2;
    const previewColor = COLORS[nextPiece.color - 1];
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const px = ox + c * s;
        const py = oy + r * s;
        const rad = 4;
        ctx.save();
        ctx.shadowColor = hexToRgba(previewColor, 0.4);
        ctx.shadowBlur = 6;
        ctx.fillStyle = previewColor;
        ctx.beginPath();
        ctx.roundRect(px + 1, py + 1, s - 2, s - 2, rad);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath();
        ctx.roundRect(px + 2, py + 1, s - 4, (s - 2) * 0.35, rad * 0.5);
        ctx.fill();
        ctx.restore();
      }
    }
  }, [nextPiece]);

  const restart = () => {
    setBoard(createBoard());
    setPiece(randomPiece());
    setNextPiece(randomPiece());
    setGameOver(false);
    setPaused(false);
    setLevel(1);
    setLines(0);
    scoreRef.current = 0;
    resetScore();
  };

  const TB = ({ label, onClick, className = '' }: { label: string; onClick: () => void; className?: string }) => (
    <button
      onClick={onClick}
      onTouchStart={(e) => { e.preventDefault(); onClick(); }}
      className={`flex-1 py-4 rounded-2xl text-lg font-black select-none transition-colors border-2 border-dashed border-[rgba(255,45,149,0.25)] bg-[rgba(40,15,80,0.6)] active:bg-[rgba(255,45,149,0.2)] text-[#ff6baf] ${className}`}
      style={{ touchAction: 'manipulation' }}
    >
      {label}
    </button>
  );

  const { t } = useI18n();
  return (
    <GameWrapper
      title={t.tetris.title}
      score={score}
      highScore={highScore}
      controls={
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={restart} className="btn-premium">
            {t.common.newGame}
          </button>
          <button onClick={() => setPaused(p => !p)} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-medium transition-colors">
            {paused ? t.common.continue : t.common.pause}
          </button>
          <LeaderboardPanel gameId="tetris" currentScore={score} gameOver={gameOver} />
        </div>
      }
    >
      <div className="flex flex-col items-center gap-4">
        {/* Game area: canvas + info panel side by side */}
        <div className="flex gap-4 items-start">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={COLS * CELL}
              height={ROWS * CELL}
              className="rounded-2xl border-3 border-[rgba(255,45,149,0.3)]"
              style={{ width: 'min(60vw, 280px)', height: 'auto', imageRendering: 'pixelated' }}
            />
            {(gameOver || paused) && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
                style={{ background: 'rgba(0,0,0,0.18)' }}
              >
                <div className="text-center px-8 py-6 rounded-2xl backdrop-blur-xl border-3 border-[rgba(255,45,149,0.4)]"
                  style={{ background: 'rgba(26,10,46,0.82)', animation: 'popIn 0.4s ease-out', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                  <div className="text-4xl mb-2" style={{ animation: 'bounce 1s ease-in-out infinite' }}>
                    {gameOver ? '💀' : '⏸️'}
                  </div>
                  <div className="text-xl sm:text-2xl font-black mb-4 text-white">
                    {gameOver ? t.common.gameOver : t.common.paused}
                  </div>
                  <button
                    onClick={gameOver ? restart : () => setPaused(false)}
                    className="btn-premium"
                  >
                    {gameOver ? t.common.restart : t.common.continue}
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3" style={{ width: 'min(25vw, 100px)' }}>
            <div className="rounded-2xl p-3 border-2 border-dashed border-[rgba(255,45,149,0.3)]" style={{ background: 'rgba(40,15,80,0.8)' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#ff6baf', marginBottom: 6, textTransform: 'uppercase' }}>🔮 NEXT</div>
              <canvas ref={nextCanvasRef} width={80} height={50} className="w-full" />
            </div>
            <div className="rounded-2xl p-3 border-2 border-dashed border-[rgba(255,107,43,0.3)]" style={{ background: 'rgba(40,15,80,0.8)' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#ff6b2b', marginBottom: 4, textTransform: 'uppercase' }}>⚡ LVL</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#ffe93e', lineHeight: 1, textShadow: '0 0 8px rgba(255,233,62,0.4)' }}>{level}</div>
            </div>
            <div className="rounded-2xl p-3 border-2 border-dashed border-[rgba(0,240,255,0.3)]" style={{ background: 'rgba(40,15,80,0.8)' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#00f0ff', marginBottom: 4, textTransform: 'uppercase' }}>📏 LINES</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#39ff14', lineHeight: 1, textShadow: '0 0 8px rgba(57,255,20,0.4)' }}>{lines}</div>
            </div>
          </div>
        </div>

        {/* Touch controls - always visible on all screen sizes for touch devices */}
        <div className="w-full max-w-sm flex flex-col gap-2" style={{ touchAction: 'none' }}>
          <div className="flex gap-2">
            <TB label="←" onClick={() => movePiece(-1)} />
            <TB label="↻" onClick={rotatePiece} />
            <TB label="↓" onClick={drop} />
            <TB label="→" onClick={() => movePiece(1)} />
          </div>
          <TB label={t.tetris.drop} onClick={hardDrop} />
        </div>
      </div>
      <p
        className="hidden sm:block"
        style={{
          fontSize: 11,
          textAlign: 'center',
          marginTop: 10,
          color: '#c8a0e0',
          fontWeight: 600,
          opacity: 0.5,
        }}
      >
        {t.tetris.controls}
      </p>
    </GameWrapper>
  );
}
