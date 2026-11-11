import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, COOKIE } from '../../../src/lib/auth';
import { getAllHolatlar, setTaskStatus } from '../../../src/lib/store';
import { STATUSES } from '../../../src/data/constants';
import { isKnownDir } from '../../../src/lib/dirs';

async function getUser() {
  const jar = await cookies();
  return verifyToken(jar.get(COOKIE)?.value);
}

// GET -> { user, holatlar }  (hammaga ochiq, realtime poll shu endpointni chaqiradi)
export async function GET() {
  try {
    const [user, holatlar] = await Promise.all([getUser(), getAllHolatlar()]);
    return NextResponse.json({ user, holatlar }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST { dir, id, status } -> bitta vazifa holatini darhol saqlaydi (faqat login qilgan)
// Butun yo'nalishni qayta yozmaydi — shuning uchun ikki kishi bir vaqtda boshqa-boshqa
// vazifani tahrirlasa, bir-birining o'zgarishini o'chirib yubormaydi.
export async function POST(req) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Avval tizimga kiring' }, { status: 401 });

    const { dir, id, status } = await req.json().catch(() => ({}));
    if (!(await isKnownDir(dir))) return NextResponse.json({ error: "Noma'lum yo'nalish" }, { status: 400 });
    if (!/^\d{1,2}\.\d{1,2}$/.test(id || '')) return NextResponse.json({ error: "Noto'g'ri vazifa id" }, { status: 400 });
    if (!STATUSES.includes(status)) return NextResponse.json({ error: "Noto'g'ri holat" }, { status: 400 });

    const result = await setTaskStatus({ dir, id, status, user });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
