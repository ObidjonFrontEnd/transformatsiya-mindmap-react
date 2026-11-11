'use client';
import { useState } from 'react';

export default function NameModal({ open, title, initial, onClose, onSubmit }) {
  const [err, setErr] = useState('');
  if (!open) return null;

  async function submit(e) {
    e.preventDefault();
    setErr('');
    const f = new FormData(e.target);
    try {
      await onSubmit(f.get('nm'));
      onClose();
    } catch (x) {
      setErr(x.message);
    }
  }

  return (
    <div id="lg" className="on">
      <form onSubmit={submit}>
        <h3>{title}</h3>
        <input name="nm" placeholder="Номи" defaultValue={initial || ''} required />
        <div className="err">{err}</div>
        <div className="row">
          <button type="button" className="btn" onClick={onClose}>Бекор қилиш</button>
          <button className="btn pri" type="submit">Сақлаш</button>
        </div>
      </form>
    </div>
  );
}
