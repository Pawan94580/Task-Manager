import { useEffect } from 'react';

export default function Modal({ title, onClose, children, width = 520 }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: width }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: '1px solid var(--color-border)',
              background: 'transparent', cursor: 'pointer', fontSize: 18, lineHeight: 1,
              color: 'var(--color-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
