export default function TaskMenu({ x, y, onEdit, onLinks, onArchive, onClose }) {
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 19 }} onClick={onClose} />
      <div style={{
        position: 'fixed', left: x, top: y, zIndex: 20, background: '#fff', border: '1px solid var(--line)',
        borderRadius: 8, boxShadow: '0 6px 24px rgba(0,0,0,.15)', padding: 4, display: 'flex', flexDirection: 'column', minWidth: 160,
      }}>
        <button className="btn" style={{ border: 'none', textAlign: 'left' }} onClick={() => { onEdit(); onClose(); }}>✎ Таҳрирлаш</button>
        <button className="btn" style={{ border: 'none', textAlign: 'left' }} onClick={() => { onLinks(); onClose(); }}>🔗 Ҳаволалар</button>
        <button className="btn" style={{ border: 'none', textAlign: 'left', color: 'var(--late)' }} onClick={() => { onArchive(); onClose(); }}>🗄 Архивлаш</button>
      </div>
    </>
  );
}
