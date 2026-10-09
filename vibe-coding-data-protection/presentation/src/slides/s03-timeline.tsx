import { useMemo, useRef, useState } from 'react';
import { datedIncidents, LANES, type DatedIncident, type Lane } from '../lib/data';
import { LedgerChip } from '../components/Chip';

// Geometry (SVG user units). The time axis is linear in days between DOMAIN_START and DOMAIN_END.
const DOMAIN_START = Date.UTC(2025, 2, 1); // 1 Mar 2025
const DOMAIN_END = Date.UTC(2026, 10, 1); // 1 Nov 2026
const DATE_OF_RECORD = Date.UTC(2026, 9, 9);
const W = 1120;
const LEFT = 170;
const RIGHT = 24;
const TOP = 34;
const ROW = 20;
const LANE_PAD = 12;
const MIN_GAP = 18;

const x = (t: number) => LEFT + ((t - DOMAIN_START) / (DOMAIN_END - DOMAIN_START)) * (W - LEFT - RIGHT);
const LANE_VAR: Record<Lane, string> = {
  'App authorisation': 'var(--lane-1)',
  'Builder platform': 'var(--lane-2)',
  'Agent plane': 'var(--lane-3)',
  'Supply chain': 'var(--lane-4)',
  'Defaults and storage': 'var(--lane-5)',
  'Vendor and regulatory': 'var(--lane-6)',
};
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface Placed extends DatedIncident {
  x0: number;
  x1: number;
  sub: number;
}

/** Greedy packing: within a lane, a mark drops to the next sub-row when it would touch the previous one. */
function layout(rows: DatedIncident[]) {
  const lanes = LANES.map((lane) => {
    const ends: number[] = [];
    const items: Placed[] = rows
      .filter((r) => r.lane === lane)
      .map((r) => {
        const x0 = x(r.start.getTime());
        const x1 = Math.max(x(r.end.getTime() + 86_400_000), x0 + 1);
        let sub = ends.findIndex((e) => e + MIN_GAP <= x0);
        if (sub < 0) sub = ends.push(0) - 1;
        ends[sub] = Math.max(x1, x0 + 8);
        return { ...r, x0, x1, sub };
      });
    return { lane, items, rows: Math.max(1, ends.length) };
  });
  let y = TOP;
  return lanes.map((l) => {
    const top = y;
    const height = l.rows * ROW + LANE_PAD * 2;
    y += height;
    return { ...l, top, height };
  });
}

export function IncidentTimeline() {
  const [hidden, setHidden] = useState<Set<Lane>>(new Set());
  const [sel, setSel] = useState(() => datedIncidents.findIndex((d) => d.idx === 1));
  const [list, setList] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const visible = useMemo(() => datedIncidents.filter((d) => !hidden.has(d.lane)), [hidden]);
  const lanes = useMemo(() => layout(datedIncidents), []);
  const H = lanes[lanes.length - 1].top + lanes[lanes.length - 1].height + 30;
  const current = datedIncidents[sel];

  const ticks: { t: number; label: string; major: boolean }[] = [];
  for (let d = new Date(DOMAIN_START); d.getTime() <= DOMAIN_END; d.setUTCMonth(d.getUTCMonth() + 1)) {
    const m = d.getUTCMonth();
    ticks.push({ t: d.getTime(), label: `${MONTHS[m]} ${d.getUTCFullYear()}`, major: m % 3 === 2 });
  }

  const step = (delta: number) => {
    const order = visible.map((v) => datedIncidents.indexOf(v));
    const pos = order.indexOf(sel);
    const next = order[Math.max(0, Math.min(order.length - 1, (pos < 0 ? 0 : pos) + delta))];
    if (next !== undefined) setSel(next);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') step(1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') step(-1);
    else if (e.key === 'Home') step(-999);
    else if (e.key === 'End') step(999);
    else return;
    e.preventDefault();
  };
  const toggle = (l: Lane) =>
    setHidden((h) => {
      const n = new Set(h);
      n.has(l) ? n.delete(l) : n.add(l);
      return n;
    });

  return (
    <div class="stack-lg">
      <div class="filters">
        <div class="filter-group">
          <span class="eyebrow" id="tl-lanes">Layer (grouped from the ledger's layer column)</span>
          <div class="seg" role="group" aria-labelledby="tl-lanes">
            {LANES.map((l) => (
              <button type="button" key={l} aria-pressed={!hidden.has(l)} onClick={() => toggle(l)}>
                <span class="lane-swatch" style={{ background: LANE_VAR[l] }} aria-hidden="true" />
                {l}
              </button>
            ))}
          </div>
        </div>
        <button type="button" class="toggle" aria-pressed={list} onClick={() => setList(!list)}>
          Show as table
        </button>
      </div>

      <div class="timeline-grid">
        <div class="chart-frame tl-frame" data-hscroll>
          <div
            ref={listRef}
            role="listbox"
            tabIndex={0}
            aria-label="Incident timeline; use the arrow keys to move between entries"
            aria-activedescendant={`tl-${current.idx}`}
            onKeyDown={onKey as any}
            class="tl-box"
          >
            <svg class="chart timeline" viewBox={`0 0 ${W} ${H}`} style={{ minWidth: '760px' }} role="presentation">
              <g data-derived>
                {ticks.map((tk) => (
                  <g key={tk.t} class="tick">
                    <line x1={x(tk.t)} x2={x(tk.t)} y1={TOP - 6} y2={H - 26} stroke="var(--line)" stroke-width={tk.major ? 1 : 0.5} stroke-dasharray={tk.major ? undefined : '2 4'} />
                    {tk.major && (
                      <text x={x(tk.t)} y={H - 10} text-anchor="middle">
                        {tk.label}
                      </text>
                    )}
                  </g>
                ))}
                <line x1={x(DATE_OF_RECORD)} x2={x(DATE_OF_RECORD)} y1={TOP - 22} y2={H - 26} stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="4 3" />
                <text x={x(DATE_OF_RECORD) - 6} y={TOP - 14} text-anchor="end" class="tl-dor">
                  Date of record, 9 Oct 2026
                </text>
              </g>
              {lanes.map((l) => (
                <g key={l.lane} opacity={hidden.has(l.lane) ? 0.18 : 1}>
                  <rect x={0} y={l.top} width={W} height={l.height} fill="var(--surface-2)" opacity={LANES.indexOf(l.lane) % 2 ? 0 : 0.55} />
                  <text x={8} y={l.top + l.height / 2 + 4} class="tl-lane" fill={LANE_VAR[l.lane]}>
                    {l.lane}
                  </text>
                  {l.items.map((it) => {
                    const i = datedIncidents.indexOf(it);
                    const cy = l.top + LANE_PAD + it.sub * ROW + ROW / 2;
                    const on = i === sel;
                    const point = it.precision === 'day';
                    const label = `${it.date}: ${it.incident} (${it.layer})`;
                    return (
                      <g
                        key={it.idx}
                        id={`tl-${it.idx}`}
                        role="option"
                        aria-selected={on}
                        aria-label={label}
                        class={`tl-mark${on ? ' on' : ''}`}
                        onClick={() => {
                          setSel(i);
                          listRef.current?.focus({ preventScroll: true });
                        }}
                      >
                        <title>{label}</title>
                        {point ? (
                          <circle cx={it.x0} cy={cy} r={on ? 7.5 : 6} fill={LANE_VAR[it.lane]} stroke="var(--surface)" stroke-width="1.5" />
                        ) : (
                          <rect x={it.x0} y={cy - 5} width={Math.max(8, it.x1 - it.x0)} height={10} rx={5} fill={LANE_VAR[it.lane]} fill-opacity={0.35} stroke={LANE_VAR[it.lane]} stroke-width="1.5" />
                        )}
                        {on && <circle cx={point ? it.x0 : (it.x0 + Math.max(8, it.x1 - it.x0) / 2)} cy={cy} r={12} fill="none" stroke="var(--fg)" stroke-width="1.5" />}
                        <rect x={it.x0 - 8} y={cy - 9} width={Math.max(16, it.x1 - it.x0 + 16)} height={18} fill="transparent" />
                      </g>
                    );
                  })}
                </g>
              ))}
            </svg>
          </div>
        </div>

        <aside class="card tl-detail" aria-live="polite">
          <div class="row" style={{ justifyContent: 'space-between' }}>
            <span class="eyebrow">{current.date}</span>
            <LedgerChip text={current.confidence} />
          </div>
          <h2 class="h3 tl-title">{current.incident}</h2>
          <dl class="tl-fields">
            <dt>Layer</dt>
            <dd>{current.layer}</dd>
            <dt>Capability demonstrated</dt>
            <dd>{current.capability_demonstrated}</dd>
            <dt>Impact</dt>
            <dd>{current.impact}</dd>
            <dt>Remediation</dt>
            <dd>{current.remediation}</dd>
          </dl>
          <div class="row" data-chrome>
            <button type="button" class="toggle" onClick={() => step(-1)}>
              Earlier
            </button>
            <button type="button" class="toggle" onClick={() => step(1)}>
              Later
            </button>
          </div>
        </aside>
      </div>

      <p class="small muted">
        Dots are entries dated to the day; bars are entries the ledger dates only to a month or a range. Confidence is the ledger's own scale (paper §3.2). The last entry, Supabase's explicit-grants default reaching existing projects on 30 Oct 2026, is scheduled: it falls after the date of record.
      </p>

      {list && (
        <div class="tbl-wrap tall" tabIndex={0} role="region" aria-label="Incident timeline as a table" data-hscroll>
          <table class="ptable">
            <thead>
              <tr>
                {['Date', 'Incident', 'Layer', 'Capability demonstrated', 'Impact', 'Remediation', 'Confidence'].map((h) => (
                  <th scope="col" key={h}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((d) => (
                <tr key={d.idx}>
                  <th scope="row" data-label="Date">
                    {d.date}
                  </th>
                  <td data-label="Incident">{d.incident}</td>
                  <td data-label="Layer">{d.layer}</td>
                  <td data-label="Capability demonstrated">{d.capability_demonstrated}</td>
                  <td data-label="Impact">{d.impact}</td>
                  <td data-label="Remediation">{d.remediation}</td>
                  <td data-label="Confidence">
                    <LedgerChip text={d.confidence} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
