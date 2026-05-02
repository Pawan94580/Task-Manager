import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/dashboard', icon: '⬡', label: 'Dashboard' },
  { to: '/projects',  icon: '◫', label: 'Projects'  },
  { to: '/tasks',     icon: '✓', label: 'Tasks'     },
];

export default function Sidebar() {
  const { user } = useAuth();
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#818cf8,#6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: '#fff',
          }}>E</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 16, letterSpacing: '-.02em' }}>Ethara</div>
            <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 11, marginTop: 1 }}>Task Manager</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 12px', flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '.1em', padding: '8px 8px 6px', textTransform: 'uppercase' }}>Navigation</div>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <span style={{ fontSize: 16 }}>{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
        {user?.role === 'ADMIN' && (
          <NavLink to="/users" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <span style={{ fontSize: 16 }}>👥</span>
            Users
          </NavLink>
        )}
      </nav>

      {/* User profile at bottom */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg,#a5b4fc,#818cf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 11 }}>{user?.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
