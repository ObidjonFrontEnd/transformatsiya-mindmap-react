'use client';
import { useState } from 'react';

export default function LoginModal({ open, onClose, onLogin }) {
  const [err, setErr] = useState('');
  if (!open) return null;

  async function submit(e) {
    e.preventDefault();
    setErr('');
    const f = new FormData(e.target);
    try {
      await onLogin(f.get('login'), f.get('password'));
      e.target.reset();
      onClose();
    } catch (x) {
      setErr(x.message);
    }
  }

  return (
    <div id="lg" className="on">
      <form onSubmit={submit} autoComplete="on">
        <h3>Тизимга кириш</h3>
        <input name="login" placeholder="Логин" autoComplete="username" required />
        <input name="password" type="password" placeholder="Парол" autoComplete="current-password" required />
        <div className="err">{err}</div>
        <div className="row">
          <button type="button" className="btn" onClick={onClose}>Бекор қилиш</button>
          <button className="btn pri" type="submit">Кириш</button>
        </div>
      </form>
    </div>
  );
}
