export default function AuthBar({ user, onLoginClick, onLogout, onHistoryClick, onDirectionsClick, onlineCount }) {
  return (
    <div className="auth">
      {onlineCount != null && (
        <span title="Ҳозир сайтда">
          <i className="dot" style={{ background: 'var(--done)' }} /> {onlineCount} онлайн
        </span>
      )}
      {user && <button className="btn" onClick={onDirectionsClick}>⚙ Йўналишлар</button>}
      {user && <button className="btn" onClick={onHistoryClick}>Тарих</button>}
      {user ? (
        <>
          <span>👤 {user}</span>
          <button className="btn" onClick={onLogout}>Чиқиш</button>
        </>
      ) : (
        <button className="btn" onClick={onLoginClick}>Кириш</button>
      )}
    </div>
  );
}
