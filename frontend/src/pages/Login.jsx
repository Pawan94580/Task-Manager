import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        toast.error(data.errors.map(e => e.message).join(', '));
      } else {
        toast.error(data?.message || 'Login failed');
      }
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
    }}>
      {/* Left panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, color: '#fff' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'linear-gradient(135deg,#818cf8,#6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, fontWeight: 800, marginBottom: 24, boxShadow: '0 16px 40px rgba(99,102,241,.4)',
        }}>E</div>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12, letterSpacing: '-.02em' }}>Ethara</h1>
        <p style={{ fontSize: 16, opacity: .7, textAlign: 'center', maxWidth: 300, lineHeight: 1.6 }}>
          The modern team task manager built for high-performing teams.
        </p>
        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 260 }}>
          {['🚀 Kanban Board with Drag & Drop', '📊 Insightful Dashboard & Charts', '🔔 Real-time Activity Logs', '🌙 Dark Mode Support'].map((f) => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, opacity: .85 }}>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-surface)', padding: 48,
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Sign in</h2>
          <p style={{ color: 'var(--color-muted)', marginBottom: 32, fontSize: 14 }}>
            Welcome back! Enter your credentials.
          </p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label className="label">Email</label>
              <input id="email" type="email" required className="input" value={form.email} onChange={set('email')} placeholder="you@company.com" />
            </div>
            <div>
              <label className="label">Password</label>
              <input id="password" type="password" required className="input" value={form.password} onChange={set('password')} placeholder="••••••••" />
            </div>
            <button id="login-submit" type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15 }}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--color-muted)' }}>
            No account?{' '}
            <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
