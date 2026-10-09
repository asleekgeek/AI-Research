// §8.2 (authors' proposal): data/rollout-phases.json on a to-scale day axis. Windows are parsed
// from the JSON's own text ("Weeks 0–2", "Days 30–90"); "Ongoing" has no stated start or end and is
// drawn as an open lane off the scale. The gap the source leaves between week 2 and day 30 is kept.
import { useRef, useState } from 'react';
import { Chip } from '../components/Chip';
import { Inline } from '../components/Inline';
import { phases, table } from '../lib/data';
import { splitInline } from './s06-util';

type Win = { start: number; end: number } | null;

function parseWindow(w: string): Win {
  let m = /^Weeks (\d+)–(\d+)$/.exec(w);
  if (m) return { start: +m[1] * 7, end: +m[2] * 7 };
  m = /^Days (\d+)–(\d+)$/.exec(w);
  if (m) return { start: +m[1], end: +m[2] };
  if (/^Ongoing$/.test(w)) return null;
  throw new Error(`Unparsed rollout window: ${w}`);
}

const WIN = phases.map((p) => parseWindow(p.window));
const SCALED = WIN.filter((w): w is NonNullable<Win> => w !== null);
const MAX = Math.max(...SCALED.map((w) => w.end));
const STEP = 30;
const TICKS = Array.from({ length: Math.floor(MAX / STEP) + 1 }, (_, i) => i * STEP);
const pct = (d: number) => (d / MAX) * 100;
/** Stretches of the day axis the source assigns to no phase. */
const GAPS = [...SCALED]
  .sort((a, b) => a.start - b.start)
  .flatMap((w, i, all) => (i > 0 && w.start > all[i - 1].end ? [{ from: all[i - 1].end, to: w.start }] : []));

/** The paper's §8.2 table row for a phase (its first cell starts with the phase number). */
function paperRow(phase: string) {
  const t = table('8.2#1');
  const i = t.rowsPlain.findIndex((r) => r[0].trim().startsWith(`${phase} `));
  if (i < 0) throw new Error(`No §8.2 row for phase ${phase}`);
  return t.rows[i];
}

/** Marks the one dated deadline in the actions. */
function withDeadline(text: string) {
  const m = /^(.*)(before 30 Oct 2026)(.*)$/.exec(text);
  if (!m) return text;
  return (
    <>
      {m[1]}
      <mark class="s8-deadline">{m[2]}</mark>
      {m[3]}
    </>
  );
}

export function Rollout() {
  const [sel, setSel] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent) => {
    const n = phases.length;
    const to =
      e.key === 'ArrowDown' || e.key === 'ArrowRight'
        ? (sel + 1) % n
        : e.key === 'ArrowUp' || e.key === 'ArrowLeft'
          ? (sel - 1 + n) % n
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? n - 1
              : -1;
    if (to < 0) return;
    e.preventDefault();
    setSel(to);
    tabs.current[to]?.focus();
  };
  const p = phases[sel];
  const row = paperRow(p.phase);

  const lane = (i: number) => {
    const ph = phases[i];
    const w = WIN[i];
    const width = w ? pct(w.end) - pct(w.start) : 0;
    const inside = width >= 22;
    return (
      <button
        key={ph.phase}
        ref={(el) => {
          tabs.current[i] = el;
        }}
        type="button"
        role="tab"
        id={`s8-ph-${ph.phase}`}
        aria-selected={i === sel}
        aria-controls="s8-ph-panel"
        tabIndex={i === sel ? 0 : -1}
        class={`s8-lane${w ? '' : ' s8-lane-open'}${i === sel ? ' is-on' : ''}`}
        onClick={() => setSel(i)}
      >
        <span class="s8-lane-label">
          <span class="s8-ph-num">Phase {ph.phase}</span>
          <span class="s8-ph-name">{ph.name}</span>
          <Chip code="PROP" />
        </span>
        {w ? (
          <span class="s8-track" style={{ ['--ticks' as any]: TICKS.length - 1 }}>
            {GAPS.map((g) => (
              <span key={g.from} class="s8-gap" style={{ left: `${pct(g.from)}%`, width: `${pct(g.to) - pct(g.from)}%` }} />
            ))}
            <span class="s8-bar" style={{ left: `${pct(w.start)}%`, width: `${width}%` }} />
            <span class={`s8-bar-text${inside ? ' is-inside' : ''}`} style={inside ? { left: `${pct(w.start)}%` } : { left: `${pct(w.end)}%` }}>
              {ph.window}
            </span>
          </span>
        ) : (
          <span class="s8-track s8-track-open">
            <span class="s8-open-band" />
            <span class="s8-bar-text s8-open-text">{ph.window}: no start or end stated</span>
          </span>
        )}
      </button>
    );
  };

  return (
    <div class="stack-lg">
      <figure class="s8-gantt">
        <div class="s8-axis" aria-hidden="true" data-derived>
          <span class="s8-axis-title">Day</span>
          <span class="s8-axis-track">
            {TICKS.map((d, i) => (
              <span key={d} class={`s8-tick${i === 0 ? ' is-first' : i === TICKS.length - 1 ? ' is-last' : ''}`} style={{ left: `${pct(d)}%` }}>
                {d}
              </span>
            ))}
          </span>
        </div>
        <div class="s8-lanes" role="tablist" aria-orientation="vertical" aria-label="Rollout phases (authors' proposal)" onKeyDown={onKey as any}>
          {phases.map((_, i) => (WIN[i] ? lane(i) : null))}
          <div class="s8-sep" role="presentation">
            <span>Not on the day scale</span>
          </div>
          {phases.map((_, i) => (WIN[i] ? null : lane(i)))}
        </div>
        <figcaption class="s8-cap">
          <span class="s8-key">
            <span class="s8-swatch s8-swatch-gap" aria-hidden="true" />
            Between week 2 and day 30 the paper states no phase; the gap is the source's, not a drawing choice.
          </span>
          <span class="s8-key">
            <span class="s8-swatch s8-swatch-open" aria-hidden="true" />
            “Ongoing” has no stated start or end, so it is drawn open at both ends and kept off the day scale.
          </span>
          <span class="scale-note" data-chrome>
            Linear day scale from 0 to {MAX}; weeks drawn as 7 days. Select a phase for its actions, exit criterion, owner and evidence.
          </span>
        </figcaption>
      </figure>

      <section class="s8-detail" role="tabpanel" id="s8-ph-panel" aria-labelledby={`s8-ph-${p.phase}`} tabIndex={0}>
        <header class="s8-detail-head">
          <span class="eyebrow">
            Phase {p.phase} · {p.window}
          </span>
          <h2 class="s8-detail-title">
            {p.name} <Chip code="PROP" />
          </h2>
        </header>
        <div class="s8-detail-grid">
          <div class="stack">
            <div class="s8-exit">
              <span class="eyebrow">Exit criterion</span>
              <p>{p.exit_criterion}</p>
            </div>
            <dl class="s8-meta">
              <div>
                <dt>Owner</dt>
                <dd>{p.owner}</dd>
              </div>
              <div>
                <dt>Evidence produced</dt>
                <dd>{p.evidence}</dd>
              </div>
            </dl>
          </div>
          <div class="stack">
            <span class="eyebrow">Key actions</span>
            <ul class="s8-actions">
              {p.key_actions.split(/;\s*/).map((a) => (
                <li key={a}>{withDeadline(a)}</li>
              ))}
            </ul>
          </div>
        </div>
        <details class="more" key={p.phase}>
          <summary>All actions, as the paper's table 8.2 states them</summary>
          <ul class="s8-actions s8-actions-full">
            {splitInline(row[2]).map((a, i) => (
              <li key={i}>
                <Inline nodes={a} />
              </li>
            ))}
          </ul>
        </details>
      </section>
    </div>
  );
}
