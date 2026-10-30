import { ACHIEVEMENT_DEFS } from '../data/achievements';
import { TECH_DEFS } from '../data/technologies';
import type { GameSnapshot } from '../engine/Game';

interface Props {
  snap: GameSnapshot;
  onClose: () => void;
}

export default function StatsPanel({ snap, onClose }: Props) {
  const { population, time, buildings, tech, military, achievements } = snap;

  const totalBuildings = buildings.length;
  const completedBuildings = buildings.filter(b => b.constructionLeft === 0).length;

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)',
      zIndex: 85,
    }}>
      <div style={{
        width: 480,
        maxHeight: '80vh',
        background: 'rgba(10,10,30,0.97)',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.12)',
        padding: '20px',
        overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0 }}>📊 帝国统计</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <StatCard label="人口" value={`${population.total} / ${population.maxPop}`} color="#64b5f6" />
          <StatCard label="幸福度" value={`${population.happiness}%`} color={population.happiness >= 70 ? '#4caf50' : '#ffc107'} />
          <StatCard label="年份" value={`第${time.year}年`} color="#ce93d8" />
          <StatCard label="天数" value={`${time.day}`} color="#90a4ae" />
          <StatCard label="建筑" value={`${completedBuildings} / ${totalBuildings}`} color="#ffb74d" />
          <StatCard label="科技" value={`${tech.researched.length} / ${Object.keys(TECH_DEFS).length}`} color="#7c4dff" />
          <StatCard label="战斗胜率" value={military.totalBattles > 0 ? `${Math.round(military.totalWins / military.totalBattles * 100)}%` : '-'} color="#f44336" />
          <StatCard label="成就" value={`${achievements.unlocked.length} / ${achievements.total}`} color="#ffd700" />
        </div>

        <h4 style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 10 }}>🏆 成就</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {ACHIEVEMENT_DEFS.map(a => {
            const unlocked = achievements.unlocked.includes(a.id);
            return (
              <div key={a.id} style={{
                padding: '8px 10px',
                borderRadius: 8,
                background: unlocked ? 'rgba(255,215,0,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${unlocked ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.05)'}`,
                opacity: unlocked ? 1 : 0.4,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 16 }}>{a.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: unlocked ? '#ffd700' : '#888' }}>{a.title}</div>
                    <div style={{ fontSize: 9, color: '#888' }}>{a.description}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      padding: '10px 14px',
      borderRadius: 10,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ fontSize: 10, color: '#888', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}
