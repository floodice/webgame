import type { ActiveEvent } from '../systems/EventSystem';

interface Props {
  event: ActiveEvent;
  onResolve: (choiceIndex: number) => void;
}

export default function EventDialog({ event, onResolve }: Props) {
  const { def, affordable } = event;

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)',
      zIndex: 100,
    }}>
      <div style={{
        width: 340,
        background: 'rgba(15,12,40,0.97)',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.15)',
        padding: '20px 24px',
        animation: 'popIn 0.3s ease-out',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{def.icon}</div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>{def.title}</h3>
        </div>
        <p style={{ fontSize: 13, color: '#c0b0d0', lineHeight: 1.7, textAlign: 'center', marginBottom: 16 }}>
          {def.description}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {def.choices.map((choice, i) => {
            const canAfford = affordable?.[i] !== false;
            return (
              <button
                key={i}
                onClick={() => canAfford && onResolve(i)}
                disabled={!canAfford}
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: `1px solid ${canAfford ? 'rgba(255,255,255,0.12)' : 'rgba(244,67,54,0.2)'}`,
                  background: canAfford ? 'rgba(255,255,255,0.05)' : 'rgba(244,67,54,0.05)',
                  color: canAfford ? '#e0d0f0' : '#886060',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: canAfford ? 'pointer' : 'not-allowed',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                  opacity: canAfford ? 1 : 0.6,
                }}
                onMouseEnter={e => {
                  if (!canAfford) return;
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                }}
                onMouseLeave={e => {
                  if (!canAfford) return;
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                }}
              >
                {choice.label}
                {!canAfford && <span style={{ fontSize: 10, color: '#f44336', marginLeft: 6 }}>（资源不足）</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
