import { useState, useCallback, useEffect, useRef } from 'react';
import GameWrapper from '../../components/GameWrapper';
import { useGameScore } from '../../hooks/useGameScore';
import LeaderboardPanel from '../../components/LeaderboardPanel';
import { useIdleHint } from '../../hooks/useIdleHint';
import { useI18n, fmt } from '../../i18n';

const EMOJIS = [
  '🐶', '🐱', '🐼', '🦊', '🐸', '🐵', '🦁', '🐯',
  '🐰', '🐻', '🐨', '🐮', '🐷', '🐔', '🐙', '🦄',
  '🦋', '🐢',
];

type Card = { id: number; emoji: string; flipped: boolean; matched: boolean };

type GridSize = { rows: number; cols: number; pairs: number };

const GRID_SIZES: { label: string; size: GridSize }[] = [
  { label: '4×4', size: { rows: 4, cols: 4, pairs: 8 } },
  { label: '4×5', size: { rows: 4, cols: 5, pairs: 10 } },
  { label: '6×6', size: { rows: 6, cols: 6, pairs: 18 } },
];

function createCards(pairs: number): Card[] {
  const emojis = EMOJIS.slice(0, pairs);
  const cards: Card[] = [...emojis, ...emojis].map((emoji, i) => ({
    id: i,
    emoji,
    flipped: false,
    matched: false,
  }));
  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export default function Memory() {
  const { score, highScore, updateScore } = useGameScore('memory');
  const [sizeIdx, setSizeIdx] = useState(0);
  const gridSize = GRID_SIZES[sizeIdx].size;
  const { t } = useI18n();
  const [cards, setCards] = useState<Card[]>(() => createCards(gridSize.pairs));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [time, setTime] = useState(0);
  const [started, setStarted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lockRef = useRef(false);
  const { showHint: memoryIdle, resetHint: resetMemIdle } = useIdleHint(8000, started && !completed);

  useEffect(() => {
    if (started && !completed) {
      timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, completed]);

  const handleFlip = useCallback((index: number) => {
    if (lockRef.current || completed) return;
    resetMemIdle();
    const card = cards[index];
    if (card.flipped || card.matched) return;

    if (!started) setStarted(true);

    const newCards = [...cards];
    newCards[index] = { ...card, flipped: true };
    const newFlipped = [...flipped, index];
    setCards(newCards);
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      lockRef.current = true;
      setMoves(m => m + 1);
      const [first, second] = newFlipped;

      if (newCards[first].emoji === newCards[second].emoji) {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) =>
            i === first || i === second ? { ...c, matched: true } : c
          ));
          const newMatched = matchedCount + 1;
          setMatchedCount(newMatched);

          if (newMatched === gridSize.pairs) {
            setCompleted(true);
            const finalMoves = moves + 1;
            const finalScore = Math.max(1000 - finalMoves * 10 - time * 2, 100);
            updateScore(finalScore);
          }

          setFlipped([]);
          lockRef.current = false;
        }, 300);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) =>
            i === first || i === second ? { ...c, flipped: false } : c
          ));
          setFlipped([]);
          lockRef.current = false;
        }, 800);
      }
    }
  }, [cards, flipped, completed, started, matchedCount, gridSize.pairs, moves, time, updateScore]);

  const restart = (newSizeIdx?: number) => {
    const idx = newSizeIdx ?? sizeIdx;
    if (newSizeIdx !== undefined) setSizeIdx(idx);
    const size = GRID_SIZES[idx].size;
    setCards(createCards(size.pairs));
    setFlipped([]);
    setMoves(0);
    setMatchedCount(0);
    setCompleted(false);
    setTime(0);
    setStarted(false);
    lockRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return (
    <GameWrapper
      title={t.memory.title}
      score={completed ? score : undefined}
      highScore={highScore}
      controls={
        <div className="flex flex-wrap gap-2 items-center">
          {GRID_SIZES.map((g, i) => (
            <button
              key={g.label}
              onClick={() => restart(i)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                sizeIdx === i ? 'bg-purple-700 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {g.label}
            </button>
          ))}
          <button onClick={() => restart()} className="btn-premium">
            {t.memory.reset}
          </button>
          <div className="flex gap-3 text-sm ml-2 font-bold">
            <span className="text-[#ff6baf]">👣 {moves}</span>
            <span className="text-[#ffe93e]">⏱ {time}s</span>
          </div>
          <LeaderboardPanel gameId="memory" currentScore={completed ? moves : 0} gameOver={completed} scoreLabel={t.memory.steps} detail={GRID_SIZES[sizeIdx].label} />
        </div>
      }
    >
      <style>{`
        @keyframes memoryWobble {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          75% { transform: rotate(3deg); }
        }
      `}</style>
      <div className="relative" style={{
        padding: '16px',
        borderRadius: 24,
        background: 'linear-gradient(145deg, rgba(40,15,80,0.4) 0%, rgba(26,10,46,0.6) 100%)',
        border: '3px dashed rgba(255,45,149,0.2)',
        boxShadow: '0 8px 32px rgba(255,45,149,0.08), inset 0 0 60px rgba(191,90,242,0.05)',
        animation: 'candyPulse 6s ease-in-out infinite',
      }}>
        <div
          className="inline-grid gap-2 sm:gap-3"
          style={{ gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)` }}
        >
          {cards.map((card, i) => (
            <button
              key={card.id}
              onClick={() => handleFlip(i)}
              className="relative select-none"
              style={{
                width: gridSize.cols > 5 ? 'min(12vw, 60px)' : 'min(18vw, 80px)',
                aspectRatio: '1',
                perspective: '600px',
              }}
            >
              <div
                className="absolute inset-0 transition-transform duration-300"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: card.flipped || card.matched ? 'rotateY(180deg)' : 'rotateY(0)',
                }}
              >
                {/* Back */}
                <div
                  className="absolute inset-0 rounded-xl flex items-center justify-center"
                  style={{
                    backfaceVisibility: 'hidden',
                    background: 'linear-gradient(135deg, #1a0a2e, #2d1b69, #1a0a2e)',
                    border: '2.5px solid rgba(255,45,149,0.4)',
                    animation: memoryIdle && !card.flipped && !card.matched ? 'memoryWobble 1.5s ease-in-out infinite' : undefined,
                    animationDelay: memoryIdle && !card.flipped && !card.matched ? `${(i % 4) * 150}ms` : undefined,
                  }}
                >
                  <span className="text-xl">🎪</span>
                </div>
                {/* Front */}
                <div
                  className="absolute inset-0 rounded-xl flex items-center justify-center"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: card.matched ? 'rgba(57,255,20,0.08)' : 'rgba(40,15,80,0.8)',
                    border: card.matched
                      ? '2px solid rgba(57,255,20,0.4)'
                      : '2px solid rgba(255,45,149,0.2)',
                    boxShadow: card.matched ? '0 0 14px rgba(57,255,20,0.3)' : undefined,
                  }}
                >
                  <span className="text-2xl sm:text-3xl">{card.emoji}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {completed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
            style={{ background: 'rgba(0,0,0,0.18)' }}>
            <div className="text-center px-8 py-6 rounded-2xl backdrop-blur-xl border-3 border-[rgba(255,45,149,0.4)]"
              style={{ background: 'rgba(26,10,46,0.82)', animation: 'popIn 0.4s ease-out', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
              <div className="text-4xl mb-2" style={{ animation: 'bounce 1s ease-in-out infinite' }}>🎉</div>
              <div className="text-2xl font-black mb-2 text-white">{t.memory.complete}</div>
              <div className="text-[#c8a0e0] mb-4">{fmt(t.memory.result, { moves, time })}</div>
              <button
                onClick={() => restart()}
                className="btn-premium"
              >
                {t.common.newGame}
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
        letterSpacing: 2,
      }}>
        {t.memory.hint}
      </p>
    </GameWrapper>
  );
}
