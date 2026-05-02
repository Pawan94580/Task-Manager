import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => api.get(`/projects/${id}`).then((r) => setProject(r.data)).finally(() => setLoading(false));

  useEffect(() => {
    load();
    if (user?.role === 'ADMIN') api.get('/users').then((r) => setAllUsers(r.data));
  }, [id]);

  const addMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/members`, { userId: selected });
      toast.success('Member added');
      setShowModal(false);
      setSelected('');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const removeMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      toast.success('Member removed');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>;
  if (!project) return <div className="empty-state"><div className="icon">😕</div><h3>Project not found</h3><Link to="/projects">← Back to Projects</Link></div>;

  const nonMembers = allUsers.filter((u) => !project.members.some((m) => m.id === u.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <Link to="/projects" style={{ color: 'var(--color-muted)', textDecoration: 'none', fontSize: 14 }}>← Projects</Link>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>{project.name}</h2>
          <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>{project.description || 'No description'}</p>
        </div>
        <Link to={`/tasks?projectId=${project.id}`} className="btn-primary" style={{ marginLeft: 'auto' }}>View Tasks →</Link>
      </div>

      {/* Members */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15 }}>Team Members ({project.members.length})</h3>
          {user?.role === 'ADMIN' && nonMembers.length > 0 && (
            <button className="btn-primary" style={{ fontSize: 13, padding: '7px 14px' }} onClick={() => setShowModal(true)}>+ Add Member</button>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {project.members.map((m) => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: `hsl(${(m.name.charCodeAt(0) * 47) % 360},60%,55%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0,
                }}>{m.name[0].toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
                  <div style={{ color: 'var(--color-muted)', fontSize: 12 }}>{m.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className={`badge ${m.role === 'ADMIN' ? 'badge-admin' : 'badge-member'}`}>{m.role}</span>
                {user?.role === 'ADMIN' && m.id !== project.owner?.id && (
                  <button onClick={() => removeMember(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f43f5e', fontSize: 13, fontWeight: 600 }}>Remove</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Owner info */}
      <div className="card" style={{ padding: 20 }}>
        <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
          Project owner: <strong style={{ color: 'var(--color-text)' }}>{project.owner?.name}</strong> · Created {new Date(project.createdAt).toLocaleDateString()}
        </p>
      </div>

      {showModal && (
        <Modal title="Add Team Member" onClose={() => setShowModal(false)}>
          <form onSubmit={addMember} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="label">Select User</label>
              <select required className="input" value={selected} onChange={(e) => setSelected(e.target.value)}>
                <option value="">-- Choose a user --</option>
                {nonMembers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email}) — {u.role}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Add Member</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
