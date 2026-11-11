const { DIRS } = require('../data/constants');
const { getDirOverlay } = require('./store');

// Baseline 8 ta yo'nalish + foydalanuvchi qo'shgan yangi yo'nalishlar (arxivlangan bo'lsa ham — token
// hali ham o'sha yo'nalishga ishora qilayotgan so'rovlar uchun yoziladigan amallarni bloklamaslik uchun)
async function isKnownDir(dir) {
  if (DIRS.includes(dir)) return true;
  const overlay = await getDirOverlay();
  return Object.prototype.hasOwnProperty.call(overlay, dir);
}

module.exports = { isKnownDir };
