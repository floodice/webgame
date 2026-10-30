import { useState, useCallback, useRef } from 'react';
import GameWrapper from '../../components/GameWrapper';
import { useGameScore } from '../../hooks/useGameScore';
import LeaderboardPanel from '../../components/LeaderboardPanel';
import { useIdleHint } from '../../hooks/useIdleHint';
import { useI18n } from '../../i18n';

type Suit = '♠' | '♥' | '♦' | '♣';
interface Card {
  suit: Suit;
  rank: number;
  faceUp: boolean;
  id: string;
}

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANK_LABELS = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function isRed(suit: Suit): boolean {
  return suit === '♥' || suit === '♦';
}

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({ suit, rank, faceUp: false, id: `${suit}${rank}` });
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

interface GameState {
  tableau: Card[][];
  foundations: Card[][];
  stock: Card[];
  waste: Card[];
}

function dealGame(): GameState {
  const deck = createDeck();
  const tableau: Card[][] = [];
  let idx = 0;
  for (let col = 0; col < 7; col++) {
    const pile: Card[] = [];
    for (let row = 0; row <= col; row++) {
      const card = { ...deck[idx++] };
      card.faceUp = row === col;
      pile.push(card);
    }
    tableau.push(pile);
  }
  const stock = deck.slice(idx).map(c => ({ ...c, faceUp: false }));
  return { tableau, foundations: [[], [], [], []], stock, waste: [] };
}

function canPlaceOnTableau(card: Card, pile: Card[]): boolean {
  if (pile.length === 0) return card.rank === 13;
  const top = pile[pile.length - 1];
  if (!top.faceUp) return false;
  return isRed(card.suit) !== isRed(top.suit) && card.rank === top.rank - 1;
}

function canPlaceOnFoundation(card: Card, pile: Card[]): boolean {
  if (pile.length === 0) return card.rank === 1;
  const top = pile[pile.length - 1];
  return top.suit === card.suit && card.rank === top.rank + 1;
}

type Selection =
  | { type: 'tableau'; col: number; cardIdx: number }
  | { type: 'waste' }
  | null;

export default function Solitaire() {
  const { t } = useI18n();
  const { score, highScore, updateScore, resetScore } = useGameScore('solitaire');
  const [game, setGame] = useState<GameState>(() => dealGame());
  const [sel, setSel] = useState<Selection>(null);
  const [won, setWon] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [hint, setHint] = useState('Click the deck to draw cards, or click a face-up card to start');
  const [showRules, setShowRules] = useState(false);
  const { showHint: solIdle, resetHint: resetSolIdle } = useIdleHint(10000, !won);
  const scoreAccum = useRef(0);

  const showHint = (msg: string) => setHint(msg);

  const addPoints = useCallback((pts: number) => {
    scoreAccum.current += pts;
    updateScore(scoreAccum.current);
  }, [updateScore]);

  const checkWin = useCallback((g: GameState): boolean => {
    return g.foundations.every(f => f.length === 13);
  }, []);

  const flipTop = (tableau: Card[][], col: number) => {
    const pile = tableau[col];
    if (pile.length > 0 && !pile[pile.length - 1].faceUp) {
      pile[pile.length - 1] = { ...pile[pile.length - 1], faceUp: true };
    }
  };

  // Get selected cards info for highlighting valid targets
  const getSelectedCards = (): Card[] => {
    if (!sel) return [];
    if (sel.type === 'waste') {
      const top = game.waste[game.waste.length - 1];
      return top ? [top] : [];
    }
    return game.tableau[sel.col].slice(sel.cardIdx).filter(c => c.faceUp);
  };

  const selectedCards = getSelectedCards();
  const selectedCard = selectedCards[0];

  // Check if a tableau column is a valid target for the current selection
  const isValidTarget = (col: number): boolean => {
    if (!selectedCard) return false;
    return canPlaceOnTableau(selectedCard, game.tableau[col]) ||
      (game.tableau[col].length === 0 && selectedCard.rank === 13);
  };

  // Check if a foundation is a valid target
  const isValidFoundation = (fi: number): boolean => {
    if (!selectedCard || selectedCards.length !== 1) return false;
    return canPlaceOnFoundation(selectedCard, game.foundations[fi]);
  };

  const drawCard = useCallback(() => {
    setSel(null);
    resetSolIdle();
    setGame(prev => {
      if (prev.stock.length === 0) {
        if (prev.waste.length === 0) return prev;
        showHint('Deck reshuffled');
        return {
          ...prev,
          stock: [...prev.waste].reverse().map(c => ({ ...c, faceUp: false })),
          waste: [],
        };
      }
      const newStock = [...prev.stock];
      const card = { ...newStock.pop()!, faceUp: true };
      showHint(`Drew ${RANK_LABELS[card.rank]}${card.suit} — click to select`);
      return { ...prev, stock: newStock, waste: [...prev.waste, card] };
    });
  }, []);

  const handleSelect = useCallback((source: Selection) => {
    if (won || !source) return;

    if (!sel) {
      setSel(source);
      if (source.type === 'waste') {
        const c = game.waste[game.waste.length - 1];
        if (c) showHint(`Selected ${RANK_LABELS[c.rank]}${c.suit} — click target or click again to auto-stack`);
      } else {
        const cards = game.tableau[source.col].slice(source.cardIdx).filter(c => c.faceUp);
        if (cards.length === 1) {
          showHint(`Selected ${RANK_LABELS[cards[0].rank]}${cards[0].suit} — highlighted positions available`);
        } else if (cards.length > 1) {
          showHint(`Selected ${cards.length} cards (${RANK_LABELS[cards[0].rank]}${cards[0].suit}...) — highlighted positions available`);
        }
      }
      return;
    }

    setGame(prev => {
      let srcCards: Card[] = [];
      let removeSource: (g: GameState) => void;

      if (sel.type === 'waste') {
        const top = prev.waste[prev.waste.length - 1];
        if (!top) { setSel(source); return prev; }
        srcCards = [top];
        removeSource = (g) => { g.waste = prev.waste.slice(0, -1); };
      } else {
        srcCards = prev.tableau[sel.col].slice(sel.cardIdx).filter(c => c.faceUp);
        if (srcCards.length === 0) { setSel(source); return prev; }
        removeSource = (g) => {
          g.tableau[sel.col] = prev.tableau[sel.col].slice(0, sel.cardIdx);
          flipTop(g.tableau, sel.col);
        };
      }

      const srcCard = srcCards[0];

      if (source.type === 'waste') {
        setSel(source);
        return prev;
      }

      if (source.type === 'tableau') {
        const targetPile = prev.tableau[source.col];

        // Same card double-click → auto-foundation
        if (sel.type === 'tableau' && sel.col === source.col && sel.cardIdx === source.cardIdx) {
          if (srcCards.length === 1) {
            for (let fi = 0; fi < 4; fi++) {
              if (canPlaceOnFoundation(srcCard, prev.foundations[fi])) {
                const newG: GameState = {
                  tableau: prev.tableau.map(p => [...p]),
                  foundations: prev.foundations.map((f, i) => i === fi ? [...f, { ...srcCard, faceUp: true }] : [...f]),
                  stock: [...prev.stock],
                  waste: [...prev.waste],
                };
                newG.tableau[sel.col] = prev.tableau[sel.col].slice(0, sel.cardIdx);
                flipTop(newG.tableau, sel.col);
                setSel(null);
                setMoveCount(m => m + 1);
                addPoints(25);
                showHint(`${RANK_LABELS[srcCard.rank]}${srcCard.suit} → foundation! +25`);
                if (checkWin(newG)) { setWon(true); addPoints(500); }
                return newG;
              }
            }
          }
          setSel(null);
          showHint('Cannot auto-stack — try something else');
          return prev;
        }

        if (canPlaceOnTableau(srcCard, targetPile) || (targetPile.length === 0 && srcCard.rank === 13)) {
          const newG: GameState = {
            tableau: prev.tableau.map(p => [...p]),
            foundations: prev.foundations.map(f => [...f]),
            stock: [...prev.stock],
            waste: [...prev.waste],
          };
          newG.tableau[source.col] = [...targetPile, ...srcCards.map(c => ({ ...c, faceUp: true }))];
          removeSource(newG);
          setSel(null);
          setMoveCount(m => m + 1);
          addPoints(10);
          showHint('Move successful! +10');
          if (checkWin(newG)) { setWon(true); addPoints(500); }
          return newG;
        }

        // Invalid target, show message and re-select
        showHint('Cannot place here — alternate red/black, descending rank');
      }

      setSel(source);
      return prev;
    });
  }, [sel, won, game, addPoints, checkWin]);

  const handleWasteTap = useCallback(() => {
    if (won) return;
    const top = game.waste[game.waste.length - 1];
    if (!top) return;

    if (sel?.type === 'waste') {
      for (let fi = 0; fi < 4; fi++) {
        if (canPlaceOnFoundation(top, game.foundations[fi])) {
          setGame(prev => {
            const newG: GameState = {
              tableau: prev.tableau.map(p => [...p]),
              foundations: prev.foundations.map((f, i) => i === fi ? [...f, { ...top, faceUp: true }] : [...f]),
              stock: [...prev.stock],
              waste: prev.waste.slice(0, -1),
            };
            setSel(null);
            setMoveCount(m => m + 1);
            addPoints(25);
            showHint(`${RANK_LABELS[top.rank]}${top.suit} → foundation! +25`);
            if (checkWin(newG)) { setWon(true); addPoints(500); }
            return newG;
          });
          return;
        }
      }
      setSel(null);
      showHint('Cannot auto-stack');
    } else {
      setSel({ type: 'waste' });
      showHint(`Selected ${RANK_LABELS[top.rank]}${top.suit} — click target to place`);
    }
  }, [sel, won, game, addPoints, checkWin]);

  const handleFoundationClick = useCallback((fi: number) => {
    if (!sel || won) return;

    setGame(prev => {
      let srcCard: Card | undefined;
      if (sel.type === 'waste') {
        srcCard = prev.waste[prev.waste.length - 1];
      } else {
        const pile = prev.tableau[sel.col];
        const cards = pile.slice(sel.cardIdx);
        if (cards.length !== 1) { setSel(null); showHint('Only single cards can go to foundation'); return prev; }
        srcCard = cards[0];
      }

      if (!srcCard || !canPlaceOnFoundation(srcCard, prev.foundations[fi])) {
        setSel(null);
        showHint('Cannot place on this foundation');
        return prev;
      }

      const newG: GameState = {
        tableau: prev.tableau.map(p => [...p]),
        foundations: prev.foundations.map((f, i) => i === fi ? [...f, { ...srcCard!, faceUp: true }] : [...f]),
        stock: [...prev.stock],
        waste: [...prev.waste],
      };

      if (sel.type === 'tableau') {
        newG.tableau[sel.col] = prev.tableau[sel.col].slice(0, sel.cardIdx);
        flipTop(newG.tableau, sel.col);
      } else {
        newG.waste = prev.waste.slice(0, -1);
      }

      setSel(null);
      setMoveCount(m => m + 1);
      addPoints(25);
      showHint(`${RANK_LABELS[srcCard!.rank]}${srcCard!.suit} → foundation! +25`);
      if (checkWin(newG)) { setWon(true); addPoints(500); }
      return newG;
    });
  }, [sel, won, addPoints, checkWin]);

  const handleEmptyTableau = useCallback((col: number) => {
    if (!sel || won) return;

    setGame(prev => {
      let srcCards: Card[] = [];
      if (sel.type === 'waste') {
        const card = prev.waste[prev.waste.length - 1];
        srcCards = card ? [card] : [];
      } else {
        srcCards = prev.tableau[sel.col].slice(sel.cardIdx).filter(c => c.faceUp);
      }

      if (srcCards.length === 0 || srcCards[0].rank !== 13) {
        setSel(null);
        showHint('Only K can go on empty columns');
        return prev;
      }

      const newG: GameState = {
        tableau: prev.tableau.map(p => [...p]),
        foundations: prev.foundations.map(f => [...f]),
        stock: [...prev.stock],
        waste: [...prev.waste],
      };
      newG.tableau[col] = [...srcCards.map(c => ({ ...c, faceUp: true }))];

      if (sel.type === 'tableau') {
        newG.tableau[sel.col] = prev.tableau[sel.col].slice(0, sel.cardIdx);
        flipTop(newG.tableau, sel.col);
      } else {
        newG.waste = prev.waste.slice(0, -1);
      }

      setSel(null);
      setMoveCount(m => m + 1);
      addPoints(10);
      showHint('Move successful! +10');
      return newG;
    });
  }, [sel, won, addPoints]);

  const restart = () => {
    setGame(dealGame());
    setSel(null);
    setWon(false);
    setMoveCount(0);
    scoreAccum.current = 0;
    resetScore();
    showHint('New game! Click the deck to draw cards');
  };

  const isCardSelected = (source: Selection): boolean => {
    if (!sel || !source) return false;
    if (sel.type === 'waste' && source.type === 'waste') return true;
    if (sel.type === 'tableau' && source.type === 'tableau') {
      return sel.col === source.col && sel.cardIdx >= 0 && source.cardIdx >= sel.cardIdx;
    }
    return false;
  };

  const topWaste = game.waste.length > 0 ? game.waste[game.waste.length - 1] : null;

  // Card component
  const renderCard = (card: Card, onClick?: () => void, selected?: boolean, glowing?: boolean) => {
    const color = isRed(card.suit) ? '#b5651d' : '#e2e8f0';
    if (!card.faceUp) {
      return (
        <div
          className="rounded-md select-none"
          style={{
            width: 'min(12vw, 60px)', height: 'min(16.8vw, 84px)',
            background: 'repeating-linear-gradient(45deg, #3d2810, #3d2810 3px, #4a3418 3px, #4a3418 6px)',
            border: '1.5px solid rgba(205,127,50,0.3)',
            boxSizing: 'border-box',
          }}
          onClick={onClick}
        />
      );
    }
    return (
      <div
        className={`rounded-md flex flex-col p-1 select-none cursor-pointer active:scale-95 transition-all`}
        style={{
          width: 'min(12vw, 60px)', height: 'min(16.8vw, 84px)',
          background: selected ? '#2a1f10' : '#1a1410',
          border: selected ? '2px solid #cd7f32' : glowing ? '2px solid #cd7f32' : '1.5px solid rgba(205,127,50,0.3)',
          color,
          boxSizing: 'border-box',
          boxShadow: glowing ? '0 0 8px rgba(205,127,50,0.4)' : 'none',
        }}
        onClick={onClick}
      >
        <div className="leading-tight" style={{ fontSize: 'min(3.2vw, 14px)', fontWeight: 700 }}>
          {RANK_LABELS[card.rank]}{card.suit}
        </div>
      </div>
    );
  };

  const renderEmpty = (onClick?: () => void, label?: string, glowing?: boolean) => (
    <div
      className="rounded-md flex items-center justify-center cursor-pointer transition-all"
      style={{
        width: 'min(12vw, 60px)', height: 'min(16.8vw, 84px)',
        border: glowing ? '2px solid #cd7f32' : '2px dashed rgba(205,127,50,0.3)',
        background: glowing ? 'rgba(205,127,50,0.1)' : 'transparent',
        boxShadow: glowing ? '0 0 8px rgba(205,127,50,0.3)' : 'none',
      }}
      onClick={onClick}
    >
      {label && <span style={{ color: glowing ? '#cd7f32' : '#8b6914', fontSize: 'min(4vw, 16px)' }}>{label}</span>}
    </div>
  );

  return (
    <GameWrapper title={t.solitaire.title} score={score} highScore={highScore}
      controls={
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={restart} className="btn-premium">{t.common.newGame}</button>
          <button onClick={() => setShowRules(!showRules)} className="btn-ghost">
            {showRules ? t.common.closeRules : '❓ ' + t.common.rules}
          </button>
          <span className="text-gray-400 text-sm">
            {t.common.steps}: <span className="text-white font-bold">{moveCount}</span>
          </span>
          <LeaderboardPanel gameId="solitaire" currentScore={score} gameOver={won} />
        </div>
      }
    >
      <style>{`
        @keyframes solIdleHint {
          0%, 100% { box-shadow: 0 0 8px rgba(205,127,50,0.4); }
          50% { box-shadow: 0 0 18px rgba(205,127,50,0.7), 0 0 30px rgba(205,127,50,0.3); }
        }
      `}</style>
      <div className="flex flex-col gap-2 items-center w-full" style={{ touchAction: 'manipulation', maxWidth: 'min(98vw, 500px)' }}>

        {/* Rules overlay */}
        {showRules && (
          <div style={{
            width: '100%',
            borderRadius: 12,
            padding: '18px 24px',
            background: 'rgba(30,20,10,0.5)',
            border: '1px solid rgba(205,127,50,0.15)',
            lineHeight: 1.8,
            color: 'rgba(205,180,130,0.8)',
          }}>
            <p style={{ fontWeight: 700, color: '#e2c88c', marginBottom: 8, fontSize: 13 }}>⚙️ {t.common.rules}</p>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div>🎯 Goal: Sort all cards by suit A→K to the 4 foundation piles</div>
              <div>📋 Stack: Alternate red/black, descending rank (e.g. red Q on black K)</div>
              <div>👑 Empty column: Only K can be placed on empty columns</div>
              <div>🔄 Draw: Click the deck (top-left) to draw a new card</div>
            </div>
            <p style={{ fontWeight: 700, color: '#e2c88c', marginTop: 10, marginBottom: 6, fontSize: 13 }}>Controls</p>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div>① Click a card → yellow border = selected</div>
              <div>② Green glow → valid target</div>
              <div>③ Click target to complete the move</div>
              <div>④ Double-click to auto-send to foundation</div>
            </div>
          </div>
        )}

        {/* Hint bar */}
        <div style={{
          width: '100%',
          textAlign: 'center',
          padding: '12px 20px',
          borderRadius: 10,
          fontSize: 12,
          color: 'rgba(205,180,130,0.6)',
          background: 'rgba(30,20,10,0.4)',
          border: '1px solid rgba(205,127,50,0.1)',
          minHeight: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {hint}
        </div>

        {/* Top row: stock, waste, foundations */}
        <div className="flex gap-1.5 justify-between w-full">
          <div style={{
            animation: solIdle ? 'solIdleHint 1.2s ease-in-out infinite' : undefined,
            borderRadius: 6,
          }}>
          {game.stock.length > 0 ? (
            renderCard({ ...game.stock[0], faceUp: false } as Card, drawCard)
          ) : (
            renderEmpty(drawCard, '↺')
          )}
          </div>

          {topWaste ? (
            renderCard(topWaste, handleWasteTap, sel?.type === 'waste')
          ) : (
            renderEmpty()
          )}

          <div style={{ width: 'min(4vw, 16px)' }} />

          {game.foundations.map((pile, fi) => (
            pile.length > 0 ? (
              <div key={fi}>{renderCard(pile[pile.length - 1], () => handleFoundationClick(fi), false, isValidFoundation(fi))}</div>
            ) : (
              <div key={fi}>{renderEmpty(() => handleFoundationClick(fi), SUITS[fi], isValidFoundation(fi))}</div>
            )
          ))}
        </div>

        {/* Tableau */}
        <div className="flex gap-1 sm:gap-1.5 w-full justify-center" style={{ alignItems: 'flex-start' }}>
          {game.tableau.map((pile, col) => (
            <div key={col} className="relative" style={{ width: 'min(12vw, 60px)', minHeight: 'min(16.8vw, 84px)' }}>
              {pile.length === 0 ? (
                renderEmpty(
                  () => handleEmptyTableau(col),
                  sel ? 'K' : '',
                  sel !== null && selectedCard?.rank === 13,
                )
              ) : (
                pile.map((card, ci) => {
                  const source: Selection = { type: 'tableau', col, cardIdx: ci };
                  const topOffset = pile.slice(0, ci).reduce((acc, c) => {
                    return acc + (c.faceUp ? 24 : 8);
                  }, 0);
                  const isLast = ci === pile.length - 1;
                  const selected = isCardSelected(source);
                  const glow = isLast && card.faceUp && sel !== null && !selected && isValidTarget(col);

                  return (
                    <div
                      key={card.id}
                      style={{
                        position: ci === 0 ? 'relative' : 'absolute',
                        top: ci === 0 ? 0 : topOffset,
                        left: 0,
                        zIndex: ci,
                      }}
                    >
                      {renderCard(card, () => card.faceUp && handleSelect(source), selected, glow)}
                    </div>
                  );
                })
              )}
              <div style={{
                height: pile.reduce((acc, c, i) => {
                  if (i === pile.length - 1) return acc;
                  return acc + (c.faceUp ? 24 : 8);
                }, 0),
                pointerEvents: 'none',
              }} />
            </div>
          ))}
        </div>

        {won && (
          <div className="text-center py-4" style={{ animation: 'popIn 0.4s ease-out' }}>
            <div className="text-4xl mb-2" style={{ animation: 'bounce 1s ease-in-out infinite' }}>🎉</div>
            <p className="text-2xl font-black text-white mb-2">{t.solitaire.won}</p>
            <p className="text-[#c8a0e0] mb-3">Completed in {moveCount} moves</p>
            <button onClick={restart} className="btn-premium">{t.solitaire.again}</button>
          </div>
        )}
      </div>
    </GameWrapper>
  );
}
