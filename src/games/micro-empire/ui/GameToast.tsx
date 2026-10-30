interface ToastItem {
  id: number;
  text: string;
  type: 'info' | 'warn' | 'error' | 'success';
}

const TYPE_STYLES: Record<string, { bg: string; border: string; color: string }> = {
  info:    { bg: 'rgba(33,150,243,0.15)',  border: 'rgba(33,150,243,0.4)',  color: '#64b5f6' },
  warn:    { bg: 'rgba(255,193,7,0.15)',   border: 'rgba(255,193,7,0.4)',   color: '#ffc107' },
  error:   { bg: 'rgba(244,67,54,0.15)',   border: 'rgba(244,67,54,0.4)',   color: '#ef5350' },
  success: { bg: 'rgba(76,175,80,0.15)',   border: 'rgba(76,175,80,0.4)',   color: '#66bb6a' },
};

export default function GameToast({ toasts }: { toasts: ToastItem[] }) {
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 110,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      zIndex: 50,
      pointerEvents: 'none',
      alignItems: 'center',
    }}>
      {toasts.map(t => {
        const s = TYPE_STYLES[t.type] ?? TYPE_STYLES.info;
        return (
          <div
            key={t.id}
            style={{
              background: s.bg,
              border: `1px solid ${s.border}`,
              color: s.color,
              padding: '6px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              backdropFilter: 'blur(8px)',
              whiteSpace: 'nowrap',
              animation: 'toastIn 0.25s ease-out',
            }}
          >
            {t.text}
          </div>
        );
      })}
      <style>{`
        @keyframes toastIn {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
