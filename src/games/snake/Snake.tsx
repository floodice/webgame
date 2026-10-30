import { useState, useEffect, useCallback, useRef } from 'react';
import GameWrapper from '../../components/GameWrapper';
import { useGameScore } from '../../hooks/useGameScore';
import LeaderboardPanel from '../../components/LeaderboardPanel';
import { useI18n } from '../../i18n';

const GRID = 20;
const CELL = 20;
const CANVAS_SIZE = GRID * CELL;

type Point = { x: number; y: number };
type Dir = 'up' | 'down' | 'left' | 'right';

const OPPOSITE: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };

const DIFFICULTIES = [
  { initialSpeed: 200, decelStep: 1, minSpeed: 80 },
  { initialSpeed: 150, decelStep: 2, minSpeed: 60 },
  { initialSpeed: 100, decelStep: 3, minSpeed: 40 },
] as const;
const DIFF_KEYS = ['easy', 'medium', 'hard'] as const;

const SNAKE_COLORS = ['#39ff14', '#ffe93e', '#00f0ff', '#ff6baf', '#bf5af2', '#ff6b2b'];
function snakeSegmentColor(index: number, length: number): string {
  const t = length <= 1 ? 0 : index / (length - 1);
  const ci = Math.floor(t * (SNAKE_COLORS.length - 1));
  return SNAKE_COLORS[Math.min(ci, SNAKE_COLORS.length - 1)];
}

function segmentCenter(seg: Point): [number, number] {
  return [seg.x * CELL + CELL / 2, seg.y * CELL + CELL / 2];
}

function randomFood(snake: Point[]): Point {
  const occupied = new Set(snake.map(p => `${p.x},${p.y}`));
  let p: Point;
  do {
    p = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
  } while (occupied.has(`${p.x},${p.y}`));
  return p;
}

export default function Snake() {
  const { score, highScore, updateScore, resetScore } = useGameScore('snake');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dirRef = useRef<Dir>('right');
  const nextDirRef = useRef<Dir>('right');
  const [diffIdx, setDiffIdx] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const snakeRef = useRef<Point[]>([{ x: 5, y: 10 }, { x: 4, y: 10 }, { x: 3, y: 10 }]);
  const foodRef = useRef<Point>(randomFood(snakeRef.current));
  const scoreRef = useRef(0);
  const speedRef = useRef<number>(DIFFICULTIES[1].initialSpeed);
  const speedConfigRef = useRef<{ decelStep: number; minSpeed: number }>({
    decelStep: DIFFICULTIES[1].decelStep,
    minSpeed: DIFFICULTIES[1].minSpeed,
  });
  const gameOverRef = useRef(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#1a0a2e';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID; i++) {
      const major = i % 5 === 0;
      ctx.strokeStyle = major ? 'rgba(255,45,149,0.08)' : 'rgba(255,45,149,0.03)';
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, CANVAS_SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(CANVAS_SIZE, i * CELL); ctx.stroke();
    }

    const food = foodRef.current;
    const fx = food.x * CELL + 2;
    const fy = food.y * CELL + 2;
    const fs = CELL - 4;
    ctx.save();
    ctx.shadowColor = '#ff2d95';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#ff2d95';
    ctx.beginPath();
    ctx.arc(fx + fs / 2, fy + fs / 2, fs / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(fx + fs / 2 - 2, fy + fs / 2 - 2, fs / 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const snake = snakeRef.current;
    for (let i = snake.length - 1; i > 0; i--) {
      const [x1, y1] = segmentCenter(snake[i - 1]);
      const [x2, y2] = segmentCenter(snake[i]);
      ctx.save();
      ctx.strokeStyle = snakeSegmentColor(i - 1, snake.length);
      ctx.lineWidth = CELL - 4;
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(57,255,20,0.5)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    }

    for (let i = snake.length - 1; i >= 0; i--) {
      const seg = snake[i];
      const isHead = i === 0;
      const color = isHead ? '#39ff14' : snakeSegmentColor(i, snake.length);
      const radius = isHead ? 8 : 5;
      ctx.save();
      ctx.shadowColor = isHead ? 'rgba(57,255,20,0.8)' : 'rgba(57,255,20,0.3)';
      ctx.shadowBlur = isHead ? 14 : 6;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, radius);
      ctx.fill();
      // Candy shine
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.roundRect(seg.x * CELL + 3, seg.y * CELL + 2, CELL - 6, (CELL - 2) * 0.35, radius * 0.5);
      ctx.fill();
      ctx.restore();
    }

    const head = snake[0];
    ctx.fillStyle = '#1a0a2e';
    const eyeOffset: Record<Dir, [number, number][]> = {
      right: [[14, 5], [14, 13]], left: [[5, 5], [5, 13]],
      up: [[5, 5], [13, 5]], down: [[5, 14], [13, 14]],
    };
    eyeOffset[dirRef.current].forEach(([ox, oy]) => {
      ctx.beginPath();
      ctx.arc(head.x * CELL + ox, head.y * CELL + oy, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(head.x * CELL + ox + 0.5, head.y * CELL + oy - 0.5, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a0a2e';
    });
  }, []);

  const gameLoop = useCallback(() => {
    if (gameOverRef.current) return;

    dirRef.current = nextDirRef.current;
    const snake = snakeRef.current;
    const head = { ...snake[0] };
    const dir = dirRef.current;

    if (dir === 'up') head.y--;
    else if (dir === 'down') head.y++;
    else if (dir === 'left') head.x--;
    else head.x++;

    if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
      gameOverRef.current = true;
      setGameOver(true);
      return;
    }
    if (snake.some(s => s.x === head.x && s.y === head.y)) {
      gameOverRef.current = true;
      setGameOver(true);
      return;
    }

    const newSnake = [head, ...snake];
    const food = foodRef.current;
    if (head.x === food.x && head.y === food.y) {
      scoreRef.current += 10;
      updateScore(scoreRef.current);
      foodRef.current = randomFood(newSnake);
      const { minSpeed, decelStep } = speedConfigRef.current;
      speedRef.current = Math.max(minSpeed, speedRef.current - decelStep);
    } else {
      newSnake.pop();
    }
    snakeRef.current = newSnake;
    draw();
  }, [draw, updateScore]);

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      gameLoop();
      timer = setTimeout(tick, speedRef.current);
    };
    timer = setTimeout(tick, speedRef.current);
    return () => clearTimeout(timer);
  }, [gameStarted, gameOver, gameLoop]);

  const changeDir = useCallback((dir: Dir) => {
    if (!gameStarted) setGameStarted(true);
    if (dir !== OPPOSITE[dirRef.current]) {
      nextDirRef.current = dir;
    }
  }, [gameStarted]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const keyMap: Record<string, Dir> = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', s: 'down', a: 'left', d: 'right',
      };
      const dir = keyMap[e.key];
      if (dir) {
        e.preventDefault();
        changeDir(dir);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [changeDir]);

  const restart = (nextDiffIdx?: number) => {
    const idx = nextDiffIdx ?? diffIdx;
    if (nextDiffIdx !== undefined) setDiffIdx(nextDiffIdx);
    const cfg = DIFFICULTIES[idx];
    speedConfigRef.current = { decelStep: cfg.decelStep, minSpeed: cfg.minSpeed };
    snakeRef.current = [{ x: 5, y: 10 }, { x: 4, y: 10 }, { x: 3, y: 10 }];
    foodRef.current = randomFood(snakeRef.current);
    dirRef.current = 'right';
    nextDirRef.current = 'right';
    scoreRef.current = 0;
    speedRef.current = cfg.initialSpeed;
    gameOverRef.current = false;
    resetScore();
    setGameOver(false);
    setGameStarted(false);
    draw();
  };

  const selectDifficulty = (idx: number) => {
    if (idx === diffIdx) return;
    restart(idx);
  };

  // Touch swipe on canvas
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      changeDir(dx > 0 ? 'right' : 'left');
    } else {
      changeDir(dy > 0 ? 'down' : 'up');
    }
    touchStart.current = null;
  };

  const DirBtn = ({ label, dir }: { label: string; dir: Dir }) => (
    <button
      onClick={() => changeDir(dir)}
      onTouchStart={(e) => { e.preventDefault(); changeDir(dir); }}
      className="w-16 h-16 rounded-2xl text-2xl font-black select-none flex items-center justify-center transition-colors border-2 border-dashed border-[rgba(57,255,20,0.25)] bg-[rgba(40,15,80,0.6)] active:bg-[rgba(57,255,20,0.2)] text-[#39ff14]"
      style={{ touchAction: 'manipulation' }}
    >
      {label}
    </button>
  );

  const { t } = useI18n();
  const diffLabels = [t.common.easy, t.common.medium, t.common.hard];
  return (
    <GameWrapper
      title={t.snake.title}
      score={score}
      highScore={highScore}
      controls={
        <div className="flex flex-wrap gap-2 items-center">
          {diffLabels.map((label, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => selectDifficulty(idx)}
              className={
                diffIdx === idx
                  ? 'rounded-lg px-4 py-2 text-sm bg-cyan-600 text-white'
                  : 'rounded-lg px-4 py-2 text-sm bg-white/10 text-gray-300 hover:bg-white/20'
              }
            >
              {label}
            </button>
          ))}
          <button onClick={() => restart()} className="btn-premium">
            {t.common.newGame}
          </button>
          <LeaderboardPanel gameId="snake" currentScore={score} gameOver={gameOver} detail={diffLabels[diffIdx]} />
        </div>
      }
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="relative"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={(e) => e.preventDefault()}
          style={{ touchAction: 'none' }}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="rounded-2xl border-3 border-[rgba(255,45,149,0.3)]"
            style={{ width: 'min(90vw, 400px)', height: 'auto' }}
          />
          {!gameStarted && !gameOver && (
            <div
              className="absolute inset-0 flex items-center justify-center rounded-2xl"
              style={{ background: 'rgba(0,0,0,0.18)' }}
            >
              <div className="text-center px-6 py-5 rounded-2xl backdrop-blur-xl border-3 border-[rgba(255,45,149,0.4)]"
                style={{ background: 'rgba(26,10,46,0.82)', animation: 'popIn 0.4s ease-out', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                <div className="text-3xl mb-2" style={{ animation: 'wiggle 2s ease-in-out infinite' }}>🐍</div>
                <div className="text-white text-base sm:text-lg font-black">
                  {t.snake.startHint}
                </div>
              </div>
            </div>
          )}
          {gameOver && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
              style={{ background: 'rgba(0,0,0,0.18)' }}
            >
              <div className="text-center px-8 py-6 rounded-2xl backdrop-blur-xl border-3 border-[rgba(255,45,149,0.4)]"
                style={{ background: 'rgba(26,10,46,0.82)', animation: 'popIn 0.4s ease-out', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                <div className="text-4xl mb-2" style={{ animation: 'bounce 1s ease-in-out infinite' }}>💀</div>
                <div className="text-2xl font-black mb-4 text-white">{t.snake.dataLost}</div>
                <button
                  onClick={() => restart()}
                  className="btn-premium"
                >
                  {t.common.restart}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Virtual D-pad */}
        <div className="flex flex-col items-center gap-2" style={{ touchAction: 'none' }}>
          <DirBtn label="↑" dir="up" />
          <div className="flex gap-2">
            <DirBtn label="←" dir="left" />
            <div className="w-16 h-16" />
            <DirBtn label="→" dir="right" />
          </div>
          <DirBtn label="↓" dir="down" />
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
        {t.snake.controls}
      </p>
    </GameWrapper>
  );
}
