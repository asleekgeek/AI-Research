// Helpers shared by the section 6 and 8 slides. Nothing here creates content: links are looked up
// in the parsed paper so every URL on these slides is one the paper cites.
import { paper, section } from '../lib/data';
import type { Inline as Node } from '../lib/types';
import { plain } from '../components/Inline';

type Link = { href: string; text: string };

function collect(n: unknown, out: Link[]): void {
  if (Array.isArray(n)) return n.forEach((x) => collect(x, out));
  if (!n || typeof n !== 'object') return;
  const o = n as Record<string, any>;
  if (o.t === 'a') out.push({ href: o.href, text: plain(o.c) });
  if (o.t === 'table') {
    const t = paper.tables[o.id];
    if (t) collect([t.head, t.rows], out);
  }
  for (const k of ['c', 'items', 'blocks', 'rows', 'head']) if (o[k]) collect(o[k], out);
}

/** The URL of a source the paper cites in section `id`, matched on part of its URL. */
export function paperHref(id: string, needle: string): string {
  const links: Link[] = [];
  collect(section(id).blocks, links);
  const hit = links.find((l) => l.href.includes(needle));
  if (!hit) throw new Error(`No link containing "${needle}" in paper section ${id}`);
  return hit.href;
}

/** A source link, opened in a new tab, for a URL the paper cites. */
export function Src({ id, has, children }: { id: string; has: string; children: any }) {
  return (
    <a href={paperHref(id, has)} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

/** Splits parsed inline Markdown at a separator that occurs in its plain-text runs (e.g. "; "). */
export function splitInline(nodes: Node[], sep = ';'): Node[][] {
  const out: Node[][] = [[]];
  for (const n of nodes) {
    if (n.t !== 'text' || !n.v.includes(sep)) {
      out[out.length - 1].push(n);
      continue;
    }
    n.v.split(sep).forEach((part, i) => {
      if (i > 0) out.push([]);
      const v = i > 0 ? part.replace(/^\s+/, '') : part;
      if (v) out[out.length - 1].push({ t: 'text', v });
    });
  }
  return out.filter((seg) => plain(seg).trim() !== '');
}
