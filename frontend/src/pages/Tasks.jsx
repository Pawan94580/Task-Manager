import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import KanbanBoard from '../components/KanbanBoard';
import toast from 'react-hot-toast';

const EMPTY_FORM = { title: '', description: '', priority: 'MEDIUM', dueDate: '', assignedToId: '', projectId: '', status: 'TODO' };

export default function Tasks() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [tasks, setTasks]       = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM, projectId: searchParams.get('projectId') || '' });
  const [view, setView] = useState('kanban');
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterUser, setFilterUser]     = useState('');

  const loadTasks = useCallback(() => {
    const params = new URLSearchParams();
    if (filterStatus)   params.set('status', filterStatus);
    if (filterPriority) params.set('priority', filterPriority);
    if (filterUser)     params.set('assignedToId', filterUser);
    if (search)         params.set('search', search);
    const pid = searchParams.get('projectId');
    if (pid) params.set('projectId', pid);
    return api.get(`/tasks?${params}`).then((r) => setTasks(r.data)).finally(() => setLoading(false));
  }, [filterStatus, filterPriority, filterUser, search, searchParams]);

  useEffect(() => {
    loadTasks();
    api.get('/projects').then((r) => setProjects(r.data));
    if (user?.role === 'ADMIN') api.get('/users').then((r) => setUsers(r.data));
  }, [loadTasks]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', form);
      toast.success('Task created!');
      setShowModal(false);
      setForm({ ...EMPTY_FORM });
      loadTasks();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleStatusChange = async (taskId, status) => {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status } : t));
    try { await api.put(`/tasks/${taskId}`, { status }); }
    catch { toast.error('Failed to update status'); loadTasks(); }
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try { await api.delete(`/tasks/${taskId}`); toast.success('Task deleted'); loadTasks(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const overdueCount = tasks.filter((t) => t.isOverdue).length;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Tasks</h2>
          <p style={{ color: 'var(--color-muted)', fontSize: 13, marginTop: 2 }}>
            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
            {overdueCount > 0 && <span style={{ color: '#f43f5e', marginLeft: 8 }}>· {overdueCount} overdue ⚠</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
            {[['kanban','🗂 Kanban'],['list','☰ List']].map(([v, lbl]) => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '7px 14px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: view === v ? 'var(--color-primary)' : 'transparent',
                color: view === v ? '#fff' : 'var(--color-muted)',
              }}>{lbl}</button>
            ))}
          </div>
          {user?.role === 'ADMIN' && <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Task</button>}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <input className="input" style={{ maxWidth: 220 }} placeholder="🔍 Search tasks…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" style={{ maxWidth: 150 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
        <select className="input" style={{ maxWidth: 150 }} value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="">All Priority</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
        {user?.role === 'ADMIN' && (
          <select className="input" style={{ maxWidth: 180 }} value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
            <option value="">All Members</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        )}
        {(search || filterStatus || filterPriority || filterUser) && (
          <button className="btn-ghost" onClick={() => { setSearch(''); setFilterStatus(''); setFilterPriority(''); setFilterUser(''); }}>Clear ×</button>
        )}
      </div>

      {/* Board / List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>
      ) : !tasks.length ? (
        <div className="empty-state">
          <div className="icon">✅</div>
          <h3>No tasks found</h3>
          <p>{user?.role === 'ADMIN' ? 'Create your first task.' : 'No tasks assigned to you yet.'}</p>
          {user?.role === 'ADMIN' && <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>Create Task</button>}
        </div>
      ) : view === 'kanban' ? (
        <KanbanBoard tasks={tasks} isAdmin={user?.role === 'ADMIN'} onStatusChange={handleStatusChange} onDelete={handleDelete} />
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                {['Title','Project','Status','Priority','Assigned','Due Date',''].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--color-border)', background: t.isOverdue ? 'rgba(244,63,94,.04)' : 'transparent' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: 14 }}>
                    {t.isOverdue && <span style={{ color: '#f43f5e', marginRight: 4 }}>⚠</span>}{t.title}
                    {t.description && <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2, fontWeight: 400 }}>{t.description.slice(0,60)}{t.description.length>60?'…':''}</p>}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-muted)' }}>{t.project?.name}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge ${t.status==='TODO'?'badge-todo':t.status==='IN_PROGRESS'?'badge-inprog':'badge-done'}`}>
                      {t.status==='IN_PROGRESS'?'In Progress':t.status==='TODO'?'To Do':'Done'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}><span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span></td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>{t.assignedTo?.name||'—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: t.isOverdue?'#f43f5e':'var(--color-muted)' }}>{t.dueDate?new Date(t.dueDate).toLocaleDateString():'—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {user?.role==='ADMIN' && <button onClick={()=>handleDelete(t.id)} style={{ background:'none',border:'none',cursor:'pointer',color:'#f43f5e',fontSize:13,fontWeight:600 }}>Delete</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title="Create Task" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><label className="label">Title *</label><input required className="input" value={form.title} onChange={set('title')} placeholder="Task title" /></div>
            <div><label className="label">Description</label><textarea className="input" rows={2} value={form.description} onChange={set('description')} placeholder="Optional…" style={{ resize:'vertical' }} /></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div><label className="label">Priority</label>
                <select className="input" value={form.priority} onChange={set('priority')}>
                  <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
                </select>
              </div>
              <div><label className="label">Due Date</label><input type="date" className="input" value={form.dueDate} onChange={set('dueDate')} /></div>
            </div>
            <div><label className="label">Project *</label>
              <select required className="input" value={form.projectId} onChange={set('projectId')}>
                <option value="">-- Select Project --</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div><label className="label">Assign To</label>
              <select className="input" value={form.assignedToId} onChange={set('assignedToId')}>
                <option value="">-- Unassigned --</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
              <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Create Task</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
