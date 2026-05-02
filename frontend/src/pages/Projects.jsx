import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  const load = () => api.get('/projects').then((r) => setProjects(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', form);
      toast.success('Project created!');
      setShowModal(false);
      setForm({ name: '', description: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Your Projects</h2>
          <p style={{ color: 'var(--color-muted)', fontSize: 14, marginTop: 2 }}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>
      ) : !projects.length ? (
        <div className="empty-state">
          <div className="icon">📁</div>
          <h3>No projects yet</h3>
          <p>{user?.role === 'ADMIN' ? 'Create your first project to get started.' : 'You have not been added to any project yet.'}</p>
          {user?.role === 'ADMIN' && <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>Create Project</button>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 18 }}>
          {projects.map((p) => (
            <Link key={p.id} to={`/projects/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ padding: 22, height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: `hsl(${(p.name.charCodeAt(0) * 17) % 360},60%,55%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800, fontSize: 18,
                  }}>
                    {p.name[0].toUpperCase()}
                  </div>
                  {user?.role === 'ADMIN' && (
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => handleDelete(p.id, e)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f43f5e', fontSize: 13, padding: '4px 8px', borderRadius: 6, fontWeight: 600 }}
                    >Delete</button>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{p.name}</h3>
                  <p style={{ color: 'var(--color-muted)', fontSize: 13, lineHeight: 1.5 }}>{p.description || 'No description'}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--color-border)', fontSize: 12, color: 'var(--color-muted)' }}>
                  <span>👥 {p.members?.length ?? 0} member{p.members?.length !== 1 ? 's' : ''}</span>
                  <span>📋 {p.taskCount ?? 0} task{p.taskCount !== 1 ? 's' : ''}</span>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>View →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="New Project" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="label">Project Name *</label>
              <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Marketing Campaign" />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this project about?" style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Create Project</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
