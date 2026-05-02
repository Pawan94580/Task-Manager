import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ActivityFeed from '../components/ActivityFeed';

function StatCard({ label, value, icon, color, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${color}18` }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
      </div>
      <div>
        <p style={{ fontSize: 13, color: 'var(--color-muted)', fontWeight: 600 }}>{label}</p>
        <p style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.1, color }}>{value ?? '—'}</p>
        {sub && <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats]       = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [actLoading, setActLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks/dashboard').then((r) => setStats(r.data)).finally(() => setLoading(false));
    api.get('/activity?limit=20').then((r) => setActivity(r.data)).finally(() => setActLoading(false));
  }, []);

  const COLORS = ['#6366f1', '#f59e0b', '#10b981'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Greeting */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
            <span style={{ color: 'var(--color-primary)' }}>{user?.name?.split(' ')[0]}</span> 👋
          </h2>
          <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>
            Here's what's happening with your tasks today.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/tasks" className="btn-primary">+ New Task</Link>
          <Link to="/projects" className="btn-ghost">View Projects →</Link>
        </div>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><div className="spinner" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
          <StatCard label="Total Tasks"  value={stats?.total}     icon="📋" color="#6366f1" />
          <StatCard label="Completed"    value={stats?.completed} icon="✅" color="#10b981" sub={`${stats?.total ? Math.round((stats.completed/stats.total)*100) : 0}% done`} />
          <StatCard label="Pending"      value={stats?.pending}   icon="⏳" color="#f59e0b" />
          <StatCard label="Overdue"      value={stats?.overdue}   icon="🚨" color="#f43f5e" />
        </div>
      )}

      {/* Charts */}
      {!loading && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
          {/* Pie chart */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 15 }}>Task Status Breakdown</h3>
            {stats.byStatus?.every((s) => s.value === 0) ? (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <div>No task data yet</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={stats.byStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}>
                    {stats.byStatus?.map((entry, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
              {stats.byStatus?.map((s, i) => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i], display: 'inline-block' }} />
                  {s.name} ({s.value})
                </div>
              ))}
            </div>
          </div>

          {/* Bar chart */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 15 }}>Tasks per Team Member</h3>
            {!stats.byUser?.length ? (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <div>No assignment data yet</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.byUser} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted)' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-surface)' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name="Tasks" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* Activity Feed */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15 }}>Recent Activity</h3>
          <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Last 20 actions</span>
        </div>
        <ActivityFeed logs={activity} loading={actLoading} />
      </div>
    </div>
  );
}
