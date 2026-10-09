// Local helpers for the §4.2–4.4 slides (s04b). Nothing here holds a fact: links are looked up in
// the parsed paper by their link text, so every source URL on these slides is the paper's own.
import { useRef } from 'react';
import { section, table } from '../lib/data';
import type { Code, Inline as Node } from '../lib/types';
import { plain } from '../components/Inline';
import { Chips } from '../components/Chip';

function walk(nodes: Node[], f: (n: Node) => void) {
  for (const n of nodes) {
    f(n);
    if ('c' in n) walk(n.c, f);
  }
}

/** The href of the nth link whose text is `label` in a paper section's paragraphs (or a paper table). */
export function href(where: string, label: string, nth = 0): string {
  const hits: string[] = [];
  const visit = (nodes: Node[]) => walk(nodes, (n) => n.t === 'a' && plain(n.c) === label && hits.push(n.href));
  if (where.includes('#')) table(where).rows.forEach((r) => r.forEach(visit));
  else
    for (const b of section(where).blocks) {
      if (b.t === 'p') visit(b.c);
      if (b.t === 'ol') b.items.forEach(visit);
    }
  const h = hits[nth];
  if (!h) throw new Error(`No link "${label}" in paper ${where}`);
  return h;
}

/** A source link exactly as the paper cites it. */
export function Src({ sec, label, nth, children }: { sec: string; label: string; nth?: number; children?: any }) {
  return (
    <a class="s4b-src" href={href(sec, label, nth)} target="_blank" rel="noopener noreferrer">
      {children ?? label}
    </a>
  );
}

/** Evidence tags as the paper writes them, e.g. ['CP', 'INF'] where the paper writes [CP]/[INF]. */
export function Tags({ c }: { c: Code[] }) {
  return <Chips codes={c} />;
}

let uid = 0;
export function useId(prefix: string) {
  return useRef(`s4b-${prefix}-${++uid}`).current;
}

/** Roving focus for a tablist laid out in any direction: all four arrows, Home and End. */
export function useRoving(count: number, active: number, setActive: (i: number) => void) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (e: KeyboardEvent) => {
    const k = e.key;
    let n = -1;
    if (k === 'ArrowRight' || k === 'ArrowDown') n = (active + 1) % count;
    else if (k === 'ArrowLeft' || k === 'ArrowUp') n = (active - 1 + count) % count;
    else if (k === 'Home') n = 0;
    else if (k === 'End') n = count - 1;
    if (n < 0) return;
    e.preventDefault();
    setActive(n);
    refs.current[n]?.focus();
  };
  const ref = (i: number) => (el: HTMLButtonElement | null) => {
    refs.current[i] = el;
  };
  return { ref, onKeyDown };
}

/** A connector arrow for HTML diagrams. `open` draws the dashed, warning-toned variant. */
export function Arrow({ open, down }: { open?: boolean; down?: boolean }) {
  return <span class={`s4b-arw${open ? ' is-open' : ''}${down ? ' is-down' : ''}`} aria-hidden="true" />;
}

/** Section part heading: the paper's subsection number as an eyebrow, the claim as an h2. */
export function Part({ n, title, id, children }: { n: string; title: any; id: string; children?: any }) {
  return (
    <header class="s4b-part">
      <span class="eyebrow">§{n}</span>
      <h2 class="h2" id={id}>
        {title}
      </h2>
      {children}
    </header>
  );
}
