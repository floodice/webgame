import { type ReactNode, useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useSEO } from '../hooks/useSEO';

interface Props {
  title: string;
  description?: string;
  score?: number;
  highScore?: number;
  children: ReactNode;
  controls?: ReactNode;
  scoreLabel?: string;
}

const FLOAT_EMOJIS = ['🍬', '🍭', '🌈', '⭐', '🎈', '🎪', '💫', '🍩', '🧁', '🎀', '🪅', '🎠', '🦄', '🍦', '🎵', '✨', '🔮', '🎯', '🪩', '🧸'];

const STICKER_COLORS = [
  'linear-gradient(135deg, #ff2d95, #ff6baf)',
  'linear-gradient(135deg, #ff6b2b, #ffe93e)',
  'linear-gradient(135deg, #39ff14, #00f0ff)',
  'linear-gradient(135deg, #bf5af2, #ff2d95)',
  'linear-gradient(135deg, #00f0ff, #39ff14)',
];

const FUN_FOOTERS = [
  '🎪 玩得开心！', '🍭 甜蜜时光~', '💫 你太棒了！', '🦄 独角兽加油！',
  '🎈 飞起来~', '⭐ 闪闪发光！', '🍬 糖果时间！', '🎠 旋转吧！',
  '🔥 火力全开！', '🌈 彩虹能量！', '🪩 迪斯科！', '🧸 抱抱~',
];

export default function GameWrapper({ title, description, score, highScore, children, controls, scoreLabel }: Props) {
  const { t } = useI18n();
  const location = useLocation();
  const sl = scoreLabel ?? t.common.score;

  useSEO({
    title: `Play ${title} Online Free`,
    description: description ?? `Play ${title} for free in your browser. No downloads, no ads — just instant fun on GameHub!`,
    path: location.pathname,
  });
  const [scoreAnim, setScoreAnim] = useState(false);

  useEffect(() => {
    if (score !== undefined && score > 0) {
      setScoreAnim(true);
      const timer = setTimeout(() => setScoreAnim(false), 300);
      return () => clearTimeout(timer);
    }
  }, [score]);

  const floaters = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => ({
      emoji: FLOAT_EMOJIS[i % FLOAT_EMOJIS.length],
      left: `${3 + (i * 7) % 94}%`,
      top: `${5 + (i * 11) % 85}%`,
      size: 16 + (i % 5) * 5,
      delay: i * 0.5,
      duration: 5 + (i % 4) * 2,
    }));
  }, []);

  const [stickerIdx] = useState(() => Math.floor(Math.random() * STICKER_COLORS.length));
  const [footerMsg] = useState(() => FUN_FOOTERS[Math.floor(Math.random() * FUN_FOOTERS.length)]);
  const stickerColor = STICKER_COLORS[stickerIdx];
  const stickerColor2 = STICKER_COLORS[(stickerIdx + 2) % STICKER_COLORS.length];
  const stickerColor3 = STICKER_COLORS[(stickerIdx + 3) % STICKER_COLORS.length];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 16px 40px',
      minHeight: 'calc(100vh - 60px)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Floating emoji particles */}
      {floaters.map((f, i) => (
        <div
          key={i}
          style={{
            position: 'fixed',
            left: f.left,
            top: f.top,
            fontSize: f.size,
            opacity: 0.10 + (i % 3) * 0.03,
            animation: `floatAround ${f.duration}s ease-in-out ${f.delay}s infinite`,
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 0,
            filter: `hue-rotate(${i * 30}deg)`,
          }}
        >
          {f.emoji}
        </div>
      ))}

      <div style={{ width: '100%', maxWidth: 720, position: 'relative', zIndex: 1 }}>
        {/* Header panel */}
        <div
          className="wacky-border"
          style={{
            background: 'rgba(40,15,80,0.85)',
            backdropFilter: 'blur(14px)',
            borderRadius: 24,
            border: '3px solid rgba(255,45,149,0.3)',
            padding: '28px 32px 24px',
            marginBottom: 18,
            animation: 'popIn 0.4s ease-out both',
            position: 'relative',
            overflow: 'visible',
          }}
        >
          {/* Decorative sticker tapes */}
          <div style={{
            position: 'absolute', top: -5, right: 28,
            width: 52, height: 12,
            background: stickerColor,
            borderRadius: '0 0 8px 8px',
            transform: 'rotate(3deg)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }} />
          <div style={{
            position: 'absolute', top: -5, left: 35,
            width: 38, height: 10,
            background: stickerColor2,
            borderRadius: '0 0 6px 6px',
            transform: 'rotate(-4deg)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          }} />
          {/* Bottom-left sticker */}
          <div style={{
            position: 'absolute', bottom: -6, left: 50,
            width: 44, height: 10,
            background: stickerColor3,
            borderRadius: '8px 8px 0 0',
            transform: 'rotate(2deg)',
            boxShadow: '0 -2px 6px rgba(0,0,0,0.2)',
          }} />

          {/* Corner doodle emojis */}
          <div style={{
            position: 'absolute',
            bottom: 6, right: 10,
            fontSize: 20,
            opacity: 0.20,
            animation: 'wobble 3s ease-in-out infinite',
          }}>🎪</div>
          <div style={{
            position: 'absolute',
            top: 8, right: 80,
            fontSize: 14,
            opacity: 0.15,
            animation: 'float 4s ease-in-out 0.5s infinite',
          }}>✨</div>

          {/* Title row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: controls ? 18 : 0,
          }}>
            <h1
              className="wacky-title"
              style={{
                fontSize: 28,
                fontWeight: 900,
                margin: 0,
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
                WebkitTextFillColor: 'transparent',
              }}
            >
              {title}
            </h1>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              fontSize: 14,
              flexShrink: 0,
            }}>
              {score !== undefined && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'rgba(255,233,62,0.08)',
                  borderRadius: 16,
                  padding: '6px 16px',
                  border: '2.5px dashed rgba(255,233,62,0.25)',
                  transition: 'all 0.2s',
                  transform: scoreAnim ? 'scale(1.15) rotate(-3deg)' : 'scale(1)',
                }}>
                  <span style={{
                    fontSize: 9,
                    color: '#c8a0e0',
                    fontWeight: 800,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                  }}>{sl}</span>
                  <span
                    style={{
                      color: '#ffe93e',
                      fontWeight: 900,
                      fontSize: 24,
                      textShadow: '0 0 14px rgba(255,233,62,0.5), 0 2px 4px rgba(0,0,0,0.3)',
                      animation: scoreAnim ? 'jelly 0.3s ease' : 'none',
                    }}
                  >
                    {score.toLocaleString()}
                  </span>
                </div>
              )}
              {highScore !== undefined && highScore > 0 && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'rgba(255,45,149,0.08)',
                  borderRadius: 16,
                  padding: '6px 14px',
                  border: '2.5px dashed rgba(255,45,149,0.25)',
                }}>
                  <span style={{
                    fontSize: 9,
                    color: '#ff6baf',
                    fontWeight: 800,
                    letterSpacing: 1.5,
                  }}>🏆 BEST</span>
                  <span style={{
                    fontWeight: 900,
                    fontSize: 20,
                    color: '#ff6baf',
                    textShadow: '0 0 10px rgba(255,45,149,0.4)',
                  }}>
                    {highScore.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Controls row */}
          {controls && (
            <div style={{
              paddingTop: 16,
              borderTop: '2.5px dashed rgba(255,45,149,0.15)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 14,
            }}>
              {controls}
            </div>
          )}
        </div>

        {/* Game content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            animation: 'fadeIn 0.4s ease 0.1s both',
          }}
        >
          {children}
        </div>

        {/* Fun footer */}
        <div style={{
          textAlign: 'center',
          marginTop: 20,
          fontSize: 13,
          color: '#c8a0e0',
          opacity: 0.4,
          fontWeight: 700,
          animation: 'float 5s ease-in-out infinite',
          letterSpacing: 0.5,
        }}>
          {footerMsg}
        </div>
      </div>
    </div>
  );
}
