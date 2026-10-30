import { useRef, useEffect, useState, useCallback } from 'react';
import GameWrapper from '../../components/GameWrapper';
import { useGameScore } from '../../hooks/useGameScore';
import LeaderboardPanel from '../../components/LeaderboardPanel';
import { useI18n } from '../../i18n';

const W = 320;
const H = 480;
const BIRD_X = 80;
const BIRD_R = 15;
const JUMP_VEL = -6;
const PIPE_W = 50;

const DIFFICULTY_CONFIGS = [
  { GAP: 160, PIPE_SPEED: 2, GRAVITY: 0.3, PIPE_INTERVAL: 200 },
  { GAP: 130, PIPE_SPEED: 2.5, GRAVITY: 0.35, PIPE_INTERVAL: 180 },
  { GAP: 100, PIPE_SPEED: 3.2, GRAVITY: 0.4, PIPE_INTERVAL: 150 },
] as const;

type Pipe = { x: number; topH: number };

export default function Flappy() {
  const { score, highScore, updateScore, resetScore } = useGameScore('flappy');
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'over'>('idle');
  const [diffIdx, setDiffIdx] = useState(1);
  const DIFFICULTIES = DIFFICULTY_CONFIGS.map((cfg, i) => ({
    name: [t.common.easy, t.common.medium, t.common.hard][i],
    ...cfg,
  }));
  const diffRef = useRef<(typeof DIFFICULTY_CONFIGS)[number]>(DIFFICULTY_CONFIGS[1]);
  const stateRef = useRef({ gameState: 'idle' as string });

  const birdRef = useRef({ y: H / 2, vel: 0 });
  const pipesRef = useRef<Pipe[]>([]);
  const frameRef = useRef(0);
  const scoreRef = useRef(0);
  const passedRef = useRef(new Set<number>());
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // Deep sea gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#000814');
    grad.addColorStop(0.45, '#001d3d');
    grad.addColorStop(1, '#003566');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Floating bubbles
    for (let i = 0; i < 30; i++) {
      const sx = (i * 97 + 13) % W;
      const sy = (i * 53 + 7) % (H * 0.6);
      const r = 1.5 + (i % 3) * 0.8;
      ctx.fillStyle = 'rgba(100,200,255,0.15)';
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Seabed sand
    ctx.fillStyle = '#2a1a0e';
    ctx.fillRect(0, H - 30, W, 30);
    ctx.fillStyle = '#3d2818';
    ctx.fillRect(0, H - 30, W, 5);

    // Coral / seaweed pillars
    for (const pipe of pipesRef.current) {
      ctx.fillStyle = '#c2185b';
      ctx.beginPath();
      ctx.roundRect(pipe.x, 0, PIPE_W, pipe.topH, [0, 0, 8, 8]);
      ctx.fill();
      ctx.fillStyle = '#e91e63';
      ctx.beginPath();
      ctx.roundRect(pipe.x - 3, pipe.topH - 20, PIPE_W + 6, 20, 6);
      ctx.fill();

      const bottomY = pipe.topH + diffRef.current.GAP;
      const bottomH = H - 30 - bottomY;
      ctx.fillStyle = '#c2185b';
      ctx.beginPath();
      ctx.roundRect(pipe.x, bottomY, PIPE_W, bottomH, [8, 8, 0, 0]);
      ctx.fill();
      ctx.fillStyle = '#e91e63';
      ctx.beginPath();
      ctx.roundRect(pipe.x - 3, bottomY, PIPE_W + 6, 20, 6);
      ctx.fill();
    }

    // Jellyfish / fish
    const bird = birdRef.current;
    const angle = Math.min(Math.max(bird.vel * 3, -30), 70) * Math.PI / 180;
    ctx.save();
    ctx.translate(BIRD_X, bird.y);
    ctx.rotate(angle);

    ctx.fillStyle = 'rgba(100,200,255,0.6)';
    ctx.beginPath();
    ctx.ellipse(0, 0, BIRD_R, BIRD_R * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4fc3f7';
    ctx.beginPath();
    ctx.ellipse(-5, 3, 7, 4, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5, 4, 6, 3.5, 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(6, -4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(7, -4, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(100,200,255,0.4)';
    ctx.lineWidth = 1.5;
    for (let t = 0; t < 3; t++) {
      const ox = -4 + t * 4;
      ctx.beginPath();
      ctx.moveTo(ox, BIRD_R * 0.5);
      ctx.bezierCurveTo(ox - 6, BIRD_R + 8, ox + 6, BIRD_R + 16, ox + (t - 1) * 2, BIRD_R + 22);
      ctx.stroke();
    }

    ctx.restore();

    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00e5ff';
    ctx.fillText(String(scoreRef.current), W / 2, 50);
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
  }, []);

  const checkCollision = useCallback(() => {
    const bird = birdRef.current;
    // Ground or ceiling
    if (bird.y + BIRD_R > H - 30 || bird.y - BIRD_R < 0) return true;

    // Pipes
    for (const pipe of pipesRef.current) {
      if (BIRD_X + BIRD_R > pipe.x && BIRD_X - BIRD_R < pipe.x + PIPE_W) {
        const gap = diffRef.current.GAP;
        if (bird.y - BIRD_R < pipe.topH || bird.y + BIRD_R > pipe.topH + gap) {
          return true;
        }
      }
    }
    return false;
  }, []);

  const loop = useCallback(() => {
    if (stateRef.current.gameState !== 'playing') return;

    const { GRAVITY, PIPE_SPEED, PIPE_INTERVAL, GAP } = diffRef.current;
    const bird = birdRef.current;
    bird.vel += GRAVITY;
    bird.y += bird.vel;

    // Move pipes
    pipesRef.current = pipesRef.current
      .map(p => ({ ...p, x: p.x - PIPE_SPEED }))
      .filter(p => p.x + PIPE_W > -10);

    // Add new pipes
    frameRef.current++;
    if (frameRef.current % PIPE_INTERVAL === 0) {
      const topH = 60 + Math.random() * (H - 30 - GAP - 120);
      pipesRef.current.push({ x: W + 10, topH });
    }

    // Score
    for (const pipe of pipesRef.current) {
      if (pipe.x + PIPE_W < BIRD_X && !passedRef.current.has(pipe.x)) {
        passedRef.current.add(pipe.x);
        scoreRef.current++;
        updateScore(scoreRef.current);
      }
    }

    // Collision
    if (checkCollision()) {
      stateRef.current.gameState = 'over';
      setGameState('over');
      draw();
      return;
    }

    draw();
    rafRef.current = requestAnimationFrame(loop);
  }, [draw, checkCollision, updateScore]);

  const jump = useCallback(() => {
    if (stateRef.current.gameState === 'idle') {
      stateRef.current.gameState = 'playing';
      setGameState('playing');
      birdRef.current = { y: H / 2, vel: JUMP_VEL };
      pipesRef.current = [];
      frameRef.current = 0;
      scoreRef.current = 0;
      passedRef.current = new Set();
      resetScore();
      rafRef.current = requestAnimationFrame(loop);
      return;
    }
    if (stateRef.current.gameState === 'playing') {
      birdRef.current.vel = JUMP_VEL;
    }
  }, [loop, resetScore]);

  const restart = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    stateRef.current.gameState = 'idle';
    setGameState('idle');
    birdRef.current = { y: H / 2, vel: 0 };
    pipesRef.current = [];
    frameRef.current = 0;
    scoreRef.current = 0;
    passedRef.current = new Set();
    resetScore();
    draw();
  }, [draw, resetScore]);

  useEffect(() => {
    draw();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (stateRef.current.gameState === 'over') {
          restart();
          setTimeout(jump, 50);
        } else {
          jump();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      cancelAnimationFrame(rafRef.current);
    };
  }, [draw, jump, restart]);

  const selectDifficulty = (idx: number) => {
    setDiffIdx(idx);
    diffRef.current = DIFFICULTY_CONFIGS[idx];
    restart();
  };

  const handleCanvasClick = () => {
    if (stateRef.current.gameState === 'over') {
      restart();
      setTimeout(jump, 50);
    } else {
      jump();
    }
  };

  return (
    <GameWrapper
      title={t.flappy.title}
      score={score}
      highScore={highScore}
      controls={
        <div className="flex flex-wrap items-center gap-2">
          {DIFFICULTIES.map((d, i) => (
            <button
              key={d.name}
              type="button"
              onClick={() => selectDifficulty(i)}
              className={
                diffIdx === i
                  ? 'rounded-lg px-4 py-2 text-sm bg-emerald-600 text-white'
                  : 'rounded-lg px-4 py-2 text-sm bg-white/10 text-gray-300 hover:bg-white/20'
              }
            >
              {d.name}
            </button>
          ))}
          <button onClick={restart} className="btn-premium">
            {t.common.newGame}
          </button>
          <LeaderboardPanel gameId="flappy" currentScore={score} gameOver={gameState === 'over'} detail={DIFFICULTIES[diffIdx].name} />
        </div>
      }
    >
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="rounded-2xl border-3 border-[rgba(255,45,149,0.3)] cursor-pointer"
          style={{ width: 'min(90vw, 320px)', height: 'auto', touchAction: 'none' }}
          onClick={handleCanvasClick}
          onTouchStart={(e) => { e.preventDefault(); handleCanvasClick(); }}
        />
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl"
            style={{ background: 'rgba(0,0,0,0.18)' }}>
            <div className="text-center px-6 py-5 rounded-2xl backdrop-blur-xl border-3 border-[rgba(255,45,149,0.4)]"
              style={{ background: 'rgba(26,10,46,0.82)', animation: 'popIn 0.4s ease-out', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
              <div className="text-4xl mb-3" style={{ animation: 'float 3s ease-in-out infinite' }}>🪼</div>
              <div className="text-white text-lg font-black mb-2">{t.flappy.tapToStart}</div>
              <div className="text-[#c8a0e0] text-sm">{t.flappy.swimHint}</div>
            </div>
          </div>
        )}
        {gameState === 'over' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
            style={{ background: 'rgba(0,0,0,0.18)' }}>
            <div className="text-center px-8 py-6 rounded-2xl backdrop-blur-xl border-3 border-[rgba(255,45,149,0.4)]"
              style={{ background: 'rgba(26,10,46,0.82)', animation: 'popIn 0.4s ease-out', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
              <div className="text-4xl mb-2" style={{ animation: 'bounce 1s ease-in-out infinite' }}>💀</div>
              <div className="text-2xl font-black mb-2 text-white">{t.flappy.deepsea}</div>
              <div className="text-[#ffe93e] mb-4 font-bold">Score: {score}</div>
              <div className="text-sm text-[#c8a0e0] mb-4">{t.flappy.restartHint}</div>
            </div>
          </div>
        )}
      </div>
      <p style={{
        fontSize: 11,
        textAlign: 'center',
        marginTop: 10,
        color: 'rgba(100,200,255,0.3)',
        letterSpacing: 1,
      }}>
        {t.flappy.controls}
      </p>
    </GameWrapper>
  );
}
