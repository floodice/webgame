import { useRef, useEffect, useState, useCallback } from 'react';
import GameWrapper from '../../components/GameWrapper';
import { useGameScore } from '../../hooks/useGameScore';
import LeaderboardPanel from '../../components/LeaderboardPanel';
import { useI18n } from '../../i18n';

const COLS = 10;
const ROWS = 12;
const BUBBLE_R = 16;
const DIAMETER = BUBBLE_R * 2;
const COLORS = ['#e91e63', '#2196f3', '#4caf50', '#ffc107', '#9c27b0', '#ff5722'];
const SHOOT_SPEED = 10;
const CANVAS_W = COLS * DIAMETER + BUBBLE_R;
const CANVAS_H = (ROWS + 3) * DIAMETER;
const DANGER_Y = (ROWS - 1) * (DIAMETER - 2) + BUBBLE_R;

type Bubble = { row: number; col: number; color: string };
type FlyingBubble = { x: number; y: number; dx: number; dy: number; color: string };

function getX(row: number, col: number) {
  const offset = row % 2 === 1 ? BUBBLE_R : 0;
  return col * DIAMETER + BUBBLE_R + offset;
}
function getY(row: number) {
  return row * (DIAMETER - 2) + BUBBLE_R;
}

function randomColor(existing: Bubble[]): string {
  const used = new Set(existing.map(b => b.color));
  const pool = COLORS.filter(c => used.has(c));
  if (pool.length === 0) return COLORS[Math.floor(Math.random() * COLORS.length)];
  return pool[Math.floor(Math.random() * pool.length)];
}

function initBoard(): Bubble[] {
  const bubbles: Bubble[] = [];
  for (let row = 0; row < 5; row++) {
    const maxCol = row % 2 === 1 ? COLS - 1 : COLS;
    for (let col = 0; col < maxCol; col++) {
      bubbles.push({ row, col, color: COLORS[Math.floor(Math.random() * COLORS.length)] });
    }
  }
  return bubbles;
}

function findNeighbors(row: number, col: number, bubbles: Bubble[]): Bubble[] {
  const even = row % 2 === 0;
  const offsets = even
    ? [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]]
    : [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]];
  return offsets
    .map(([dr, dc]) => bubbles.find(b => b.row === row + dr && b.col === col + dc))
    .filter((b): b is Bubble => b !== undefined);
}

function findCluster(bubble: Bubble, bubbles: Bubble[]): Bubble[] {
  const cluster: Bubble[] = [bubble];
  const visited = new Set<string>();
  visited.add(`${bubble.row},${bubble.col}`);
  const queue = [bubble];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const n of findNeighbors(cur.row, cur.col, bubbles)) {
      const key = `${n.row},${n.col}`;
      if (!visited.has(key) && n.color === bubble.color) {
        visited.add(key);
        cluster.push(n);
        queue.push(n);
      }
    }
  }
  return cluster;
}

function findFloating(bubbles: Bubble[]): Bubble[] {
  const attached = new Set<string>();
  const queue = bubbles.filter(b => b.row === 0);
  queue.forEach(b => attached.add(`${b.row},${b.col}`));
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const n of findNeighbors(cur.row, cur.col, bubbles)) {
      const key = `${n.row},${n.col}`;
      if (!attached.has(key)) {
        attached.add(key);
        queue.push(n);
      }
    }
  }
  return bubbles.filter(b => !attached.has(`${b.row},${b.col}`));
}

function snapToGrid(x: number, y: number): { row: number; col: number } {
  let bestRow = 0, bestCol = 0, bestDist = Infinity;
  for (let row = 0; row < ROWS; row++) {
    const maxCol = row % 2 === 1 ? COLS - 1 : COLS;
    for (let col = 0; col < maxCol; col++) {
      const gx = getX(row, col);
      const gy = getY(row);
      const d = Math.hypot(x - gx, y - gy);
      if (d < bestDist) {
        bestDist = d;
        bestRow = row;
        bestCol = col;
      }
    }
  }
  return { row: bestRow, col: bestCol };
}

export default function BubbleShooter() {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { score, highScore, updateScore, resetScore } = useGameScore('bubble-shooter');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const stateRef = useRef({
    bubbles: initBoard(),
    flying: null as FlyingBubble | null,
    nextColor: '',
    currentColor: '',
    aimAngle: -Math.PI / 2,
    score: 0,
    gameOver: false,
    won: false,
    missCount: 0,
  });

  // Initialize colors
  if (!stateRef.current.currentColor) {
    stateRef.current.currentColor = randomColor(stateRef.current.bubbles);
    stateRef.current.nextColor = randomColor(stateRef.current.bubbles);
  }

  const shooterY = CANVAS_H - BUBBLE_R - 10;
  const shooterX = CANVAS_W / 2;

  const restart = useCallback(() => {
    const s = stateRef.current;
    s.bubbles = initBoard();
    s.flying = null;
    s.score = 0;
    s.missCount = 0;
    s.currentColor = randomColor(s.bubbles);
    s.nextColor = randomColor(s.bubbles);
    s.gameOver = false;
    s.won = false;
    resetScore();
    setGameOver(false);
    setWon(false);
  }, [resetScore]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId = 0;

    function updateAim(clientX: number, clientY: number) {
      const rect = canvas!.getBoundingClientRect();
      const scaleX = CANVAS_W / rect.width;
      const scaleY = CANVAS_H / rect.height;
      const mx = (clientX - rect.left) * scaleX;
      const my = (clientY - rect.top) * scaleY;
      let angle = Math.atan2(my - shooterY, mx - shooterX);
      if (angle > -0.15) angle = -0.15;
      if (angle < -Math.PI + 0.15) angle = -Math.PI + 0.15;
      stateRef.current.aimAngle = angle;
    }

    function shoot() {
      const s = stateRef.current;
      if (s.flying || s.gameOver) return;
      s.flying = {
        x: shooterX,
        y: shooterY,
        dx: Math.cos(s.aimAngle) * SHOOT_SPEED,
        dy: Math.sin(s.aimAngle) * SHOOT_SPEED,
        color: s.currentColor,
      };
      s.currentColor = s.nextColor;
      s.nextColor = randomColor(s.bubbles);
    }

    function landBubble(fb: FlyingBubble) {
      const s = stateRef.current;
      const { row, col } = snapToGrid(fb.x, fb.y);
      const existing = s.bubbles.find(b => b.row === row && b.col === col);
      if (existing) {
        s.flying = null;
        return;
      }
      const newBubble: Bubble = { row, col, color: fb.color };
      s.bubbles = [...s.bubbles, newBubble];
      s.flying = null;

      const cluster = findCluster(newBubble, s.bubbles);
      if (cluster.length >= 3) {
        const keys = new Set(cluster.map(b => `${b.row},${b.col}`));
        s.bubbles = s.bubbles.filter(b => !keys.has(`${b.row},${b.col}`));
        const floating = findFloating(s.bubbles);
        const floatKeys = new Set(floating.map(b => `${b.row},${b.col}`));
        s.bubbles = s.bubbles.filter(b => !floatKeys.has(`${b.row},${b.col}`));

        const popped = cluster.length + floating.length;
        s.score += popped * 10 + (floating.length > 0 ? floating.length * 20 : 0);
        updateScore(s.score);
        s.missCount = 0;
      } else {
        s.missCount++;
        if (s.missCount >= 5) {
          s.missCount = 0;
          s.bubbles = s.bubbles.map(b => ({ ...b, row: b.row + 1 }));
          const maxCol = COLS;
          for (let c = 0; c < maxCol; c++) {
            s.bubbles.push({
              row: 0,
              col: c,
              color: COLORS[Math.floor(Math.random() * COLORS.length)],
            });
          }
        }
      }

      if (s.bubbles.length === 0) {
        s.gameOver = true;
        s.won = true;
        s.score += 100;
        updateScore(s.score);
        setGameOver(true);
        setWon(true);
        return;
      }

      if (s.bubbles.some(b => getY(b.row) >= DANGER_Y)) {
        s.gameOver = true;
        s.won = false;
        setGameOver(true);
      }
    }

    function handleClick(e: MouseEvent) {
      const s = stateRef.current;
      if (s.gameOver) {
        // click to restart
        s.bubbles = initBoard();
        s.flying = null;
        s.score = 0;
        s.missCount = 0;
        s.currentColor = randomColor(s.bubbles);
        s.nextColor = randomColor(s.bubbles);
        s.gameOver = false;
        s.won = false;
        resetScore();
        setGameOver(false);
        setWon(false);
        return;
      }
      updateAim(e.clientX, e.clientY);
      shoot();
    }

    function handleMouseMove(e: MouseEvent) {
      updateAim(e.clientX, e.clientY);
    }

    function handleTouchStart(e: TouchEvent) {
      e.preventDefault();
      updateAim(e.touches[0].clientX, e.touches[0].clientY);
    }
    function handleTouchMove(e: TouchEvent) {
      e.preventDefault();
      updateAim(e.touches[0].clientX, e.touches[0].clientY);
    }
    function handleTouchEnd(e: TouchEvent) {
      e.preventDefault();
      const s = stateRef.current;
      if (s.gameOver) {
        s.bubbles = initBoard();
        s.flying = null;
        s.score = 0;
        s.missCount = 0;
        s.currentColor = randomColor(s.bubbles);
        s.nextColor = randomColor(s.bubbles);
        s.gameOver = false;
        s.won = false;
        resetScore();
        setGameOver(false);
        setWon(false);
        return;
      }
      shoot();
    }

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    function drawCrystalBubble(x: number, y: number, color: string, radius = BUBBLE_R - 1) {
      ctx.save();
      ctx.shadowBlur = 6;
      ctx.shadowColor = color;
      const grad = ctx.createRadialGradient(x - radius * 0.35, y - radius * 0.35, radius * 0.1, x, y, radius);
      grad.addColorStop(0, 'rgba(255,255,255,0.85)');
      grad.addColorStop(0.35, color);
      grad.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(x - radius * 0.28, y - radius * 0.32, radius * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.fill();
      ctx.restore();
    }

    function draw() {
      const s = stateRef.current;
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = '#0a0612';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      const caveGrad = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
      caveGrad.addColorStop(0, 'rgba(76, 29, 149, 0.22)');
      caveGrad.addColorStop(0.5, 'rgba(30, 10, 50, 0.08)');
      caveGrad.addColorStop(1, 'rgba(88, 28, 135, 0.18)');
      ctx.fillStyle = caveGrad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // danger line
      ctx.save();
      ctx.strokeStyle = 'rgba(255,0,100,0.4)';
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(255,0,100,0.55)';
      ctx.setLineDash([6, 5]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, DANGER_Y);
      ctx.lineTo(CANVAS_W, DANGER_Y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // board bubbles
      for (const b of s.bubbles) {
        const bx = getX(b.row, b.col);
        const by = getY(b.row);
        drawCrystalBubble(bx, by, b.color);
      }

      // flying bubble
      const fb = s.flying;
      if (fb) {
        fb.x += fb.dx;
        fb.y += fb.dy;
        if (fb.x - BUBBLE_R <= 0 || fb.x + BUBBLE_R >= CANVAS_W) {
          fb.dx = -fb.dx;
          fb.x = Math.max(BUBBLE_R, Math.min(CANVAS_W - BUBBLE_R, fb.x));
        }
        if (fb.y - BUBBLE_R <= 0) {
          fb.y = BUBBLE_R;
          landBubble(fb);
        } else {
          let hit = false;
          for (const b of s.bubbles) {
            const bx = getX(b.row, b.col);
            const by = getY(b.row);
            if (Math.hypot(fb.x - bx, fb.y - by) < DIAMETER - 2) {
              hit = true;
              break;
            }
          }
          if (hit) {
            landBubble(fb);
          } else {
            drawCrystalBubble(fb.x, fb.y, fb.color);
          }
        }
      }

      // aim line
      if (!s.flying && !s.gameOver) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(255,255,255,0.75)';
        ctx.beginPath();
        ctx.moveTo(shooterX, shooterY);
        ctx.lineTo(
          shooterX + Math.cos(s.aimAngle) * 120,
          shooterY + Math.sin(s.aimAngle) * 120,
        );
        ctx.stroke();
        ctx.restore();
      }

      // shooter glow ring
      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = s.currentColor;
      ctx.beginPath();
      ctx.arc(shooterX, shooterY, BUBBLE_R + 3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      drawCrystalBubble(shooterX, shooterY, s.currentColor);

      // next bubble
      drawCrystalBubble(shooterX - 40, shooterY + 5, s.nextColor, BUBBLE_R * 0.6);
      ctx.fillStyle = 'rgba(200,220,255,0.75)';
      ctx.font = '10px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('NEXT', shooterX - 40, shooterY + 24);

      // game over overlay
      if (s.gameOver) {
        ctx.fillStyle = 'rgba(5,0,15,0.72)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        const title = s.won ? '◈ CRYSTAL CLEARED ◈' : '◈ CAVE BREACH ◈';
        const subtitle = s.won ? 'Cave Cleared!' : 'Defense Breached!';
        ctx.textAlign = 'center';
        ctx.save();
        ctx.shadowBlur = 16;
        ctx.shadowColor = s.won ? '#00ffff' : '#ff0066';
        ctx.fillStyle = s.won ? '#b8fff9' : '#ffb3d9';
        ctx.font = 'bold 20px ui-monospace, monospace';
        ctx.fillText(title, CANVAS_W / 2, CANVAS_H / 2 - 28);
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '16px sans-serif';
        ctx.fillText(subtitle, CANVAS_W / 2, CANVAS_H / 2 - 4);
        ctx.restore();
        ctx.font = '14px ui-monospace, monospace';
        ctx.fillStyle = '#a5b4fc';
        ctx.fillText(`SCORE // ${s.score}`, CANVAS_W / 2, CANVAS_H / 2 + 22);
        ctx.fillStyle = '#64748b';
        ctx.font = '12px ui-monospace, monospace';
        ctx.fillText('[ TAP TO RESTART ]', CANVAS_W / 2, CANVAS_H / 2 + 48);
      }

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GameWrapper title={t.bubbleShooter.title} score={score} highScore={highScore}
      controls={
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={restart} className="btn-premium">
            {t.common.newGame}
          </button>
          <LeaderboardPanel gameId="bubble-shooter" currentScore={score} gameOver={gameOver} />
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="rounded-2xl"
        style={{
          width: `min(95vw, ${CANVAS_W}px)`,
          height: 'auto',
          touchAction: 'none',
        }}
      />
      <p style={{
        fontSize: 11,
        textAlign: 'center',
        marginTop: 10,
        color: 'rgba(168,130,255,0.35)',
        letterSpacing: 0.8,
      }}>
        {gameOver
          ? t.bubbleShooter.restartHint
          : t.bubbleShooter.hint}
      </p>
    </GameWrapper>
  );
}
