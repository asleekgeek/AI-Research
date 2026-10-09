import { fig } from '../lib/data';
import { Chips } from './Chip';

/**
 * A key figure exactly as data/key-figures.json states it: value, what it counts, date,
 * confidence chip and a link to the source. `n` is the 1-based row in appendix table (a).
 */
export function FigTile({ n, compact, label }: { n: number; compact?: boolean; label?: string }) {
  const f = fig(n);
  return (
    <div class={`figtile${compact ? ' compact' : ''}`} data-figure={n}>
      {/* Whitespace between blocks keeps the page text as the data states it ("6.2" then "400 …"). */}
      <div class="fig-label">{label ?? f.figure}</div>{' '}
      <div class="fig-value">{f.value}</div>{' '}
      <div class="fig-denom">{f.unit_denominator}</div>{' '}
      <div class="fig-foot">
        <Chips codes={f.confidence_codes} />
        <span>{f.date}</span>
        <a href={f.source_url} target="_blank" rel="noopener noreferrer" data-source>
          Source
        </a>
        <span class="small" data-chrome>
          Key figure {n}
        </span>
      </div>
    </div>
  );
}

/** Inline citation for a key figure used in running text: chip plus source link. */
export function FigRef({ n }: { n: number }) {
  const f = fig(n);
  return (
    <span class="figref" data-figure-ref={n}>
      <Chips codes={f.confidence_codes} />{' '}
      <a href={f.source_url} target="_blank" rel="noopener noreferrer" title={`${f.figure} (${f.date})`}>
        source
      </a>
    </span>
  );
}

/** A link to a source the paper cites inline, shown with the paper's own tag. */
export function Cite({ href, children }: { href: string; children: any }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
