export default function SectionMenu({ x, y, canDelete, onRename, onDelete, onClose }) {
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 19 }} onClick={onClose} />
      <div style={{
        position: 'fixed', left: x, top: y, zIndex: 20, background: '#fff', border: '1px solid var(--line)',
        borderRadius: 8, boxShadow: '0 6px 24px rgba(0,0,0,.15)', padding: 4, display: 'flex', flexDirection: 'column', minWidth: 170,
      }}>
        <button className="btn" style={{ border: 'none', textAlign: 'left' }} onClick={() => { onRename(); onClose(); }}>✎ Бўлим номини ўзгартириш</button>
        <button className="btn" disabled={!canDelete} title={canDelete ? '' : "Bo'limda vazifalar bor"}
          style={{ border: 'none', textAlign: 'left', color: canDelete ? 'var(--late)' : undefined }}
          onClick={() => { if (canDelete) { onDelete(); onClose(); } }}>🗑 Бўлимни ўчириш</button>
      </div>
    </>
  );
}
