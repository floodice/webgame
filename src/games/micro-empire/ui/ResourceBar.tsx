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
      background: 'rgba(0,0,0,0.7)',
      borderRadius: 10,
      backdropFilter: 'blur(8px)',
    }}>
      {ALL_RESOURCES.map(r => {
        const def = RESOURCE_DEFS[r];
        const data = resources[r];
        if (!data) return null;
        const pct = data.max > 0 ? (data.amount / data.max) * 100 : 0;
        return (
          <div key={r} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 8px',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.05)',
            fontSize: 12,
            minWidth: 90,
          }}>
            <span style={{ fontSize: 14 }}>{def.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ color: def.color, fontWeight: 700, fontSize: 13 }}>
                  {Math.floor(data.amount)}
                </span>
                <span style={{
                  fontSize: 10,
                  color: data.rate > 0 ? '#4caf50' : data.rate < 0 ? '#f44336' : '#888',
                  fontWeight: 600,
                }}>
                  {rateSign(data.rate)}/s
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
                  background: def.color,
                  transition: 'width 0.3s',
                }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
