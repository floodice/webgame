import { SEASON_NAMES, type Season } from '../utils/constants';

interface Props {
  dayInSeason: number;
  season: number;
  year: number;
  seasonProgress: number;
  paused: boolean;
  speed: number;
  population: { total: number; maxPop: number; happiness: number };
  defense: number;
  achievementCount: number;
  achievementTotal: number;
  onTogglePause: () => void;
  onSetSpeed: (s: number) => void;
  onOpenPopulation: () => void;
  onOpenTech: () => void;
  onOpenSave: () => void;
  onOpenTrade: () => void;
  onOpenStats: () => void;
  onOpenLeaderboard: () => void;
  tradeAvailable: boolean;
  nextInvasion: number;
}

export default function HUD({
  dayInSeason, season, year, seasonProgress, paused, speed,
  population, defense, achievementCount, achievementTotal,
  onTogglePause, onSetSpeed, onOpenPopulation, onOpenTech, onOpenSave, onOpenTrade, onOpenStats, onOpenLeaderboard,
  tradeAvailable, nextInvasion,
}: Props) {
  const seasonName = SEASON_NAMES[season as Season] ?? '?';
  const happinessColor = population.happiness >= 70 ? '#4caf50' : population.happiness >= 40 ? '#ffc107' : '#f44336';

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '6px 12px',
      background: 'rgba(0,0,0,0.75)',
      borderRadius: 10,
      backdropFilter: 'blur(8px)',
      gap: 10,
      flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>
          第{year}年 {seasonName}
          <span style={{ color: '#888', fontSize: 10, marginLeft: 4 }}>第{dayInSeason}天</span>
        </div>
        <div style={{ width: 50, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)' }}>
          <div style={{
            height: '100%', borderRadius: 2,
            width: `${seasonProgress * 100}%`,
            background: season === 0 ? '#66bb6a' : season === 1 ? '#ffa726' : season === 2 ? '#ef5350' : '#42a5f5',
            transition: 'width 0.3s',
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 11, color: '#64b5f6' }}>👥 {population.total}/{population.maxPop}</span>
        <span style={{ fontSize: 11, color: happinessColor }}>😊 {population.happiness}%</span>
        <span style={{ fontSize: 11, color: '#ff9800' }}>🛡️ {defense}</span>
        {nextInvasion <= 20 && (
          <span style={{ fontSize: 11, color: '#f44336', fontWeight: 700, animation: 'pulse 1s infinite' }}>⚠️ 入侵将至!</span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <button
          onClick={onTogglePause}
          style={{
            padding: '3px 10px', borderRadius: 6,
            border: 'none',
            background: paused ? 'rgba(255,235,59,0.15)' : 'rgba(255,255,255,0.08)',
            color: paused ? '#ffeb3b' : '#ccc',
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}
        >
          {paused ? '▶' : '⏸'}
        </button>
        {[1, 2, 3].map(s => (
          <button
            key={s}
            onClick={() => onSetSpeed(s)}
            style={{
              padding: '3px 8px', borderRadius: 6,
              border: 'none',
              background: speed === s ? 'rgba(255,255,255,0.15)' : 'transparent',
              color: speed === s ? '#fff' : '#888',
              fontSize: 11, fontWeight: 700, cursor: 'pointer',
            }}
          >
            {s}x
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 4 }}>
        <button
          onClick={onOpenPopulation}
          style={toolBtnStyle}
          title="人口管理"
        >👥</button>
        <button
          onClick={onOpenTech}
          style={toolBtnStyle}
          title="科技树"
        >🔬</button>
        {tradeAvailable && (
          <button
            onClick={onOpenTrade}
            style={{ ...toolBtnStyle, background: 'rgba(255,152,0,0.15)', borderColor: 'rgba(255,152,0,0.3)' }}
            title="贸易"
          >🏪</button>
        )}
        <button
          onClick={onOpenLeaderboard}
          style={{ ...toolBtnStyle, background: 'rgba(255,215,0,0.1)', borderColor: 'rgba(255,215,0,0.2)' }}
          title="排行榜"
        >🏆</button>
        <button
          onClick={onOpenStats}
          style={toolBtnStyle}
          title="统计"
        >📊</button>
        <button
          onClick={onOpenSave}
          style={toolBtnStyle}
          title="存档"
        >💾</button>
        <span style={{ fontSize: 10, color: '#888', alignSelf: 'center', marginLeft: 4 }}>
          🏆 {achievementCount}/{achievementTotal}
        </span>
      </div>
    </div>
  );
}

const toolBtnStyle: React.CSSProperties = {
  width: 30, height: 28,
  borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.05)',
  fontSize: 14,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
