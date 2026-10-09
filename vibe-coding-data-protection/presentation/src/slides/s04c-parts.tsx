// Local building blocks for the B4 and discovery slides (s04c). Nothing here holds a number:
// copy lives in the slide modules, links resolve from the parsed paper so every URL is the paper's own.
import { sectionTree } from '../lib/data';
import type { Inline as Node } from '../lib/types';
import { plain } from '../components/Inline';

const linkCache = new Map<string, string>();

function findLink(nodes: any, text: string): string | undefined {
  if (Array.isArray(nodes)) {
    for (const n of nodes) {
      const hit = findLink(n, text);
      if (hit) return hit;
    }
    return undefined;
  }
  if (!nodes || typeof nodes !== 'object') return undefined;
  if (nodes.t === 'a' && plain(nodes.c as Node[]) === text) return nodes.href;
  for (const k of ['c', 'items', 'blocks']) if (nodes[k]) {
    const hit = findLink(nodes[k], text);
    if (hit) return hit;
  }
  return undefined;
}

/** The URL the paper attaches to a link with this exact text inside section `sec` (or its children). */
export function paperHref(sec: string, text: string): string {
  const key = `${sec}|${text}`;
  const cached = linkCache.get(key);
  if (cached) return cached;
  const href = findLink(sectionTree(sec).map((s) => s.blocks), text);
  if (!href) throw new Error(`No link "${text}" in paper section ${sec}`);
  linkCache.set(key, href);
  return href;
}

/** A source link exactly as the paper cites it (link text and URL from the paper). */
export function Src({ s, t, children }: { s: string; t: string; children?: any }) {
  return (
    <a class="b4-src" href={paperHref(s, t)} target="_blank" rel="noopener noreferrer">
      {children ?? t}
    </a>
  );
}

/** Several sources after a claim, separated the way the paper separates them. */
export function Srcs({ s, ts }: { s: string; ts: string[] }) {
  return (
    <span class="b4-srcs">
      {ts.map((t, i) => (
        <span key={t}>
          {i > 0 && '; '}
          <Src s={s} t={t} />
        </span>
      ))}
    </span>
  );
}

/** A quoted fragment in the vendor's or researcher's own words. */
export function Q({ children }: { children: any }) {
  return <q class="b4-q">{children}</q>;
}

/** Section block inside a slide: mono eyebrow with the paper number, then an h2. */
export function Block({ id, num, title, children, wide }: { id: string; num: string; title: any; children: any; wide?: boolean }) {
  return (
    <section class={`b4-block${wide ? ' is-wide' : ''}`} aria-labelledby={id}>
      <header class="b4-block-head">
        <span class="eyebrow">§{num}</span>
        <h2 id={id} class="h2">
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

export interface FlowNode {
  title: any;
  sub?: any;
  tone?: 'enforced' | 'open' | 'safe' | 'plain' | 'prop';
}

export interface FlowLane {
  label: any;
  nodes: FlowNode[];
  tone?: 'enforced' | 'open' | 'safe' | 'prop';
  note?: any;
}

/** Lanes of nodes joined by arrows; turns vertical in a narrow container. Arrows are CSS, never text. */
export function Flow({ lanes, label }: { lanes: FlowLane[]; label: string }) {
  return (
    <div class="b4-flow" role="group" aria-label={label}>
      {lanes.map((l, i) => (
        <div class={`b4-lane${l.tone ? ` is-${l.tone}` : ''}`} key={i}>
          <div class="b4-lane-label">{l.label}</div>
          <ol class="b4-lane-nodes">
            {l.nodes.map((n, j) => (
              <li class={`b4-node${n.tone ? ` is-${n.tone}` : ''}`} key={j}>
                <span class="b4-node-title">{n.title}</span>
                {n.sub && <span class="b4-node-sub">{n.sub}</span>}
              </li>
            ))}
          </ol>
          {l.note && <div class="b4-lane-note">{l.note}</div>}
        </div>
      ))}
    </div>
  );
}

/** A labelled list of seams or properties: short key on the left, the source's words on the right. */
export function KV({ rows, label }: { rows: { k: any; v: any }[]; label?: string }) {
  return (
    <dl class="b4-kv" aria-label={label}>
      {rows.map((r, i) => (
        <div class="b4-kv-row" key={i}>
          <dt>{r.k}</dt>
          <dd>{r.v}</dd>
        </div>
      ))}
    </dl>
  );
}
