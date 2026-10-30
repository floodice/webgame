import { Link } from 'react-router-dom';
import type { GameInfo } from '../utils/gameRegistry';
import { getHighScore } from '../utils/storage';
import { useI18n } from '../i18n';
import { getGameName, getGameDesc, getCatLabel } from '../i18n/gameNames';

interface Props { game: GameInfo }

const catColor: Record<string, { bg: string; text: string }> = {
  puzzle: { bg: 'rgba(59,130,246,0.12)', text: '#60a5fa' },
  arcade: { bg: 'rgba(16,185,129,0.12)', text: '#34d399' },
  strategy: { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24' },
  casual: { bg: 'rgba(236,72,153,0.12)', text: '#f472b6' },
};

export default function GameCard({ game }: Props) {
  const { t } = useI18n();
  const hs = getHighScore(game.id);
  const cc = catColor[game.categoryKey] ?? { bg: 'rgba(156,163,175,0.12)', text: '#9ca3af' };

  return (
    <Link
      to={game.path}
      style={{
        display: 'block',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.08)',
        background: '#151730',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = '#1c1e3e';
        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = '#151730';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ padding: '24px 24px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 36, lineHeight: 1 }}>{game.icon}</span>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '6px 14px',
            borderRadius: 12,
            background: cc.bg,
            color: cc.text,
          }}>
            {getCatLabel(t, game.categoryKey)}
          </span>
        </div>

        <h3 style={{
          fontSize: 16,
          fontWeight: 700,
          color: '#fff',
          margin: '0 0 8px 0',
          lineHeight: 1.3,
        }}>
          {getGameName(t, game.nameKey)}
        </h3>

        <p style={{
          fontSize: 13,
          color: '#9ca3af',
          margin: '0 0 16px 0',
          lineHeight: 1.6,
        }}>
          {getGameDesc(t, game.descKey)}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {hs > 0 ? (
            <span style={{ fontSize: 13, color: '#818cf8', fontWeight: 600 }}>🏆 {hs.toLocaleString()}</span>
          ) : (
            <span style={{ fontSize: 12, color: '#4b5563' }}>{t.common.clickToStart}</span>
          )}
          <span style={{ fontSize: 14, color: '#4b5563', transition: 'color 0.2s' }}>{t.common.play} →</span>
        </div>
      </div>
    </Link>
  );
}
