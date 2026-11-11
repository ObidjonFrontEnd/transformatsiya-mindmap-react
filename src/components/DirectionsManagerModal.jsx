'use client';
import { useState } from 'react';

export default function DirectionsManagerModal({ open, onClose, BASELINE, dirOverlay, onAdd, onRename, onArchive, onRestore }) {
  const [newNm, setNewNm] = useState('');
  const [renaming, setRenaming] = useState(null); // {k, nm}
  const [err, setErr] = useState('');

  if (!open) return null;

  const baselineKeys = new Set(BASELINE.map(d => d.k));
  const rows = [
    ...BASELINE.map(d => ({ k: d.k, nm: dirOverlay[d.k]?.nm ?? d.nm, archived: !!dirOverlay[d.k]?.archived })),
    ...Object.entries(dirOverlay).filter(([k]) => !baselineKeys.has(k)).map(([k, v]) => ({ k, nm: v.nm, archived: !!v.archived })),
  ];

  async function submitAdd(e) {
    e.preventDefault();
    setErr('');
    if (!newNm.trim()) return;
    try { await onAdd(newNm.trim()); setNewNm(''); } catch (x) { setErr(x.message); }
  }

  async function submitRename(e) {
    e.preventDefault();
    setErr('');
    try { await onRename(renaming.k, renaming.nm); setRenaming(null); } catch (x) { setErr(x.message); }
  }

  return (
    <div id="lg" className="on">
      <form onSubmit={e => e.preventDefault()} style={{ width: 420 }}>
        <h3>Йўналишларни бошқариш</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflowY: 'auto' }}>
          {rows.map(r => (
            <div key={r.k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, opacity: r.archived ? 0.5 : 1 }}>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {r.nm}{r.archived ? ' (архивда)' : ''}
              </span>
              <button type="button" className="btn" onClick={() => setRenaming({ k: r.k, nm: r.nm })}>✎</button>
              {r.archived
                ? <button type="button" className="btn" onClick={() => onRestore(r.k)}>Қайтариш</button>
                : <button type="button" className="btn" style={{ color: 'var(--late)' }} onClick={() => onArchive(r.k)}>Архивлаш</button>}
            </div>
          ))}
        </div>

        {renaming && (
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 10, marginTop: 4 }}>
            <div className="sub" style={{ marginBottom: 6 }}>«{renaming.k}» номини ўзгартириш</div>
            <input value={renaming.nm} onChange={e => setRenaming({ ...renaming, nm: e.target.value })} />
            <div className="row" style={{ marginTop: 8 }}>
              <button type="button" className="btn" onClick={() => setRenaming(null)}>Бекор қилиш</button>
              <button type="button" className="btn pri" onClick={submitRename}>Сақлаш</button>
            </div>
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 10, marginTop: 4 }}>
          <div className="sub" style={{ marginBottom: 6 }}>Янги йўналиш қўшиш</div>
          <input placeholder="Мас. «Маркетинг»" value={newNm} onChange={e => setNewNm(e.target.value)} />
          <div className="row" style={{ marginTop: 8, justifyContent: 'flex-start' }}>
            <button type="button" className="btn pri" onClick={submitAdd}>+ Қўшиш</button>
          </div>
        </div>

        <div className="err">{err}</div>
        <div className="row">
          <button type="button" className="btn" onClick={onClose}>Ёпиш</button>
        </div>
      </form>
    </div>
  );
}
