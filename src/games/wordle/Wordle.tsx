import { useState, useCallback, useEffect, useRef } from 'react';
import GameWrapper from '../../components/GameWrapper';
import { useGameScore } from '../../hooks/useGameScore';
import LeaderboardPanel from '../../components/LeaderboardPanel';
import { useI18n } from '../../i18n';

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

const WORDS = [
  'APPLE', 'BRAIN', 'CHAIR', 'DANCE', 'EAGLE', 'FLAME', 'GRACE', 'HEART',
  'IMAGE', 'JUICE', 'KNIFE', 'LIGHT', 'MAGIC', 'NOVEL', 'OCEAN', 'PIANO',
  'QUEEN', 'RIVER', 'STONE', 'TIGER', 'ULTRA', 'VOICE', 'WORLD', 'YOUTH',
  'ALIEN', 'BEACH', 'CANDY', 'DELTA', 'EMOJI', 'FRESH', 'GIANT', 'HOUSE',
  'INPUT', 'JOKER', 'KARMA', 'LASER', 'MEDAL', 'NERVE', 'ORBIT', 'POWER',
  'QUEST', 'RAPID', 'SOLAR', 'TOAST', 'UNITY', 'VALUE', 'WHALE', 'XENON',
  'BLEND', 'CRANE', 'DRIFT', 'EVENT', 'FLOAT', 'GLOBE', 'HASTE', 'IRONY',
  'JEWEL', 'KNEEL', 'LUNAR', 'MAPLE', 'NICHE', 'OLIVE', 'PLUMB', 'QUIRK',
  'REIGN', 'SHARP', 'TREND', 'USHER', 'VIVID', 'WRIST', 'YIELD', 'ZEBRA',
  'ADMIN', 'BLINK', 'CLASH', 'DOUBT', 'EXUDE', 'FROST', 'GRIND', 'HOVER',
  'IVORY', 'JOINT', 'KNACK', 'LODGE', 'MIRTH', 'NUDGE', 'ONSET', 'PATCH',
  'REALM', 'SHELF', 'THEFT', 'URBAN', 'VAULT', 'WEIRD', 'BADGE', 'CHARM',
  'DWARF', 'FABLE', 'GLEAM', 'HAUNT', 'INNER', 'JUMBO', 'LEMON',
  'MORAL', 'NOBLE', 'OUTER', 'PROUD', 'RAVEN', 'STAIN', 'TRUCE', 'UNDER',
  'VIGOR', 'WRECK', 'AUDIO', 'BUNCH', 'CLIMB', 'DRAIN', 'EMBED', 'FORGE',
  'GRAPH', 'HUMID', 'JUDGE', 'LABEL', 'MINOR', 'NIGHT', 'PHASE', 'RAISE',
  'SCALE', 'TRADE', 'UPPER', 'VERSE', 'WATCH', 'ANGEL', 'BOOST', 'CHILL',
  'DREAM', 'EXTRA', 'FLUSH', 'GHOST', 'HAPPY', 'IDEAL', 'JAZZY', 'LATCH',
  'MOUNT', 'NOTCH', 'OUTDO', 'PRANK', 'ROUND', 'SNACK', 'TRACE', 'UNITE',
  'VITAL', 'WINDY', 'ALARM', 'BLOOM', 'COMET', 'DIZZY', 'ELBOW', 'FIBER',
  'GRAIN', 'HONEY', 'INBOX', 'JOLLY', 'KAYAK', 'LILAC', 'MUDDY', 'NINTH',
  'OASIS', 'PEACH', 'RETRY', 'SKULL', 'THICK', 'VOCAL', 'WORSE',
];

function getRandomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

type LetterState = 'correct' | 'present' | 'absent' | 'empty';

function evaluateGuess(guess: string, answer: string): LetterState[] {
  const result: LetterState[] = Array(WORD_LENGTH).fill('absent');
  const remaining: (string | null)[] = answer.split('');

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === answer[i]) {
      result[i] = 'correct';
      remaining[i] = null;
    }
  }
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === 'correct') continue;
    const idx = remaining.indexOf(guess[i]);
    if (idx !== -1) {
      result[i] = 'present';
      remaining[idx] = null;
    }
  }
  return result;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
];

const STATE_COLORS: Record<LetterState, string> = {
  correct: '#39ff14',
  present: '#ffe93e',
  absent: 'rgba(40,15,80,0.6)',
  empty: 'transparent',
};

export default function Wordle() {
  const { score, highScore, updateScore } = useGameScore('wordle');
  const { t } = useI18n();
  const [answer, setAnswer] = useState(() => getRandomWord());
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState('');
  const [showRules, setShowRules] = useState(true);
  const [hint, setHint] = useState('Enter a 5-letter word and press ENTER');
  const scoreRef = useRef(0);
  scoreRef.current = score;
  const lastInputRef = useRef<'touch' | 'mouse' | null>(null);

  const keyStates = useCallback((): Record<string, LetterState> => {
    const states: Record<string, LetterState> = {};
    for (const guess of guesses) {
      const eval_ = evaluateGuess(guess, answer);
      for (let i = 0; i < WORD_LENGTH; i++) {
        const letter = guess[i];
        const newState = eval_[i];
        const old = states[letter];
        if (!old || newState === 'correct' || (newState === 'present' && old !== 'correct')) {
          states[letter] = newState;
        }
      }
    }
    return states;
  }, [guesses, answer]);

  const showMessage = useCallback((msg: string, duration = 1500) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), duration);
  }, []);

  const handleKey = useCallback((key: string) => {
    if (gameOver) return;
    if (key === 'ENTER') {
      if (current.length !== WORD_LENGTH) {
        setShake(true);
        showMessage(t.wordle.tooShort);
        setTimeout(() => setShake(false), 500);
        return;
      }
      const newGuesses = [...guesses, current];
      setGuesses(newGuesses);
      setCurrent('');

      if (current === answer) {
        setGameOver(true);
        setWon(true);
        const pts = (MAX_GUESSES - newGuesses.length + 1) * 100;
        updateScore(scoreRef.current + pts);
        showMessage(`Solved in ${newGuesses.length}/${MAX_GUESSES} tries!`, 3000);
        setHint(t.wordle.won + ' — play again!');
      } else if (newGuesses.length >= MAX_GUESSES) {
        setGameOver(true);
        setWon(false);
        showMessage(`${t.wordle.lost.split('{word}')[0]} ${answer}`, 5000);
        setHint('💡 ' + answer + ' — play again!');
      } else {
        const remaining = MAX_GUESSES - newGuesses.length;
        setHint(`${remaining} tries left — use color clues!`);
        if (remaining <= 2) showMessage(`${remaining} tries left`);
      }
    } else if (key === '⌫' || key === 'BACKSPACE') {
      setCurrent(c => c.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && current.length < WORD_LENGTH) {
      setCurrent(c => c + key);
    }
  }, [current, guesses, gameOver, answer, updateScore, showMessage]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const k = e.key.toUpperCase();
      if (k === 'ENTER' || k === 'BACKSPACE' || /^[A-Z]$/.test(k)) {
        handleKey(k);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKey]);

  const restart = () => {
    setAnswer(getRandomWord());
    setGuesses([]);
    setCurrent('');
    setGameOver(false);
    setWon(false);
    setMessage('');
    setHint('Enter a 5-letter word and press ENTER');
  };

  const onKeyPress = useCallback((key: string, source: 'touch' | 'mouse') => {
    // Prevent double-fire: if touch fires, ignore the subsequent mouse event
    if (source === 'mouse' && lastInputRef.current === 'touch') {
      lastInputRef.current = null;
      return;
    }
    lastInputRef.current = source;
    handleKey(key);
  }, [handleKey]);

  const ks = keyStates();

  return (
    <GameWrapper title={t.wordle.title} score={score} highScore={highScore} scoreLabel={t.common.score}
      controls={
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={restart} className="btn-premium">{t.common.newGame}</button>
          <button onClick={() => setShowRules(!showRules)} className="btn-ghost">
            {showRules ? t.common.closeRules : '❓ ' + t.common.rules}
          </button>
          <LeaderboardPanel gameId="wordle" currentScore={score} gameOver={gameOver} scoreLabel={t.common.score} />
        </div>
      }
    >
      <div className="flex flex-col items-center gap-2" style={{ touchAction: 'manipulation', maxWidth: 'min(98vw, 500px)', margin: '0 auto' }}>

        {/* Rules panel */}
        {showRules && (
          <div
            style={{
              width: '100%',
              borderRadius: 16,
              padding: '18px 24px',
              color: '#c8a0e0',
              background: 'rgba(40,15,80,0.5)',
              border: '2px dashed rgba(255,45,149,0.2)',
              lineHeight: 1.8,
            }}
          >
            <p style={{ fontWeight: 900, marginBottom: 8, fontSize: 14, color: '#ff6baf' }}>🎪 How to Play</p>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div>🎯 Goal: Guess the 5-letter word in 6 tries</div>
              <div>⌨️ Input: Type letters and press ENTER to submit</div>
              <div>🟢 Correct letter, correct position</div>
              <div>🟡 Correct letter, wrong position</div>
              <div>⬛ Letter not in the word</div>
              <div>💡 Tip: Start with common letters (E, A, R, S, T)</div>
            </div>
          </div>
        )}

        {/* Hint bar */}
        <div
          style={{
            width: '100%',
            textAlign: 'left',
            padding: '12px 20px',
            borderRadius: 12,
            fontSize: 12,
            minHeight: 32,
            display: 'flex',
            alignItems: 'center',
            fontWeight: 700,
            color: '#ff6baf',
            background: 'rgba(255,45,149,0.05)',
            border: '2px dashed rgba(255,45,149,0.15)',
          }}
        >
          ✨ {hint}
        </div>

        {/* Message toast */}
        {message && (
          <div className="bg-gray-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium animate-[fadeIn_0.2s]">
            {message}
          </div>
        )}

        {/* Grid */}
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: MAX_GUESSES }, (_, rowIdx) => {
            const isGuessed = rowIdx < guesses.length;
            const isCurrent = rowIdx === guesses.length && !gameOver;
            const word = isGuessed ? guesses[rowIdx] : isCurrent ? current : '';
            const eval_ = isGuessed ? evaluateGuess(guesses[rowIdx], answer) : null;

            return (
              <div key={rowIdx}
                className={`flex gap-1.5 ${isCurrent && shake ? 'animate-[shake_0.5s]' : ''}`}
              >
                {Array.from({ length: WORD_LENGTH }, (_, i) => {
                  const letter = word[i] || '';
                  const state = eval_ ? eval_[i] : 'empty';
                  const bg = eval_ ? STATE_COLORS[state] : letter ? 'rgba(40,15,80,0.6)' : 'transparent';
                  const border = letter && !eval_
                    ? 'rgba(255,45,149,0.4)'
                    : eval_
                      ? bg
                      : 'rgba(255,45,149,0.15)';
                  const shouldPop = isCurrent && i === word.length - 1 && letter;

                  return (
                    <div
                      key={i}
                      className={`font-bold flex items-center justify-center rounded-lg transition-transform
                        ${shouldPop ? 'scale-110' : 'scale-100'}`}
                      style={{
                        width: 'min(14vw, 58px)',
                        height: 'min(14vw, 58px)',
                        fontSize: 'min(6vw, 24px)',
                        fontWeight: 900,
                        color: state === 'correct' || state === 'present' ? '#1a0a2e' : '#fff',
                        borderRadius: 12,
                        backgroundColor: bg,
                        border: `2px solid ${border}`,
                        transition: isGuessed ? `background-color 0.3s ${i * 0.15}s, transform 0.1s` : 'transform 0.1s',
                      }}
                    >
                      {letter}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Game over actions */}
        {gameOver && (
          <div className="text-center py-2">
            <div className="text-3xl mb-1" style={{ animation: 'bounce 1s ease-in-out infinite' }}>
              {won ? '🎉' : '😵'}
            </div>
            <p className="text-lg font-black mb-1 text-white">
              {won ? `Solved in ${guesses.length} tries!` : `The word was: ${answer}`}
            </p>
            <button onClick={restart} className="btn-premium">{t.common.newGame}</button>
          </div>
        )}

        {/* Keyboard */}
        <div className="flex flex-col items-center gap-1.5 mt-1" style={{
          padding: '12px',
          borderRadius: 18,
          background: 'rgba(40,15,80,0.3)',
          border: '2px dashed rgba(255,45,149,0.12)',
        }}>
          {KEYBOARD_ROWS.map((row, ri) => (
            <div key={ri} className="flex gap-1">
              {row.map(key => {
                const isWide = key === 'ENTER' || key === '⌫';
                const state = ks[key];
                let bg = 'rgba(40,15,80,0.6)';
                if (state === 'correct') bg = '#39ff14';
                else if (state === 'present') bg = '#ffe93e';
                else if (state === 'absent') bg = 'rgba(26,10,46,0.8)';

                const kColor = (state === 'correct' || state === 'present') ? '#1a0a2e' : '#c8a0e0';

                return (
                  <button
                    key={key}
                    className="font-black rounded-xl active:scale-95 transition-transform select-none border border-[rgba(255,45,149,0.12)]"
                    style={{
                      width: isWide ? 'min(16vw, 66px)' : 'min(9vw, 40px)',
                      height: 'min(12vw, 52px)',
                      fontSize: isWide ? 'min(3vw, 12px)' : 'min(4.5vw, 16px)',
                      color: kColor,
                      backgroundColor: bg,
                    }}
                    onTouchStart={(e) => { e.preventDefault(); onKeyPress(key, 'touch'); }}
                    onClick={() => onKeyPress(key, 'mouse')}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 16,
            flexWrap: 'wrap',
            fontSize: 11,
            fontWeight: 700,
            color: '#c8a0e0',
            opacity: 0.6,
            marginTop: 4,
          }}
        >
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: '#39ff14' }} /> Match
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: '#ffe93e' }} /> Close
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: 'rgba(40,15,80,0.8)', border: '1px solid rgba(255,45,149,0.3)' }} /> Miss
          </span>
        </div>
      </div>
    </GameWrapper>
  );
}
