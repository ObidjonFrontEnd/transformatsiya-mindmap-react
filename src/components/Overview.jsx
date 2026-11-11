import { KEYS, COL, ICON, pc } from '../data/constants';
import { countFor, countAll } from '../lib/scoring';
import KpiRow from './KpiRow';

export default function Overview({ DATA, S, onSelectDir }) {
  const a = countAll(DATA, S);
  const W = 1300, H = 760, cx = 650, cy = 380, rx = 470, ry = 275, CW = 230, CH = 96;

  const lines = [];
  const groups = [];

  DATA.forEach((d, i) => {
    const ang = ((-90 + (i * 360) / DATA.length) * Math.PI) / 180;
    const x = cx + rx * Math.cos(ang), y = cy + ry * Math.sin(ang);
    const c = countFor(d, S), p = pc(c);
    lines.push(
      <path key={'ln' + d.k} d={`M${cx} ${cy} Q${(cx + x) / 2} ${cy} ${x} ${y}`} stroke="#1F3A5F" strokeWidth="4" fill="none" opacity=".75" />
    );
    const sx = x - CW / 2 + 14, bw = CW - 28;
    let off = 0;
    const bars = [];
    KEYS.forEach(k => {
      const w = (bw * c[k]) / c.n;
      if (w > 0) bars.push(<rect key={k} x={sx + off} y={y + 18} width={w} height={8} fill={COL[k]} />);
      off += w;
    });
    groups.push(
      <g key={d.k} className="dir" onClick={() => onSelectDir(d.k)}>
        <rect x={x - CW / 2} y={y - CH / 2} width={CW} height={CH} rx="12" fill="#fff" stroke="#1F3A5F" strokeWidth="2" />
        <text x={x - CW / 2 + 14} y={y - 22} fontSize="13.5" fontWeight="700" fill="#16202B">{d.nm}</text>
        <text x={x + CW / 2 - 14} y={y + 6} fontSize="26" fontWeight="800" textAnchor="end" fill={p > 0 ? '#2E9E5B' : '#16202B'}>{p}%</text>
        <text x={x - CW / 2 + 14} y={y + 4} fontSize="11.5" fill="#5E6B78">{c.done}/{c.n} бажарилди</text>
        <clipPath id={`cp${i}`}><rect x={sx} y={y + 18} width={bw} height={8} rx="4" /></clipPath>
        <rect x={sx} y={y + 18} width={bw} height={8} rx="4" fill="#EEF0F3" />
        <g clipPath={`url(#cp${i})`}>{bars}</g>
        <text x={x - CW / 2 + 14} y={y + 41} fontSize="11" fontWeight="600">
          {KEYS.map((k, ki) => (
            <tspan key={k} fill={COL[k]}>{ki > 0 && <tspan fill="#C9D0D7">{'  ·  '}</tspan>}{ICON[k]} {c[k]}</tspan>
          ))}
        </text>
      </g>
    );
  });

  const p = pc(a), R = 96;
  const center = (
    <>
      <circle cx={cx} cy={cy} r={R - 8} fill="#1F3A5F" />
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#E3F4EA" strokeWidth="9" />
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#2E9E5B" strokeWidth="9"
        strokeDasharray={`${(2 * Math.PI * R * p) / 100} 9999`} transform={`rotate(-90 ${cx} ${cy})`}
        strokeLinecap={p > 0 ? 'round' : 'butt'} />
      <text x={cx} y={cy - 22} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="800">ТРАНСФОРМАЦИЯ</text>
      <text x={cx} y={cy + 16} textAnchor="middle" fill="#fff" fontSize="34" fontWeight="800">{p}%</text>
      <text x={cx} y={cy + 38} textAnchor="middle" fill="#fff" fontSize="11.5" opacity=".85">{a.done} / {a.n} вазифа</text>
    </>
  );

  return (
    <>
      <div className="ph">
        <div>
          <h2>Трансформация — умумий ҳолат</h2>
          <div className="sub" style={{ marginTop: 3 }}>8 йўналиш · {a.n} вазифа · фоиз = (бажарилди × 1 + тасдиқланмаган × 0.9) / жами вазифалар</div>
        </div>
      </div>
      <KpiRow c={a} label="бажарилди" />
      <svg className="mm" viewBox={`0 0 ${W} ${H}`}>{lines}{groups}{center}</svg>
      <table className="tbl">
        <thead>
          <tr><th>Йўналиш</th><th>Ҳолатлар</th><th className="n">Бажарилди</th><th className="n">Жараёнда</th><th className="n">Кечикмоқда</th><th className="n">Тасдиқланмаган</th><th className="n">Режада</th><th className="n">Жами</th><th className="n">%</th></tr>
        </thead>
        <tbody>
          {DATA.map(d => {
            const c = countFor(d, S);
            return (
              <tr className="rw" key={d.k} onClick={() => onSelectDir(d.k)}>
                <td><b>{d.nm}</b></td>
                <td><div className="mini">{KEYS.map(k => c[k] > 0 && <div key={k} style={{ width: `${(c[k] / c.n) * 100}%`, background: COL[k] }} />)}</div></td>
                {KEYS.map(k => <td className="n" key={k}>{c[k]}</td>)}
                <td className="n">{c.n}</td>
                <td className="n"><b>{pc(c)}%</b></td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td>Жами трансформация</td>
            <td><div className="mini">{KEYS.map(k => a[k] > 0 && <div key={k} style={{ width: `${(a[k] / a.n) * 100}%`, background: COL[k] }} />)}</div></td>
            {KEYS.map(k => <td className="n" key={k}>{a[k]}</td>)}
            <td className="n">{a.n}</td>
            <td className="n">{pc(a)}%</td>
          </tr>
        </tfoot>
      </table>
    </>
  );
}
