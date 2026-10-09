// §6.7: the survey and telemetry ledger (paper table 6.7#1) as cards that can be grouped by what
// each figure measures, by evidence tag, or left in the paper's order.
import { useState } from 'react';
import { Chip } from '../components/Chip';
import { Inline, plain } from '../components/Inline';
import { CODES, fig, legend, table } from '../lib/data';
import type { Code, Inline as Node } from '../lib/types';

type Mode = 'kind' | 'tag' | 'paper';

/** Kinds of measure, read from the paper's "What it measures" column. */
const KINDS = [
  { id: 'telemetry', name: 'Product telemetry', note: 'What a vendor product saw in customer traffic, by the vendor’s or its customers’ definitions', test: /telemetry|Traffic shares|Paste-event|Content sensitivity/i },
  { id: 'self', name: 'Worker self-report', note: 'What employees and builders say they do', test: /self-report/i },
  { id: 'leader', name: 'Leader perception', note: 'What security and technology leaders believe or suspect', test: /^Leader/i },
  { id: 'breach', name: 'Breached organisations', note: 'A sample defined by having been breached', test: /Breached/i },
  { id: 'unknown', name: 'Population not stated', note: 'No N or population reachable', test: /.*/ },
] as const;

/** Ledger rows that are also key figures: their source link comes from data/key-figures.json. */
const KEY_FIGURE: Record<string, number> = { 'Netskope Cloud and Threat Report 2026': 34, 'Retool State of AI Governance 2026': 39, 'Gartner, Nov 2025': 35 };

interface Row {
  i: number;
  cells: Node[][];
  plain: string[];
  kind: (typeof KINDS)[number];
  tags: Code[];
  keyFig?: number;
}

function tagsOf(nodes: Node[]): Code[] {
  const out: Code[] = [];
  const walk = (ns: Node[]) =>
    ns.forEach((n) => {
      if (n.t === 'tag') out.push(n.v);
      else if (n.t === 'b' || n.t === 'i' || n.t === 'a') walk(n.c);
    });
  walk(nodes);
  return out;
}

function rows(): Row[] {
  const t = table('6.7#1');
  return t.rows.map((cells, i) => {
    const p = t.rowsPlain[i];
    const measures = plain(cells[3]);
    const kind = KINDS.find((k) => k.test.test(measures))!;
    const src = plain(cells[1]).replace(/\s*\(.*\)$/, '').trim();
    return { i, cells, plain: p, kind, tags: tagsOf(cells[3]), keyFig: KEY_FIGURE[src] ?? KEY_FIGURE[plain(cells[1]).trim()] };
  });
}

function LedgerCard({ r, heads }: { r: Row; heads: string[] }) {
  const strongest = r.keyFig === 34;
  return (
    <article class={`s6-ledger-card${strongest ? ' is-strongest' : ''}`} data-ledger-row={r.i}>
      {strongest && (
        <span class="s6-badge">
          Strongest available evidence that sanctioned accounts plus blocking shift behaviour <Chip code="INF" />
        </span>
      )}
      <p class="s6-ledger-fig">
        <Inline nodes={r.cells[0]} />
      </p>
      <dl class="s6-ledger-dl">
        <dt>{heads[1]}</dt>
        <dd>
          <Inline nodes={r.cells[1]} />
          {r.keyFig && (
            <>
              {' '}
              <a href={fig(r.keyFig).source_url} target="_blank" rel="noopener noreferrer">
                source
              </a>
            </>
          )}
        </dd>
        <dt>{heads[2]}</dt>
        <dd>
          <Inline nodes={r.cells[2]} />
        </dd>
        <dt>{heads[3]}</dt>
        <dd class="s6-ledger-measures">
          <Inline nodes={r.cells[3]} />
        </dd>
      </dl>
    </article>
  );
}

export function Surveys() {
  const [mode, setMode] = useState<Mode>('kind');
  const heads = table('6.7#1').headPlain;
  const all = rows();
  const groups =
    mode === 'kind'
      ? KINDS.map((k) => ({ id: k.id, title: k.name, note: k.note, items: all.filter((r) => r.kind.id === k.id), code: undefined as Code | undefined }))
      : mode === 'tag'
        ? CODES.map((c) => ({ id: c, title: '', note: '', code: c, items: all.filter((r) => r.tags.includes(c)) }))
        : [{ id: 'paper', title: 'In the paper’s order', note: '', code: undefined as Code | undefined, items: all }];
  const MODES: { id: Mode; label: string }[] = [
    { id: 'kind', label: 'What it measures' },
    { id: 'tag', label: 'Evidence tag' },
    { id: 'paper', label: 'Paper order' },
  ];
  return (
    <div class="stack-lg">
      <p class="lead">
        They measure at least four different things on four populations <Chip code="INF" />: traffic and DLP detections, paste events, content sensitivity, breached organisations, leader perception and worker self-report.
      </p>
      <div class="filters">
        <div class="filter-group">
          <span class="eyebrow" id="s6s-group">
            Group by
          </span>
          <div class="seg" role="group" aria-labelledby="s6s-group">
            {MODES.map((m) => (
              <button key={m.id} type="button" aria-pressed={mode === m.id} onClick={() => setMode(m.id)}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div class="s6-ledger">
        {groups
          .filter((g) => g.items.length)
          .map((g) => (
            <section class="s6-ledger-group" key={`${mode}-${g.id}`} aria-label={g.code ? `Tagged ${g.code}` : g.title} style={{ ['--n' as any]: Math.min(4, g.items.length) }}>
              <header class="s6-ledger-head">
                <h2 class="h3">{g.code ? <Chip code={g.code} large /> : g.title}</h2>
                {g.code ? <span class="small muted">{legend[g.code]}</span> : g.note && <span class="small muted">{g.note}</span>}
              </header>
              <div class="s6-ledger-grid">
                {g.items.map((r) => (
                  <LedgerCard key={r.i} r={r} heads={heads} />
                ))}
              </div>
            </section>
          ))}
      </div>
      {mode === 'kind' && <p class="small muted">Grouping is this presentation's reading of the paper's “What it measures” column; every card is one row of the paper's table, unchanged.</p>}
      <div class="grid-2">
        <div class="card s6-takeaway">
          <h2 class="h3">The Netskope trend</h2>
          <p class="small">
            The strongest available evidence that sanctioned enterprise accounts plus blocking shift behaviour; it does not isolate either lever <Chip code="INF" />.
          </p>
        </div>
        <div class="card s6-takeaway">
          <h2 class="h3">Training</h2>
          <p class="small">
            Recommended by every source and evidenced by none: the one design with an enforcement hook is Tenable's “no training, no tool access” <Chip code="CP" />
            <Chip code="INF" />.
          </p>
        </div>
      </div>
    </div>
  );
}
