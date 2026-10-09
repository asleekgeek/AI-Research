// §8.1 (authors' proposal): paper table 8.1#1 as four tier columns with the attributes as aligned
// rows; narrow screens show one tier at a time through a selector. Cell text is the paper's,
// split only at its own semicolons.
import { useState } from 'react';
import { Chip } from '../components/Chip';
import { Inline } from '../components/Inline';
import { section, table } from '../lib/data';
import type { Inline as Node } from '../lib/types';
import { splitInline } from './s06-util';

function Cell({ nodes }: { nodes: Node[] }) {
  const parts = splitInline(nodes);
  if (parts.length < 2) return <Inline nodes={nodes} />;
  return (
    <ul class="s8-cell-list">
      {parts.map((p, i) => (
        <li key={i}>
          <Inline nodes={p} />
        </li>
      ))}
    </ul>
  );
}

function Meter({ level, of }: { level: number; of: number }) {
  return (
    <span class="s8-meter" aria-hidden="true">
      {Array.from({ length: of }, (_, i) => (
        <span key={i} class={i <= level ? 'on' : undefined} />
      ))}
    </span>
  );
}

function OwnershipRules() {
  const b = section('8.1').blocks.find((x) => x.t === 'p');
  if (!b || b.t !== 'p') throw new Error('No ownership-rules paragraph in §8.1');
  // Drop the paragraph's own lead-in, which becomes the heading.
  const nodes = b.c.map((n, i) => (i === 0 && n.t === 'text' ? { ...n, v: n.v.replace(/^Ownership rules:\s*/, '') } : n));
  const first = nodes[0];
  if (first.t === 'text') nodes[0] = { ...first, v: first.v.charAt(0).toUpperCase() + first.v.slice(1) };
  return (
    <section class="s8-own" aria-labelledby="s8-own-h">
      <h2 id="s8-own-h" class="s8-own-h">
        Ownership rules <Chip code="PROP" />
      </h2>
      <p class="s8-own-p">
        <Inline nodes={nodes} />
      </p>
    </section>
  );
}

export function Tiers() {
  const t = table('8.1#1');
  const [sel, setSel] = useState(0);
  const tiers = t.rows.map((row, i) => {
    const m = /^(T\d)\s+(.+)$/.exec(t.rowsPlain[i][0].trim());
    if (!m) throw new Error(`Unparsed tier: ${t.rowsPlain[i][0]}`);
    return { id: m[1], name: m[2], row };
  });
  const attrs = t.head.map((h, k) => ({ h, k })).slice(1);
  return (
    <div class="stack-lg">
      <div class="s8-tiers">
        <div class="s8-pick">
          <span class="eyebrow" id="s8-pick-l">
            Show tier
          </span>
          <div class="seg" role="group" aria-labelledby="s8-pick-l">
            {tiers.map((x, i) => (
              <button key={x.id} type="button" aria-pressed={i === sel} onClick={() => setSel(i)}>
                <strong>{x.id}</strong> {x.name}
              </button>
            ))}
          </div>
        </div>
        <div class="s8-tier-frame" tabIndex={0} role="region" aria-label="Tiers T0 to T3, paper table 8.1" data-hscroll>
          <table class="s8-tier-table" data-paper-table="8.1#1">
            <thead>
              <tr>
                <td class="s8-corner">
                  <span class="eyebrow">Attribute</span>
                </td>
                {tiers.map((x, i) => (
                  <th scope="col" key={x.id} class={`s8-tier-h${i === sel ? ' is-on' : ''}`}>
                    <span class="s8-tid">{x.id}</span>
                    <span class="s8-tname">{x.name}</span>
                    <span class="s8-tmeta">
                      <Meter level={i} of={tiers.length} />
                      <Chip code="PROP" />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attrs.map((a) => (
                <tr key={a.k}>
                  <th scope="row" class="s8-attr">
                    <Inline nodes={a.h} />
                  </th>
                  {tiers.map((x, i) => (
                    <td key={x.id} class={i === sel ? 'is-on' : undefined}>
                      <Cell nodes={x.row[a.k]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <OwnershipRules />
    </div>
  );
}
