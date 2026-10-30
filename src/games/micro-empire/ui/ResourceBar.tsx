import { RESOURCE_DEFS, ALL_RESOURCES } from '../data/resources';
import { rateSign } from '../utils/helpers';

interface Props {
  resources: Record<string, { amount: number; max: number; rate: number }>;
}

export default function ResourceBar({ resources }: Props) {
  return (
    <div style={{
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap',
      padding: '6px 10px',
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(8px)',
    }}>
      {ALL_RESOURCES.map(r => {
        const def = RESOURCE_DEFS[r];
        const data = resources[r];
        if (!data) return null;
        const pct = data.max > 0 ? (data.amount / data.max) * 100 : 0;
        const isLow = data.amount <= data.max * 0.1 && data.rate <= 0;
        const isFull = pct >= 95;
        return (
          <div key={r} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 8px',
            borderRadius: 6,
            background: isLow
              ? 'rgba(244,67,54,0.15)'
              : isFull
              ? 'rgba(76,175,80,0.1)'
              : 'rgba(255,255,255,0.05)',
            border: isLow ? '1px solid rgba(244,67,54,0.3)' : '1px solid transparent',
            fontSize: 12,
            minWidth: 100,
            animation: isLow ? 'resourcePulse 1.5s ease-in-out infinite' : undefined,
          }}>
            <span style={{ fontSize: 14 }}>{def.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{
                  color: isLow ? '#f44336' : def.color,
                  fontWeight: 700,
                  fontSize: 13,
                }}>
                  {Math.floor(data.amount)}
                  <span style={{ fontSize: 10, color: '#888', fontWeight: 400 }}>/{data.max}</span>
                </span>
                <span style={{
                  fontSize: 10,
                  color: data.rate > 0 ? '#4caf50' : data.rate < 0 ? '#f44336' : '#888',
                  fontWeight: 600,
                }}>
                  {rateSign(data.rate)}/天
                </span>
              </div>
              <div style={{
                height: 3,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.1)',
                marginTop: 2,
              }}>
                <div style={{
                  height: '100%',
                  borderRadius: 2,
                  width: `${Math.min(100, pct)}%`,
                  background: isLow ? '#f44336' : def.color,
                  transition: 'width 0.3s',
                }} />
              </div>
            </div>
            {isLow && <span style={{ fontSize: 10 }} title="资源告急">⚠️</span>}
          </div>
        );
      })}
      <style>{`
        @keyframes resourcePulse {
          0%, 100% { border-color: rgba(244,67,54,0.3); }
          50% { border-color: rgba(244,67,54,0.6); }
        }
      `}</style>
    </div>
  );
}
