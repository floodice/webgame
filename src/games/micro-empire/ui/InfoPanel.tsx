import { BUILDING_DEFS } from '../data/buildings';
import { TILE_INFO, type TileType } from '../world/Tile';
import { RESOURCE_DEFS, type ResourceType } from '../data/resources';
import type { PlacedBuilding } from '../systems/BuildingSystem';

interface Props {
  selectedTile: { x: number; y: number } | null;
  tileType: TileType | null;
  building: PlacedBuilding | null;
  onUpgrade: (x: number, y: number) => void;
  onRemove: (x: number, y: number) => void;
  onClose: () => void;
}

export default function InfoPanel({ selectedTile, tileType, building, onUpgrade, onRemove, onClose }: Props) {
  if (!selectedTile || !tileType) return null;

  const tile = TILE_INFO[tileType];
  const bDef = building ? BUILDING_DEFS[building.type] : null;

  return (
    <div style={{
      position: 'absolute',
      right: 8,
      bottom: 8,
      width: 240,
      background: 'rgba(10,10,30,0.92)',
      borderRadius: 12,
      border: '1px solid rgba(255,255,255,0.1)',
      backdropFilter: 'blur(8px)',
      padding: '12px 14px',
      zIndex: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: '#888' }}>
          ({selectedTile.x}, {selectedTile.y})
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >✕</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36,
          borderRadius: 8,
          background: 'rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>
          {building ? (bDef?.icon ?? '?') : '🗺️'}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
            {building ? bDef?.label ?? building.type : tile.label}
          </div>
          <div style={{ fontSize: 11, color: '#aaa' }}>
            {building ? `等级 ${building.level}/${bDef?.maxLevel ?? 3}` : tile.labelEn}
          </div>
        </div>
      </div>

      {building && building.constructionLeft > 0 && (
        <div style={{
          padding: '6px 10px',
          borderRadius: 6,
          background: 'rgba(255,233,62,0.1)',
          border: '1px solid rgba(255,233,62,0.2)',
          fontSize: 11,
          color: '#ffe93e',
          marginBottom: 8,
        }}>
          ⏳ 建造中... 剩余 {building.constructionLeft} 回合
        </div>
      )}

      {building && bDef && building.constructionLeft === 0 && (
        <div style={{ marginBottom: 8 }}>
          {Object.entries(bDef.production).length > 0 && (
            <div style={{ fontSize: 11, color: '#8bc34a', marginBottom: 4 }}>
              产出: {Object.entries(bDef.production).map(([r, amt]) => {
                const mul = 1 + (building.level - 1) * 0.5;
                return `${RESOURCE_DEFS[r as ResourceType]?.icon}${((amt ?? 0) * mul).toFixed(1)}`;
              }).join(' ')}
            </div>
          )}
          {Object.entries(bDef.upkeep).length > 0 && (
            <div style={{ fontSize: 11, color: '#f44336', marginBottom: 4 }}>
              消耗: {Object.entries(bDef.upkeep).map(([r, amt]) => {
                const upkeepMul = 1 + (building.level - 1) * 0.25;
                return `${RESOURCE_DEFS[r as ResourceType]?.icon}${((amt ?? 0) * upkeepMul).toFixed(1)}`;
              }).join(' ')}
            </div>
          )}
          {bDef.populationCapacity > 0 && (
            <div style={{ fontSize: 11, color: '#64b5f6', marginBottom: 4 }}>
              容纳人口: {bDef.populationCapacity * building.level}
            </div>
          )}
          {bDef.defenseBonus > 0 && (
            <div style={{ fontSize: 11, color: '#ff9800', marginBottom: 4 }}>
              防御: +{bDef.defenseBonus * building.level}
            </div>
          )}
          {bDef.happinessBonus !== 0 && (
            <div style={{ fontSize: 11, color: bDef.happinessBonus > 0 ? '#e91e63' : '#f44336', marginBottom: 4 }}>
              幸福度: {bDef.happinessBonus > 0 ? '+' : ''}{bDef.happinessBonus * building.level}
            </div>
          )}
        </div>
      )}

      {!building && (
        <div style={{ fontSize: 11, color: '#aaa', marginBottom: 8 }}>
          {tile.buildable ? '可以建造建筑' : '不可建造'}
          {Object.entries(tile.resourceYield).length > 0 && (
            <div style={{ marginTop: 4 }}>
              地形资源: {Object.entries(tile.resourceYield).map(([r, amt]) =>
                `${RESOURCE_DEFS[r as ResourceType]?.icon ?? r}+${amt}`
              ).join(' ')}
            </div>
          )}
        </div>
      )}

      {building && building.constructionLeft === 0 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {building.level < (bDef?.maxLevel ?? 3) && (
            <button
              onClick={() => onUpgrade(selectedTile.x, selectedTile.y)}
              style={{
                flex: 1,
                padding: '6px 0',
                borderRadius: 6,
                border: '1px solid rgba(76,175,80,0.3)',
                background: 'rgba(76,175,80,0.1)',
                color: '#4caf50',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ⬆ 升级
            </button>
          )}
          <button
            onClick={() => onRemove(selectedTile.x, selectedTile.y)}
            style={{
              flex: 1,
              padding: '6px 0',
              borderRadius: 6,
              border: '1px solid rgba(244,67,54,0.3)',
              background: 'rgba(244,67,54,0.1)',
              color: '#f44336',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            🗑 拆除(返还50%)
          </button>
        </div>
      )}
    </div>
  );
}
