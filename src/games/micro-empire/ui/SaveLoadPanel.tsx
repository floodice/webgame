import { useState, useEffect, useCallback } from 'react';
import { getAllSlots, hasSave, getSaveMeta, deleteSave } from '../utils/save';
import {
  isCloudLoggedIn, getCloudName, cloudRegister, clearCloudSession,
  cloudListSaves, cloudLoad, cloudDeleteSave,
  type CloudSaveMeta,
} from '../utils/cloudApi';

interface Props {
  onSave: (slot: string) => void;
  onLoad: (slot: string) => void;
  onCloudSave: (slot: string) => Promise<boolean>;
  onCloudLoad: (data: string) => void;
  onClose: () => void;
}

type Tab = 'local' | 'cloud';

export default function SaveLoadPanel({ onSave, onLoad, onCloudSave, onCloudLoad, onClose }: Props) {
  const slots = getAllSlots();
  const [tab, setTab] = useState<Tab>('local');
  const [loggedIn, setLoggedIn] = useState(isCloudLoggedIn);
  const [cloudName, setCloudName] = useState(getCloudName() ?? '');
  const [nameInput, setNameInput] = useState('');
  const [cloudSlots, setCloudSlots] = useState<CloudSaveMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const refreshCloud = useCallback(async () => {
    if (!isCloudLoggedIn()) return;
    setLoading(true);
    const saves = await cloudListSaves();
    setCloudSlots(saves);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (tab === 'cloud' && loggedIn) refreshCloud();
  }, [tab, loggedIn, refreshCloud]);

  const handleRegister = async () => {
    if (!nameInput.trim()) return;
    setLoading(true);
    const result = await cloudRegister(nameInput.trim());
    setLoading(false);
    if (result) {
      setLoggedIn(true);
      setCloudName(result.name);
      setMsg('☁️ 注册成功！');
    } else {
      setMsg('❌ 注册失败，请重试');
    }
  };

  const handleLogout = () => {
    clearCloudSession();
    setLoggedIn(false);
    setCloudName('');
    setCloudSlots([]);
  };

  const handleCloudSave = async (slot: string) => {
    setLoading(true);
    setMsg('');
    const ok = await onCloudSave(slot);
    if (ok) {
      setMsg('✅ 云存档保存成功');
      await refreshCloud();
    } else {
      setMsg('❌ 保存失败');
    }
    setLoading(false);
  };

  const handleCloudLoad = async (slot: string) => {
    setLoading(true);
    setMsg('');
    const result = await cloudLoad(slot);
    if (result) {
      onCloudLoad(result.data);
      setMsg('✅ 云存档加载成功');
    } else {
      setMsg('❌ 加载失败');
    }
    setLoading(false);
  };

  const handleCloudDelete = async (slot: string) => {
    setLoading(true);
    await cloudDeleteSave(slot);
    await refreshCloud();
    setLoading(false);
  };

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)',
      zIndex: 90,
    }}>
      <div style={{
        width: 400,
        maxHeight: '85vh',
        background: 'rgba(10,10,30,0.97)',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.12)',
        padding: '20px',
        overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0 }}>💾 存档管理</h3>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
          <TabBtn label="📁 本地存档" active={tab === 'local'} onClick={() => setTab('local')} />
          <TabBtn label="☁️ 云存档" active={tab === 'cloud'} onClick={() => setTab('cloud')} />
        </div>

        {/* Local saves */}
        {tab === 'local' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {slots.map(slot => {
              const exists = hasSave(slot);
              const meta = exists ? getSaveMeta(slot) : null;
              const label = slot === 'auto' ? '自动存档' : `存档 ${slot}`;

              return (
                <div key={slot} style={slotBoxStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{label}</span>
                    {meta && (
                      <span style={{ fontSize: 10, color: '#888' }}>
                        {new Date(meta.timestamp).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {slot !== 'auto' && (
                      <button onClick={() => onSave(slot)} style={saveBtnStyle}>保存</button>
                    )}
                    {exists && (
                      <>
                        <button onClick={() => onLoad(slot)} style={loadBtnStyle}>加载</button>
                        {slot !== 'auto' && (
                          <button onClick={() => deleteSave(slot)} style={deleteBtnStyle}>删除</button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Cloud saves */}
        {tab === 'cloud' && !loggedIn && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>☁️</div>
            <div style={{ fontSize: 13, color: '#c0b0d0', marginBottom: 16 }}>
              登录云存档，在任何设备上继续你的帝国
            </div>
            <input
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="输入玩家昵称 (1-20字)"
              maxLength={20}
              style={inputStyle}
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
            />
            <button
              onClick={handleRegister}
              disabled={loading || !nameInput.trim()}
              style={{
                ...cloudActionBtnStyle,
                background: 'rgba(76,175,80,0.15)',
                borderColor: 'rgba(76,175,80,0.3)',
                color: '#4caf50',
                opacity: loading || !nameInput.trim() ? 0.5 : 1,
              }}
            >
              {loading ? '连接中...' : '🚀 创建账号并登录'}
            </button>
          </div>
        )}

        {tab === 'cloud' && loggedIn && (
          <div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 12, padding: '8px 12px', borderRadius: 8,
              background: 'rgba(76,175,80,0.08)', border: '1px solid rgba(76,175,80,0.15)',
            }}>
              <span style={{ fontSize: 12, color: '#4caf50', fontWeight: 700 }}>
                👤 {cloudName}
              </span>
              <button onClick={handleLogout} style={{ ...deleteBtnStyle, padding: '3px 8px', fontSize: 10 }}>
                登出
              </button>
            </div>

            {loading && (
              <div style={{ textAlign: 'center', color: '#888', padding: 20, fontSize: 12 }}>
                加载中...
              </div>
            )}

            {!loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* New save button */}
                <button
                  onClick={() => handleCloudSave(`cloud_${Date.now()}`)}
                  style={{
                    ...cloudActionBtnStyle,
                    background: 'rgba(76,175,80,0.1)',
                    borderColor: 'rgba(76,175,80,0.25)',
                    color: '#4caf50',
                  }}
                >
                  ➕ 保存到新的云存档槽位
                </button>

                {cloudSlots.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#666', padding: 20, fontSize: 12 }}>
                    暂无云存档
                  </div>
                )}

                {cloudSlots.map(s => (
                  <div key={s.slot} style={slotBoxStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                        ☁️ {s.slot.startsWith('cloud_') ? `存档 ${cloudSlots.indexOf(s) + 1}` : s.slot}
                      </span>
                      <span style={{ fontSize: 10, color: '#888' }}>
                        {new Date(s.updatedAt).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: '#aaa', marginBottom: 6, display: 'flex', gap: 8 }}>
                      <span>📅 第{s.year}年</span>
                      <span>👥 {s.population}人</span>
                      <span>🏠 {s.buildings}建筑</span>
                      <span>🏆 {s.achievements}成就</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => handleCloudSave(s.slot)} style={saveBtnStyle}>覆盖</button>
                      <button onClick={() => handleCloudLoad(s.slot)} style={loadBtnStyle}>加载</button>
                      <button onClick={() => handleCloudDelete(s.slot)} style={deleteBtnStyle}>删除</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {msg && (
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 12, color: msg.includes('❌') ? '#f44336' : '#4caf50' }}>
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '7px 0',
        borderRadius: 8,
        border: `1px solid ${active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
        background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
        color: active ? '#fff' : '#888',
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );
}

const closeBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 16,
};

const slotBoxStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(255,255,255,0.03)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.05)',
  color: '#fff',
  fontSize: 14,
  outline: 'none',
  marginBottom: 10,
  boxSizing: 'border-box',
};

const cloudActionBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 0',
  borderRadius: 10,
  border: '1px solid',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 0.15s',
};

const saveBtnStyle: React.CSSProperties = {
  flex: 1, padding: '5px 0', borderRadius: 6,
  border: '1px solid rgba(76,175,80,0.3)', background: 'rgba(76,175,80,0.1)',
  color: '#4caf50', fontSize: 11, fontWeight: 700, cursor: 'pointer',
};

const loadBtnStyle: React.CSSProperties = {
  flex: 1, padding: '5px 0', borderRadius: 6,
  border: '1px solid rgba(33,150,243,0.3)', background: 'rgba(33,150,243,0.1)',
  color: '#2196f3', fontSize: 11, fontWeight: 700, cursor: 'pointer',
};

const deleteBtnStyle: React.CSSProperties = {
  padding: '5px 10px', borderRadius: 6,
  border: '1px solid rgba(244,67,54,0.3)', background: 'rgba(244,67,54,0.1)',
  color: '#f44336', fontSize: 11, fontWeight: 700, cursor: 'pointer',
};
