export function wrap(t, max) {
  const w = t.split(' '), L = [''];
  w.forEach(x => {
    if ((L[L.length - 1] + ' ' + x).trim().length > max && L[L.length - 1]) L.push(x);
    else L[L.length - 1] = (L[L.length - 1] + ' ' + x).trim();
  });
  return L;
}

export const trunc = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
