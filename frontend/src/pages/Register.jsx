import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'MEMBER' });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
      padding: 16,
    }}>
      <div style={{
        background: 'var(--color-surface)', borderRadius: 20, padding: 40,
        width: '100%', maxWidth: 440, boxShadow: '0 24px 60px rgba(0,0,0,.2)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg,#818cf8,#6366f1)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 12,
          }}>E</div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Create your account</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: 14, marginTop: 4 }}>Get started with Ethara today</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="label">Full Name</label>
            <input id="name" type="text" required className="input" value={form.name} onChange={set('name')} placeholder="Jane Smith" />
          </div>
          <div>
            <label className="label">Email</label>
            <input id="email" type="email" required className="input" value={form.email} onChange={set('email')} placeholder="you@company.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input id="password" type="password" required minLength={6} className="input" value={form.password} onChange={set('password')} placeholder="Min 6 characters" />
          </div>
          <div>
            <label className="label">Role</label>
            <select id="role" className="input" value={form.role} onChange={set('role')}>
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button id="register-submit" type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: 12, fontSize: 15, marginTop: 4 }}>
            {loading ? 'Creating account…' : 'Create Account →'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--color-muted)' }}>
          Have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
