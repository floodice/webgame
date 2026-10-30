import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { games, type CategoryKey } from '../utils/gameRegistry';
import { getHighScore } from '../utils/storage';
import { useI18n, fmt } from '../i18n';
import { getGameName, getGameDesc, getCatLabel, getCatDesc } from '../i18n/gameNames';

/* ── Wacky category visuals ── */
interface CatStyle {
  emoji: string;
  gradient: string;
  accent: string;
  accentRgb: string;
  border: string;
  tagBg: string;
  tagText: string;
  wobble: string;
  sticker: string;
}

const CAT_STYLES: Record<Exclude<CategoryKey, 'all'>, CatStyle> = {
  puzzle: {
    emoji: '🧠',
    gradient: 'linear-gradient(135deg, rgba(191,90,242,0.15) 0%, rgba(130,50,200,0.08) 100%)',
    accent: '#bf5af2',
    accentRgb: '191,90,242',
    border: 'rgba(191,90,242,0.3)',
    tagBg: 'rgba(191,90,242,0.15)',
    tagText: '#d494ff',
    wobble: 'rotate(-1deg)',
    sticker: '🤓',
  },
  arcade: {
    emoji: '🕹️',
    gradient: 'linear-gradient(135deg, rgba(57,255,20,0.12) 0%, rgba(0,200,100,0.06) 100%)',
    accent: '#39ff14',
    accentRgb: '57,255,20',
    border: 'rgba(57,255,20,0.3)',
    tagBg: 'rgba(57,255,20,0.12)',
    tagText: '#39ff14',
    wobble: 'rotate(1deg)',
    sticker: '💪',
  },
  strategy: {
    emoji: '♟️',
    gradient: 'linear-gradient(135deg, rgba(255,233,62,0.12) 0%, rgba(255,150,20,0.06) 100%)',
    accent: '#ffe93e',
    accentRgb: '255,233,62',
    border: 'rgba(255,233,62,0.3)',
    tagBg: 'rgba(255,233,62,0.12)',
    tagText: '#ffe93e',
    wobble: 'rotate(0.5deg)',
    sticker: '🧐',
  },
  casual: {
    emoji: '🎯',
    gradient: 'linear-gradient(135deg, rgba(255,45,149,0.12) 0%, rgba(255,100,175,0.06) 100%)',
    accent: '#ff2d95',
    accentRgb: '255,45,149',
    border: 'rgba(255,45,149,0.3)',
    tagBg: 'rgba(255,45,149,0.12)',
    tagText: '#ff6baf',
    wobble: 'rotate(-0.5deg)',
    sticker: '😜',
  },
};

const SECTION_ORDER: Exclude<CategoryKey, 'all'>[] = ['puzzle', 'arcade', 'strategy', 'casual'];

const CARD_TILTS = [-2.5, 1.5, -1, 2, -1.5, 1, 0.5, -2, 1.8, -0.8, 2.2, -1.2, 0.7, -1.8, 1.3, -0.5, 2.5, -2.2, 1.1];

const FUNKY_BORDERS = [
  'rgba(255,45,149,0.4)',
  'rgba(57,255,20,0.4)',
  'rgba(255,233,62,0.4)',
  'rgba(0,240,255,0.4)',
  'rgba(191,90,242,0.4)',
  'rgba(255,107,43,0.4)',
];

export default function Home() {
  const { t } = useI18n();
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);

  const scrollTo = (cat: string) => {
    sectionRefs.current[cat]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const addSparkle = (e: React.MouseEvent) => {
    const emojis = ['✨', '⚡', '💥', '🌟', '💫', '🎉', '🔥', '💖'];
    const id = Date.now();
    setSparkles(prev => [...prev, {
      id,
      x: e.clientX + (Math.random() - 0.5) * 40,
      y: e.clientY + (Math.random() - 0.5) * 40,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    }]);
    setTimeout(() => setSparkles(prev => prev.filter(s => s.id !== id)), 800);
  };

  return (
    <div
      onClick={addSparkle}
      style={{ width: '100%', maxWidth: 1100, margin: '0 auto', padding: '28px 24px 60px', position: 'relative' }}
    >
      {/* Click sparkle effects */}
      {sparkles.map(s => (
        <div key={s.id} style={{
          position: 'fixed', left: s.x, top: s.y, fontSize: 24, pointerEvents: 'none', zIndex: 999,
          animation: 'sparkle 0.8s ease-out forwards',
        }}>
          {s.emoji}
        </div>
      ))}

      {/* ── Hero ── */}
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <div style={{
          fontSize: 50, marginBottom: 8,
          animation: 'bounce 2s ease-in-out infinite',
        }}>🎪</div>
        <h1 style={{
          fontSize: 42, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 6, lineHeight: 1.2,
          animation: 'popIn 0.5s ease-out',
        }}>
          <span style={{
            background: 'linear-gradient(135deg, #ff2d95, #ff6b2b, #ffe93e)',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 3s ease infinite',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Game</span>
          <span style={{
            background: 'linear-gradient(135deg, #39ff14, #00f0ff, #bf5af2)',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 3s ease infinite 0.5s',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Hub</span>
        </h1>
        <p style={{
          fontSize: 15, color: '#c8a0e0', margin: '0 0 6px',
          animation: 'fadeIn 0.5s ease 0.2s both',
          fontWeight: 600,
        }}>
          {fmt(t.home.subtitle, { n: games.length })}
        </p>
        <p style={{
          fontSize: 11, color: 'rgba(255,45,149,0.5)', letterSpacing: 2,
          fontWeight: 700, textTransform: 'uppercase',
          animation: 'fadeIn 0.5s ease 0.3s both',
        }}>
          ⚡ NO ADS · NO DOWNLOADS · JUST FUN ⚡
        </p>

        {/* Category nav pills */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap',
          marginTop: 24,
        }}>
          {SECTION_ORDER.map((cat, i) => {
            const s = CAT_STYLES[cat];
            return (
              <button
                key={cat}
                onClick={() => scrollTo(cat)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 22px', borderRadius: 16,
                  fontSize: 14, fontWeight: 800,
                  border: `2px solid ${s.border}`,
                  background: s.gradient,
                  color: s.accent,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  animation: `popIn 0.4s ease ${200 + i * 100}ms both`,
                  transform: `rotate(${(i % 2 === 0 ? -1 : 1) * 1.5}deg)`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = `0 6px 24px rgba(${s.accentRgb},0.35)`;
                  e.currentTarget.style.borderColor = s.accent;
                  e.currentTarget.style.transform = 'rotate(0deg) scale(1.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = s.border;
                  e.currentTarget.style.transform = `rotate(${(i % 2 === 0 ? -1 : 1) * 1.5}deg)`;
                }}
              >
                <span style={{ fontSize: 20, animation: 'wiggle 1.5s ease-in-out infinite' }}>{s.emoji}</span>
                {getCatLabel(t, cat)}
                <span style={{
                  fontSize: 11, fontWeight: 900,
                  background: s.tagBg, color: s.tagText,
                  padding: '2px 8px', borderRadius: 10,
                }}>
                  {games.filter(g => g.categoryKey === cat).length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Category Sections ── */}
      {SECTION_ORDER.map((cat, si) => {
        const s = CAT_STYLES[cat];
        const catGames = games.filter(g => g.categoryKey === cat);

        return (
          <section
            key={cat}
            ref={el => { sectionRefs.current[cat] = el; }}
            style={{ marginBottom: 52, scrollMarginTop: 76 }}
          >
            {/* Section header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22,
              paddingBottom: 16,
              borderBottom: `3px dashed ${s.border}`,
              animation: `slideUp 0.4s ease ${si * 80}ms both`,
            }}>
              <div style={{
                width: 50, height: 50, borderRadius: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26,
                background: s.gradient,
                border: `2px solid ${s.border}`,
                boxShadow: `0 0 20px rgba(${s.accentRgb},0.2)`,
                animation: 'float 3s ease-in-out infinite',
                position: 'relative',
              }}>
                {s.emoji}
                <span style={{
                  position: 'absolute', top: -6, right: -6,
                  fontSize: 14,
                  animation: 'bounce 1.5s ease-in-out infinite',
                }}>{s.sticker}</span>
              </div>
              <div>
                <h2 style={{
                  fontSize: 22, fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.3,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  {getCatLabel(t, cat)}
                  <span style={{
                    fontSize: 12, fontWeight: 800,
                    padding: '3px 12px', borderRadius: 10,
                    background: s.tagBg, color: s.tagText,
                    border: `1px solid ${s.border}`,
                    animation: 'jelly 2s ease-in-out infinite',
                    display: 'inline-block',
                  }}>
                    {fmt(t.cat.count, { n: catGames.length })}
                  </span>
                </h2>
                <p style={{ fontSize: 13, color: '#a080c0', margin: '4px 0 0', fontWeight: 600 }}>
                  {getCatDesc(t, cat)}
                </p>
              </div>
            </div>

            {/* Game cards grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
              gap: 18,
            }}>
              {catGames.map((game, i) => {
                const hs = getHighScore(game.id);
                const tilt = CARD_TILTS[(si * 6 + i) % CARD_TILTS.length];
                const borderColor = FUNKY_BORDERS[(si * 6 + i) % FUNKY_BORDERS.length];

                return (
                  <Link
                    key={game.id}
                    to={game.path}
                    style={{
                      display: 'flex', flexDirection: 'column',
                      borderRadius: 18,
                      border: `2.5px solid ${borderColor}`,
                      background: s.gradient,
                      textDecoration: 'none', color: 'inherit',
                      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      overflow: 'hidden',
                      animation: `slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${si * 60 + i * 60}ms both`,
                      transform: `rotate(${tilt}deg)`,
                      position: 'relative',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = s.accent;
                      e.currentTarget.style.transform = 'rotate(0deg) translateY(-8px) scale(1.05)';
                      e.currentTarget.style.boxShadow = `0 12px 32px rgba(${s.accentRgb},0.3), 0 0 0 2px rgba(${s.accentRgb},0.1)`;
                      e.currentTarget.style.zIndex = '10';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = borderColor;
                      e.currentTarget.style.transform = `rotate(${tilt}deg)`;
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.zIndex = '1';
                    }}
                  >
                    {/* Fun tape decoration on top-left */}
                    <div style={{
                      position: 'absolute', top: -4, left: 14,
                      width: 30, height: 12,
                      background: `linear-gradient(135deg, ${s.accent}80, ${s.accent}40)`,
                      borderRadius: '0 0 4px 4px',
                      zIndex: 2,
                    }} />

                    <div style={{ padding: '20px 18px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                        <span style={{
                          fontSize: 34, lineHeight: 1,
                          width: 48, height: 48,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          borderRadius: 14,
                          background: 'rgba(255,255,255,0.06)',
                          border: `2px dashed rgba(${s.accentRgb},0.25)`,
                          flexShrink: 0,
                          animation: `float ${2.5 + i * 0.3}s ease-in-out infinite`,
                        }}>
                          {game.icon}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <h3 style={{
                            fontSize: 16, fontWeight: 800, color: '#fff',
                            margin: 0, lineHeight: 1.3,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {getGameName(t, game.nameKey)}
                          </h3>
                          <p style={{
                            fontSize: 12, color: '#b090d0', margin: '3px 0 0',
                            lineHeight: 1.5, fontWeight: 500,
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}>
                            {getGameDesc(t, game.descKey)}
                          </p>
                        </div>
                      </div>

                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        paddingTop: 10,
                        borderTop: `2px dotted rgba(${s.accentRgb},0.15)`,
                      }}>
                        {hs > 0 ? (
                          <span style={{
                            fontSize: 12, color: s.accent, fontWeight: 800,
                            textShadow: `0 0 8px rgba(${s.accentRgb},0.4)`,
                          }}>
                            🏆 {hs.toLocaleString()}
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, color: '#7060a0', fontWeight: 600 }}>
                            {t.home.clickToStart}
                          </span>
                        )}
                        <span style={{
                          fontSize: 12, fontWeight: 800, color: '#fff',
                          background: `linear-gradient(135deg, ${s.accent}, rgba(${s.accentRgb},0.6))`,
                          padding: '3px 10px', borderRadius: 8,
                          transition: 'all 0.2s',
                        }}>
                          {t.home.enter}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Fun floating decoration */}
      <div style={{
        position: 'fixed', bottom: 20, right: 20,
        fontSize: 30, opacity: 0.15, pointerEvents: 'none',
        animation: 'float 4s ease-in-out infinite',
      }}>🎮</div>
    </div>
  );
}
