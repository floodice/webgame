import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useI18n, type Lang, LANG_LIST } from '../i18n';

const HEADER_EMOJIS = ['🎮', '👾', '🕹️', '🎪', '🤪', '💥', '🎲', '🃏', '🧩', '🎯', '🔥', '⚡', '🌈', '🦄', '🍭', '🧸', '🪩', '🎠', '🍬', '🪅'];

export default function Layout() {
  const isHome = useLocation().pathname === '/';
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [logoEmoji, setLogoEmoji] = useState('🎮');
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = LANG_LIST.find(l => l.code === lang)!;

  const shuffleLogo = () => {
    setLogoEmoji(HEADER_EMOJIS[Math.floor(Math.random() * HEADER_EMOJIS.length)]);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '3px solid',
        borderImage: 'linear-gradient(90deg, #ff2d95, #ff6b2b, #ffe93e, #39ff14, #00f0ff, #bf5af2) 1',
        background: 'rgba(26,10,46,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
        <div style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '0 24px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Link
            to="/"
            onClick={shuffleLogo}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              textDecoration: 'none', fontWeight: 900, fontSize: 18,
            }}
          >
            <span style={{
              fontSize: 26,
              animation: 'wobble 2s ease-in-out infinite',
              display: 'inline-block',
              cursor: 'pointer',
            }}>{logoEmoji}</span>
            <span style={{
              background: 'linear-gradient(135deg, #ff2d95, #ff6b2b, #ffe93e)',
              backgroundSize: '200% 200%',
              animation: 'gradientShift 3s ease infinite',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              textShadow: 'none',
            }}>
              GameHub
            </span>
            <span style={{
              fontSize: 11,
              background: 'linear-gradient(135deg, #39ff14, #00f0ff, #bf5af2)',
              backgroundSize: '200% 200%',
              animation: 'gradientShift 2s ease infinite, wiggle 1.5s ease-in-out infinite',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 900,
              letterSpacing: 1.5,
              transform: 'rotate(-8deg)',
              display: 'inline-block',
              marginLeft: -4,
              marginTop: -10,
              textShadow: 'none',
              filter: 'drop-shadow(0 0 4px rgba(57,255,20,0.3))',
            }}>WACKY!</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Language Dropdown */}
            <div ref={dropRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setOpen(v => !v)}
                style={{
                  padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                  background: 'rgba(255,45,149,0.12)',
                  border: '2px solid rgba(255,45,149,0.25)',
                  color: '#ffa4d0', cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#ff2d95';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.transform = 'rotate(-2deg) scale(1.05)';
                }}
                onMouseLeave={e => {
                  if (!open) {
                    e.currentTarget.style.borderColor = 'rgba(255,45,149,0.25)';
                    e.currentTarget.style.color = '#ffa4d0';
                    e.currentTarget.style.transform = 'none';
                  }
                }}
              >
                <span>{current.flag}</span>
                <span>{current.label}</span>
                <span style={{ fontSize: 10, marginLeft: 2 }}>{open ? '🔼' : '🔽'}</span>
              </button>
              {open && (
                <div style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  minWidth: 180,
                  background: 'rgba(40,15,70,0.97)',
                  border: '2px solid rgba(255,45,149,0.3)',
                  borderRadius: 14,
                  boxShadow: '0 12px 40px rgba(255,45,149,0.2), 0 0 0 1px rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  padding: '6px 0',
                  zIndex: 999,
                  maxHeight: 420,
                  overflowY: 'auto',
                  animation: 'popIn 0.25s ease-out',
                }}>
                  {LANG_LIST.map((item, i) => (
                    <button
                      key={item.code}
                      onClick={() => { setLang(item.code); setOpen(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        width: '100%',
                        padding: '9px 16px',
                        border: 'none',
                        background: item.code === lang ? 'rgba(255,45,149,0.15)' : 'transparent',
                        color: item.code === lang ? '#ff2d95' : '#c8a0e0',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: item.code === lang ? 800 : 600,
                        textAlign: 'left',
                        transition: 'all 0.15s',
                        animation: `fadeIn 0.2s ease ${i * 30}ms both`,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255,45,149,0.12)';
                        e.currentTarget.style.color = '#ff6baf';
                        e.currentTarget.style.paddingLeft = '22px';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = item.code === lang ? 'rgba(255,45,149,0.15)' : 'transparent';
                        e.currentTarget.style.color = item.code === lang ? '#ff2d95' : '#c8a0e0';
                        e.currentTarget.style.paddingLeft = '16px';
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{item.flag}</span>
                      <span>{item.label}</span>
                      {item.code === lang && <span style={{ marginLeft: 'auto' }}>✨</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {!isHome && (
              <Link to="/" className="btn-secondary" style={{ fontSize: 13 }}>
                {t.common.backHome}
              </Link>
            )}
          </div>
        </div>
      </header>
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}
