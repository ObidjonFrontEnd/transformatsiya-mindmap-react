import { KEYS, COL, ST, pc } from '../data/constants';

export default function KpiRow({ c, label }) {
  return (
    <>
      <div className="kpis">
        <div className="kpi big">
          <b>{pc(c)}%</b>
          <span>{label} ({c.done}/{c.n})</span>
        </div>
        {KEYS.map(k => (
          <div className="kpi" key={k}>
            <b style={{ color: COL[k] }}>{c[k]}</b>
            <span><i className="dot" style={{ background: COL[k] }} />{ST[k]}</span>
          </div>
        ))}
      </div>
      <div className="bar">
        {KEYS.map(k => c[k] > 0 && <div key={k} style={{ width: `${(c[k] / c.n) * 100}%`, background: COL[k] }} />)}
      </div>
    </>
  );
}
