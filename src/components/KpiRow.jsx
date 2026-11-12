import { KEYS, COL, ST, pc } from '../data/constants';

export default function KpiRow({ c, label, participants }) {
  const hasParticipants = Boolean(
    participants && (participants.leader || (participants.members && participants.members.length > 0))
  );

  return (
    <>
      <div className="kpi-row-wrap">
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

        {hasParticipants && (
          <div className="members-card">
            <div className="members-head">
              <span className="members-title">
                <i className="members-icon">👥</i> Ташкилий таркиб
              </span>
            </div>
            <div className="members-body">
              {participants.leader && (
                <div className="member-row leader">
                  <span className="role-tag leader-tag">Лидер</span>
                  <span className="member-name leader-name">{participants.leader}</span>
                </div>
              )}
              {participants.members && participants.members.length > 0 && (
                <div className="member-row members-group">
                  <span className="role-tag">Аъзолар</span>
                  <div className="members-chips">
                    {participants.members.map((name, i) => (
                      <span className="member-chip" key={i}>
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="bar">
        {KEYS.map(k => c[k] > 0 && <div key={k} style={{ width: `${(c[k] / c.n) * 100}%`, background: COL[k] }} />)}
      </div>
    </>
  );
}
