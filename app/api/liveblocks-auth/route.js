import { NextResponse } from 'next/server';
import { Liveblocks } from '@liveblocks/node';
import { cookies } from 'next/headers';
import { verifyToken, COOKIE } from '../../../src/lib/auth';

const ROOM_ID = 'transformatsiya-mindmap';

// Liveblocks presence/room'ga kirish uchun token beradi.
// LIVEBLOCKS_SECRET_KEY sozlanmagan bo'lsa — 404, frontend presence'ni shunchaki o'chirib qo'yadi.
export async function POST(req) {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: 'Liveblocks sozlanmagan' }, { status: 404 });

  const jar = await cookies();
  const user = verifyToken(jar.get(COOKIE)?.value);

  const liveblocks = new Liveblocks({ secret });
  const session = liveblocks.prepareSession(user || `mehmon-${Math.random().toString(36).slice(2, 8)}`, {
    userInfo: { name: user || 'Mehmon' },
  });
  session.allow(ROOM_ID, session.FULL_ACCESS);

  const { status, body } = await session.authorize();
  return new NextResponse(body, { status, headers: { 'Content-Type': 'application/json' } });
}
