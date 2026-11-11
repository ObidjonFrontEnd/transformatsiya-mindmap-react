const crypto = require('crypto');

const COOKIE = 'mm_s';
const SESSION_TTL = 7 * 24 * 3600; // 7 kun

function secret() {
  // Parol yoki Redis tokeni o'zgarsa, eski sessiyalar avtomatik bekor bo'ladi
  return crypto.createHash('sha256')
    .update(`${process.env.KV_REST_API_TOKEN || ''}|${process.env.ADMIN_PASSWORD || ''}|mindmap-react`)
    .digest();
}

const b64 = s => Buffer.from(s).toString('base64url');
const sign = data => crypto.createHmac('sha256', secret()).update(data).digest('base64url');

function makeToken(user) {
  const data = b64(JSON.stringify({ u: user, exp: Math.floor(Date.now() / 1000) + SESSION_TTL }));
  return `${data}.${sign(data)}`;
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

function verifyToken(token) {
  if (!token) return null;
  const [data, sig] = token.split('.');
  if (!data || !sig || !safeEqual(sig, sign(data))) return null;
  try {
    const p = JSON.parse(Buffer.from(data, 'base64url').toString());
    return p.exp > Date.now() / 1000 ? p.u : null;
  } catch { return null; }
}

module.exports = { COOKIE, SESSION_TTL, makeToken, verifyToken, safeEqual };
