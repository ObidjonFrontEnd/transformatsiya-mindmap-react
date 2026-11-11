'use client';
import { useEffect } from 'react';
import { useHistory } from '../hooks/useHistory';

function fmt(iso) {
  try { return new Date(iso).toLocaleString('uz-UZ'); } catch { return iso; }
}

export default function HistoryPanel({ open, onClose, DATA }) {
  const { history, error, load } = useHistory();

  useEffect(() => { if (open) load(); }, [open, load]);

  if (!open) return null;
  const nameOf = k => DATA.find(d => d.k === k)?.nm || k;

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(22,32,43,.45)', zIndex: 10 }} onClick={onClose} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 380, maxWidth: '90vw', background: '#fff', zIndex: 11,
        boxShadow: '-10px 0 40px rgba(0,0,0,.2)', padding: 20, overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Тарих</h3>
          <button className="btn" onClick={onClose}>Ёпиш</button>
        </div>
        {error && <div className="err">{error}</div>}
        {!history && !error && <div className="sub">Юкланмоқда…</div>}
        {history && history.length === 0 && <div className="sub">Ҳали ўзгаришлар йўқ</div>}
        {history && history.map((h, i) => (
          <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #EEF0F3', fontSize: 12.5 }}>
            <div style={{ color: 'var(--mute)', fontSize: 11 }}>{fmt(h.vaqt)} · 👤 {h.user}</div>
            <div><b>{nameOf(h.dir)}</b></div>
            {h.changes.map((c, j) => (
              <div key={j}>{c.id}: {c.eski ? `${c.eski} → ` : ''}{c.yangi}</div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
