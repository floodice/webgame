import { BUILDING_DEFS, BUILDING_CATEGORIES, type BuildingCategory } from '../data/buildings';
import { RESOURCE_DEFS, type ResourceType } from '../data/resources';
import { useState } from 'react';

interface Props {
  placing: string | null;
  onSelect: (type: string | null) => void;
  resources: Record<string, { amount: number; max: number; rate: number }>;
  researchedTechs: string[];
}

export default function BuildMenu({ placing, onSelect, resources, researchedTechs }: Props) {
  const [cat, setCat] = useState<BuildingCategory>('production');
  const [expanded, setExpanded] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const buildings = Object.values(BUILDING_DEFS).filter(b => b.category === cat);

  const canAfford = (id: string): boolean => {
    const def = BUILDING_DEFS[id];
    if (!def) return false;
    if (def.requiredTech && !researchedTechs.includes(def.requiredTech)) return false;
    for (const [r, amt] of Object.entries(def.cost)) {
      if ((resources[r]?.amount ?? 0) < (amt ?? 0)) return false;
    }
    return true;
  };

  const isLocked = (id: string): boolean => {
    const def = BUILDING_DEFS[id];
    return !!def?.requiredTech && !researchedTechs.includes(def.requiredTech);
  };

  const hoveredDef = hoveredId ? BUILDING_DEFS[hoveredId] : null;

  return (
    <div style={{
      position: 'absolute',
      left: 8,
      bottom: 8,
      width: 290,
      maxHeight: expanded ? 440 : 40,
      background: 'rgba(10,10,30,0.92)',
      borderRadius: 12,
      border: '1px solid rgba(255,255,255,0.1)',
      overflow: 'hidden',
      transition: 'max-height 0.3s',
      backdropFilter: 'blur(8px)',
      zIndex: 10,
    }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '8px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          borderBottom: expanded ? '1px solid rgba(255,255,255,0.1)' : 'none',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>🔨 建造</span>
        <span style={{ fontSize: 11, color: '#888' }}>{expanded ? '▼' : '▲'}</span>
      </div>

      {expanded && (
        <>
          <div style={{ display: 'flex', gap: 2, padding: '6px 8px', flexWrap: 'wrap' }}>
            {BUILDING_CATEGORIES.map(c => (
              <button
                key={c.key}
                onClick={() => setCat(c.key)}
                style={{
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: cat === c.key ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: cat === c.key ? '#fff' : '#888',
                }}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '4px 8px 8px', maxHeight: 280, overflowY: 'auto' }}>
            {buildings.map(b => {
              const locked = isLocked(b.id);
              const affordable = canAfford(b.id);
              const selected = placing === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => {
                    if (locked) return;
                    onSelect(selected ? null : b.id);
                  }}
                  onMouseEnter={() => setHoveredId(b.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    padding: '8px 10px',
                    marginBottom: 4,
                    borderRadius: 8,
                    border: selected ? '1px solid #ffe93e' : '1px solid rgba(255,255,255,0.06)',
                    background: selected ? 'rgba(255,233,62,0.1)' : 'rgba(255,255,255,0.03)',
                    cursor: locked ? 'not-allowed' : 'pointer' as const,
                    opacity: locked ? 0.4 : affordable ? 1 : 0.7,
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{b.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{b.label}</div>
                      <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>{b.description}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    {Object.entries(b.cost).map(([r, amt]) => {
                      const enough = (resources[r]?.amount ?? 0) >= (amt ?? 0);
                      return (
                        <span key={r} style={{
                          fontSize: 10,
                          color: enough ? '#8bc34a' : '#f44336',
                          fontWeight: 600,
                        }}>
                          {RESOURCE_DEFS[r as ResourceType]?.icon}{amt}
                        </span>
                      );
                    })}
                    <span style={{ fontSize: 10, color: '#888' }}>
                      ⏱{b.constructionTime}天
                    </span>
                    {locked && (
                      <span style={{ fontSize: 10, color: '#ff9800' }}>🔒 需要科技</span>
                    )}
                    {!locked && !affordable && (
                      <span style={{ fontSize: 10, color: '#f44336' }}>💰 资源不足</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Building detail tooltip on hover */}
          {hoveredDef && (
            <div style={{
              padding: '6px 10px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              fontSize: 10,
              color: '#ccc',
              lineHeight: 1.6,
            }}>
              {Object.keys(hoveredDef.production).length > 0 && (
                <div>📈 产出: {Object.entries(hoveredDef.production).map(([r, amt]) =>
                  `${RESOURCE_DEFS[r as ResourceType]?.icon ?? ''}${amt}/天`
                ).join(' ')}</div>
              )}
              {Object.keys(hoveredDef.upkeep).length > 0 && (
                <div>📉 消耗: {Object.entries(hoveredDef.upkeep).map(([r, amt]) =>
                  `${RESOURCE_DEFS[r as ResourceType]?.icon ?? ''}${amt}/天`
                ).join(' ')}</div>
              )}
              {hoveredDef.populationCapacity > 0 && (
                <div>👥 住房容量: +{hoveredDef.populationCapacity}</div>
              )}
              {hoveredDef.happinessBonus > 0 && (
                <div>😊 幸福度: +{hoveredDef.happinessBonus}</div>
              )}
              {hoveredDef.defenseBonus > 0 && (
                <div>🛡️ 防御: +{hoveredDef.defenseBonus}</div>
              )}
              {hoveredDef.knowledgeBonus > 0 && (
                <div>📚 知识: +{hoveredDef.knowledgeBonus}/天</div>
              )}
              <div style={{ color: '#888' }}>
                🗺️ 可建造: {hoveredDef.allowedTerrain.join(', ')} | 最高 {hoveredDef.maxLevel} 级
              </div>
            </div>
          )}
        </>
      )}

      {placing && (
        <div style={{
          padding: '6px 12px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          fontSize: 11,
          color: '#ffe93e',
          textAlign: 'center',
          background: 'rgba(255,233,62,0.05)',
        }}>
          🔨 点击绿色地块放置 · 红色表示不可放置 · 右键取消
        </div>
      )}
    </div>
  );
}
