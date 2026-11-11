// Xolatlar va tarix saqlash qatlami.
// Agar KV_REST_API_URL / KV_REST_API_TOKEN sozlangan bo'lsa — Upstash Redis (production, eski loyihadagi bilan bir xil sxema).
// Aks holda — lokal JSON fayl (data/local-state.json), bir nechta brauzer tabida realtime testlash uchun yetarli
// (Next.js dev serveri bitta Node jarayoni, shuning uchun fayl barcha so'rovlar uchun umumiy holat bo'lib xizmat qiladi).

const fs = require('fs');
const path = require('path');

const LOCAL_FILE = path.join(process.cwd(), 'data', 'local-state.json');

function hasRedis() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function redis(...cmd) {
  const url = process.env.KV_REST_API_URL, token = process.env.KV_REST_API_TOKEN;
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

function readLocal() {
  try {
    return JSON.parse(fs.readFileSync(LOCAL_FILE, 'utf8'));
  } catch {
    return { holatlar: {}, tarix: [], login_fail: {} };
  }
}

function writeLocal(data) {
  fs.mkdirSync(path.dirname(LOCAL_FILE), { recursive: true });
  fs.writeFileSync(LOCAL_FILE, JSON.stringify(data, null, 2));
}

// ---------- umumiy interfeys ----------

async function getAllHolatlar() {
  if (hasRedis()) {
    const flat = (await redis('HGETALL', 'holatlar')) || [];
    const holatlar = {};
    for (let i = 0; i < flat.length; i += 2) {
      try { holatlar[flat[i]] = JSON.parse(flat[i + 1]); } catch {}
    }
    return holatlar;
  }
  return readLocal().holatlar || {};
}

async function getDirHolatlar(dir) {
  if (hasRedis()) {
    try { return JSON.parse((await redis('HGET', 'holatlar', dir)) || '{}'); } catch { return {}; }
  }
  return (readLocal().holatlar || {})[dir] || {};
}

// bitta vazifa holatini darhol yozish (ziddiyatni oldini olish — butun yo'nalishni qayta yozmaydi)
async function setTaskStatus({ dir, id, status, user }) {
  const prev = await getDirHolatlar(dir);
  const eski = prev[id] || null;
  const next = { ...prev, [id]: status };

  if (hasRedis()) {
    await redis('HSET', 'holatlar', dir, JSON.stringify(next));
  } else {
    const local = readLocal();
    local.holatlar = local.holatlar || {};
    local.holatlar[dir] = next;
    writeLocal(local);
  }

  if (eski !== status) {
    await pushHistory({ user, dir, changes: [{ id, eski, yangi: status }] });
  }
  return { ozgardi: eski !== status ? 1 : 0 };
}

async function pushHistory({ user, dir, changes }) {
  const entry = { vaqt: new Date().toISOString(), user, dir, changes };
  if (hasRedis()) {
    await redis('LPUSH', 'tarix', JSON.stringify(entry));
    await redis('LTRIM', 'tarix', 0, 499);
  } else {
    const local = readLocal();
    local.tarix = [entry, ...(local.tarix || [])].slice(0, 500);
    writeLocal(local);
  }
}

// login urinishlarini cheklash (15 daqiqa / 10 xato)
async function getLoginFails(ip) {
  if (hasRedis()) return Number(await redis('GET', `login_fail:${ip}`)) || 0;
  const local = readLocal();
  const rec = (local.login_fail || {})[ip];
  if (!rec) return 0;
  if (Date.now() > rec.exp) return 0;
  return rec.count;
}

async function incrLoginFail(ip) {
  if (hasRedis()) {
    await redis('INCR', `login_fail:${ip}`);
    await redis('EXPIRE', `login_fail:${ip}`, 900);
    return;
  }
  const local = readLocal();
  local.login_fail = local.login_fail || {};
  const rec = local.login_fail[ip];
  local.login_fail[ip] = { count: rec && Date.now() <= rec.exp ? rec.count + 1 : 1, exp: Date.now() + 900_000 };
  writeLocal(local);
}

async function clearLoginFail(ip) {
  if (hasRedis()) { await redis('DEL', `login_fail:${ip}`); return; }
  const local = readLocal();
  if (local.login_fail) delete local.login_fail[ip];
  writeLocal(local);
}

async function getHistory(limit = 50) {
  if (hasRedis()) {
    const raw = (await redis('LRANGE', 'tarix', 0, limit - 1)) || [];
    return raw.map(s => { try { return JSON.parse(s); } catch { return null; } }).filter(Boolean);
  }
  return (readLocal().tarix || []).slice(0, limit);
}

// ---------- vazifalar CRUD qatlami (overlay, baseline tasks.json ustiga) ----------
// task_overlay[dir] = { added: [[id, sec, sh, f]], edited: { [id]: {sh, f} }, archived: [id, ...],
//                        links: { [id]: [{name, url}] }, secs: { [secNum]: nomi | null (o'chirilgan) } }

function emptyOverlay() { return { added: [], edited: {}, archived: [], links: {}, secs: {} }; }

async function getOverlay(dir) {
  let raw;
  if (hasRedis()) {
    try { raw = JSON.parse((await redis('HGET', 'task_overlay', dir)) || '{}'); } catch { raw = {}; }
  } else {
    raw = (readLocal().task_overlay || {})[dir] || {};
  }
  return { ...emptyOverlay(), ...raw };
}

async function getAllOverlays() {
  if (hasRedis()) {
    const flat = (await redis('HGETALL', 'task_overlay')) || [];
    const out = {};
    for (let i = 0; i < flat.length; i += 2) {
      try { out[flat[i]] = { ...emptyOverlay(), ...JSON.parse(flat[i + 1]) }; } catch {}
    }
    return out;
  }
  return readLocal().task_overlay || {};
}

async function saveOverlay(dir, overlay) {
  if (hasRedis()) {
    await redis('HSET', 'task_overlay', dir, JSON.stringify(overlay));
  } else {
    const local = readLocal();
    local.task_overlay = local.task_overlay || {};
    local.task_overlay[dir] = overlay;
    writeLocal(local);
  }
}

async function addTask({ dir, id, sec, sh, f, user }) {
  const overlay = await getOverlay(dir);
  overlay.added.push([id, sec, sh, f]);
  await saveOverlay(dir, overlay);
  await pushHistory({ user, dir, changes: [{ id, eski: null, yangi: `qo'shildi: ${sh}` }] });
  return overlay;
}

async function editTask({ dir, id, sh, f, user }) {
  const overlay = await getOverlay(dir);
  overlay.edited[id] = { sh, f };
  const addedIdx = overlay.added.findIndex(t => t[0] === id);
  if (addedIdx >= 0) { overlay.added[addedIdx][2] = sh; overlay.added[addedIdx][3] = f; }
  await saveOverlay(dir, overlay);
  await pushHistory({ user, dir, changes: [{ id, eski: null, yangi: `tahrirlandi: ${sh}` }] });
  return overlay;
}

async function archiveTask({ dir, id, user }) {
  const overlay = await getOverlay(dir);
  if (!overlay.archived.includes(id)) overlay.archived.push(id);
  await saveOverlay(dir, overlay);
  await pushHistory({ user, dir, changes: [{ id, eski: null, yangi: 'arxivlandi' }] });
  return overlay;
}

async function restoreTask({ dir, id, user }) {
  const overlay = await getOverlay(dir);
  overlay.archived = overlay.archived.filter(x => x !== id);
  await saveOverlay(dir, overlay);
  await pushHistory({ user, dir, changes: [{ id, eski: null, yangi: 'arxivdan qaytarildi' }] });
  return overlay;
}

async function setTaskLinks({ dir, id, links, user }) {
  const overlay = await getOverlay(dir);
  overlay.links = overlay.links || {};
  if (links.length) overlay.links[id] = links; else delete overlay.links[id];
  await saveOverlay(dir, overlay);
  await pushHistory({ user, dir, changes: [{ id, eski: null, yangi: `havolalar yangilandi (${links.length})` }] });
  return overlay;
}

async function addSection({ dir, sec, name, user }) {
  const overlay = await getOverlay(dir);
  overlay.secs = overlay.secs || {};
  overlay.secs[sec] = name;
  await saveOverlay(dir, overlay);
  await pushHistory({ user, dir, changes: [{ id: `${sec}-bo'lim`, eski: null, yangi: `qo'shildi: ${name}` }] });
  return overlay;
}

async function renameSection({ dir, sec, name, user }) {
  const overlay = await getOverlay(dir);
  overlay.secs = overlay.secs || {};
  overlay.secs[sec] = name;
  await saveOverlay(dir, overlay);
  await pushHistory({ user, dir, changes: [{ id: `${sec}-bo'lim`, eski: null, yangi: `tahrirlandi: ${name}` }] });
  return overlay;
}

async function deleteSection({ dir, sec, user }) {
  const overlay = await getOverlay(dir);
  overlay.secs = overlay.secs || {};
  overlay.secs[sec] = null; // tombstone — baseline'dagi nomni ham yashiradi
  await saveOverlay(dir, overlay);
  await pushHistory({ user, dir, changes: [{ id: `${sec}-bo'lim`, eski: null, yangi: "o'chirildi" }] });
  return overlay;
}

// ---------- yo'nalishlar CRUD (global registr, baseline 8 ta yo'nalish ustiga) ----------
// dir_overlay = { [k]: { nm, archived } }  -- yangi yo'nalishlar va baseline nomlarni almashtirish/arxivlash

async function getDirOverlay() {
  if (hasRedis()) {
    try { return JSON.parse((await redis('GET', 'dir_overlay')) || '{}'); } catch { return {}; }
  }
  return readLocal().dir_overlay || {};
}

async function saveDirOverlay(obj) {
  if (hasRedis()) {
    await redis('SET', 'dir_overlay', JSON.stringify(obj));
  } else {
    const local = readLocal();
    local.dir_overlay = obj;
    writeLocal(local);
  }
}

async function addDirection({ k, nm, user }) {
  const overlay = await getDirOverlay();
  overlay[k] = { nm, archived: false };
  await saveDirOverlay(overlay);
  await pushHistory({ user, dir: k, changes: [{ id: null, eski: null, yangi: `yo'nalish qo'shildi: ${nm}` }] });
  return overlay;
}

async function renameDirection({ k, nm, user }) {
  const overlay = await getDirOverlay();
  overlay[k] = { ...(overlay[k] || { archived: false }), nm };
  await saveDirOverlay(overlay);
  await pushHistory({ user, dir: k, changes: [{ id: null, eski: null, yangi: `yo'nalish nomi: ${nm}` }] });
  return overlay;
}

async function setDirectionArchived({ k, archived, nm, user }) {
  const overlay = await getDirOverlay();
  overlay[k] = { ...(overlay[k] || {}), nm: overlay[k]?.nm ?? nm, archived };
  await saveDirOverlay(overlay);
  await pushHistory({ user, dir: k, changes: [{ id: null, eski: null, yangi: archived ? 'arxivlandi' : 'arxivdan qaytarildi' }] });
  return overlay;
}

module.exports = {
  hasRedis, getAllHolatlar, getDirHolatlar, setTaskStatus, getLoginFails, incrLoginFail, clearLoginFail,
  getHistory, getOverlay, getAllOverlays, addTask, editTask, archiveTask, restoreTask, setTaskLinks,
  addSection, renameSection, deleteSection,
  getDirOverlay, addDirection, renameDirection, setDirectionArchived,
};
