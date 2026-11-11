'use client';
import { useState } from 'react';

export default function LinksEditorModal({ open, initial, onClose, onSubmit }) {
  const [links, setLinks] = useState(initial || []);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [err, setErr] = useState('');

  if (!open) return null;

  function addLink() {
    if (!/^https:\/\//i.test(url.trim())) { setErr('Ҳавола https:// билан бошланиши керак (Google Docs/Sheets ҳаволасини нусха олинг)'); return; }
    setErr('');
    setLinks([...links, { name: name.trim() || url.trim(), url: url.trim() }]);
    setName(''); setUrl('');
  }

  async function save() {
    setErr('');
    try {
      await onSubmit(links);
      onClose();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div id="lg" className="on">
      <form onSubmit={e => e.preventDefault()} style={{ width: 400 }}>
        <h3>Ҳужжат ҳаволалари</h3>
        <div className="sub">Google Docs/Sheets ёки папка ҳаволасини қўшинг — боshqalar янги ойначада очиб ўқий олади.</div>

        {links.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {links.map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📄 {l.name}</span>
                <button type="button" className="btn" onClick={() => setLinks(links.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
          </div>
        )}

        <input placeholder="Номи (мас. «Техник топшириқ»)" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="https://docs.google.com/..." value={url} onChange={e => setUrl(e.target.value)} />
        <button type="button" className="btn" onClick={addLink}>+ Ҳавола қўшиш</button>

        <div className="err">{err}</div>
        <div className="row">
          <button type="button" className="btn" onClick={onClose}>Бекор қилиш</button>
          <button type="button" className="btn pri" onClick={save}>Сақлаш</button>
        </div>
      </form>
    </div>
  );
}
