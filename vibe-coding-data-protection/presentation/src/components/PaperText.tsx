import { sectionTree } from '../lib/data';
import type { Block } from '../lib/types';
import { Inline } from './Inline';
import { PaperTable } from './PaperTable';

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.t === 'p')
          return (
            <p key={i}>
              <Inline nodes={b.c} />
            </p>
          );
        if (b.t === 'ol')
          return (
            <ol key={i}>
              {b.items.map((it, j) => (
                <li key={j}>
                  <Inline nodes={it} />
                </li>
              ))}
            </ol>
          );
        if (b.t === 'table') return <PaperTable key={i} id={b.id} />;
        return (
          <pre key={i}>
            <code>{b.text}</code>
          </pre>
        );
      })}
    </>
  );
}

/** The paper's own text for one or more sections, verbatim, including tables and code. */
export function PaperText({ ids }: { ids: string[] }) {
  return (
    <div class="paper-text">
      {ids.flatMap((id) =>
        sectionTree(id).map((s) => {
          const H = s.level <= 3 ? 'h3' : 'h4';
          return (
            <section key={s.id} aria-label={`Paper section ${s.number ?? s.id}`}>
              <H>
                {s.number ? `${s.number} ` : ''}
                {s.title}
              </H>
              <Blocks blocks={s.blocks} />
            </section>
          );
        }),
      )}
    </div>
  );
}
