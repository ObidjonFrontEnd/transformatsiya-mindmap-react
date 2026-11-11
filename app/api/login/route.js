import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { COOKIE, SESSION_TTL, makeToken, safeEqual } from '../../../src/lib/auth';
import { getLoginFails, incrLoginFail, clearLoginFail } from '../../../src/lib/store';

export async function POST(req) {
  if (!process.env.ADMIN_LOGIN || !process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Login sozlanmagan (ADMIN_LOGIN / ADMIN_PASSWORD)' }, { status: 500 });
  }

  const h = await headers();
  const ip = String(h.get('x-forwarded-for') || 'local').split(',')[0].trim();

  try {
    const fails = await getLoginFails(ip);
    if (fails >= 10) {
      return NextResponse.json({ error: "Juda ko'p urinish. 15 daqiqadan keyin qayta urining." }, { status: 429 });
    }

    const { login, password } = await req.json().catch(() => ({}));
    if (safeEqual(login || '', process.env.ADMIN_LOGIN) && safeEqual(password || '', process.env.ADMIN_PASSWORD)) {
      await clearLoginFail(ip);
      const jar = await cookies();
      jar.set(COOKIE, makeToken(process.env.ADMIN_LOGIN), {
        httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: SESSION_TTL,
      });
      return NextResponse.json({ user: process.env.ADMIN_LOGIN });
    }
    await incrLoginFail(ip);
    return NextResponse.json({ error: "Login yoki parol noto'g'ri" }, { status: 401 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
