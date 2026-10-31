import { TECH_DEFS, TECH_BRANCHES, type TechBranch } from '../data/technologies';
import { RESOURCE_DEFS, type ResourceType } from '../data/resources';
import { useState } from 'react';

interface Props {
  researched: string[];
  currentResearch: string | null;
  researchProgress: number;
  researchTotal: number;
  resources: Record<string, { amount: number }>;
  onResearch: (techId: string) => void;
  onClose: () => void;
}

export default function TechTreePanel({ researched, currentResearch, researchProgress, researchTotal, resources, onResearch, onClose }: Props) {
  const [branch, setBranch] = useState<TechBranch>('economy');

  const branchTechs = Object.values(TECH_DEFS)
    .filter(t => t.branch === branch)
    .sort((a, b) => a.tier - b.tier);

  const canResearch = (id: string): boolean => {
    const def = TECH_DEFS[id];
    if (!def) return false;
    if (researched.includes(id)) return false;
    if (currentResearch) return false;
    for (const pre of def.prerequisites) {
      if (!researched.includes(pre)) return false;
    }
    for (const [r, amt] of Object.entries(def.cost)) {
      if ((resources[r]?.amount ?? 0) < (amt ?? 0)) return false;
    }
    return true;
  };

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)',
      zIndex: 80,
    }}>
      <div style={{
        width: 520,
        maxHeight: '80vh',
        background: 'rgba(10,10,30,0.97)',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.12)',
        padding: '20px',
        overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0 }}>🔬 科技树</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>

        {currentResearch && (() => {
          const pct = researchTotal > 0 ? Math.round((researchProgress / researchTotal) * 100) : 0;
          const remaining = researchTotal - researchProgress;
          return (
            <div style={{
              padding: '12px 16px',
              borderRadius: 12,
              background: 'rgba(124,77,255,0.12)',
              border: '1px solid rgba(124,77,255,0.3)',
              marginBottom: 14,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#b388ff', fontWeight: 700 }}>
                  🔬 正在研究: {TECH_DEFS[currentResearch]?.icon} {TECH_DEFS[currentResearch]?.label}
                </span>
                <span style={{ fontSize: 12, color: '#ce93d8', fontWeight: 700 }}>{pct}%</span>
              </div>
              <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  borderRadius: 5,
                  width: `${pct}%`,
                  minWidth: researchProgress > 0 ? 4 : 0,
                  background: 'linear-gradient(90deg, #7c4dff, #b388ff, #ce93d8)',
                  transition: 'width 0.3s',
                  boxShadow: '0 0 8px rgba(124,77,255,0.4)',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 11, color: '#9575cd' }}>进度 {researchProgress}/{researchTotal} 天</span>
                <span style={{ fontSize: 11, color: '#9575cd' }}>剩余 {remaining} 天</span>
              </div>
            </div>
          );
        })()}

        <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
          {TECH_BRANCHES.map(b => (
            <button
              key={b.key}
              onClick={() => setBranch(b.key)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 8,
                border: branch === b.key ? `1px solid ${b.color}` : '1px solid rgba(255,255,255,0.08)',
                background: branch === b.key ? `${b.color}15` : 'transparent',
                color: branch === b.key ? b.color : '#888',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {b.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {branchTechs.map(tech => {
            const done = researched.includes(tech.id);
            const active = currentResearch === tech.id;
            const available = canResearch(tech.id);
            const prereqMet = tech.prerequisites.every(p => researched.includes(p));

            return (
              <div
                key={tech.id}
                onClick={() => available && onResearch(tech.id)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: done ? '1px solid rgba(76,175,80,0.3)' : active ? '1px solid rgba(124,77,255,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  background: done ? 'rgba(76,175,80,0.08)' : active ? 'rgba(124,77,255,0.08)' : 'rgba(255,255,255,0.02)',
                  cursor: available ? 'pointer' : 'default',
                  opacity: !prereqMet && !done ? 0.4 : 1,
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 20 }}>{tech.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: done ? '#4caf50' : '#fff' }}>
                      {tech.label}
                      {done && <span style={{ fontSize: 10, marginLeft: 6 }}>✅</span>}
                    </div>
                    <div style={{ fontSize: 10, color: '#aaa' }}>{tech.description}</div>
                  </div>
                </div>
                {!done && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 4, fontSize: 10, color: '#888' }}>
                    <span>⏱ {tech.researchTime}回合</span>
                    {Object.entries(tech.cost).map(([r, amt]) => (
                      <span key={r} style={{ color: (resources[r]?.amount ?? 0) >= (amt ?? 0) ? '#8bc34a' : '#f44336' }}>
                        {RESOURCE_DEFS[r as ResourceType]?.icon}{amt}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
