import { useMemo, useState } from 'react';
import type { SlideDef } from './types';
import { Chip } from '../components/Chip';
import { FigTile } from '../components/Figure';
import { Inline } from '../components/Inline';
import { CODES, DATE_OF_RECORD, keyFigures, legend, paper, section } from '../lib/data';
import type { Code } from '../lib/types';
import './appendix.css';

// ---- a-key-figures ------------------------------------------------------------------------------

/** Codes that at least one key figure carries, in legend order. */
const FIG_CODES: Code[] = CODES.filter((c) => keyFigures.some((f) => f.confidence_codes.includes(c)));

const host = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return u;
  }
};

function Tile({ n }: { n: number }) {
  return (
    <li>
      <FigTile n={n} />
    </li>
  );
}

function KeyFigures() {
  const [code, setCode] = useState<Code | null>(null);
  const [q, setQ] = useState('');
  const hits = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return keyFigures
      .map((f, i) => ({ f, n: i + 1 }))
      .filter(({ f }) => !code || f.confidence_codes.includes(code))
      .filter(({ f }) => !needle || [f.figure, f.value, f.unit_denominator, f.date, host(f.source_url), ...f.confidence_labels].join(' ').toLowerCase().includes(needle));
  }, [code, q]);

  return (
    <div class="stack-lg">
      <p class="small muted ax-intro">
        Each tile is one row of <code>data/key-figures.json</code>. The date on a tile is the source's own; vendor prices and regulatory statuses are as verified on the date of record, {DATE_OF_RECORD}.
      </p>
      <div class="filters ax-filters" role="search" aria-label="Filter key figures">
        <div class="filter-group">
          <span class="eyebrow" id="ax-code-l">
            Evidence tag
          </span>
          <div class="seg" role="group" aria-labelledby="ax-code-l">
            <button type="button" aria-pressed={code === null} onClick={() => setCode(null)}>
              All
            </button>
            {FIG_CODES.map((c) => (
              <button type="button" key={c} aria-pressed={code === c} onClick={() => setCode(code === c ? null : c)} title={legend[c]}>
                <Chip code={c} /> <span class="ax-code-name">{legend[c]}</span>
              </button>
            ))}
          </div>
        </div>
        <div class="filter-group ax-search">
          <label class="eyebrow" for="ax-q">
            Search
          </label>
          <input id="ax-q" class="search" type="search" value={q} placeholder="e.g. Supabase or EUR" onInput={(e) => setQ((e.target as HTMLInputElement).value)} autocomplete="off" />
        </div>
        <p class="count" data-chrome aria-live="polite">
          {hits.length} of {keyFigures.length} key figures
        </p>
      </div>
      {hits.length ? (
        <ul class="ax-grid" aria-label="Key figures">
          {hits.map(({ n }) => (
            <Tile key={n} n={n} />
          ))}
        </ul>
      ) : (
        <p class="ax-empty">
          No key figure matches{q.trim() ? ` “${q.trim()}”` : ''}
          {code ? ` with the tag ${code}` : ''}.{' '}
          <button
            type="button"
            class="ax-reset"
            onClick={() => {
              setQ('');
              setCode(null);
            }}
          >
            Clear filters
          </button>
        </p>
      )}
    </div>
  );
}

// ---- a-colophon ---------------------------------------------------------------------------------

const RULES: { h: string; t: string }[] = [
  { h: 'No new numbers.', t: 'Every figure comes from the key-figures file or a paper table, with its source and evidence tag.' },
  { h: 'Evidence tags travel with the claim.', t: 'They render as chips next to every figure and verdict, never dropped for tidiness.' },
  { h: 'Proposals stay labelled.', t: 'Tiers, rollout, proposed KPIs and checklists carry the PROP banner or chip.' },
  { h: 'Legal content is regulation text, not advice.', t: 'The §7 slides keep the paper’s instruction to obtain qualified legal review.' },
  { h: 'Date of record.', t: `Vendor defaults, prices and regulatory statuses are as verified on ${DATE_OF_RECORD}; slides that show them say so.` },
  { h: 'Units and currency as documented.', t: 'Metric units; USD list prices, EUR where the law states EUR; no conversion.' },
  { h: 'Do not rewrite the paper.', t: 'Slides condense; hedges, conditions and denominators stay as the paper states them.' },
];

const STRANDS = ['incident ledger', 'data-layer controls', 'platform/identity matrix', 'agent execution plane', 'empirical evidence', 'regulation and standards', 'governance operating models'];

const KEYS: [string[], string][] = [
  [['→', 'PageDown', 'Space'], 'Next slide'],
  [['←', 'PageUp', 'Shift+Space'], 'Previous slide'],
  [['Shift+→', 'Shift+←'], 'Next / previous section'],
  [['Home', 'End'], 'First / last slide'],
  [['O'], 'All slides'],
  [['S'], 'Paper text for this slide'],
  [['L'], 'Evidence-confidence codes'],
  [['T'], 'Switch light / dark theme'],
  [['?'], 'Keyboard shortcuts'],
  [['Esc'], 'Close a panel'],
];

function Colophon() {
  const disclaimer = section('7').blocks[0];
  return (
    <div class="ax-colo">
      <section class="ax-block ax-span" aria-labelledby="ax-what">
        <h2 id="ax-what" class="eyebrow">
          What this is
        </h2>
        <p class="lead">
          An interactive presentation of the practitioner paper <cite class="ax-title">{paper.title}</cite>. Slides condense the paper; its own text for every slide is one keypress away (<kbd>S</kbd>), and where the two differ in emphasis, the paper governs.
        </p>
        <ul class="ax-not">
          <li>
            <strong>Not new research.</strong> Every number comes from the paper or its data files.
          </li>
          <li>
            <strong>Not legal advice.</strong> The §7 slides present regulation and EDPB text as the paper does.
          </li>
          <li>
            <strong>Not an industry standard.</strong> The tiers, rollout plan, proposed KPIs and checklists are the authors' design <Chip code="PROP" />.
          </li>
        </ul>
      </section>

      <section class="ax-block" aria-labelledby="ax-prov">
        <h2 id="ax-prov" class="eyebrow">
          Provenance
        </h2>
        <p>
          The paper was produced by a coordinated deep-research pass on 8–9 October 2026: seven parallel primary-source research strands, then one synthesis pass.
        </p>
        <ul class="ax-strands" aria-label="Research strands">
          {STRANDS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p>
          It reviews two prior documents: the original research report (paper §1 states what it got right and wrong) and an independent accuracy audit of it (§2 states which corrections were confirmed, refined, or found incomplete).
        </p>
        <p>Evidence confidence is tagged on every quantitative claim and control verdict:</p>
        <ul class="ax-codes">
          {CODES.map((c) => (
            <li key={c}>
              <Chip code={c} /> {legend[c]}
            </li>
          ))}
        </ul>
      </section>

      <section class="ax-block" aria-labelledby="ax-rules">
        <h2 id="ax-rules" class="eyebrow">
          The hand-over's rules, in short
        </h2>
        <ol class="ax-rules">
          {RULES.map((r) => (
            <li key={r.h}>
              <span>
                <strong>{r.h}</strong> {r.t}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section class="ax-block" aria-labelledby="ax-legal">
        <h2 id="ax-legal" class="eyebrow">
          Legal caveat
        </h2>
        <blockquote class="quote ax-quote">
          {disclaimer.t === 'p' && <Inline nodes={disclaimer.c} />}
          <cite>The paper, §7</cite>
        </blockquote>
      </section>

      <section class="ax-block" aria-labelledby="ax-limits">
        <h2 id="ax-limits" class="eyebrow">
          Known limits to keep in view
        </h2>
        <ul class="ax-list">
          <li>Vendor defaults, prices and regulatory statuses are as verified 8–9 October 2026 and change monthly; re-check in a trial tenant before procurement.</li>
          <li>Legal sections present regulation and EDPB text, not advice; obtain qualified legal review before external use.</li>
          <li>
            Paper §11 lists primary sources that could not be located and vendor behaviours that were not verified. The presentation does not fill those gaps with assumptions; it shows them as gaps.
          </li>
        </ul>
      </section>

      <section class="ax-block" aria-labelledby="ax-build">
        <h2 id="ax-build" class="eyebrow">
          How the deck is built
        </h2>
        <ul class="ax-list">
          <li>
            The paper's tables and section text are parsed from its Markdown at build time, so a table on a slide is the paper's table cell for cell, and the Paper text panel is verbatim.
          </li>
          <li>Key figures, incidents, controls and rollout phases are read from the hand-over's data files, never retyped.</li>
          <li>
            Automated checks run on the built page: every number on every slide must occur in the paper or the data files; chart values must match the key figure they draw from; figure tiles must carry their chip and source link; proposal, legal and date-of-record notices must appear where the rules require them; no slide may scroll sideways at phone width.
          </li>
          <li>Quotations on the legal slides are checked word for word against the paper section they come from.</li>
          <li>One static HTML file; light and dark themes; keyboard, touch and deep links (each slide's address is its own link).</li>
        </ul>
      </section>

      <section class="ax-block" aria-labelledby="ax-keys">
        <h2 id="ax-keys" class="eyebrow">
          Keyboard
        </h2>
        <dl class="keys ax-keys">
          {KEYS.map(([ks, what]) => (
            <div class="ax-key" key={what}>
              <dt>
                {ks.map((k, i) => (
                  <kbd key={i}>{k}</kbd>
                ))}
              </dt>
              <dd>{what}</dd>
            </div>
          ))}
        </dl>
        <p class="small muted">On a touch screen, swipe left or right.</p>
      </section>
    </div>
  );
}

const slides: SlideDef[] = [
  {
    slug: 'a-key-figures',
    section: 'A',
    title: 'Every key figure, with its source and evidence tag',
    short: 'Key figures',
    dek: 'The paper’s appendix table (a), filterable by evidence tag and searchable: each value with what it counts, its date, its tag and a link to its source, exactly as the data file states them.',
    paper: ['appendix-a'],
    flags: { dated: true },
    Body: KeyFigures,
  },
  {
    slug: 'a-colophon',
    section: 'A',
    title: 'Colophon',
    short: 'Colophon',
    dek: 'What this presentation is and is not, where the paper comes from, the rules it was built under, and how to drive it.',
    paper: ['0'],
    flags: { dated: true },
    Body: Colophon,
  },
];
export default slides;
