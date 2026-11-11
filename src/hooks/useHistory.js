'use client';
import { useCallback, useState } from 'react';

export function useHistory() {
  const [history, setHistory] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const r = await fetch('/api/history', { credentials: 'same-origin' });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Хато');
      setHistory(j.history || []);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  return { history, error, load };
}
