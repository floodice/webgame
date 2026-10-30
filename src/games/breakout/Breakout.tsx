import { useRef, useEffect, useState, useCallback } from 'react';
import GameWrapper from '../../components/GameWrapper';
import { useGameScore } from '../../hooks/useGameScore';
import LeaderboardPanel from '../../components/LeaderboardPanel';
import { useI18n } from '../../i18n';

const W = 400;
const H = 500;
const PADDLE_H = 12;

const DIFFICULTIES = [
  { paddleW: 100, ballSpeed: 2.5, lives: 5 },
  { paddleW: 80, ballSpeed: 3, lives: 3 },
  { paddleW: 60, ballSpeed: 4, lives: 2 },
] as const;
// DIFF_LABELS moved inside component for i18n
const PADDLE_Y = H - 40;
const BALL_R = 6;
const BRICK_ROWS = 6;
const BRICK_COLS = 8;
const BRICK_W = (W - 20) / BRICK_COLS;
const BRICK_H = 18;
const BRICK_TOP = 50;
const BRICK_PAD = 3;

type Brick = { x: number; y: number; alive: boolean; color: string; points: number };

const ROW_COLORS = ['#ff006e', '#8338ec', '#3a86ff', '#06d6a0', '#ffd166', '#ef476f'];

function createBricks(): Brick[] {
  const bricks: Brick[] = [];
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      bricks.push({
        x: 10 + c * BRICK_W + BRICK_PAD,
        y: BRICK_TOP + r * (BRICK_H + BRICK_PAD),
        alive: true,
        color: ROW_COLORS[r],
        points: (BRICK_ROWS - r) * 10,
      });
    }
  }
  return bricks;
}

export default function Breakout() {
  const { score, highScore, updateScore, resetScore } = useGameScore('breakout');
  const { t } = useI18n();
  const DIFF_LABELS = [t.common.easy, t.common.medium, t.common.hard];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [diffIdx, setDiffIdx] = useState(1);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'over' | 'won'>('idle');
  const stateRef = useRef({ state: 'idle' as string });

  const paddleWRef = useRef<number>(DIFFICULTIES[1].paddleW);
  const ballSpeedRef = useRef<number>(DIFFICULTIES[1].ballSpeed);
  const paddleRef = useRef(W / 2 - DIFFICULTIES[1].paddleW / 2);
  const ballRef = useRef({
    x: W / 2,
    y: PADDLE_Y - BALL_R - 1,
    dx: DIFFICULTIES[1].ballSpeed,
    dy: -DIFFICULTIES[1].ballSpeed,
  });
  const bricksRef = useRef<Brick[]>(createBricks());
  const scoreRef = useRef(0);
  const livesRef = useRef<number>(DIFFICULTIES[1].lives);
  const rafRef = useRef<number>(0);
  const mouseXRef = useRef(W / 2);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#02010a';
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 20; i++) {
      const sx = (i * 137 + 41) % W;
      const sy = (i * 89 + 17) % H;
      const alpha = 0.1 + ((i * 31 + 7) % 30) / 100;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const brick of bricksRef.current) {
      if (!brick.alive) continue;
      const bw = BRICK_W - BRICK_PAD * 2;
      ctx.shadowBlur = 6;
      ctx.shadowColor = brick.color + '80';
      ctx.fillStyle = brick.color;
      ctx.beginPath();
      ctx.roundRect(brick.x, brick.y, bw, BRICK_H, 5);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillRect(brick.x, brick.y, bw, 2);
    }

    const paddleW = paddleWRef.current;
    const paddleX = paddleRef.current;
    const paddleGrad = ctx.createLinearGradient(paddleX, PADDLE_Y, paddleX + paddleW, PADDLE_Y);
    paddleGrad.addColorStop(0, '#00e5ff');
    paddleGrad.addColorStop(1, '#0066ff');
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#00e5ff';
    ctx.fillStyle = paddleGrad;
    ctx.beginPath();
    ctx.roundRect(paddleX, PADDLE_Y, paddleW, PADDLE_H, 8);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(paddleX + 4, PADDLE_Y + 1, paddleW - 8, 2);

    const ball = ballRef.current;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffd700';
    ctx.fillStyle = 'rgba(255, 215, 0, 0.25)';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R + 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    ctx.fillStyle = '#ffd166';
    ctx.font = '14px sans-serif';
    for (let i = 0; i < livesRef.current; i++) {
      ctx.fillText('⚡', 10 + i * 22, H - 10);
    }
  }, []);

  const loop = useCallback(() => {
    if (stateRef.current.state !== 'playing') return;

    const ball = ballRef.current;
    const paddle = paddleRef.current;
    const paddleW = paddleWRef.current;
    const ballSpeed = ballSpeedRef.current;

    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collisions
    if (ball.x - BALL_R <= 0 || ball.x + BALL_R >= W) {
      ball.dx = -ball.dx;
      ball.x = Math.max(BALL_R, Math.min(W - BALL_R, ball.x));
    }
    if (ball.y - BALL_R <= 0) {
      ball.dy = Math.abs(ball.dy);
    }

    // Paddle collision
    if (ball.dy > 0 &&
        ball.y + BALL_R >= PADDLE_Y &&
        ball.y + BALL_R <= PADDLE_Y + PADDLE_H + 5 &&
        ball.x >= paddle && ball.x <= paddle + paddleW) {
      ball.dy = -Math.abs(ball.dy);
      // Angle based on hit position
      const hitPos = (ball.x - paddle) / paddleW - 0.5;
      ball.dx = hitPos * 8;
      // Ensure minimum vertical speed
      const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
      if (Math.abs(ball.dy) < 2) {
        ball.dy = -2;
        ball.dx = ball.dx > 0 ? Math.sqrt(speed * speed - 4) : -Math.sqrt(speed * speed - 4);
      }
    }

    // Ball falls
    if (ball.y > H) {
      livesRef.current--;
      if (livesRef.current <= 0) {
        stateRef.current.state = 'over';
        setGameState('over');
        draw();
        return;
      }
      ball.x = W / 2;
      ball.y = PADDLE_Y - BALL_R - 1;
      ball.dx = ballSpeed * (Math.random() > 0.5 ? 1 : -1);
      ball.dy = -ballSpeed;
    }

    // Brick collisions
    for (const brick of bricksRef.current) {
      if (!brick.alive) continue;
      const bw = BRICK_W - BRICK_PAD * 2;
      if (ball.x + BALL_R > brick.x && ball.x - BALL_R < brick.x + bw &&
          ball.y + BALL_R > brick.y && ball.y - BALL_R < brick.y + BRICK_H) {
        brick.alive = false;
        scoreRef.current += brick.points;
        updateScore(scoreRef.current);

        // Determine reflection
        const overlapLeft = ball.x + BALL_R - brick.x;
        const overlapRight = brick.x + bw - (ball.x - BALL_R);
        const overlapTop = ball.y + BALL_R - brick.y;
        const overlapBottom = brick.y + BRICK_H - (ball.y - BALL_R);
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

        if (minOverlap === overlapLeft || minOverlap === overlapRight) {
          ball.dx = -ball.dx;
        } else {
          ball.dy = -ball.dy;
        }
        break;
      }
    }

    // Check win
    if (bricksRef.current.every(b => !b.alive)) {
      stateRef.current.state = 'won';
      setGameState('won');
      draw();
      return;
    }

    // Move paddle toward mouse
    const targetX = mouseXRef.current - paddleW / 2;
    paddleRef.current = Math.max(0, Math.min(W - paddleW, targetX));

    draw();
    rafRef.current = requestAnimationFrame(loop);
  }, [draw, updateScore]);

  const start = useCallback(() => {
    stateRef.current.state = 'playing';
    setGameState('playing');
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const applyDifficulty = useCallback((idx: number) => {
    const cfg = DIFFICULTIES[idx];
    paddleWRef.current = cfg.paddleW;
    ballSpeedRef.current = cfg.ballSpeed;
    livesRef.current = cfg.lives;
    paddleRef.current = W / 2 - cfg.paddleW / 2;
    ballRef.current = {
      x: W / 2,
      y: PADDLE_Y - BALL_R - 1,
      dx: cfg.ballSpeed,
      dy: -cfg.ballSpeed,
    };
  }, []);

  const restart = useCallback((nextDiffIdx?: number) => {
    cancelAnimationFrame(rafRef.current);
    const idx = nextDiffIdx ?? diffIdx;
    if (nextDiffIdx !== undefined) setDiffIdx(nextDiffIdx);
    applyDifficulty(idx);
    bricksRef.current = createBricks();
    scoreRef.current = 0;
    stateRef.current.state = 'idle';
    setGameState('idle');
    resetScore();
    draw();
  }, [applyDifficulty, diffIdx, draw, resetScore]);

  const selectDifficulty = useCallback((idx: number) => {
    if (idx === diffIdx) return;
    restart(idx);
  }, [diffIdx, restart]);

  useEffect(() => {
    draw();

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      mouseXRef.current = (e.clientX - rect.left) * scaleX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      mouseXRef.current = (e.touches[0].clientX - rect.left) * scaleX;
    };

    const handleKey = (e: KeyboardEvent) => {
      const paddleW = paddleWRef.current;
      if (e.key === 'ArrowLeft') {
        mouseXRef.current = Math.max(0, paddleRef.current - 15 + paddleW / 2);
      } else if (e.key === 'ArrowRight') {
        mouseXRef.current = Math.min(W, paddleRef.current + 15 + paddleW / 2);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKey);
      cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  return (
    <GameWrapper
      title={t.breakout.title}
      score={score}
      highScore={highScore}
      controls={
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            {DIFF_LABELS.map((label, idx) => (
              <button
                key={label}
                type="button"
                onClick={() => selectDifficulty(idx)}
                className={
                  diffIdx === idx
                    ? 'rounded-lg px-4 py-2 text-sm bg-purple-600 text-white'
                    : 'rounded-lg px-4 py-2 text-sm bg-white/10 text-gray-300 hover:bg-white/20'
                }
              >
                {label}
              </button>
            ))}
          </div>
          <button onClick={() => restart()} className="btn-premium">
            {t.common.newGame}
          </button>
          <LeaderboardPanel gameId="breakout" currentScore={score} gameOver={gameState === 'over' || gameState === 'won'} detail={DIFF_LABELS[diffIdx]} />
        </div>
      }
    >
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="rounded-2xl border-3 border-[rgba(255,45,149,0.3)] cursor-none"
          style={{ width: 'min(95vw, 400px)', height: 'auto', touchAction: 'none' }}
          onClick={() => {
            if (stateRef.current.state === 'idle') start();
          }}
          onTouchStart={() => {
            if (stateRef.current.state === 'idle') start();
          }}
        />
        {gameState === 'idle' && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-2xl cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.18)' }}
            onClick={start}
            onTouchStart={(e) => { e.preventDefault(); start(); }}
          >
            <div className="text-center pointer-events-none px-6 py-5 rounded-2xl backdrop-blur-xl border-3 border-[rgba(255,45,149,0.4)]"
              style={{ background: 'rgba(26,10,46,0.82)', animation: 'popIn 0.4s ease-out', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
              <div className="text-4xl mb-3" style={{ animation: 'bounce 1.5s ease-in-out infinite' }}>🚀</div>
              <div className="text-white text-lg font-black mb-2">{t.breakout.launch}</div>
              <div className="text-[#c8a0e0] text-sm">{t.breakout.hint}</div>
            </div>
          </div>
        )}
        {(gameState === 'over' || gameState === 'won') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
            style={{ background: 'rgba(0,0,0,0.18)' }}>
            <div className="text-center px-8 py-6 rounded-2xl backdrop-blur-xl border-3 border-[rgba(255,45,149,0.4)]"
              style={{ background: 'rgba(26,10,46,0.82)', animation: 'popIn 0.4s ease-out', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
              <div className="text-4xl mb-2" style={{ animation: 'bounce 1s ease-in-out infinite' }}>
                {gameState === 'won' ? '🏆' : '💥'}
              </div>
              <div className="text-2xl font-black mb-2 text-white">
                {gameState === 'won' ? t.breakout.missionComplete : t.breakout.shipDown}
              </div>
              <div className="text-[#ffe93e] mb-4 font-bold">Score: {score}</div>
              <button onClick={() => restart()} className="btn-premium">
                {t.breakout.again}
              </button>
            </div>
          </div>
        )}
      </div>
      <p style={{
        fontSize: 11,
        textAlign: 'center',
        marginTop: 10,
        color: 'rgba(0,229,255,0.3)',
        letterSpacing: 1,
      }}>
        {t.breakout.controls}
      </p>
    </GameWrapper>
  );
}
