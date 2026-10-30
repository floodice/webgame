import { ACHIEVEMENT_DEFS } from '../data/achievements';
import { useEffect, useState } from 'react';

interface Props {
  unlockedIds: string[];
}

export default function AchievementToast({ unlockedIds }: Props) {
  const [shown, setShown] = useState<string[]>([]);
  const [queue, setQueue] = useState<string[]>([]);

  useEffect(() => {
    const newOnes = unlockedIds.filter(id => !shown.includes(id));
    if (newOnes.length > 0) {
      setQueue(prev => [...prev, ...newOnes]);
      setShown(prev => [...prev, ...newOnes]);
    }
  }, [unlockedIds]);

  useEffect(() => {
    if (queue.length === 0) return;
    const timer = setTimeout(() => {
      setQueue(prev => prev.slice(1));
    }, 3000);
    return () => clearTimeout(timer);
  }, [queue]);

  if (queue.length === 0) return null;

  const id = queue[0];
  const def = ACHIEVEMENT_DEFS.find(a => a.id === id);
  if (!def) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 50,
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '10px 20px',
      borderRadius: 12,
      background: 'rgba(255,215,0,0.15)',
      border: '1px solid rgba(255,215,0,0.3)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      zIndex: 200,
      animation: 'slideDown 0.3s ease-out, fadeOut 0.5s ease 2.5s forwards',
    }}>
      <span style={{ fontSize: 24 }}>{def.icon}</span>
      <div>
        <div style={{ fontSize: 11, color: '#ffd700', fontWeight: 800, letterSpacing: 1 }}>🏆 成就解锁</div>
        <div style={{ fontSize: 13, color: '#fff', fontWeight: 700 }}>{def.title}</div>
        <div style={{ fontSize: 10, color: '#ccc' }}>{def.description}</div>
      </div>
    </div>
  );
}
