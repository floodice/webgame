import type { ActiveEvent } from '../systems/EventSystem';

interface Props {
  event: ActiveEvent;
  onResolve: (choiceIndex: number) => void;
}

export default function EventDialog({ event, onResolve }: Props) {
  const { def } = event;

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
          {def.choices.map((choice, i) => (
            <button
              key={i}
              onClick={() => onResolve(i)}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.05)',
                color: '#e0d0f0',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              }}
            >
              {choice.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
