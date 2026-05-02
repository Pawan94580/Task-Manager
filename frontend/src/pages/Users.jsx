import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/users').then((r) => setUsers(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const updateRole = async (id, role) => {
    try {
      await api.put(`/users/${id}/role`, { role });
      toast.success('Role updated');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Users</h2>
        <p style={{ color: 'var(--color-muted)', fontSize: 14, marginTop: 2 }}>{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                {['User', 'Email', 'Role', 'Joined', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '10px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: `hsl(${(u.name.charCodeAt(0) * 47) % 360},60%,55%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
                      }}>{u.name[0].toUpperCase()}</div>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--color-muted)' }}>{u.email}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-admin' : 'badge-member'}`}>{u.role}</span>
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--color-muted)' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {u.id !== user?.id && (
                      <select
                        value={u.role}
                        onChange={(e) => updateRole(u.id, e.target.value)}
                        style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 13, cursor: 'pointer' }}
                      >
                        <option value="MEMBER">MEMBER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    )}
                    {u.id === user?.id && <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>You</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
