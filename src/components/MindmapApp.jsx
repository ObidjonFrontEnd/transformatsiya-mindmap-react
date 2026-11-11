'use client';
import { useEffect, useState } from 'react';
import { useAppState } from '../hooks/useAppState';
import { RoomProvider, useOthers, useUpdateMyPresence, useStatus, colorFor, ROOM_ID } from '../lib/liveblocks';
import BASELINE from '../data/tasks.json';
import Tabs from './Tabs';
import Overview from './Overview';
import DirectionView from './DirectionView';
import AuthBar from './AuthBar';
import LoginModal from './LoginModal';
import HistoryPanel from './HistoryPanel';
import DirectionsManagerModal from './DirectionsManagerModal';
import Toast from './Toast';
import Legend from './Legend';

function InnerApp({ others, onlineCount, updateMyPresence }) {
  const {
    DATA, S, user, loading, toastMsg, cycleTask, login, logout,
    addTask, editTask, archiveTask, setLinks,
    addSection, renameSection, deleteSection,
    dirOverlay, addDirection, renameDirection, archiveDirection, restoreDirection,
  } = useAppState();
  const [cur, setCur] = useState('umumiy');
  const [loginOpen, setLoginOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [dirsOpen, setDirsOpen] = useState(false);

  const othersInDir = others
    .filter(o => o.presence?.dir === cur)
    .map(o => ({ connectionId: o.connectionId, color: colorFor(o.connectionId), taskId: o.presence?.taskId || null }));

  useEffect(() => {
    const hs = location.hash.slice(1);
    if (hs === 'umumiy' || DATA.some(d => d.k === hs)) setCur(hs);
  }, [DATA]);

  // joriy yo'nalish arxivlansa yoki o'chsa, umumiy sahifaga qaytamiz
  useEffect(() => {
    if (cur !== 'umumiy' && !DATA.some(d => d.k === cur)) setCur('umumiy');
  }, [DATA, cur]);

  useEffect(() => { updateMyPresence({ dir: cur, taskId: null }); }, [cur, updateMyPresence]);

  function go(k) {
    setCur(k);
    try { history.replaceState(null, '', '#' + k); } catch {}
    window.scrollTo({ top: 0 });
  }

  const dir = cur !== 'umumiy' ? DATA.find(d => d.k === cur) : null;

  return (
    <div className="wrap">
      <h1>MEGA BUILD ТРАНСФОРМАЦИЯСИ — нима қилинди, нима қолди</h1>
      <div className="sub">Mega Build · Трансформация режаси{loading ? ' · юкланмоқда…' : ''}</div>
      <AuthBar user={user} onLoginClick={() => setLoginOpen(true)} onLogout={logout}
        onHistoryClick={() => setHistoryOpen(true)} onDirectionsClick={() => setDirsOpen(true)} onlineCount={onlineCount} />
      <Tabs DATA={DATA} S={S} cur={cur} onSelect={go} />
      <div className="panel">
        {cur === 'umumiy' || !dir
          ? <Overview DATA={DATA} S={S} onSelectDir={go} />
          : <DirectionView d={dir} S={S} user={user} others={othersInDir}
              onToggleTask={id => cycleTask(cur, id)}
              onHoverTask={id => updateMyPresence({ dir: cur, taskId: id })}
              onAddTask={(sec, sh, f) => addTask(cur, sec, sh, f)}
              onEditTask={(id, sh, f) => editTask(cur, id, sh, f)}
              onArchiveTask={id => archiveTask(cur, id)}
              onSetLinks={(id, links) => setLinks(cur, id, links)}
              onAddSection={name => addSection(cur, name)}
              onRenameSection={(sec, name) => renameSection(cur, sec, name)}
              onDeleteSection={sec => deleteSection(cur, sec)} />}
      </div>
      <Legend />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLogin={login} />
      <HistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} DATA={DATA} />
      <DirectionsManagerModal open={dirsOpen} onClose={() => setDirsOpen(false)} BASELINE={BASELINE} dirOverlay={dirOverlay}
        onAdd={addDirection} onRename={renameDirection} onArchive={archiveDirection} onRestore={restoreDirection} />
      <Toast message={toastMsg} />
    </div>
  );
}

function PresenceBridge() {
  const status = useStatus();
  const others = useOthers();
  const updateMyPresence = useUpdateMyPresence();
  const onlineCount = status === 'connected' ? others.length + 1 : null;
  return <InnerApp others={others} onlineCount={onlineCount} updateMyPresence={updateMyPresence} />;
}

export default function MindmapApp({ liveblocksEnabled }) {
  if (!liveblocksEnabled) {
    return <InnerApp others={[]} onlineCount={null} updateMyPresence={() => {}} />;
  }
  return (
    <RoomProvider id={ROOM_ID} initialPresence={{ dir: null, taskId: null }}>
      <PresenceBridge />
    </RoomProvider>
  );
}
