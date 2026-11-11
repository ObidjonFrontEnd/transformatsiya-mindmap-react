// BASELINE (eski saytdan ko'chirilgan 324 vazifa, o'zgarmas) ustiga serverdagi overlay'ni (qo'shilgan/
// tahrirlangan/arxivlangan vazifalar, bo'limlar) qo'yib, ekranda ko'rsatiladigan yakuniy DATA tuzilmasini hosil qiladi.

function mergeOneDir(base, ov) {
  ov = ov || { added: [], edited: {}, archived: [], links: {}, secs: {} };
  const archived = new Set(ov.archived || []);
  const edited = ov.edited || {};
  const links = ov.links || {};

  // har bir vazifa tuple'ini [id, sec, sh, f, links] shakliga keltiradi
  const finalize = t => [
    t[0], t[1],
    edited[t[0]] ? edited[t[0]].sh : t[2],
    edited[t[0]] ? edited[t[0]].f : t[3],
    links[t[0]] || [],
  ];

  const secOverlay = ov.secs || {};
  const secs = { ...base.secs };
  for (const [num, name] of Object.entries(secOverlay)) {
    if (name == null) delete secs[num]; else secs[num] = name;
  }
  const deletedSecs = new Set(Object.entries(secOverlay).filter(([, v]) => v == null).map(([k]) => Number(k)));

  const base_ = (base.tasks || [])
    .filter(t => !archived.has(t[0]) && !deletedSecs.has(t[1]))
    .map(finalize);
  const added = (ov.added || [])
    .filter(t => !archived.has(t[0]) && !deletedSecs.has(t[1]))
    .map(finalize);

  const tasks = [...base_, ...added].sort((x, y) => {
    if (x[1] !== y[1]) return x[1] - y[1];
    return parseFloat(x[0]) - parseFloat(y[0]);
  });

  return { k: base.k, nm: base.nm, secs, tasks };
}

export function mergeOverlays(BASELINE, overlays) {
  return BASELINE.map(d => mergeOneDir(d, overlays[d.k]));
}

// BASELINE + task_overlay (har yo'nalish uchun) + dir_overlay (yo'nalishlarning o'zi: yangi/nomi/arxiv)
export function mergeDirections(BASELINE, taskOverlays, dirOverlay) {
  dirOverlay = dirOverlay || {};
  const baselineKeys = new Set(BASELINE.map(d => d.k));

  const fromBaseline = BASELINE
    .filter(d => !dirOverlay[d.k]?.archived)
    .map(d => mergeOneDir({ ...d, nm: dirOverlay[d.k]?.nm ?? d.nm }, taskOverlays[d.k]));

  const custom = Object.entries(dirOverlay)
    .filter(([k, v]) => !baselineKeys.has(k) && !v.archived)
    .map(([k, v]) => mergeOneDir({ k, nm: v.nm, secs: {}, tasks: [] }, taskOverlays[k]));

  return [...fromBaseline, ...custom];
}

// Bo'limdagi mavjud eng katta minor raqamdan keyingisini beradi (masalan 3.11 -> 3.12)
export function nextTaskId(dirTasks, sec) {
  let max = 0;
  dirTasks.forEach(([id, s]) => {
    if (s !== sec) return;
    const minor = parseInt(String(id).split('.')[1], 10);
    if (minor > max) max = minor;
  });
  return `${sec}.${max + 1}`;
}

// Yo'nalishdagi mavjud bo'lim raqamlaridan keyingisini beradi
export function nextSectionNum(secsObj) {
  const nums = Object.keys(secsObj || {}).map(Number).filter(n => !isNaN(n));
  return (nums.length ? Math.max(...nums) : 0) + 1;
}

// lotin/kiril harflarni urf bo'lgan slug'ga aylantiradi, mas. "Yangi bo'lim" -> "yangi_bolim"
export function slugify(nm) {
  const map = { 'ў': 'u', 'қ': 'q', 'ғ': 'g', 'ҳ': 'h', 'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'x', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sh', 'ъ': '', 'ы': 'i', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya' };
  const translit = nm.toLowerCase().split('').map(ch => map[ch] ?? ch).join('');
  const slug = translit.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return slug || 'yonalish';
}
