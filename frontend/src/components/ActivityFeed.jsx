const ACTION_ICONS = {
  'Created project': '🏗',
  'Created task':    '✅',
  'Updated status':  '🔄',
  'Changed status':  '🔄',
  'Deleted task':    '🗑',
  'Added member':    '👥',
};

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function ActivityFeed({ logs = [], loading }) {
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
      <div className="spinner" />
    </div>
  );
  if (!logs.length) return (
    <div className="empty-state">
      <div className="icon">📋</div>
      <h3>No activity yet</h3>
      <p>Actions will appear here as you work</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {logs.map((log, i) => (
        <div key={log.id} style={{
          display: 'flex', gap: 14, paddingBottom: 16,
          borderLeft: '2px solid var(--color-border)',
          paddingLeft: 16, marginLeft: 12, position: 'relative',
        }}>
          {/* Timeline dot */}
          <div style={{
            position: 'absolute', left: -9, top: 0,
            width: 18, height: 18, borderRadius: '50%',
            background: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10,
          }}>
            {ACTION_ICONS[log.action] || '•'}
          </div>

          <div style={{ flex: 1, paddingTop: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4 }}>
              <span style={{ fontSize: 13 }}>
                <strong style={{ color: 'var(--color-primary)' }}>{log.user?.name}</strong>
                {' '}{log.action.toLowerCase()}
                {log.detail && <span style={{ color: 'var(--color-muted)' }}>: {log.detail}</span>}
              </span>
              <span style={{ fontSize: 11, color: 'var(--color-muted)', flexShrink: 0 }}>
                {timeAgo(log.createdAt)}
              </span>
            </div>
            {log.task && (
              <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 2 }}>
                📌 {log.task.title}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
