export const MAP = { bajarildi: 'done', jarayonda: 'prog', kechikmoqda: 'late', rejada: 'plan', tasdiqlanmagan: 'unc' };
export const RMAP = Object.fromEntries(Object.entries(MAP).map(([k, v]) => [v, k]));
export const ST = { done: 'Бажарилди', prog: 'Жараёнда', late: 'Кечикмоқда', plan: 'Режада', unc: 'Тасдиқланмаган' };
export const ICON = { done: '✓', prog: '▶', late: '!', plan: '·', unc: '?' };
export const COL = { done: '#2E9E5B', prog: '#2F6FD6', late: '#D64545', plan: '#9AA3AE', unc: '#E0A526' };
export const COLL = { done: '#E3F4EA', prog: '#E4EDFB', late: '#FBE7E7', plan: '#EEF0F3', unc: '#FCF3DC' };
export const KEYS = ['done', 'prog', 'late', 'unc', 'plan'];
export const CYCLE = ['done', 'prog', 'late', 'unc', 'plan'];

// Balл: bajarildi = 1, tasdiqlanmagan = 0.9, qolganlari = 0
export const W = { done: 1, unc: 0.9, prog: 0, late: 0, plan: 0 };

export function emptyCount() {
  return { done: 0, prog: 0, late: 0, plan: 0, unc: 0, n: 0 };
}

export function score(c) {
  return c.n ? KEYS.reduce((x, k) => x + c[k] * W[k], 0) / c.n : 0;
}

export function pc(c) {
  return Math.round(score(c) * 100);
}

export const STATUSES = Object.keys(MAP); // bajarildi, jarayonda, kechikmoqda, rejada, tasdiqlanmagan
export const DIRS = ['boshqaruv', 'moliya', 'hr', 'qurilish', 'taminot', 'savdo', 'xavfsizlik', 'xotira'];
