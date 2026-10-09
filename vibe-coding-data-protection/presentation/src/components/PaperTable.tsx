import { table } from '../lib/data';
import { Inline, plain } from './Inline';

interface Props {
  id: string;
  /** Column indexes to show, in order. Defaults to all. */
  cols?: number[];
  caption?: string;
  /** Row indexes to show. Defaults to all. */
  rows?: number[];
  /** Treat the first shown column as a row header. */
  rowHeader?: boolean;
  tall?: boolean;
  highlight?: (rowIndex: number) => boolean;
  dim?: (rowIndex: number) => boolean;
}

/** A table from the paper, cell for cell (parsed from the Markdown at build time). */
export function PaperTable({ id, cols, caption, rows, rowHeader = true, tall, highlight, dim }: Props) {
  const t = table(id);
  const c = cols ?? t.headPlain.map((_, i) => i);
  const r = rows ?? t.rows.map((_, i) => i);
  return (
    <div class={`tbl-wrap${tall ? ' tall' : ''}`} tabIndex={0} role="region" aria-label={caption ?? `Paper table ${id}`} data-hscroll>
      <table class="ptable" data-paper-table={id}>
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>
            {c.map((ci) => (
              <th scope="col" key={ci}>
                <Inline nodes={t.head[ci]} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {r.map((ri) => (
            <tr key={ri} class={highlight?.(ri) ? 'is-hit' : dim?.(ri) ? 'is-dim' : undefined}>
              {c.map((ci, k) =>
                k === 0 && rowHeader ? (
                  <th scope="row" key={ci} data-label={plain(t.head[ci])}>
                    <Inline nodes={t.rows[ri][ci]} />
                  </th>
                ) : (
                  <td key={ci} data-label={plain(t.head[ci])}>
                    <Inline nodes={t.rows[ri][ci]} />
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
