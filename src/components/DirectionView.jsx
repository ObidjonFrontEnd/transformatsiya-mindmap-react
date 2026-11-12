'use client';
import { useState } from 'react';
import { COL, COLL, ICON, ST, pc, score } from '../data/constants';
import PARTICIPANTS from '../data/participants.json';
import { countFor } from '../lib/scoring';
import { wrap, trunc } from '../lib/text';
import KpiRow from './KpiRow';
import TaskMenu from './TaskMenu';
import TaskFormModal from './TaskFormModal';
import LinksMenu from './LinksMenu';
import LinksEditorModal from './LinksEditorModal';
import SectionMenu from './SectionMenu';
import NameModal from './NameModal';

export default function DirectionView({ d, S, user, others, onToggleTask, onHoverTask, onAddTask, onEditTask, onArchiveTask, onSetLinks, onAddSection, onRenameSection, onDeleteSection }) {
  const [menu, setMenu] = useState(null); // {x, y, id, sh, f}
  const [editing, setEditing] = useState(null); // {sh, f}
  const [addingSec, setAddingSec] = useState(null); // sec number
  const [linksMenu, setLinksMenu] = useState(null); // {x, y, links}
  const [linksEditing, setLinksEditing] = useState(null); // {id, links}
  const [sectionMenu, setSectionMenu] = useState(null); // {x, y, sec, name, canDelete}
  const [sectionRenaming, setSectionRenaming] = useState(null); // {sec, name}
  const [addingDirSection, setAddingDirSection] = useState(false);

  const c = countFor(d, S);
  // d.secs'dagi (hali vazifasiz) bo'limlarni ham kiritamiz — aks holda yangi qo'shilgan bo'sh bo'lim ko'rinmay qoladi
  const secs = [...new Set([...d.tasks.map(t => t[1]), ...Object.keys(d.secs || {}).map(Number)])].sort((a, b) => a - b);
  const leaves = s => d.tasks.filter(t => t[1] === s);
  const total = d.tasks.length;
  let best = 1, bd = 1e9, acc = 0;
  for (let i = 1; i < secs.length; i++) {
    acc += leaves(secs[i - 1]).length;
    const df = Math.abs(total - 2 * acc);
    if (df < bd) { bd = df; best = i; }
  }
  const L = secs.slice(0, best), R = secs.slice(best);
  const GAP = 40, PAD = 40, MINH = 96;
  const bh = s => Math.max(leaves(s).length * GAP, MINH);
  const colH = arr => arr.reduce((x, s) => x + bh(s), 0) + PAD * (arr.length - 1);
  const maxH = Math.max(colH(L), colH(R)), top = 30, H = maxH + top * 2, W = 1300, cx = 650, cy = top + maxH / 2;
  const PW = 330, BW = 184;

  const otherTaskId = id => (others || []).find(o => o.taskId === id);

  const lines = [];
  const groups = [];

  [[L, -1], [R, 1]].forEach(([col, side]) => {
    let y = top + (maxH - colH(col)) / 2;
    const bx = side < 0 ? 470 : 830, px = side < 0 ? 20 : W - 20 - PW, ax = side < 0 ? px + PW : px, bedge = bx + (side * BW) / 2;
    col.forEach(s => {
      const lv = leaves(s), h0 = bh(s), by = y + h0 / 2, sc = countFor(d, S, s);
      lines.push(<path key={`sec-${s}`} d={`M${cx} ${cy} C${(cx + bx) / 2} ${cy},${(cx + bx) / 2} ${by},${bx} ${by}`} stroke="#1F3A5F" strokeWidth="5" fill="none" opacity=".85" />);
      const y0 = by - ((lv.length - 1) * GAP) / 2;
      lv.forEach(([id, , sh, f, taskLinks = []], i) => {
        const st = S[d.k][id] || 'plan';
        const ly = y0 + i * GAP, mx = (bedge + ax) / 2;
        const other = otherTaskId(id);
        const clipX = user ? px + PW - 32 : px + PW - 15;
        lines.push(<path key={`t-${id}`} d={`M${bedge} ${by} C${mx} ${by},${mx} ${ly},${ax} ${ly}`} stroke={COL[st]} strokeWidth="2.2" fill="none" />);
        groups.push(
          <g className="t" key={id}
            onMouseEnter={() => onHoverTask?.(id)}
            onMouseLeave={() => onHoverTask?.(null)}
            onClick={e => {
              if (user) { onToggleTask(id); return; }
              if (taskLinks.length === 1) window.open(taskLinks[0].url, '_blank', 'noopener,noreferrer');
              else if (taskLinks.length > 1) setLinksMenu({ x: e.clientX, y: e.clientY, links: taskLinks });
              else onToggleTask(id);
            }}>
            <title>{id + ' ' + f} — {user ? ST[st] : (taskLinks.length ? 'Ҳужжатни очиш учун босинг' : ST[st])}</title>
            <rect x={px} y={ly - 17} width={PW} height={34} rx="17" fill={COLL[st]} stroke={COL[st]} strokeWidth="1.6" strokeDasharray={st === 'unc' ? '5 3' : undefined} />
            {other && (
              <rect x={px - 3} y={ly - 20} width={PW + 6} height={40} rx="19" fill="none" stroke={other.color} strokeWidth="2.5" strokeDasharray="4 3" />
            )}
            <circle cx={px + 17} cy={ly} r="9" fill={COL[st]} />
            <text x={px + 17} y={ly + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">{ICON[st]}</text>
            <text x={px + 33} y={ly + 4.5} fontSize="12.3" fill="#16202B"><tspan fontWeight="700">{id}</tspan> {trunc(sh, 38)}</text>
            {!user && taskLinks.length > 0 && (
              <>
                <circle cx={px + PW - 15} cy={ly} r="9" fill="#fff" stroke="var(--line)" />
                <text x={px + PW - 15} y={ly + 3.5} textAnchor="middle" fontSize="10" fill="var(--prog)">📎</text>
              </>
            )}
          </g>
        );
        if (taskLinks.length > 0 && user) {
          // user — ⋮ bilan bir qatorda, holatni almashtirib qo'ymasdan hujjatni ochish uchun
          groups.push(
            <g key={`clip-${id}`} style={{ cursor: 'pointer' }} onClick={e => {
              e.stopPropagation();
              if (taskLinks.length === 1) window.open(taskLinks[0].url, '_blank', 'noopener,noreferrer');
              else setLinksMenu({ x: e.clientX, y: e.clientY, links: taskLinks });
            }}>
              <title>Ҳужжатлар: {taskLinks.map(l => l.name).join(', ')}</title>
              <circle cx={clipX} cy={ly} r="9" fill="#fff" stroke="var(--line)" />
              <text x={clipX} y={ly + 3.5} textAnchor="middle" fontSize="10" fill="var(--prog)">📎</text>
            </g>
          );
        }
        if (user) {
          groups.push(
            <g key={`menu-${id}`} style={{ cursor: 'pointer' }}
              onClick={e => { e.stopPropagation(); setMenu({ x: e.clientX, y: e.clientY, id, sh, f, links: taskLinks }); }}>
              <circle cx={px + PW - 15} cy={ly} r="9" fill="#fff" stroke="var(--line)" />
              <text x={px + PW - 15} y={ly + 3.5} textAnchor="middle" fontSize="11" fill="var(--mute)">⋮</text>
            </g>
          );
        }
      });
      const nmL = wrap(d.secs[s] || '', 19).slice(0, 2), p = score(sc);
      groups.push(
        <g key={`box-${s}`}>
          <rect x={bx - BW / 2} y={by - 36} width={BW} height={72} rx="12" fill="#fff" stroke="#1F3A5F" strokeWidth="2.2" />
          <text x={bx} y={by - 17} textAnchor="middle" fontSize="10.5" fill="#5E6B78" fontWeight="600">{s}-ЙЎНАЛИШ · {sc.done}/{sc.n}</text>
          {nmL.map((t, i) => (
            <text key={i} x={bx} y={by + 1 + i * 15} textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#16202B">{t}</text>
          ))}
          <rect x={bx - 74} y={by + 25} width="148" height="4" rx="2" fill="#EEF0F3" />
          <rect x={bx - 74} y={by + 25} width={148 * p} height="4" rx="2" fill="#2E9E5B" />
          {user && (
            <>
              <g style={{ cursor: 'pointer' }} onClick={() => setAddingSec(s)}>
                <circle cx={bx + BW / 2 - 13} cy={by - 25} r="10" fill="var(--brand)" />
                <text x={bx + BW / 2 - 13} y={by - 21} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">+</text>
              </g>
              <g style={{ cursor: 'pointer' }} onClick={e => setSectionMenu({ x: e.clientX, y: e.clientY, sec: s, name: d.secs[s] || '', canDelete: sc.n === 0 })}>
                <circle cx={bx - BW / 2 + 13} cy={by - 25} r="10" fill="#fff" stroke="var(--line)" />
                <text x={bx - BW / 2 + 13} y={by - 21.5} textAnchor="middle" fontSize="10" fill="var(--mute)">⚙</text>
              </g>
            </>
          )}
        </g>
      );
      y += h0 + PAD;
    });
  });

  const p = pc(c), Rr = 78, nm = wrap(d.nm.toUpperCase(), 14);

  return (
    <>
      <div className="ph">
        <div>
          <h2>{d.nm} йўналиши</h2>
          <div className="sub" style={{ marginTop: 3 }}>
            {c.n} вазифа · {user
              ? 'вазифани босинг — ҳолати дарҳол сақланади · ⋮ — таҳрирлаш/архивлаш/ҳавола · + — янги вазифа · ⚙ — бўлим'
              : '📎 белгили вазифани босинг — ҳужжат янги ойначада очилади'}
          </div>
        </div>
        {user && <div className="btns"><button className="btn" onClick={() => setAddingDirSection(true)}>+ Бўлим</button></div>}
      </div>
      <KpiRow c={c} label="бажарилди" participants={PARTICIPANTS[d.k]} />
      <svg className="mm" viewBox={`0 0 ${W} ${H}`}>
        {lines}
        {groups}
        <circle cx={cx} cy={cy} r={Rr - 7} fill="#1F3A5F" />
        <circle cx={cx} cy={cy} r={Rr} fill="none" stroke="#E3F4EA" strokeWidth="7" />
        <circle cx={cx} cy={cy} r={Rr} fill="none" stroke="#2E9E5B" strokeWidth="7"
          strokeDasharray={`${(2 * Math.PI * Rr * p) / 100} 9999`} transform={`rotate(-90 ${cx} ${cy})`}
          strokeLinecap={p > 0 ? 'round' : 'butt'} />
        {nm.map((t, i) => (
          <text key={i} x={cx} y={cy - 20 + (i - (nm.length - 1)) * 15} textAnchor="middle" fill="#fff" fontSize="12.5" fontWeight="800">{t}</text>
        ))}
        <text x={cx} y={cy + 18} textAnchor="middle" fill="#fff" fontSize="28" fontWeight="800">{p}%</text>
        <text x={cx} y={cy + 38} textAnchor="middle" fill="#fff" fontSize="11" opacity=".85">{c.done} / {c.n}</text>
      </svg>

      {menu && (
        <TaskMenu x={menu.x} y={menu.y} onClose={() => setMenu(null)}
          onEdit={() => setEditing({ id: menu.id, sh: menu.sh, f: menu.f })}
          onLinks={() => setLinksEditing({ id: menu.id, links: menu.links })}
          onArchive={() => { if (confirm(`"${menu.sh}" вазифасини архивлашни тасдиқлайсизми?`)) onArchiveTask(menu.id); }} />
      )}

      {linksMenu && (
        <LinksMenu x={linksMenu.x} y={linksMenu.y} links={linksMenu.links} onClose={() => setLinksMenu(null)} />
      )}

      <LinksEditorModal key={`links-${linksEditing?.id || 'none'}`} open={!!linksEditing} initial={linksEditing?.links}
        onClose={() => setLinksEditing(null)}
        onSubmit={links => onSetLinks(linksEditing.id, links)} />

      <TaskFormModal open={!!editing} title="Вазифани таҳрирлаш" initial={editing}
        onClose={() => setEditing(null)}
        onSubmit={({ sh, f }) => onEditTask(editing.id, sh, f)} />

      <TaskFormModal open={addingSec != null} title={`Янги вазифа (${addingSec}-бўлим)`} initial={null}
        onClose={() => setAddingSec(null)}
        onSubmit={({ sh, f }) => onAddTask(addingSec, sh, f)} />

      {sectionMenu && (
        <SectionMenu x={sectionMenu.x} y={sectionMenu.y} canDelete={sectionMenu.canDelete}
          onClose={() => setSectionMenu(null)}
          onRename={() => setSectionRenaming({ sec: sectionMenu.sec, name: sectionMenu.name })}
          onDelete={() => { if (confirm(`"${sectionMenu.name}" бўлимини ўчиришни тасдиқлайсизми?`)) onDeleteSection(sectionMenu.sec); }} />
      )}

      <NameModal key={`section-${sectionRenaming?.sec ?? 'none'}`} open={!!sectionRenaming} title="Бўлим номини ўзгартириш" initial={sectionRenaming?.name}
        onClose={() => setSectionRenaming(null)}
        onSubmit={name => onRenameSection(sectionRenaming.sec, name)} />

      <NameModal open={addingDirSection} title="Янги бўлим" initial=""
        onClose={() => setAddingDirSection(false)}
        onSubmit={name => onAddSection(name)} />
    </>
  );
}
