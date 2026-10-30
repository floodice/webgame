import { useState, useEffect, useCallback } from 'react';
import {
  fetchLeaderboard,
  submitScore,
  getPlayerName,
  setPlayerName,
  type ScoreEntry,
  type SubmitResult,
} from '../utils/api';
import { useI18n, fmt } from '../i18n';

interface Props {
  gameId: string;
  currentScore: number;
  gameOver: boolean;
  scoreLabel?: string;
  detail?: string;
}

export default function LeaderboardPanel({
  gameId,
  currentScore,
  gameOver,
  scoreLabel,
  detail,
}: Props) {
  const { t } = useI18n();
  const sl = scoreLabel ?? t.common.score;
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(() => getPlayerName());
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const loadBoard = useCallback(async () => {
    setLoading(true);
    const data = await fetchLeaderboard(gameId);
    if (data) {
      setEntries(data.entries);
    }
    setLoading(false);
  }, [gameId]);

  useEffect(() => {
    if (open) loadBoard();
  }, [open, loadBoard]);

  useEffect(() => {
    if (!gameOver) setSubmitted(false);
  }, [gameOver]);

  const handleSubmit = async () => {
    if (!name.trim() || currentScore <= 0) return;
    setPlayerName(name.trim());
    const result = await submitScore(gameId, currentScore, detail);
    if (result) {
      setSubmitResult(result);
      setSubmitted(true);
      loadBoard();
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          padding: '5px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700,
          cursor: 'pointer', transition: 'all 0.2s',
          background: 'rgba(255,45,149,0.12)', border: '2px solid rgba(255,45,149,0.25)',
          color: '#ff6baf',
        }}
      >
        {t.lb.btn}
      </button>
    );
  }

  return (
    <div style={{
      background: 'rgba(40,15,70,0.95)', borderRadius: 16,
      border: '2px solid rgba(255,45,149,0.3)', padding: 16,
      maxWidth: 360, width: '100%',
      backdropFilter: 'blur(12px)',
      animation: 'popIn 0.3s ease-out',
      boxShadow: '0 8px 30px rgba(255,45,149,0.15)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ color: '#ff2d95', fontWeight: 800, fontSize: 15 }}>
          {t.lb.title}
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          style={{
            background: 'rgba(255,45,149,0.1)', border: '1px solid rgba(255,45,149,0.2)',
            borderRadius: 8,
            color: '#ff6baf',
            cursor: 'pointer', fontSize: 14, lineHeight: 1,
            padding: '4px 8px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,45,149,0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,45,149,0.1)'; }}
        >✕</button>
      </div>

      {gameOver && currentScore > 0 && !submitted && (
        <div style={{
          display: 'flex', gap: 6, marginBottom: 12,
          padding: 10, borderRadius: 10,
          background: 'rgba(255,45,149,0.08)', border: '2px dashed rgba(255,45,149,0.2)',
        }}>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t.lb.enterName}
            maxLength={20}
            style={{
              flex: 1, padding: '6px 10px', borderRadius: 8, fontSize: 13,
              background: 'rgba(0,0,0,0.3)', border: '2px solid rgba(255,45,149,0.15)',
              color: '#fff', outline: 'none', fontWeight: 600,
            }}
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim()}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 800,
              cursor: name.trim() ? 'pointer' : 'default',
              background: name.trim()
                ? 'linear-gradient(135deg, #ff2d95, #ff6b2b)'
                : 'rgba(255,45,149,0.2)',
              border: 'none', color: '#fff',
              transition: 'all 0.2s',
            }}
          >
            {fmt(t.lb.submit, { score: currentScore })}
          </button>
        </div>
      )}

      {submitted && submitResult && (
        <div style={{
          textAlign: 'center', padding: 8, marginBottom: 10,
          borderRadius: 10, background: 'rgba(57,255,20,0.1)',
          border: '2px solid rgba(57,255,20,0.25)',
          color: '#39ff14', fontSize: 13, fontWeight: 800,
          animation: 'jelly 0.5s ease-out',
        }}>
          {fmt(t.lb.rank, { rank: submitResult.rank, total: submitResult.total })}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 20, color: '#c8a0e0', fontSize: 12, fontWeight: 600 }}>
          {t.lb.loading}
        </div>
      ) : entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 20, color: '#7060a0', fontSize: 13, fontWeight: 600 }}>
          {t.lb.noRecords}
        </div>
      ) : (
        <div style={{ maxHeight: 240, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ color: '#c8a0e0', borderBottom: '2px dashed rgba(255,45,149,0.15)' }}>
                <th style={{ padding: '6px 4px', textAlign: 'left', width: 30, fontWeight: 800 }}>#</th>
                <th style={{ padding: '6px 4px', textAlign: 'left', fontWeight: 800 }}>{t.lb.player}</th>
                <th style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 800 }}>{sl}</th>
              </tr>
            </thead>
            <tbody>
              {entries.slice(0, 20).map((e, i) => (
                <tr key={`${e.ts}-${i}`} style={{
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  color: i < 3 ? ['#ffe93e', '#c0c0c0', '#ff6b2b'][i] : '#c8a0e0',
                  fontWeight: i < 3 ? 800 : 500,
                }}>
                  <td style={{ padding: '5px 4px' }}>
                    {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                  </td>
                  <td style={{ padding: '5px 4px' }}>
                    {e.name}
                    {e.detail && <span style={{ marginLeft: 4, opacity: 0.5, fontSize: 10 }}>{e.detail}</span>}
                  </td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {e.score.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        type="button"
        onClick={loadBoard}
        style={{
          display: 'block', width: '100%', marginTop: 8,
          padding: '6px', borderRadius: 8, fontSize: 11, fontWeight: 700,
          cursor: 'pointer', textAlign: 'center',
          background: 'rgba(255,45,149,0.06)',
          border: '2px dashed rgba(255,45,149,0.15)',
          color: '#c8a0e0',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderStyle = 'solid'; e.currentTarget.style.color = '#ff6baf'; }}
        onMouseLeave={e => { e.currentTarget.style.borderStyle = 'dashed'; e.currentTarget.style.color = '#c8a0e0'; }}
      >
        {t.lb.refresh}
      </button>
    </div>
  );
}
