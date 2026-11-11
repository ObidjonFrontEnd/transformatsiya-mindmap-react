import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE } from '../../../src/lib/auth';

export async function POST() {
  const jar = await cookies();
  jar.set(COOKIE, '', { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 0 });
  return NextResponse.json({ ok: true });
}
