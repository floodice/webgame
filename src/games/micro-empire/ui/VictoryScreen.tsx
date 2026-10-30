import type { GameSnapshot } from '../engine/Game';

interface Props {
  snap: GameSnapshot;
  onContinue: () => void;
  onNewGame: () => void;
}

export default function VictoryScreen({ snap, onContinue, onNewGame }: Props) {
  const builtCount = snap.buildings.filter(b => b.constructionLeft === 0).length;
  const score =
    snap.time.year * 100 +
    snap.population.total * 10 +
    builtCount * 20 +
    snap.tech.researched.length * 50 +
    snap.achievements.unlocked.length * 30 +
    Math.floor(snap.resources.gold?.amount ?? 0);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.85)',
      zIndex: 200,
    }}>
      <div style={{
        width: 420,
        background: 'linear-gradient(135deg, rgba(30,20,60,0.98), rgba(15,10,35,0.98))',
        borderRadius: 20,
        border: '2px solid rgba(255,215,0,0.4)',
        padding: '32px 36px',
        textAlign: 'center',
        animation: 'popIn 0.5s ease-out',
        boxShadow: '0 0 60px rgba(255,215,0,0.15)',
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
        <h2 style={{ color: '#ffd700', fontSize: 24, fontWeight: 900, margin: '0 0 8px' }}>
          帝国荣光！
        </h2>
        <p style={{ color: '#ccc', fontSize: 13, margin: '0 0 20px', lineHeight: 1.6 }}>
          你从一片荒野中建立起了伟大的帝国，<br />
          帝国纪念碑矗立在你的城市中央，<br />
          向世界宣告你的不朽传奇。
        </p>

        <div style={{
          background: 'rgba(255,215,0,0.06)',
          border: '1px solid rgba(255,215,0,0.15)',
          borderRadius: 12,
          padding: '16px',
          marginBottom: 20,
          textAlign: 'left',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#ffd700', marginBottom: 10, textAlign: 'center' }}>
            📊 帝国统计
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 12 }}>
            <Stat label="历经年份" value={`${snap.time.year} 年`} />
            <Stat label="总人口" value={`${snap.population.total} 人`} />
            <Stat label="建筑数量" value={`${builtCount} 座`} />
            <Stat label="科技研发" value={`${snap.tech.researched.length} 项`} />
            <Stat label="成就解锁" value={`${snap.achievements.unlocked.length}/${snap.achievements.total}`} />
            <Stat label="金币储备" value={`${Math.floor(snap.resources.gold?.amount ?? 0)}`} />
            <Stat label="幸福度" value={`${snap.population.happiness}%`} />
            <Stat label="军事胜利" value={`${snap.military.totalWins} 次`} />
          </div>
          <div style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: '1px solid rgba(255,215,0,0.1)',
            textAlign: 'center',
          }}>
            <span style={{ fontSize: 11, color: '#888' }}>最终评分</span>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#ffd700', marginTop: 2 }}>
              {score.toLocaleString()} 分
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={onContinue} style={btnStyle('#7c4dff')}>
            继续游戏
          </button>
          <button onClick={onNewGame} style={btnStyle('#ffd700')}>
            🔄 开始新游戏
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span style={{ color: '#888' }}>{label}: </span>
      <span style={{ color: '#fff', fontWeight: 700 }}>{value}</span>
    </div>
  );
}

function btnStyle(color: string): React.CSSProperties {
  return {
    padding: '10px 24px',
    borderRadius: 10,
    border: `1px solid ${color}60`,
    background: `${color}20`,
    color,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  };
}
