import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, COOKIE } from '../../../src/lib/auth';
import { getDirOverlay, addDirection, renameDirection, setDirectionArchived } from '../../../src/lib/store';
import { slugify } from '../../../src/lib/mergeTasks';
import { DIRS } from '../../../src/data/constants';
import BASELINE from '../../../src/data/tasks.json';

async function getUser() {
  const jar = await cookies();
  return verifyToken(jar.get(COOKIE)?.value);
}

// GET -> { dirOverlay }  (hammaga ochiq)
export async function GET() {
  try {
    const dirOverlay = await getDirOverlay();
    return NextResponse.json({ dirOverlay }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST { action: 'add'|'rename'|'archive'|'restore', k?, nm? }  (faqat login qilgan)
export async function POST(req) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Avval tizimga kiring' }, { status: 401 });

    const { action, k, nm } = await req.json().catch(() => ({}));

    if (action === 'add') {
      if (!nm || !nm.trim()) return NextResponse.json({ error: "Yo'nalish nomi kerak" }, { status: 400 });
      const overlay = await getDirOverlay();
      const taken = new Set([...DIRS, ...Object.keys(overlay)]);
      let key = slugify(nm.trim()), n = 2;
      while (taken.has(key)) key = `${slugify(nm.trim())}_${n++}`;
      const result = await addDirection({ k: key, nm: nm.trim(), user });
      return NextResponse.json({ ok: true, k: key, dirOverlay: result });
    }

    if (!k) return NextResponse.json({ error: "Yo'nalish kaliti kerak" }, { status: 400 });
    const isBaseline = BASELINE.some(d => d.k === k);
    const overlay = await getDirOverlay();
    if (!isBaseline && !overlay[k]) return NextResponse.json({ error: "Noma'lum yo'nalish" }, { status: 400 });

    if (action === 'rename') {
      if (!nm || !nm.trim()) return NextResponse.json({ error: "Yo'nalish nomi kerak" }, { status: 400 });
      const result = await renameDirection({ k, nm: nm.trim(), user });
      return NextResponse.json({ ok: true, dirOverlay: result });
    }

    if (action === 'archive' || action === 'restore') {
      const fallbackNm = BASELINE.find(d => d.k === k)?.nm || overlay[k]?.nm || k;
      const result = await setDirectionArchived({ k, archived: action === 'archive', nm: fallbackNm, user });
      return NextResponse.json({ ok: true, dirOverlay: result });
    }

    return NextResponse.json({ error: "Noma'lum amal" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
