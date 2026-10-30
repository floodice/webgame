import { useState, useEffect } from 'react';
import {
  cloudGetLeaderboard, cloudSubmitScore, isCloudLoggedIn,
  type LeaderboardEntry,
} from '../utils/cloudApi';
import type { GameSnapshot } from '../engine/Game';

interface Props {
  snap: GameSnapshot;
  onClose: () => void;
}

export default function LeaderboardPanel({ snap, onClose }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ rank: number; score: number } | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await cloudGetLeaderboard();
      setEntries(data);
      setLoading(false);
    })();
  }, []);

  const handleSubmit = async () => {
    if (!isCloudLoggedIn()) {
      setMsg('请先在存档面板中登录云账号');
      return;
    }
    setSubmitting(true);
    setMsg('');

    const completedBuildings = snap.buildings.filter(b => b.constructionLeft === 0).length;
    const result = await cloudSubmitScore({
      year: snap.time.year,
      population: snap.population.total,
      buildings: completedBuildings,
      techs: snap.tech.researched.length,
      achievements: snap.achievements.unlocked.length,
      victories: snap.military.totalWins,
    });

    setSubmitting(false);
    if (result) {
      setSubmitResult(result);
      setMsg(`🏆 排名第 ${result.rank}！综合分 ${result.score}`);
      const data = await cloudGetLeaderboard();
      setEntries(data);
    } else {
      setMsg('❌ 提交失败，请重试');
    }
  };

  const myScore = submitResult?.score ?? 0;

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)',
      zIndex: 90,
    }}>
      <div style={{
        width: 500,
        maxHeight: '85vh',
        background: 'rgba(10,10,30,0.97)',
        borderRadius: 16,
        border: '1px solid rgba(255,215,0,0.15)',
        padding: '20px',
        overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#ffd700', margin: 0 }}>🏆 帝国排行榜</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>

        {/* Submit score */}
        <div style={{
          padding: '12px 16px',
          borderRadius: 10,
          background: 'rgba(255,215,0,0.05)',
          border: '1px solid rgba(255,215,0,0.12)',
          marginBottom: 14,
        }}>
          <div style={{ fontSize: 12, color: '#c0b0d0', marginBottom: 8 }}>
            综合分 = 人口×10 + 建筑×5 + 科技×20 + 成就×50 + 战胜×30 + 年份×2
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            <MiniStat label="人口" value={snap.population.total} />
            <MiniStat label="建筑" value={snap.buildings.filter(b => b.constructionLeft === 0).length} />
            <MiniStat label="科技" value={snap.tech.researched.length} />
            <MiniStat label="成就" value={snap.achievements.unlocked.length} />
            <MiniStat label="战胜" value={snap.military.totalWins} />
            <MiniStat label="年份" value={snap.time.year} />
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: '100%',
              padding: '8px 0',
              borderRadius: 8,
              border: '1px solid rgba(255,215,0,0.3)',
              background: submitting ? 'rgba(255,215,0,0.05)' : 'rgba(255,215,0,0.12)',
              color: '#ffd700',
              fontSize: 13,
              fontWeight: 700,
              cursor: submitting ? 'wait' : 'pointer',
            }}
          >
            {submitting ? '提交中...' : submitResult ? `✅ 已提交 (分数: ${myScore})` : '📤 提交我的成绩'}
          </button>
          {msg && (
            <div style={{ marginTop: 6, fontSize: 11, color: msg.includes('❌') ? '#f44336' : '#4caf50', textAlign: 'center' }}>
              {msg}
            </div>
          )}
        </div>

        {/* Leaderboard table */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#888', padding: 30, fontSize: 12 }}>加载排行榜...</div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#666', padding: 30, fontSize: 12 }}>
            暂无数据，成为第一个上榜的帝国吧！
          </div>
        ) : (
          <div>
            <div style={{ ...rowStyle, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 6, marginBottom: 4 }}>
              <span style={{ width: 30, color: '#888', fontSize: 10 }}>#</span>
              <span style={{ flex: 1, color: '#888', fontSize: 10 }}>帝国</span>
              <span style={{ width: 60, color: '#888', fontSize: 10, textAlign: 'right' }}>分数</span>
              <span style={{ width: 40, color: '#888', fontSize: 10, textAlign: 'right' }}>年份</span>
              <span style={{ width: 40, color: '#888', fontSize: 10, textAlign: 'right' }}>人口</span>
              <span style={{ width: 40, color: '#888', fontSize: 10, textAlign: 'right' }}>科技</span>
            </div>
            {entries.map((e, i) => {
              const isTop3 = i < 3;
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <div key={`${e.name}-${e.ts}`} style={{
                  ...rowStyle,
                  padding: '6px 0',
                  background: isTop3 ? `rgba(255,215,0,${0.04 - i * 0.01})` : 'transparent',
                  borderRadius: 4,
                }}>
                  <span style={{ width: 30, fontSize: 12, fontWeight: 700, color: isTop3 ? '#ffd700' : '#888' }}>
                    {isTop3 ? medals[i] : i + 1}
                  </span>
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#e0d0f0' }}>
                    {e.name}
                  </span>
                  <span style={{ width: 60, fontSize: 12, fontWeight: 800, color: '#ffd700', textAlign: 'right' }}>
                    {e.score.toLocaleString()}
                  </span>
                  <span style={{ width: 40, fontSize: 11, color: '#ce93d8', textAlign: 'right' }}>
                    {e.year}年
                  </span>
                  <span style={{ width: 40, fontSize: 11, color: '#64b5f6', textAlign: 'right' }}>
                    {e.population}
                  </span>
                  <span style={{ width: 40, fontSize: 11, color: '#7c4dff', textAlign: 'right' }}>
                    {e.techs}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      padding: '4px 10px',
      borderRadius: 6,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.06)',
      fontSize: 11,
      color: '#ccc',
    }}>
      {label} <span style={{ fontWeight: 800, color: '#fff' }}>{value}</span>
    </div>
  );
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};
