import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const TITLES = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/tasks': 'Tasks',
  '/users': 'Users',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const { pathname } = useLocation();

  const title = Object.entries(TITLES).find(([k]) => pathname.startsWith(k))?.[1] || 'Ethara';

  return (
    <header className="topbar">
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em' }}>{title}</h1>
      </div>

      {/* Dark mode toggle */}
      <button onClick={toggle} style={{
        width: 38, height: 38, borderRadius: 10, border: '1px solid var(--color-border)',
        background: 'transparent', cursor: 'pointer', fontSize: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-muted)', transition: 'all .2s',
      }} title="Toggle theme">
        {dark ? '☀️' : '🌙'}
      </button>

      {/* Avatar + logout */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg,#818cf8,#6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 14,
        }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</span>
        <button
          onClick={logout}
          className="btn-ghost"
          style={{ padding: '6px 12px', fontSize: 13 }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
