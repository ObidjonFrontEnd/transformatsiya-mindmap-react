import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, COOKIE } from '../../../src/lib/auth';
import {
  getAllOverlays, getOverlay, addTask, editTask, archiveTask, restoreTask, setTaskLinks,
  addSection, renameSection, deleteSection,
} from '../../../src/lib/store';
import { nextTaskId, nextSectionNum } from '../../../src/lib/mergeTasks';
import { isKnownDir } from '../../../src/lib/dirs';
import BASELINE from '../../../src/data/tasks.json';

async function getUser() {
  const jar = await cookies();
  return verifyToken(jar.get(COOKIE)?.value);
}

function effectiveSecs(baseDir, overlay) {
  const secs = { ...baseDir.secs };
  for (const [num, name] of Object.entries(overlay.secs || {})) {
    if (name == null) delete secs[num]; else secs[num] = name;
  }
  return secs;
}

// GET -> { overlays: { [dir]: {added, edited, archived, links, secs} } }  (hammaga ochiq, realtime poll shu endpointni ham chaqiradi)
export async function GET() {
  try {
    const overlays = await getAllOverlays();
    return NextResponse.json({ overlays }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST { action, dir, sec?, id?, sh?, f?, links?, name? }  (faqat login qilgan)
export async function POST(req) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Avval tizimga kiring' }, { status: 401 });

    const { action, dir, sec, id, sh, f, links, name } = await req.json().catch(() => ({}));
    if (!(await isKnownDir(dir))) return NextResponse.json({ error: "Noma'lum yo'nalish" }, { status: 400 });

    const baseDir = BASELINE.find(d => d.k === dir) || { k: dir, nm: dir, secs: {}, tasks: [] };
    const overlay = await getOverlay(dir);
    const secs = effectiveSecs(baseDir, overlay);

    if (action === 'add') {
      const secNum = Number(sec);
      if (!secs[secNum]) return NextResponse.json({ error: "Noma'lum bo'lim" }, { status: 400 });
      if (!sh || !sh.trim()) return NextResponse.json({ error: "Qisqa nom kerak" }, { status: 400 });
      const allTasks = [...baseDir.tasks, ...overlay.added];
      const newId = nextTaskId(allTasks, secNum);
      const result = await addTask({ dir, id: newId, sec: secNum, sh: sh.trim(), f: (f || sh).trim(), user });
      return NextResponse.json({ ok: true, id: newId, overlay: result });
    }

    if (action === 'add_section') {
      if (!name || !name.trim()) return NextResponse.json({ error: "Bo'lim nomi kerak" }, { status: 400 });
      const secNum = nextSectionNum(secs);
      const result = await addSection({ dir, sec: secNum, name: name.trim(), user });
      return NextResponse.json({ ok: true, sec: secNum, overlay: result });
    }

    if (action === 'rename_section') {
      const secNum = Number(sec);
      if (!secs[secNum]) return NextResponse.json({ error: "Noma'lum bo'lim" }, { status: 400 });
      if (!name || !name.trim()) return NextResponse.json({ error: "Bo'lim nomi kerak" }, { status: 400 });
      const result = await renameSection({ dir, sec: secNum, name: name.trim(), user });
      return NextResponse.json({ ok: true, overlay: result });
    }

    if (action === 'delete_section') {
      const secNum = Number(sec);
      if (!secs[secNum]) return NextResponse.json({ error: "Noma'lum bo'lim" }, { status: 400 });
      const archivedSet = new Set(overlay.archived || []);
      const allTasks = [...baseDir.tasks, ...overlay.added];
      const hasActive = allTasks.some(t => t[1] === secNum && !archivedSet.has(t[0]));
      if (hasActive) return NextResponse.json({ error: "Bo'limda vazifalar bor — avval ularni arxivlang" }, { status: 400 });
      const result = await deleteSection({ dir, sec: secNum, user });
      return NextResponse.json({ ok: true, overlay: result });
    }

    if (!id) return NextResponse.json({ error: "Vazifa id kerak" }, { status: 400 });

    if (action === 'edit') {
      if (!sh || !sh.trim()) return NextResponse.json({ error: "Qisqa nom kerak" }, { status: 400 });
      const result = await editTask({ dir, id, sh: sh.trim(), f: (f || sh).trim(), user });
      return NextResponse.json({ ok: true, overlay: result });
    }

    if (action === 'archive') {
      const result = await archiveTask({ dir, id, user });
      return NextResponse.json({ ok: true, overlay: result });
    }

    if (action === 'restore') {
      const result = await restoreTask({ dir, id, user });
      return NextResponse.json({ ok: true, overlay: result });
    }

    if (action === 'links') {
      if (!Array.isArray(links)) return NextResponse.json({ error: "Ҳаволалар рўйхати керак" }, { status: 400 });
      if (links.length > 10) return NextResponse.json({ error: "Кўпи билан 10 та ҳавола" }, { status: 400 });
      const clean = [];
      for (const l of links) {
        const url = String(l?.url || '').trim();
        if (!/^https:\/\//i.test(url)) return NextResponse.json({ error: `Ҳавола https:// билан бошланиши керак: ${url || '(бўш)'}` }, { status: 400 });
        clean.push({ name: String(l?.name || '').trim().slice(0, 80) || url, url });
      }
      const result = await setTaskLinks({ dir, id, links: clean, user });
      return NextResponse.json({ ok: true, overlay: result });
    }

    return NextResponse.json({ error: "Noma'lum amal" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
