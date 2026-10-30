import { useState } from 'react';

const STEPS = [
  {
    title: '欢迎来到微观帝国！',
    content: '你将在这片荒野中建造一个繁荣的王国。让我们开始吧！',
    icon: '🏰',
  },
  {
    title: '观察地图',
    content: '鼠标拖拽移动地图，滚轮缩放。键盘 WASD 也可以移动视角。不同颜色代表不同地形：绿色=草地，深绿=森林，灰色=山地，蓝色=水域。',
    icon: '🗺️',
  },
  {
    title: '建造建筑',
    content: '左下角是建筑面板。选择一个建筑，然后点击地图上合适的地形放置。右键取消放置。',
    icon: '🔨',
  },
  {
    title: '管理资源',
    content: '顶部显示6种资源：食物🌾、木材🪵、石材🪨、铁矿⛏️、金币💰、知识📚。建筑会自动产出和消耗资源。',
    icon: '📊',
  },
  {
    title: '人口与职业',
    content: '建造住房增加人口上限。点击👥按钮分配工人：农民→食物，工人→木材石材，学者→知识，士兵→防御，商人→金币。合理分配大幅提升效率！',
    icon: '👥',
  },
  {
    title: '科技研究',
    content: '先建「学堂」🏫积累知识，人口也会自然产出少量知识。攒够后点🔬打开科技树研究科技，解锁新建筑和各种加成。',
    icon: '🔬',
  },
  {
    title: '应对挑战',
    content: '随机事件会定期发生（灾难、机遇、选择题）。敌人也会定期入侵——建造军事设施来防御！商人来访时可以贸易。',
    icon: '⚔️',
  },
  {
    title: '快捷键',
    content: '空格=暂停/继续，1/2/3=速度，P=人口，T=科技，Esc=关闭面板/取消建造。祝你好运！',
    icon: '⌨️',
  },
];

interface Props {
  onClose: () => void;
}

export default function TutorialOverlay({ onClose }: Props) {
  const [step, setStep] = useState(0);
  const s = STEPS[step];

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)',
      zIndex: 200,
    }}>
      <div style={{
        width: 400,
        background: 'rgba(15,12,40,0.97)',
        borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.15)',
        padding: '28px 32px',
        animation: 'popIn 0.3s ease-out',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{s.icon}</div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0 }}>{s.title}</h3>
        </div>

        <p style={{
          fontSize: 14,
          color: '#c0b0e0',
          lineHeight: 1.8,
          textAlign: 'center',
          marginBottom: 24,
        }}>
          {s.content}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#888' }}>{step + 1} / {STEPS.length}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent',
                  color: '#aaa',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                上一步
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                style={{
                  padding: '8px 24px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(135deg, #7c4dff, #448aff)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                下一步
              </button>
            ) : (
              <button
                onClick={onClose}
                style={{
                  padding: '8px 24px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                开始游戏！
              </button>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            跳过教程
          </button>
        </div>
      </div>
    </div>
  );
}
