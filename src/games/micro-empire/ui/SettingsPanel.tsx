import {
  type GameSettings,
  TICK_SPEED_OPTIONS,
  AUTOSAVE_OPTIONS,
} from '../utils/settings';

interface Props {
  settings: GameSettings;
  onChange: (s: GameSettings) => void;
  onResetTutorial: () => void;
  onClearSave: () => void;
  onClose: () => void;
}

export default function SettingsPanel({ settings, onChange, onResetTutorial, onClearSave, onClose }: Props) {
  const update = (patch: Partial<GameSettings>) => {
    onChange({ ...settings, ...patch });
  };

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)',
      zIndex: 100,
    }}>
      <div style={{
        width: 380,
        maxHeight: '80%',
        background: 'rgba(15,12,40,0.97)',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.12)',
        padding: '24px 28px',
        overflowY: 'auto',
        animation: 'popIn 0.2s ease-out',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#fff' }}>⚙️ 游戏设置</h3>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        {/* Game Speed */}
        <Section label="🕹️ 游戏基础速度">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TICK_SPEED_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => update({ tickSpeed: opt.value })}
                style={{
                  ...optBtnStyle,
                  background: settings.tickSpeed === opt.value ? 'rgba(124,77,255,0.25)' : 'rgba(255,255,255,0.05)',
                  borderColor: settings.tickSpeed === opt.value ? 'rgba(124,77,255,0.5)' : 'rgba(255,255,255,0.1)',
                  color: settings.tickSpeed === opt.value ? '#b388ff' : '#aaa',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>
            配合游戏内 1x/2x/3x 速度倍率使用
          </div>
        </Section>

        {/* Display */}
        <Section label="🖥️ 显示设置">
          <Toggle label="显示网格线" checked={settings.showGrid} onChange={v => update({ showGrid: v })} />
          <Toggle label="显示小地图" checked={settings.showMinimap} onChange={v => update({ showMinimap: v })} />
          <Toggle label="显示提示通知" checked={settings.showToasts} onChange={v => update({ showToasts: v })} />
        </Section>

        {/* Auto Save */}
        <Section label="💾 自动存档">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {AUTOSAVE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => update({ autoSaveInterval: opt.value })}
                style={{
                  ...optBtnStyle,
                  background: settings.autoSaveInterval === opt.value ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.05)',
                  borderColor: settings.autoSaveInterval === opt.value ? 'rgba(76,175,80,0.4)' : 'rgba(255,255,255,0.1)',
                  color: settings.autoSaveInterval === opt.value ? '#81c784' : '#aaa',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Section>

        {/* Danger Zone */}
        <Section label="⚠️ 其他操作">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={onResetTutorial} style={dangerBtnStyle('#ff9800')}>
              📖 重置教程
            </button>
            <button onClick={() => {
              if (confirm('确定要清除所有本地存档吗？此操作不可撤销！')) {
                onClearSave();
              }
            }} style={dangerBtnStyle('#f44336')}>
              🗑️ 清除存档
            </button>
          </div>
        </Section>

        {/* Keyboard shortcuts hint */}
        <div style={{
          marginTop: 16,
          padding: '10px 12px',
          borderRadius: 8,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 6 }}>⌨️ 快捷键</div>
          <div style={{ fontSize: 11, color: '#666', lineHeight: 1.8 }}>
            <span style={kbdStyle}>空格</span> 暂停/继续 &nbsp;
            <span style={kbdStyle}>1</span><span style={kbdStyle}>2</span><span style={kbdStyle}>3</span> 速度 &nbsp;
            <span style={kbdStyle}>P</span> 人口 &nbsp;
            <span style={kbdStyle}>T</span> 科技 &nbsp;
            <span style={kbdStyle}>Esc</span> 关闭/取消
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#ccc', marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 0',
        cursor: 'pointer',
        fontSize: 13,
        color: '#bbb',
        userSelect: 'none',
      }}
    >
      <span>{label}</span>
      <div
        style={{
          width: 38,
          height: 20,
          borderRadius: 10,
          background: checked ? 'rgba(76,175,80,0.4)' : 'rgba(255,255,255,0.1)',
          position: 'relative',
          transition: 'background 0.2s',
          flexShrink: 0,
        }}
      >
        <div style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          background: checked ? '#4caf50' : '#666',
          position: 'absolute',
          top: 2,
          left: checked ? 20 : 2,
          transition: 'left 0.2s, background 0.2s',
        }} />
      </div>
    </div>
  );
}

const closeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#888',
  fontSize: 16,
  cursor: 'pointer',
  padding: '4px 8px',
};

const optBtnStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.1)',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
};

const kbdStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '1px 5px',
  borderRadius: 3,
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.15)',
  fontSize: 10,
  fontFamily: 'monospace',
  color: '#aaa',
  marginRight: 2,
};

function dangerBtnStyle(color: string): React.CSSProperties {
  return {
    padding: '6px 14px',
    borderRadius: 8,
    border: `1px solid ${color}40`,
    background: `${color}15`,
    color,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  };
}
