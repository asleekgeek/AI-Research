// Small helpers shared by the §1, §2, §11 and §12 slides. They only re-slice the paper's own
// parsed inline nodes (src/generated/paper.json); none of them adds wording or numbers.
import { useEffect, useState } from 'react';
import type { Code, Inline as Node } from '../lib/types';
import { CODES, section, table } from '../lib/data';
import { plain } from '../components/Inline';
import { IconExternal } from '../components/Icons';
import './s01-helpers.css';

function walk(nodes: Node[], f: (n: Node) => void) {
  for (const n of nodes) {
    f(n);
    if (n.t === 'b' || n.t === 'i' || n.t === 'a') walk(n.c, f);
  }
}

/** Evidence codes tagged anywhere in these nodes, in legend order. */
export function codesIn(nodes: Node[]): Code[] {
  const seen = new Set<Code>();
  walk(nodes, (n) => n.t === 'tag' && seen.add(n.v));
  return CODES.filter((c) => seen.has(c));
}

/** The href of the link whose text is `text` in one paper section (paragraphs, lists, tables). */
export function linkIn(id: string, text: string): string {
  const pools: Node[][] = [];
  for (const b of section(id).blocks) {
    if (b.t === 'p') pools.push(b.c);
    else if (b.t === 'ol') pools.push(...b.items);
    else if (b.t === 'table') table(b.id).rows.forEach((r) => pools.push(...r));
  }
  let href: string | undefined;
  for (const p of pools) walk(p, (n) => !href && n.t === 'a' && plain(n.c) === text && (href = n.href));
  if (!href) throw new Error(`No link "${text}" in paper section ${id}`);
  return href;
}

/** Paragraph nodes of a section block, by position. */
export function para(id: string, i: number): Node[] {
  const b = section(id).blocks[i];
  if (!b || b.t !== 'p') throw new Error(`Paper section ${id} block ${i} is not a paragraph`);
  return b.c;
}

const text = (v: string): Node => ({ t: 'text', v });

/** Edit the first / last text node; drops it when it ends up empty. */
function editEnd(nodes: Node[], end: 'first' | 'last', f: (v: string) => string): Node[] {
  const a = [...nodes];
  const i = end === 'first' ? 0 : a.length - 1;
  const n = a[i];
  if (n?.t !== 'text') return a;
  const v = f(n.v);
  if (v) a[i] = text(v);
  else a.splice(i, 1);
  return a;
}

export const trim = (nodes: Node[]) =>
  editEnd(
    editEnd(nodes, 'first', (v) => v.replace(/^\s+/, '')),
    'last',
    (v) => v.replace(/\s+$/, ''),
  );

/** Remove a leading pattern (e.g. "and ", "that ") from the first text node. */
export const stripLead = (nodes: Node[], re: RegExp) => editEnd(nodes, 'first', (v) => v.replace(re, ''));
/** Remove a trailing pattern (e.g. a final full stop) from the last text node. */
export const stripTrail = (nodes: Node[], re: RegExp) => editEnd(nodes, 'last', (v) => v.replace(re, ''));
/** Upper-case the first letter (list items that open a sentence fragment). */
export const capFirst = (nodes: Node[]) => editEnd(nodes, 'first', (v) => v.charAt(0).toUpperCase() + v.slice(1));

/** Split inline nodes on a separator that occurs in text nodes (e.g. the paper's "; " lists). */
export function splitOn(nodes: Node[], sep: string | RegExp): Node[][] {
  const out: Node[][] = [[]];
  for (const n of nodes) {
    if (n.t !== 'text') {
      out[out.length - 1].push(n);
      continue;
    }
    n.v.split(sep).forEach((p, i) => {
      if (i > 0) out.push([]);
      if (p) out[out.length - 1].push(text(p));
    });
  }
  return out.map(trim).filter((x) => x.length > 0);
}

/** Split at the first occurrence of `sep` only: [before, after]. */
export function splitOnce(nodes: Node[], sep: string): [Node[], Node[]] {
  const k = nodes.findIndex((n) => n.t === 'text' && n.v.includes(sep));
  if (k < 0) return [nodes, []];
  const v = (nodes[k] as { v: string }).v;
  const at = v.indexOf(sep);
  const head = [...nodes.slice(0, k), text(v.slice(0, at))];
  const tail = [text(v.slice(at + sep.length)), ...nodes.slice(k + 1)];
  return [trim(head), trim(tail)];
}

/** For the last item of a list that ends a paragraph: split off the sentence that follows it. */
export function splitTrailingSentence(nodes: Node[]): [Node[], Node[]] {
  const k = nodes.length - 1;
  const n = nodes[k];
  if (n?.t !== 'text') return [nodes, []];
  const m = /\.\s+(?=[A-Z])/.exec(n.v);
  if (!m) return [nodes, []];
  return [trim([...nodes.slice(0, k), text(n.v.slice(0, m.index))]), [text(n.v.slice(m.index + m[0].length))]];
}

export interface Sourced {
  body: Node[];
  source?: { href: string; label: string };
}

/** Moves a trailing "(link)" source citation out of the sentence so it can sit at the line's end. */
export function pullSource(nodes: Node[]): Sourced {
  for (let k = nodes.length - 1; k > 0; k--) {
    const a = nodes[k];
    const before = nodes[k - 1];
    const after = nodes[k + 1];
    if (a.t !== 'a' || before?.t !== 'text' || after?.t !== 'text') continue;
    if (!/\(\s*$/.test(before.v) || !/^\)/.test(after.v)) continue;
    const body = trim([...nodes.slice(0, k - 1), text(before.v.replace(/\s*\(\s*$/, '')), text(after.v.replace(/^\)/, '')), ...nodes.slice(k + 2)].filter((n) => n.t !== 'text' || n.v !== ''));
    return { body, source: { href: a.href, label: plain(a.c) } };
  }
  return { body: nodes };
}

/** A source link the paper cites, shown at the end of a line. */
export function SourceLink({ href, children }: { href: string; children: any }) {
  return (
    <a class="src-link" href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <IconExternal />
    </a>
  );
}

/** Media-query state for layouts that change structure (not just style) at phone width. */
export function useMedia(query: string): boolean {
  const get = () => typeof matchMedia === 'function' && matchMedia(query).matches;
  const [hit, setHit] = useState(get);
  useEffect(() => {
    const mq = matchMedia(query);
    const on = () => setHit(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return hit;
}
