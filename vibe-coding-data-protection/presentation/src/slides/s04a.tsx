import { useMemo, useState } from 'react';
import type { SlideDef } from './types';
import { BOUNDARIES, CODES, controls, table, VERDICT_CLASSES, verdictClass, type BoundaryKey, type VerdictClass } from '../lib/data';
import type { Code } from '../lib/types';
import { Inline } from '../components/Inline';
import { Chip, Chips } from '../components/Chip';
import { Verdict } from '../components/Verdict';
import './s04a.css';

/** Hand-off from the boundary diagram to the controls matrix (pre-selects a boundary). */
const handoff: { boundary: BoundaryKey | null } = { boundary: null };

type B = 'B1' | 'B2' | 'B3' | 'B4';
const B_ROW: Record<B, number> = { B1: 0, B2: 1, B3: 2, B4: 3 };
const B_KEY: Record<B, BoundaryKey> = { B1: 'B1 Builder identity', B2: 'B2 Ingress', B3: 'B3 Data API', B4: 'B4 Agent plane' };

function Gate({ id, x, y, active, onPick }: { id: B; x: number; y: number; active: boolean; onPick: (b: B) => void }) {
  return (
    <g
      class={`gate${active ? ' on' : ''}`}
      role="button"
      tabIndex={0}
      aria-pressed={active}
      aria-label={`Boundary ${id}`}
      onClick={() => onPick(id)}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPick(id);
        }
      }}
    >
      <rect x={x - 5} y={y - 30} width={10} height={60} rx={3} />
      <circle cx={x} cy={y - 42} r={15} />
      <text x={x} y={y - 38} text-anchor="middle">
        {id}
      </text>
    </g>
  );
}

function Box({ x, y, w, h, title, sub, tone }: { x: number; y: number; w: number; h: number; title: string; sub: string; tone?: 'actor' | 'asset' }) {
  return (
    <g class={`node ${tone ?? ''}`}>
      <rect x={x} y={y} width={w} height={h} rx={tone === 'actor' ? h / 2 : 8} />
      <text x={x + w / 2} y={y + h / 2 - 4} text-anchor="middle" class="node-title">
        {title}
      </text>
      <text x={x + w / 2} y={y + h / 2 + 14} text-anchor="middle" class="node-sub">
        {sub}
      </text>
    </g>
  );
}

function BoundaryModel() {
  const [active, setActive] = useState<B>('B3');
  const t = table('4.1#1');
  const row = t.rows[B_ROW[active]];
  const on = (b: B) => (active === b ? ' on' : '');
  return (
    <div class="stack-lg">
      <div class="bm-layout">
        <figure class="viz" style={{ margin: 0 }}>
          <div class="chart-frame" data-hscroll>
            <svg class="chart bm" viewBox="0 0 1000 470" style={{ minWidth: '700px' }} role="img" aria-labelledby="bm-title bm-desc">
              <title id="bm-title">Four trust boundaries in a vibe-coded deployment</title>
              <desc id="bm-desc">
                B1 sits between the builder and the builder workspace. B2 sits between anyone on the internet and the published app. B3 sits in front of the data and connector API, which is reachable both from the published app and directly from the internet. B4 sits between the coding agent's execution plane and production data, infrastructure and backups.
              </desc>
              <defs>
                <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0 0 L10 5 L0 10 z" fill="var(--line-strong)" />
                </marker>
              </defs>
              {/* paths */}
              <path class={`flow${on('B1')}`} d="M200 75 H330" marker-end="url(#arr)" />
              <path class={`flow${on('B2')}`} d="M200 215 H330" marker-end="url(#arr)" />
              <path class={`flow${on('B3')}`} d="M620 215 H720" marker-end="url(#arr)" />
              <path class={`flow bypass${on('B3')}`} d="M130 245 V300 H850 V255" marker-end="url(#arr)" />
              <path class="flow" d="M475 110 V175" marker-end="url(#arr)" />
              <text x={485} y={148} class="node-sub" text-anchor="start">
                publish
              </text>
              <path class="flow" d="M200 405 H330" marker-end="url(#arr)" />
              <path class={`flow${on('B4')}`} d="M620 405 H720" marker-end="url(#arr)" />
              <path class="flow dashed" d="M940 255 V365" marker-end="url(#arr)" />
              <text x={932} y={318} class="node-sub" text-anchor="end">
                same data
              </text>
              <text x={480} y={292} class="node-sub" text-anchor="middle">
                direct call with the public key, no app in the path
              </text>
              {/* nodes */}
              <Box x={20} y={45} w={180} h={60} title="Builder" sub="employee, any account" tone="actor" />
              <Box x={330} y={40} w={290} h={70} title="Builder workspace" sub="projects, connectors, publish, code export" />
              <Box x={20} y={185} w={180} h={60} title="Anyone on the internet" sub="no login" tone="actor" />
              <Box x={330} y={175} w={290} h={80} title="Published app" sub="custom domain, platform subdomain, previews" />
              <Box x={720} y={175} w={260} h={80} title="Data and connector API" sub="REST, GraphQL, RPC, Storage" tone="asset" />
              <Box x={20} y={375} w={180} h={60} title="Coding agent" sub="holds whatever it can read" tone="actor" />
              <Box x={330} y={365} w={290} h={80} title="Agent execution plane" sub="shell, files, MCP tools, hooks" />
              <Box x={720} y={365} w={260} h={80} title="Production" sub="data, infrastructure, backups" tone="asset" />
              {/* gates */}
              <Gate id="B1" x={265} y={75} active={active === 'B1'} onPick={setActive} />
              <Gate id="B2" x={265} y={215} active={active === 'B2'} onPick={setActive} />
              <Gate id="B3" x={670} y={215} active={active === 'B3'} onPick={setActive} />
              <Gate id="B4" x={670} y={405} active={active === 'B4'} onPick={setActive} />
            </svg>
          </div>
          <figcaption>Select a boundary (or use the buttons) to see its question, where it is enforced and the test that proves it. The data API is reachable without going through the app, so B2 controls do not protect it.</figcaption>
        </figure>
        <div class="stack">
          <div class="seg" role="group" aria-label="Boundary">
            {(['B1', 'B2', 'B3', 'B4'] as B[]).map((b) => (
              <button key={b} type="button" aria-pressed={active === b} onClick={() => setActive(b)}>
                {b}
              </button>
            ))}
          </div>
          <div class="card bm-detail" aria-live="polite">
            <h2 class="h2">
              <Inline nodes={row[0]} />
            </h2>
            <dl class="bm-fields">
              <dt>
                <Inline nodes={t.head[1]} />
              </dt>
              <dd>
                <Inline nodes={row[1]} />
              </dd>
              <dt>
                <Inline nodes={t.head[2]} />
              </dt>
              <dd>
                <Inline nodes={row[2]} />
              </dd>
              <dt>
                <Inline nodes={t.head[3]} />
              </dt>
              <dd>
                <Inline nodes={row[3]} />
              </dd>
            </dl>
            <a
              href="#s04-controls"
              onClick={() => {
                handoff.boundary = B_KEY[active];
              }}
            >
              Controls at {active} in the matrix
            </a>
          </div>
        </div>
      </div>
      <blockquote class="quote">
        A Cloudflare Access-protected HTML page with a separately reachable Supabase API is two boundaries, and "the public API is not automatically insecure if it enforces properly designed grants and RLS", while "a BFF that proxies through an unrestricted service-role credential is not automatically safe" <Chip code="INF" />
        <cite>The audit's observation, upheld in paper §4.1. Conflating boundaries produces both false assurance and false alarm.</cite>
      </blockquote>
    </div>
  );
}

const codesIn = (c: (typeof controls)[number]) => c.confidence_codes as Code[];

function ControlsMatrix() {
  const [bounds, setBounds] = useState<Set<BoundaryKey>>(() => {
    const b = handoff.boundary;
    handoff.boundary = null;
    return new Set(b ? [b] : BOUNDARIES);
  });
  const [verdicts, setVerdicts] = useState<Set<VerdictClass>>(new Set(VERDICT_CLASSES));
  const [codes, setCodes] = useState<Set<Code>>(new Set(CODES));
  const [q, setQ] = useState('');
  const present = useMemo(() => CODES.filter((c) => controls.some((x) => codesIn(x).includes(c))), []);
  const flip = <T,>(set: Set<T>, v: T, all: readonly T[]) => {
    const n = new Set(set);
    if (n.size === all.length) return new Set([v]);
    n.has(v) ? n.delete(v) : n.add(v);
    return n.size ? n : new Set(all);
  };
  const match = (c: (typeof controls)[number]) =>
    bounds.has(c.boundary as BoundaryKey) &&
    verdicts.has(verdictClass(c.verdict)) &&
    codesIn(c).some((k) => codes.has(k)) &&
    (!q || `${c.control} ${c.enforcement_locus} ${c.verdict} ${c.bypass_limitation}`.toLowerCase().includes(q.toLowerCase()));
  const shown = controls.filter(match).length;

  return (
    <div class="stack-lg">
      <div class="filters" role="search" aria-label="Filter controls">
        <div class="filter-group">
          <span class="eyebrow" id="cf-b">Boundary</span>
          <div class="seg" role="group" aria-labelledby="cf-b">
            {BOUNDARIES.map((b) => (
              <button type="button" key={b} aria-pressed={bounds.has(b)} onClick={() => setBounds(flip(bounds, b, BOUNDARIES))}>
                {b}
              </button>
            ))}
          </div>
        </div>
        <div class="filter-group">
          <span class="eyebrow" id="cf-v">Verdict</span>
          <div class="seg" role="group" aria-labelledby="cf-v">
            {VERDICT_CLASSES.map((v) => (
              <button type="button" key={v} aria-pressed={verdicts.has(v)} onClick={() => setVerdicts(flip(verdicts, v, VERDICT_CLASSES))}>
                {v}
              </button>
            ))}
          </div>
        </div>
        <div class="filter-group">
          <span class="eyebrow" id="cf-e">Evidence tier</span>
          <div class="seg" role="group" aria-labelledby="cf-e">
            {present.map((c) => (
              <button type="button" key={c} aria-pressed={codes.has(c)} onClick={() => setCodes(flip(codes, c, present))}>
                <Chip code={c} />
              </button>
            ))}
          </div>
        </div>
        <div class="filter-group">
          <label class="eyebrow" for="cf-q">
            Search
          </label>
          <input id="cf-q" class="search" type="search" value={q} onInput={(e) => setQ((e.target as HTMLInputElement).value)} placeholder="e.g. MCP, RLS, backup" />
        </div>
        <span class="count" data-chrome aria-live="polite">
          {shown} of {controls.length} controls shown
        </span>
      </div>
      <p class="small muted">The first click on a filter shows only that value; further clicks add or remove values. Verdict filters use the verdict's own first word; the full verdict always shows.</p>
      <div class="tbl-wrap tall" tabIndex={0} role="region" aria-label="Controls by boundary" data-hscroll>
        <table class="ptable controls">
          <thead>
            <tr>
              <th scope="col">Control</th>
              <th scope="col">Enforcement locus</th>
              <th scope="col">Verdict</th>
              <th scope="col">Bypass / limitation</th>
              <th scope="col">Evidence tier</th>
            </tr>
          </thead>
          {BOUNDARIES.map((b) => {
            const rows = controls.filter((c) => c.boundary === b);
            const any = rows.some(match);
            return (
              <tbody key={b} hidden={!any}>
                <tr class="group">
                  <th colSpan={5} scope="colgroup">
                    {b}
                  </th>
                </tr>
                {rows.map((c, i) => (
                  <tr key={i} hidden={!match(c)}>
                    <th scope="row" data-label="Control">
                      {c.control}
                    </th>
                    <td data-label="Enforcement locus">{c.enforcement_locus}</td>
                    <td data-label="Verdict">
                      <Verdict kind={verdictClass(c.verdict)} />
                      <div class="small">{c.verdict}</div>
                    </td>
                    <td data-label="Bypass / limitation">{c.bypass_limitation}</td>
                    <td data-label="Evidence tier">
                      <Chips codes={codesIn(c)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            );
          })}
        </table>
      </div>
    </div>
  );
}

const slides: SlideDef[] = [
  {
    slug: 's04-boundary-model',
    section: '4',
    title: 'A vibe-coded deployment crosses four independent trust boundaries',
    short: 'Four boundaries',
    dek: 'Each boundary has its own question, its own enforcement locus and its own test. Conflating them produces both false assurance and false alarm.',
    paper: ['4.1'],
    Body: BoundaryModel,
  },
  {
    slug: 's04-controls',
    section: '4',
    title: 'Every control, filed under the boundary it binds at',
    short: 'Controls matrix',
    dek: 'Where each control is enforced, what it does, how it is bypassed, and how well that is evidenced.',
    paper: ['appendix-c'],
    flags: { dated: true },
    Body: ControlsMatrix,
  },
];
export default slides;
