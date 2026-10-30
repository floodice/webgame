import { useState, useCallback, useEffect, useRef } from 'react';
import GameWrapper from '../../components/GameWrapper';
import { useGameScore } from '../../hooks/useGameScore';
import LeaderboardPanel from '../../components/LeaderboardPanel';
import { useI18n, fmt } from '../../i18n';

function hslToString(h: number, s: number, l: number) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function generateRound(level: number) {
  // Grid size grows with level
  const gridSize = Math.min(2 + Math.floor(level / 2), 8);

  // Color difference decreases with level
  const baseDiff = Math.max(30 - level * 2.5, 3);

  const hue = Math.floor(Math.random() * 360);
  const sat = 50 + Math.floor(Math.random() * 30);
  const light = 40 + Math.floor(Math.random() * 20);

  const diffDir = Math.random() > 0.5 ? 1 : -1;
  const diffHue = hue;
  const diffLight = Math.min(95, Math.max(10, light + baseDiff * diffDir));

  const baseColor = hslToString(hue, sat, light);
  const diffColor = hslToString(diffHue, sat, diffLight);

  const total = gridSize * gridSize;
  const diffIndex = Math.floor(Math.random() * total);

  return { gridSize, baseColor, diffColor, diffIndex, total };
}

export default function ColorFind() {
  const { score, highScore, updateScore, resetScore } = useGameScore('color-find');
  const { t } = useI18n();
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(() => generateRound(1));
  const [gameOver, setGameOver] = useState(false);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(30);
  const [started, setStarted] = useState(false);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scoreRef = useRef(0);

  useEffect(() => {
    if (started && !gameOver) {
      timerRef.current = setInterval(() => {
        setTime(t => {
          if (t <= 1) {
            setGameOver(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, gameOver]);

  const handleClick = useCallback((index: number) => {
    if (gameOver) return;
    if (!started) setStarted(true);

    if (index === round.diffIndex) {
      // Correct
      const points = 10 + level * 5;
      scoreRef.current += points;
      updateScore(scoreRef.current);
      setLevel(l => l + 1);
      setRound(generateRound(level + 1));
      setTime(t => Math.min(t + 3, 30)); // bonus time
      setFlash('correct');
      setTimeout(() => setFlash(null), 300);
    } else {
      // Wrong
      setLives(l => {
        if (l <= 1) {
          setGameOver(true);
          return 0;
        }
        return l - 1;
      });
      setFlash('wrong');
      setTimeout(() => setFlash(null), 300);
    }
  }, [round, gameOver, level, started, updateScore]);

  const restart = () => {
    setLevel(1);
    setRound(generateRound(1));
    setGameOver(false);
    setLives(3);
    setTime(30);
    setStarted(false);
    scoreRef.current = 0;
    resetScore();
    setFlash(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const cellSize = `min(${Math.floor(350 / round.gridSize)}px, ${Math.floor(90 / round.gridSize)}vw)`;

  return (
    <GameWrapper
      title={t.colorFind.title}
      score={score}
      highScore={highScore}
      controls={
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={restart} className="btn-premium">
            {t.common.newGame}
          </button>
          <div className="flex gap-3 text-sm font-bold">
            <span className="text-[#ff6baf]">🎯 Lv.{level}</span>
            <span className="text-[#ff6b2b]">❤️ {lives}</span>
            <span className={`${time <= 5 ? 'text-red-400' : 'text-[#ffe93e]'}`}>⏱ {time}s</span>
          </div>
          <LeaderboardPanel gameId="color-find" currentScore={score} gameOver={gameOver} />
        </div>
      }
    >
      <div
        className={`relative transition-all duration-100 ${
          flash === 'correct'
            ? 'scale-[1.02] ring-4 ring-green-400/70'
            : flash === 'wrong'
              ? 'scale-[0.98] ring-4 ring-red-500/70'
              : ''
        }`}
      >
        <div
          className="inline-grid gap-0 rounded-none"
          style={{
            gridTemplateColumns: `repeat(${round.gridSize}, ${cellSize})`,
            background: '#000000',
            padding: '10px',
            border: '3px solid #fff',
          }}
        >
          {Array.from({ length: round.total }, (_, i) => (
            <button
              key={`${level}-${i}`}
              className="rounded-none cursor-pointer hover:scale-105 transition-transform active:scale-95"
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: i === round.diffIndex ? round.diffColor : round.baseColor,
                border: '2px solid #000',
              }}
              onClick={() => handleClick(i)}
            />
          ))}
        </div>

        {gameOver && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
            style={{ background: 'rgba(0,0,0,0.18)' }}
          >
            <div className="text-center px-8 py-6 rounded-2xl backdrop-blur-xl border-3 border-[rgba(255,45,149,0.4)]"
              style={{ background: 'rgba(26,10,46,0.82)', animation: 'popIn 0.4s ease-out', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
              <div className="text-4xl mb-2" style={{ animation: 'bounce 1s ease-in-out infinite' }}>
                {time === 0 ? '⏰' : '🎨'}
              </div>
              <div className="text-2xl font-black mb-2 text-white">
                {time === 0 ? t.colorFind.timeUp : t.colorFind.challengeOver}
              </div>
              <div className="text-[#ffe93e] font-bold mb-1">{fmt(t.colorFind.finalScore, { n: score })}</div>
              <div className="text-[#c8a0e0] mb-4 text-sm font-bold">{fmt(t.colorFind.reachedLevel, { n: level })}</div>
              <button
                onClick={restart}
                className="btn-premium"
              >
              {t.colorFind.again}
              </button>
            </div>
          </div>
        )}
      </div>
      <p style={{
        fontSize: 11,
        textAlign: 'center',
        marginTop: 10,
        color: 'rgba(255,255,255,0.25)',
        fontWeight: 700,
        letterSpacing: 2,
      }}>
        {t.colorFind.hint}
      </p>
    </GameWrapper>
  );
}
