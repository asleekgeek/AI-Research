// Section 5 charts. Each one takes its printed text from a key figure and fails visibly (and with
// console.error, which the end-to-end tests catch) if that text is not verbatim in the figure.
import { fig } from '../lib/data';
import { Chips } from '../components/Chip';

const inFigure = (n: number, display: string) => {
  const f = fig(n);
  return `${f.value} ${f.unit_denominator}`.includes(display);
};

function Unverified({ n, display }: { n: number; display: string }) {
  console.error(`Unverified chart text: key figure ${n} does not contain "${display}"`);
  return (
    <strong data-unverified class="chip chip-po">
      unverified
    </strong>
  );
}

export function FigSource({ n }: { n: number }) {
  const f = fig(n);
  return (
    <span class="figref long">
      <Chips codes={f.confidence_codes} />{' '}
      <a href={f.source_url} target="_blank" rel="noopener noreferrer">
        {f.figure}
      </a>{' '}
      <span class="muted">({f.date})</span>
    </span>
  );
}

/** "K of N" drawn as N cells with K filled. Both numbers are parsed from text verbatim in the figure. */
export function Fraction({ n, display, label }: { n: number; display: string; label: string }) {
  const m = /(\d[\d,]*) of (\d[\d,]*)/.exec(display);
  const ok = inFigure(n, display) && !!m;
  const k = m ? Number(m[1].replace(/,/g, '')) : 0;
  const total = m ? Number(m[2].replace(/,/g, '')) : 0;
  return (
    <div class="s5-frac">
      <div class="s5-frac-head">
        <span class="s5-frac-label">{label}</span>{' '}
        <span class="s5-frac-val">{display}</span>{' '}
        {!ok && <Unverified n={n} display={display} />}
      </div>
      <div class="s5-cells" role="img" aria-label={`${label}: ${display}`}>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} class={i < k ? 'on' : undefined} />
        ))}
      </div>
    </div>
  );
}

/** A range ("20–68%") on a 0–100 scale. The ends are parsed from text verbatim in the figure. */
export function Range({ n, display, label }: { n: number; display: string; label: string }) {
  const m = /(\d+(?:\.\d+)?)–(\d+(?:\.\d+)?)%/.exec(display);
  const ok = inFigure(n, display) && !!m;
  const a = m ? Number(m[1]) : 0;
  const b = m ? Number(m[2]) : 0;
  return (
    <div class="s5-range">
      <div class="s5-frac-head">
        <span class="s5-frac-label">{label}</span>{' '}
        <span class="s5-frac-val">{display}</span>{' '}
        {!ok && <Unverified n={n} display={display} />}
      </div>
      <div class="s5-range-track" role="img" aria-label={`${label}: ${display}`}>
        <span class="s5-range-fill" style={{ left: `${a}%`, width: `${Math.max(0.6, b - a)}%` }} />
      </div>
    </div>
  );
}

/**
 * Supabase's agent-skill evaluation (key figure 24): "Opus 4.6 58/50/67; …", baseline / MCP only /
 * MCP + skill, % of requirements met. Values are parsed from the figure's own text, so nothing is retyped.
 */
export function SkillChart() {
  const f = fig(24);
  const rows = f.value.split(';').map((seg) => {
    const m = /^\s*(.+?) (\d+)\/(\d+)\/(\d+)\s*$/.exec(seg);
    return m ? { model: m[1], vals: [Number(m[2]), Number(m[3]), Number(m[4])] } : null;
  });
  if (rows.some((r) => !r)) console.error('Key figure 24 no longer matches "model a/b/c; …"');
  const series = ['Baseline', 'MCP only', 'MCP + skill'];
  return (
    <figure class="viz">
      <div class="s5-legend" aria-hidden="true">
        {series.map((s, i) => (
          <span key={s}>
            <i class={`s5-sw s5-sw-${i}`} />
            {s}
          </span>
        ))}
      </div>
      <div class="s5-groups">
        {rows.filter(Boolean).map((r) => (
          <div class="s5-group" key={r!.model}>
            <span class="s5-group-name">{r!.model}</span>{' '}
            <div class="stack" style={{ gap: '3px' }}>
              {r!.vals.map((v, i) => (
                <div class="s5-gbar" key={i} role="img" aria-label={`${r!.model}, ${series[i]}: ${v}`}>
                  <span class={`s5-gfill s5-sw-${i}`} style={{ width: `${v}%` }} />
                  <span class="s5-gval">{v}</span>{' '}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <figcaption>
        <span class="scale-note" data-chrome>
          Linear scale, 0 to 100%.
        </span>{' '}
        {f.unit_denominator}. <FigSource n={24} />
      </figcaption>
    </figure>
  );
}
