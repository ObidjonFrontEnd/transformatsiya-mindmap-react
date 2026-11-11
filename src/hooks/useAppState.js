'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BASELINE from '../data/tasks.json';
import { SEED } from '../data/seed';
import { MAP, RMAP, CYCLE } from '../data/constants';
import { mergeDirections } from '../lib/mergeTasks';

const POLL_MS = 4000;

async function api(path, opt = {}) {
  const r = await fetch(path, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, ...opt });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || 'Хато ' + r.status);
  return j;
}

// holatlar (serverdan, uzun nom: bajarildi/jarayonda/...) -> S (qisqa nom: done/prog/...)
function deriveS(DATA, holatlar) {
  const S = {};
  DATA.forEach(d => {
    S[d.k] = {};
    const merged = { ...(SEED[d.k] || {}), ...(holatlar[d.k] || {}) };
    d.tasks.forEach(([id]) => {
      const raw = String(merged[id] || 'rejada').trim().toLowerCase();
      S[d.k][id] = MAP[raw] || 'plan';
    });
  });
  return S;
}

export function useAppState() {
  const [holatlar, setHolatlar] = useState({});
  const [overlays, setOverlays] = useState({});
  const [dirOverlay, setDirOverlay] = useState({});
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const pendingRef = useRef(new Set());
  const toastTimer = useRef(null);

  const toast = useCallback(msg => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 1500);
  }, []);

  const DATA = useMemo(() => mergeDirections(BASELINE, overlays, dirOverlay), [overlays, dirOverlay]);
  const S = useMemo(() => deriveS(DATA, holatlar), [DATA, holatlar]);

  const applyHolatlar = useCallback(serverHolatlar => {
    setHolatlar(prev => {
      const next = { ...serverHolatlar };
      // hali serverga yozilayotgan vazifalarni lokal (optimistik) qiymatda qoldiramiz
      pendingRef.current.forEach(key => {
        const [dir, id] = key.split('|');
        if (prev[dir]?.[id] != null) {
          next[dir] = { ...(next[dir] || {}), [id]: prev[dir][id] };
        }
      });
      return next;
    });
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [stateRes, tasksRes, dirsRes] = await Promise.all([api('/api/state'), api('/api/tasks'), api('/api/directions')]);
      setUser(stateRes.user || null);
      applyHolatlar(stateRes.holatlar || {});
      setOverlays(tasksRes.overlays || {});
      setDirOverlay(dirsRes.dirOverlay || {});
    } catch (e) {
      console.warn('База:', e.message);
    } finally {
      setLoading(false);
    }
  }, [applyHolatlar]);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, POLL_MS);
    return () => clearInterval(t);
  }, [refresh]);

  const cycleTask = useCallback(async (dir, id) => {
    if (!user) { toast('Таҳрирлаш учун тизимга киринг'); return; }
    const cur = S[dir]?.[id] || 'plan';
    const next = CYCLE[(CYCLE.indexOf(cur) + 1) % CYCLE.length];
    const nextLong = RMAP[next];
    const key = `${dir}|${id}`;
    pendingRef.current.add(key);

    setHolatlar(prev => ({ ...prev, [dir]: { ...(prev[dir] || {}), [id]: nextLong } }));
    toast(id + ' → сақланмоқда…');

    try {
      await api('/api/state', { method: 'POST', body: JSON.stringify({ dir, id, status: nextLong }) });
      toast(id + ' → сақланди');
    } catch (e) {
      setHolatlar(prev => ({ ...prev, [dir]: { ...(prev[dir] || {}), [id]: RMAP[cur] } }));
      if (/kiring/i.test(e.message)) setUser(null);
      toast('Сақланмади: ' + e.message);
    } finally {
      pendingRef.current.delete(key);
    }
  }, [S, user, toast]);

  const login = useCallback(async (loginName, password) => {
    const j = await api('/api/login', { method: 'POST', body: JSON.stringify({ login: loginName, password }) });
    setUser(j.user);
    toast('Хуш келибсиз, ' + j.user);
  }, [toast]);

  const logout = useCallback(async () => {
    await api('/api/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
    toast('Тизимдан чиқдингиз');
  }, [toast]);

  const runTaskAction = useCallback(async (body, okMsg) => {
    try {
      const j = await api('/api/tasks', { method: 'POST', body: JSON.stringify(body) });
      if (j.overlay) setOverlays(prev => ({ ...prev, [body.dir]: j.overlay }));
      toast(okMsg);
      return j;
    } catch (e) {
      if (/kiring/i.test(e.message)) setUser(null);
      toast('Хато: ' + e.message);
      throw e;
    }
  }, [toast]);

  const runDirAction = useCallback(async (body, okMsg) => {
    try {
      const j = await api('/api/directions', { method: 'POST', body: JSON.stringify(body) });
      if (j.dirOverlay) setDirOverlay(j.dirOverlay);
      toast(okMsg);
      return j;
    } catch (e) {
      if (/kiring/i.test(e.message)) setUser(null);
      toast('Хато: ' + e.message);
      throw e;
    }
  }, [toast]);

  const addTask = useCallback((dir, sec, sh, f) =>
    runTaskAction({ action: 'add', dir, sec, sh, f }, 'Вазифа қўшилди'), [runTaskAction]);

  const editTask = useCallback((dir, id, sh, f) =>
    runTaskAction({ action: 'edit', dir, id, sh, f }, 'Вазифа таҳрирланди'), [runTaskAction]);

  const archiveTask = useCallback((dir, id) =>
    runTaskAction({ action: 'archive', dir, id }, 'Вазифа архивланди'), [runTaskAction]);

  const restoreTask = useCallback((dir, id) =>
    runTaskAction({ action: 'restore', dir, id }, 'Вазифа архивдан қайтарилди'), [runTaskAction]);

  const setLinks = useCallback((dir, id, links) =>
    runTaskAction({ action: 'links', dir, id, links }, 'Ҳаволалар сақланди'), [runTaskAction]);

  const addSection = useCallback((dir, name) =>
    runTaskAction({ action: 'add_section', dir, name }, "Бўлим қўшилди"), [runTaskAction]);

  const renameSection = useCallback((dir, sec, name) =>
    runTaskAction({ action: 'rename_section', dir, sec, name }, "Бўлим таҳрирланди"), [runTaskAction]);

  const deleteSection = useCallback((dir, sec) =>
    runTaskAction({ action: 'delete_section', dir, sec }, "Бўлим ўчирилди"), [runTaskAction]);

  const addDirection = useCallback(nm =>
    runDirAction({ action: 'add', nm }, "Йўналиш қўшилди"), [runDirAction]);

  const renameDirection = useCallback((k, nm) =>
    runDirAction({ action: 'rename', k, nm }, "Йўналиш номи ўзгартирилди"), [runDirAction]);

  const archiveDirection = useCallback(k =>
    runDirAction({ action: 'archive', k }, "Йўналиш архивланди"), [runDirAction]);

  const restoreDirection = useCallback(k =>
    runDirAction({ action: 'restore', k }, "Йўналиш архивдан қайтарилди"), [runDirAction]);

  return {
    DATA, S, user, loading, toastMsg, cycleTask, login, logout,
    addTask, editTask, archiveTask, restoreTask, setLinks,
    addSection, renameSection, deleteSection,
    dirOverlay, addDirection, renameDirection, archiveDirection, restoreDirection,
  };
}
