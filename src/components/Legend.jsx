import { KEYS, COL, ST } from '../data/constants';

export default function Legend() {
  return (
    <div className="legend">
      {KEYS.map(k => (
        <span key={k}>
          <i className="dot" style={{ background: COL[k] }} />
          {ST[k]}
        </span>
      ))}
    </div>
  );
}
