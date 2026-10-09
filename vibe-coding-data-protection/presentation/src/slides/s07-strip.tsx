import type { ComponentChildren } from 'preact';

/**
 * Dates on one linear time scale. Each row is a dated event the paper states (its date text is
 * printed as the paper writes it); the marks are positioned from ISO dates, so distances are to
 * scale. "From" duties draw an open bar to the edge; a window draws a bar between its two dates.
 * The rows are an ordered list for screen readers; the drawn track is decorative. Axis labels are
 * derived positions and sit in a data-derived element.
 */
export interface StripRow {
  /** ISO date of the event (or the start of a window). */
  at: string;
  /** ISO end date for a window drawn as a bar. */
  until?: string;
  /** The duty applies from `at` onwards: open bar to the end of the scale. */
  open?: boolean;
  dateText: string;
  label: ComponentChildren;
  tone?: 'main' | 'grace';
}

const DAY = 86_400_000;
const t = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function DateStrip({
  rows,
  label,
  from = '2026-06-01',
  to = '2028-11-01',
  record = '2026-10-09',
  caption,
}: {
  rows: StripRow[];
  label: string;
  from?: string;
  to?: string;
  /** The date of record, drawn as a dashed line across every row. */
  record?: string;
  caption?: ComponentChildren;
}) {
  const a = t(from);
  const span = t(to) - a;
  const x = (iso: string) => `${(((t(iso) - a) / span) * 100).toFixed(3)}%`;
  // Ticks every six months (January and July) inside the domain.
  const ticks: { iso: string; text: string; major: boolean }[] = [];
  const d0 = new Date(a);
  for (let y = d0.getUTCFullYear(); y <= new Date(a + span).getUTCFullYear(); y++)
    for (const m of [0, 6]) {
      const ms = Date.UTC(y, m, 1);
      if (ms > a + 15 * DAY && ms < a + span - 15 * DAY) ticks.push({ iso: new Date(ms).toISOString().slice(0, 10), text: `${MONTHS[m]} ${y}`, major: m === 0 });
    }
  const grid = (
    <>
      {ticks.map((k) => (
        <span key={k.iso} class={`s7-sgrid${k.major ? ' is-major' : ''}`} style={{ left: x(k.iso) }} />
      ))}
      <span class="s7-sdor" style={{ left: x(record) }} />
    </>
  );
  return (
    <figure class="s7-strip">
      <div class="s7-srow s7-saxis" aria-hidden="true" data-derived>
        <span class="s7-stext" />
        <div class="s7-strack">
          {ticks.map((k) => (
            <span key={k.iso} class={`s7-stick${k.major ? ' is-major' : ''}`} style={{ left: x(k.iso) }}>
              {k.text}
            </span>
          ))}
          <span class="s7-sdor-label" style={{ left: x(record) }}>
            Date of record
          </span>
          {grid}
        </div>
      </div>
      <ol class="s7-srows" aria-label={label}>
        {rows.map((r, i) => (
          <li class={`s7-srow tone-${r.tone ?? 'main'}`} key={i}>
            <p class="s7-stext">
              <span class="s7-sdate">{r.dateText}</span> <span class="s7-slabel">{r.label}</span>
            </p>
            <div class="s7-strack" aria-hidden="true">
              {grid}
              {r.until ? (
                <span class="s7-sbar is-window" style={{ left: x(r.at), width: `calc(${x(r.until)} - ${x(r.at)})` }} />
              ) : r.open ? (
                <span class="s7-sbar is-open" style={{ left: x(r.at) }} />
              ) : null}
              <span class="s7-sdot" style={{ left: x(r.until ?? r.at) }} />
            </div>
          </li>
        ))}
      </ol>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
