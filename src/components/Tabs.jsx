import { pc } from '../data/constants';
import { countFor, countAll } from '../lib/scoring';

export default function Tabs({ DATA, S, cur, onSelect }) {
  const a = countAll(DATA, S);
  return (
    <div className="tabs">
      <button className={`tab all ${cur === 'umumiy' ? 'on' : ''}`} onClick={() => onSelect('umumiy')}>
        Умумий <span className="pc">{pc(a)}%</span>
      </button>
      {DATA.map(d => (
        <button key={d.k} className={`tab ${cur === d.k ? 'on' : ''}`} onClick={() => onSelect(d.k)}>
          {d.nm} <span className="pc">{pc(countFor(d, S))}%</span>
        </button>
      ))}
    </div>
  );
}
