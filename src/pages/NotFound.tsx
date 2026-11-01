import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { useI18n } from '../i18n';

export default function NotFound() {
  const { t } = useI18n();

  useSEO({
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist. Browse our collection of free browser games.',
    path: '/404',
  });

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: 'calc(100vh - 200px)', textAlign: 'center', padding: '40px 24px',
    }}>
      <div style={{ fontSize: 80, marginBottom: 16, animation: 'float 3s ease-in-out infinite' }}>
        🕹️
      </div>
      <h1 style={{
        fontSize: 64, fontWeight: 900, margin: '0 0 8px', lineHeight: 1,
        background: 'linear-gradient(135deg, #ff2d95, #ff6b2b)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        404
      </h1>
      <p style={{ fontSize: 18, color: '#c8a0e0', fontWeight: 700, marginBottom: 8 }}>
        Oops! Page not found
      </p>
      <p style={{ fontSize: 14, color: '#7060a0', marginBottom: 28, maxWidth: 400 }}>
        The page you are looking for doesn't exist or has been moved. Let's get you back to the games!
      </p>
      <Link
        to="/"
        style={{
          padding: '12px 32px', borderRadius: 14,
          background: 'linear-gradient(135deg, #ff2d95, #ff6b2b)',
          color: '#fff', textDecoration: 'none',
          fontWeight: 800, fontSize: 15,
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        🏠 {t.common.backHome}
      </Link>
    </div>
  );
}
