import { ALL_JOBS, JOB_LABELS } from '../systems/PopulationSystem';

interface Props {
  population: { total: number; maxPop: number; happiness: number; workers: Record<string, number> };
  onAssign: (job: string, delta: number) => void;
  onClose: () => void;
}

export default function PopulationPanel({ population, onAssign, onClose }: Props) {
  const { total, maxPop, happiness, workers } = population;

  return (
    <div style={{
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      width: 320,
      background: 'rgba(10,10,30,0.95)',
      borderRadius: 14,
      border: '1px solid rgba(255,255,255,0.12)',
      backdropFilter: 'blur(12px)',
      padding: '18px 20px',
      zIndex: 50,
      animation: 'popIn 0.2s ease-out',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0 }}>👥 人口管理</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 16 }}>✕</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 14, textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#64b5f6' }}>{total}</div>
          <div style={{ fontSize: 10, color: '#888' }}>人口 / {maxPop}</div>
        </div>
        <div>
          <div style={{
            fontSize: 20,
            fontWeight: 800,
            color: happiness >= 70 ? '#4caf50' : happiness >= 40 ? '#ffc107' : '#f44336',
          }}>
            {happiness}%
          </div>
          <div style={{ fontSize: 10, color: '#888' }}>幸福度</div>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#ce93d8' }}>{workers.idle ?? 0}</div>
          <div style={{ fontSize: 10, color: '#888' }}>闲置</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {ALL_JOBS.filter(j => j !== 'idle').map(job => (
          <div key={job} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 10px',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.03)',
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#ddd', width: 50 }}>{JOB_LABELS[job]}</span>
            <button
              onClick={() => onAssign(job, -1)}
              disabled={(workers[job] ?? 0) <= 0}
              style={{
                width: 24, height: 24, borderRadius: 6,
                border: 'none',
                background: 'rgba(244,67,54,0.15)',
                color: '#f44336',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                opacity: (workers[job] ?? 0) <= 0 ? 0.3 : 1,
              }}
            >-</button>
            <span style={{
              width: 28,
              textAlign: 'center',
              fontSize: 14,
              fontWeight: 700,
              color: '#fff',
            }}>{workers[job] ?? 0}</span>
            <button
              onClick={() => onAssign(job, 1)}
              disabled={(workers.idle ?? 0) <= 0}
              style={{
                width: 24, height: 24, borderRadius: 6,
                border: 'none',
                background: 'rgba(76,175,80,0.15)',
                color: '#4caf50',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                opacity: (workers.idle ?? 0) <= 0 ? 0.3 : 1,
              }}
            >+</button>
          </div>
        ))}
      </div>
    </div>
  );
}
