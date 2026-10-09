import { useMemo, useRef, useState } from 'react';
import type { SlideDef } from './types';
import type { Code, Inline as Node } from '../lib/types';
import { Chip } from '../components/Chip';
import { Inline, plain } from '../components/Inline';
import { CODES, legend, table } from '../lib/data';
import { SourceLink, capFirst, codesIn, linkIn, para, pullSource, splitOn, splitOnce, stripLead, stripTrail, useMedia } from './s01-helpers';
import './s01.css';

// ---- s01-what-holds ---------------------------------------------------------------------------

/** The four failure modes as §1.1 lists them. */
const MODES = ['Client-reachable data API with broken authorisation', 'Public-by-default publishing', 'Platform-side bugs', 'Agent destruction with co-located backups'];

/** §1.1's four post-incident remediations; wording, sources and tags as the paper gives them. */
const REMEDIATIONS: { vendor: string; change: any; source: string; code: Code }[] = [
  { vendor: 'Replit', change: 'Dev/prod database separation', source: 'Fortune', code: 'PO' },
  {
    vendor: 'Railway',
    change: (
      <>
        Grace period on the API <code>volumeDelete</code> mutation
      </>
    ),
    source: 'Railway Central Station',
    code: 'CP',
  },
  { vendor: 'Supabase', change: 'Explicit-grants default', source: 'Supabase changelog 45329', code: 'CP' },
  { vendor: 'Lovable', change: 'Private-by-default projects', source: 'Lovable', code: 'CP' },
];

/** Short labels for scanning the confirmed statements, in the paper's order. */
const TOPICS = ['Base44', 'Moltbook', 'Supabase', 'Vercel', 'Identity proxies', 'Claude Code', 'Lovable DPA', 'AI Omnibus', 'Tea', 'Enforcement'];

function WhatHolds() {
  const [head, rest] = splitOnce(para('1.1', 1), ': ');
  const confirmed = splitOn(rest, '; ').map((n) => pullSource(capFirst(stripLead(stripTrail(n, /\.$/), /^(and |that )/))));
  if (confirmed.length !== TOPICS.length) throw new Error('s01-what-holds: §1.1 confirmed-statement list changed');
  return (
    <div class="stack-lg">
      <div class="wh-top">
        <section class="stack" aria-labelledby="wh-modes">
          <h2 id="wh-modes" class="eyebrow">
            Four failure modes, confirmed
          </h2>
          <ol class="ruled wh-modes">
            {MODES.map((m, i) => (
              <li key={m}>
                <span class="mono-id" aria-hidden="true">
                  {i + 1}
                </span>
                <span class="wh-mode">{m}</span>
              </li>
            ))}
          </ol>
          <p class="small wh-note">
            Confirmed by the full incident ledger (<a href="#s03-timeline">§3</a>); no incident found in the May–October 2026 extension required a fifth category <Chip code="INF" />
          </p>
        </section>
        <section class="stack" aria-labelledby="wh-rem">
          <h2 id="wh-rem" class="eyebrow">
            Every post-incident vendor remediation
          </h2>
          <ul class="ruled wh-rem">
            {REMEDIATIONS.map((r) => (
              <li key={r.vendor}>
                <span class="wh-vendor">{r.vendor}</span>
                <span class="wh-change">{r.change}</span>
                <span class="wh-ev">
                  <Chip code={r.code} />
                  <SourceLink href={linkIn('1.1', r.source)}>{r.source}</SourceLink>
                </span>
              </li>
            ))}
          </ul>
          <p class="small muted">Each changed defaults or blast radius rather than code correctness.</p>
        </section>
      </div>

      <section class="stack" aria-labelledby="wh-conf">
        <h2 id="wh-conf" class="eyebrow sec-title">
          <span>{plain(head).replace(/\s*\[CP\]\s*$/, '')}</span>
          <Chip code="CP" />
        </h2>
        <ul class="wh-confirmed">
          {confirmed.map((c, i) => (
            <li key={TOPICS[i]}>
              <span class="wh-topic">{TOPICS[i]}</span>
              <span class="wh-stmt">
                <Inline nodes={c.body} />
                {c.source && (
                  <>
                    {' '}
                    <SourceLink href={c.source.href}>{c.source.label}</SourceLink>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

// ---- s01-corrections --------------------------------------------------------------------------

interface Row {
  num: string;
  orig: Node[];
  corr: Node[];
  why: Node[];
  codes: Code[];
}

const corrRows = (): Row[] => table('1.2#1').rows.map((r) => ({ num: plain(r[0]), orig: r[1], corr: r[2], why: r[3], codes: codesIn(r[2]) }));
const HEAD = () => table('1.2#1').headPlain;

function Fields({ r, withOriginal }: { r: Row; withOriginal?: boolean }) {
  const h = HEAD();
  return (
    <>
      {withOriginal && (
        <div class="corr-field corr-was">
          <h3 class="eyebrow">{h[1]}</h3>
          <p>
            <Inline nodes={r.orig} />
          </p>
        </div>
      )}
      <div class="corr-field corr-now">
        <h3 class="eyebrow">{h[2]}</h3>
        <p>
          <Inline nodes={r.corr} />
        </p>
      </div>
      <div class="corr-field corr-why">
        <h3 class="eyebrow">{h[3]}</h3>
        <p>
          <Inline nodes={r.why} />
        </p>
      </div>
    </>
  );
}

/** Desktop: a vertical tab list of the corrections beside one detail panel. */
function MasterDetail({ rows }: { rows: Row[] }) {
  const [sel, setSel] = useState(rows[0]?.num);
  const active = rows.find((r) => r.num === sel) ?? rows[0];
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const move = (to: number) => {
    const r = rows[(to + rows.length) % rows.length];
    setSel(r.num);
    const el = refs.current[r.num];
    el?.focus({ preventScroll: true });
    el?.scrollIntoView({ block: 'nearest' });
  };
  const onKey = (e: KeyboardEvent) => {
    const i = rows.indexOf(active);
    const to = e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowUp' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? rows.length - 1 : null;
    if (to === null) return;
    e.preventDefault();
    move(to);
  };
  return (
    <div class="corr-md">
      <div class="stack" style={{ gap: '8px' }}>
        <div class="corr-list" role="tablist" aria-orientation="vertical" aria-label="Corrections to the original report" onKeyDown={onKey as any}>
          {rows.map((r) => (
            <button
              key={r.num}
              ref={(el) => {
                refs.current[r.num] = el;
              }}
              type="button"
              role="tab"
              id={`corr-tab-${r.num}`}
              aria-selected={r === active}
              aria-controls="corr-panel"
              tabIndex={r === active ? 0 : -1}
              onClick={() => setSel(r.num)}
            >
              <span class="corr-num">{r.num}</span>
              <span class="corr-orig">
                <Inline nodes={r.orig} />
              </span>
            </button>
          ))}
        </div>
        <p class="small muted" data-chrome>
          <kbd>↑</kbd> <kbd>↓</kbd> move through the list
        </p>
      </div>
      {active && (
        <div class="corr-detail card" role="tabpanel" id="corr-panel" aria-labelledby={`corr-tab-${active.num}`} tabIndex={0}>
          <div class="corr-detail-head">
            <span class="corr-badge">#{active.num}</span>
          </div>
          <Fields r={active} withOriginal />
        </div>
      )}
    </div>
  );
}

/** Phone: the same corrections as an accordion. */
function Accordion({ rows }: { rows: Row[] }) {
  const [open, setOpen] = useState<Set<string>>(() => new Set([rows[0]?.num]));
  const toggle = (n: string) =>
    setOpen((s) => {
      const x = new Set(s);
      if (x.has(n)) x.delete(n);
      else x.add(n);
      return x;
    });
  return (
    <ul class="ruled corr-acc">
      {rows.map((r) => {
        const o = open.has(r.num);
        return (
          <li key={r.num}>
            <h3>
              <button type="button" id={`corr-acc-b-${r.num}`} aria-expanded={o} aria-controls={`corr-acc-p-${r.num}`} onClick={() => toggle(r.num)}>
                <span class="corr-num">{r.num}</span>
                <span class="corr-orig">
                  <Inline nodes={r.orig} />
                </span>
                <span class="corr-acc-icon" aria-hidden="true" />
              </button>
            </h3>
            <div id={`corr-acc-p-${r.num}`} role="region" aria-labelledby={`corr-acc-b-${r.num}`} class="corr-acc-body" hidden={!o}>
              <Fields r={r} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Omissions() {
  const [head, rest] = splitOnce(para('1.2', 2), ': ');
  const items = splitOn(rest, ', and ').map((n) => pullSource(capFirst(stripTrail(n, /\.$/))));
  // The paper's own short names for these two items (§2.3, items 5 and 6).
  const names = ['Colorado', "CSA's superseded date"];
  return (
    <section class="corr-omit" aria-labelledby="corr-omit-h">
      <h2 id="corr-omit-h" class="eyebrow">
        {plain(head)}
      </h2>
      <div class="corr-omit-grid">
        {items.map((it, i) => (
          <div key={i} class="corr-omit-item">
            <h3 class="h3">{names[i]}</h3>
            <p class="small">
              <Inline nodes={it.body} />
              {it.source && (
                <>
                  {' '}
                  <SourceLink href={it.source.href}>{it.source.label}</SourceLink>
                </>
              )}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Corrections() {
  const rows = useMemo(corrRows, []);
  const present = CODES.filter((c) => rows.some((r) => r.codes.includes(c)));
  const [filter, setFilter] = useState<Code | null>(null);
  const shown = filter ? rows.filter((r) => r.codes.includes(filter)) : rows;
  const narrow = useMedia('(max-width: 760px)');
  return (
    <div class="stack-lg">
      <div class="corr-bar">
        <div class="filter-group">
          <span class="eyebrow" id="corr-filter-label">
            Filter by evidence in the corrected position
          </span>
          <div class="seg" role="group" aria-labelledby="corr-filter-label">
            <button type="button" aria-pressed={filter === null} onClick={() => setFilter(null)}>
              All
            </button>
            {present.map((c) => (
              <button key={c} type="button" aria-pressed={filter === c} aria-label={`${c}: ${legend[c]}`} onClick={() => setFilter(filter === c ? null : c)}>
                <Chip code={c} />
              </button>
            ))}
          </div>
        </div>
        <p class="small muted corr-hint">
          {filter ? (
            <>
              Corrections whose corrected position carries <Chip code={filter} /> {legend[filter]}.
            </>
          ) : (
            'Select a correction to compare the original statement with the corrected position.'
          )}
        </p>
        <p class="visually-hidden" aria-live="polite">
          {filter ? `Showing corrections whose corrected position carries ${filter}, ${legend[filter]}.` : 'Showing all corrections.'}
        </p>
      </div>
      {narrow ? <Accordion key={filter ?? 'all'} rows={shown} /> : <MasterDetail rows={shown} />}
      <Omissions />
    </div>
  );
}

const slides: SlideDef[] = [
  {
    slug: 's01-what-holds',
    section: '1',
    title: 'The architecture holds: fixes changed defaults or blast radius, not code',
    short: 'What holds',
    dek: "The original report's central claim, that controls must be enforced by a layer the generated code does not own, is supported by every post-incident vendor remediation.",
    paper: ['1.1'],
    flags: { dated: true },
    Body: WhatHolds,
  },
  {
    slug: 's01-corrections',
    section: '1',
    title: 'The thesis was right; roughly thirty specifics were wrong or over-compressed',
    short: 'Corrections',
    dek: "The report's weakness was evidentiary compression: selected scans, vendor documentation, individual incidents, benchmark results, legal duties and the authors' own design were written at one level of certainty.",
    paper: ['1.2'],
    flags: { dated: true },
    Body: Corrections,
  },
];
export default slides;
