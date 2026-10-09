import type { SlideDef } from './types';
import type { Inline as Node } from '../lib/types';
import { Inline, plain } from '../components/Inline';
import { Tabs } from '../components/Tabs';
import { DATE_OF_RECORD } from '../lib/data';
import { para, splitOn, splitTrailingSentence, stripTrail } from './s01-helpers';
import './s11.css';

// ---- The four categories: the paper's semicolon lists, split into items, wording unchanged ----

interface Category {
  title: string;
  items: Node[][];
  note: Node[];
}

function category(block: number): Category {
  const [head, ...rest] = para('11', block);
  const title = plain(head.t === 'b' ? head.c : [head]).replace(/\.\s*$/, '');
  const items = splitOn(rest, '; ');
  const [last, note] = splitTrailingSentence(items[items.length - 1]);
  items[items.length - 1] = last;
  return { title, items: items.map((it) => stripTrail(it, /\.$/)), note };
}

function CategoryPanel({ c }: { c: Category }) {
  return (
    <div class="og-panel">
      <ul class="og-list">
        {c.items.map((it, j) => (
          <li key={j}>
            <Inline nodes={it} />
          </li>
        ))}
      </ul>
      {c.note.length > 0 && (
        <p class="og-note">
          <Inline nodes={c.note} />
        </p>
      )}
    </div>
  );
}

// ---- Date sensitivity: a to-scale strip from the date of record to December 2027 ----------------

const DAY = 86_400_000;
const utc = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d);
/** Axis runs from the date of record (9 Oct 2026) to the end of December 2027. */
const T0 = utc(2026, 10, 9);
const T1 = utc(2027, 12, 31);

interface Ev {
  t: number;
  when: string;
  what: string;
}
/** §11 "Date sensitivity": the items the paper dates. */
const DATED: Ev[] = [
  { t: utc(2026, 10, 30), when: '30 October 2026', what: 'Supabase explicit-grants change reaches existing projects' },
  { t: utc(2026, 12, 2), when: '2 December 2026', what: 'AI Act Art. 50(2) grace period ends' },
  { t: utc(2027, 1, 1), when: '1 January 2027', what: 'Colorado ADMTA, if AG rulemaking completes' },
  { t: utc(2027, 12, 2), when: '2 December 2027', what: 'AI Act Annex III high-risk obligations' },
  { t: utc(2027, 12, 11), when: '11 December 2027', what: 'CRA full application' },
];
/** §11 items without a firm date; kept off the scale. */
const UNDATED = [
  { what: 'Supabase legacy-key removal', status: '"Late 2026, TBC"' },
  { what: 'Digital Omnibus GDPR strand', status: 'proposal' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** First of every month inside the axis; quarter starts carry a label. */
const TICKS = (() => {
  const out: { t: number; label?: string }[] = [];
  const d = new Date(T0);
  d.setUTCDate(1);
  for (d.setUTCMonth(d.getUTCMonth() + 1); d.getTime() <= T1; d.setUTCMonth(d.getUTCMonth() + 1)) {
    const m = d.getUTCMonth();
    out.push({ t: d.getTime(), label: m % 3 === 0 ? `${MONTHS[m]} ${d.getUTCFullYear()}` : undefined });
  }
  return out;
})();

// Character-width estimates (viewBox units) for the two label styles, used only to avoid overlaps.
const CW_WHEN = 6.9;
const CW_WHAT = 7.1;
const labelWidth = (e: Ev) => Math.max(e.when.length * CW_WHEN, e.what.length * CW_WHAT) + 8;

/** Desktop: horizontal axis; labels stacked above it in rows so that no label or leader line overlaps. */
function StripH() {
  const W = 1000;
  const PADL = 30;
  const PADR = 30;
  const ROW = 40;
  const GAP = 10;
  const x = (t: number) => PADL + ((t - T0) / (T1 - T0)) * (W - PADL - PADR);
  type P = { e: Ev; x: number; anchor: 'start' | 'end'; x0: number; x1: number; row: number };
  const items: P[] = DATED.map((e) => {
    const xx = x(e.t);
    const w = labelWidth(e);
    const anchor = xx + w > W - 6 ? 'end' : 'start';
    return { e, x: xx, anchor, x0: anchor === 'start' ? xx - 2 : xx - w, x1: anchor === 'start' ? xx + w : xx + 2, row: -1 };
  });
  const order = [...items.filter((i) => i.anchor === 'start').sort((a, b) => b.x - a.x), ...items.filter((i) => i.anchor === 'end').sort((a, b) => a.x - b.x)];
  const placed: P[] = [];
  for (const it of order) {
    for (let r = 0; it.row < 0; r++) {
      const ok = placed.every((p) => {
        if (p.row === r && !(it.x1 + GAP < p.x0 || p.x1 + GAP < it.x0)) return false;
        if (p.row < r && p.x0 <= it.x && it.x <= p.x1) return false;
        if (p.row > r && it.x0 <= p.x && p.x <= it.x1) return false;
        return true;
      });
      if (ok) {
        it.row = r;
        placed.push(it);
      }
    }
  }
  const rows = Math.max(...items.map((i) => i.row)) + 1;
  const axisY = 10 + rows * ROW + 12;
  const H = axisY + 52;
  const bottom = (r: number) => axisY - 14 - r * ROW;
  return (
    <svg class="chart ds-svg ds-h" viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
      <line class="ds-axis" x1={x(T0)} x2={x(T1)} y1={axisY} y2={axisY} />
      <g data-derived>
        {TICKS.map((k) => (
          <g key={k.t}>
            <line class={k.label ? 'ds-tick-major' : 'ds-tick'} x1={x(k.t)} x2={x(k.t)} y1={axisY} y2={axisY + (k.label ? 8 : 4)} />
            {k.label && (
              <text class="ds-tick-label" x={x(k.t)} y={axisY + 22} text-anchor="middle">
                {k.label}
              </text>
            )}
          </g>
        ))}
      </g>
      <g class="ds-dor">
        <line class="ds-dor-line" x1={x(T0)} x2={x(T0)} y1={axisY - 10} y2={axisY + 10} />
        <circle cx={x(T0)} cy={axisY} r={5} />
        <text class="ds-what-sm" x={x(T0)} y={axisY + 23}>
          Date of record
        </text>{' '}
        <text class="ds-when" x={x(T0)} y={axisY + 39}>
          {DATE_OF_RECORD}
        </text>{' '}
      </g>
      {items.map((p) => {
        const b = bottom(p.row);
        const tx = p.anchor === 'start' ? p.x + 6 : p.x - 6;
        return (
          <g key={p.e.when} class="ds-ev">
            <line class="ds-leader" x1={p.x} x2={p.x} y1={axisY - 6} y2={b - 29} />
            <circle class="ds-mark" cx={p.x} cy={axisY} r={5} />
            <text class="ds-when" x={tx} y={b - 17} text-anchor={p.anchor}>
              {p.e.when}
            </text>{' '}
            <text class="ds-what" x={tx} y={b - 1} text-anchor={p.anchor}>
              {p.e.what}
            </text>{' '}
          </g>
        );
      })}
    </svg>
  );
}

/** Phone: vertical axis, same scale logic; labels pushed apart along the axis with bent leaders. */
function StripV() {
  const W = 360;
  const AX = 92;
  const Y0 = 24;
  const PPD = 1.05;
  const MIN = 38;
  const y = (t: number) => Y0 + ((t - T0) / DAY) * PPD;
  const yEnd = y(T1);
  const labels = [{ e: { t: T0, when: DATE_OF_RECORD, what: 'Date of record' }, dor: true }, ...DATED.map((e) => ({ e, dor: false }))].map((l) => ({ ...l, y: y(l.e.t), c: y(l.e.t) }));
  for (let i = 1; i < labels.length; i++) labels[i].c = Math.max(labels[i].c, labels[i - 1].c + MIN);
  const H = Math.max(yEnd, labels[labels.length - 1].c + 18) + 16;
  const LX = AX + 24;
  return (
    <svg class="chart ds-svg ds-v" viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
      <line class="ds-axis" x1={AX} x2={AX} y1={Y0} y2={yEnd} />
      <g data-derived>
        {TICKS.map((k) => (
          <g key={k.t}>
            <line class={k.label ? 'ds-tick-major' : 'ds-tick'} x1={AX - (k.label ? 8 : 4)} x2={AX} y1={y(k.t)} y2={y(k.t)} />
            {k.label && (
              <text class="ds-tick-label" x={AX - 13} y={y(k.t) + 4} text-anchor="end">
                {k.label}
              </text>
            )}
          </g>
        ))}
      </g>
      {labels.map((l) => (
        <g key={l.e.when} class={l.dor ? 'ds-dor' : 'ds-ev'}>
          <polyline class="ds-leader" points={`${AX + 6},${l.y} ${AX + 12},${l.y} ${LX - 6},${l.c} ${LX - 2},${l.c}`} />
          <circle class={l.dor ? undefined : 'ds-mark'} cx={AX} cy={l.y} r={5} />
          <text class="ds-when" x={LX} y={l.c - 3}>
            {l.e.when}
          </text>{' '}
          <text class={l.dor ? 'ds-what-sm' : 'ds-what'} x={LX} y={l.c + 13}>
            {l.e.what}
          </text>{' '}
        </g>
      ))}
    </svg>
  );
}

function DateStrip() {
  return (
    <section class="stack" aria-labelledby="ds-h">
      <h2 id="ds-h" class="eyebrow">
        Date sensitivity: the dates most likely to move
      </h2>
      <figure class="viz ds-fig">
        <div class="ds-frame">
          <StripH />
          <StripV />
        </div>
        <ul class="visually-hidden">
          <li>Date of record: {DATE_OF_RECORD}.{' '}</li>
          {DATED.map((e) => (
            <li key={e.when}>
              {e.when}: {e.what}.{' '}
            </li>
          ))}
        </ul>
        <figcaption>Drawn to scale from the date of record to December 2027. Vendor defaults in section 4.2 were current on {DATE_OF_RECORD}.</figcaption>
      </figure>
      <div class="ds-undated" role="group" aria-labelledby="ds-und-h">
        <h3 id="ds-und-h" class="eyebrow">
          No firm date, so not placed on the scale
        </h3>
        <ul>
          {UNDATED.map((u) => (
            <li key={u.what}>
              <span class="ds-und-what">{u.what}</span>
              <span class="ds-und-status">{u.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function OpenGaps() {
  const cats = [0, 1, 2, 3].map(category);
  return (
    <div class="stack-lg">
      <div class="og-tabs">
        <Tabs label="Open gaps by category" tabs={cats.map((c, i) => ({ id: `og${i}`, label: c.title, panel: <CategoryPanel c={c} /> }))} />
      </div>
      <DateStrip />
    </div>
  );
}

const slides: SlideDef[] = [
  {
    slug: 's11-open-gaps',
    section: '11',
    title: 'Some sources, vendor behaviours and legal points are still unverified',
    short: 'Open gaps',
    dek: 'What to verify before relying on the paper, and the evidence limits that verification cannot close.',
    paper: ['11'],
    flags: { dated: true },
    Body: OpenGaps,
  },
];
export default slides;
