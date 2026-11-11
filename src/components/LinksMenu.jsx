export default function LinksMenu({ x, y, links, onClose }) {
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 19 }} onClick={onClose} />
      <div style={{
        position: 'fixed', left: x, top: y, zIndex: 20, background: '#fff', border: '1px solid var(--line)',
        borderRadius: 8, boxShadow: '0 6px 24px rgba(0,0,0,.15)', padding: 4, display: 'flex', flexDirection: 'column', minWidth: 200, maxWidth: 300,
      }}>
        {links.map((l, i) => (
          <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
            className="btn" style={{ border: 'none', textAlign: 'left', textDecoration: 'none', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            onClick={onClose}>
            📄 {l.name}
          </a>
        ))}
      </div>
    </>
  );
}
