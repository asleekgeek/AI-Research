import { useLayoutEffect, useRef, useState } from 'react';
import { fig } from '../lib/data';
import type { BarSpec } from '../lib/charts';
import { Chips } from './Chip';

interface Props {
  specs: BarSpec[];
  /** Upper end of the linear scale; bars start at zero. */
  max: number;
  unit?: string;
  caption?: any;
  labelWidth?: string;
}

/** A spec is verified when its printed text appears verbatim in the key figure and its plotted
 *  value is the first number in that text. Unverified bars render a warning and log an error,
 *  which the end-to-end tests fail on. */
export function verifySpec(s: BarSpec): boolean {
  const f = fig(s.n);
  const inFigure = `${f.value} ${f.unit_denominator}`.includes(s.display);
  const first = /\d[\d,]*(?:\.\d+)?/.exec(s.display)?.[0]?.replace(/,/g, '');
  return inFigure && first !== undefined && Number(first) === s.value;
}

/** Horizontal bars on one linear scale from zero. Values and labels come from key figures only. */
export function Bars({ specs, max, unit = '', caption, labelWidth }: Props) {
  const refs = [...new Set(specs.map((s) => s.n))];
  return (
    <figure class="viz">
      <div class="bars" style={labelWidth ? { ['--lw' as any]: labelWidth } : undefined}>
        {specs.map((s, i) => {
          const ok = verifySpec(s);
          if (!ok) console.error(`Unverified bar: key figure ${s.n} does not contain "${s.display}" with value ${s.value}`);
          const pct = Math.max(0, Math.min(100, (s.value / max) * 100));
          return (
            <div class="bar-row" key={i} style={labelWidth ? { gridTemplateColumns: `minmax(0, ${labelWidth}) minmax(0, 1fr)` } : undefined}>
              <div class="bar-label">
                {s.label}
                {!ok && (
                  <strong data-unverified class="chip chip-po">
                    unverified
                  </strong>
                )}
              </div>
              <BarTrack spec={s} pct={pct} />
            </div>
          );
        })}
      </div>
      <figcaption>
        <span class="scale-note" data-chrome>
          Linear scale, 0 to {max.toLocaleString('en-GB')}
          {unit}.
        </span>{' '}
        {caption}{' '}
        {refs.map((n) => (
          <span key={n} class="figref">
            <Chips codes={fig(n).confidence_codes} />{' '}
            <a href={fig(n).source_url} target="_blank" rel="noopener noreferrer">
              {fig(n).figure}
            </a>{' '}
            <span class="muted">({fig(n).date})</span>{' '}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

/** The value label sits inside the bar when it fits, else just past its end, else under the track. */
function BarTrack({ spec, pct }: { spec: BarSpec; pct: number }) {
  const track = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const [place, setPlace] = useState<'inside' | 'right' | 'below'>('right');
  useLayoutEffect(() => {
    const t = track.current;
    const l = label.current;
    if (!t || !l) return;
    const measure = () => {
      const tw = t.clientWidth;
      const fw = (tw * pct) / 100;
      const lw = l.scrollWidth;
      setPlace(lw + 8 <= fw ? 'inside' : fw + lw + 8 <= tw ? 'right' : 'below');
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(t);
    return () => ro.disconnect();
  }, [pct]);
  const ink = spec.tone === 'ghost' ? 'var(--fg)' : 'var(--accent-ink)';
  return (
    <div class="bar-cell">
      <div class="bar-track" ref={track} role="img" aria-label={spec.display}>
        <div class={`bar-fill${spec.tone ? ` ${spec.tone}` : ''}`} style={{ width: `${pct}%` }} />
        <span
          ref={label}
          class="bar-val"
          aria-hidden="true"
          style={place === 'inside' ? { left: 0, color: ink } : place === 'right' ? { left: `${pct}%` } : { left: 0, visibility: 'hidden' }}
        >
          {spec.display}
        </span>
      </div>
      {place === 'below' && <span class="bar-val-below">{spec.display}</span>}
    </div>
  );
}
