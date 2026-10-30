import { RESOURCE_DEFS } from '../data/resources';
import type { TradeOffer } from '../systems/TradeSystem';

interface Props {
  offers: TradeOffer[];
  resources: Record<string, { amount: number }>;
  onTrade: (index: number) => void;
  onClose: () => void;
}

export default function TradePanel({ offers, resources, onTrade, onClose }: Props) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)',
      zIndex: 70,
    }}>
      <div style={{
        width: 380,
        background: 'rgba(10,10,30,0.97)',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.12)',
        padding: '20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0 }}>🏪 商人来访</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>

        <p style={{ fontSize: 12, color: '#aaa', marginBottom: 14 }}>一位旅行商人带来了交易机会。</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {offers.length === 0 ? (
            <div style={{ fontSize: 13, color: '#888', textAlign: 'center', padding: 20 }}>
              所有交易已完成
            </div>
          ) : (
            offers.map((offer, i) => {
              const canAfford = (resources[offer.sellResource]?.amount ?? 0) >= offer.sellAmount;
              return (
                <div
                  key={i}
                  onClick={() => canAfford && onTrade(i)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.03)',
                    cursor: canAfford ? 'pointer' : 'not-allowed',
                    opacity: canAfford ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 16 }}>{RESOURCE_DEFS[offer.sellResource]?.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#f44336' }}>-{offer.sellAmount}</span>
                    <span style={{ fontSize: 11, color: '#888' }}>{RESOURCE_DEFS[offer.sellResource]?.label}</span>
                  </div>
                  <span style={{ fontSize: 16, color: '#888' }}>→</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 16 }}>{RESOURCE_DEFS[offer.buyResource]?.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#4caf50' }}>+{offer.buyAmount}</span>
                    <span style={{ fontSize: 11, color: '#888' }}>{RESOURCE_DEFS[offer.buyResource]?.label}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
