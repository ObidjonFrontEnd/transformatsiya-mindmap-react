import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, COOKIE } from '../../../src/lib/auth';
import { getHistory } from '../../../src/lib/store';

// GET -> { history: [...] }  (faqat login qilganlar uchun — kim nimani o'zgartirganini ko'rish)
export async function GET() {
  const jar = await cookies();
  const user = verifyToken(jar.get(COOKIE)?.value);
  if (!user) return NextResponse.json({ error: 'Avval tizimga kiring' }, { status: 401 });
  try {
    const history = await getHistory(50);
    return NextResponse.json({ history }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
