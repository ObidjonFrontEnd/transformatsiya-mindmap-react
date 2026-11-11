import { KEYS, emptyCount } from '../data/constants';

// S: { [dir]: { [taskId]: shortStatus } }
export function countFor(dir, S, sec) {
  const c = emptyCount();
  dir.tasks.forEach(([id, s]) => {
    if (sec == null || s === sec) {
      const st = S[dir.k]?.[id] || 'plan';
      c[st]++;
      c.n++;
    }
  });
  return c;
}

export function countAll(DATA, S) {
  const c = emptyCount();
  DATA.forEach(d => {
    const x = countFor(d, S);
    KEYS.forEach(k => (c[k] += x[k]));
    c.n += x.n;
  });
  return c;
}
