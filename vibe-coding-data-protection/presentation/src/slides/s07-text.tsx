// Verbatim guards for the legal slides. Regulation, EDPB and paper wording quoted on a §7 slide
// goes through `Q` (a quotation) or `V` (running text kept word for word); both check that the
// string occurs exactly in the named paper section and log an error otherwise, which the
// end-to-end tests fail on. Condensed copy is written normally; quotations are never retyped.
import { section, sectionTree, table } from '../lib/data';
import { plain } from '../components/Inline';
import type { Block } from '../lib/types';

const cache = new Map<string, string>();

function blockText(b: Block): string {
  if (b.t === 'p') return plain(b.c);
  if (b.t === 'ol') return b.items.map(plain).join('\n');
  if (b.t === 'table') {
    const t = table(b.id);
    return [t.head, ...t.rows].map((r) => r.map(plain).join(' | ')).join('\n');
  }
  return b.text;
}

/** Plain text of a paper section and its subsections, tags rendered as [CP]. */
export function sectionText(id: string): string {
  let s = cache.get(id);
  if (s === undefined) {
    section(id);
    s = sectionTree(id)
      .flatMap((x) => x.blocks.map(blockText))
      .join('\n');
    cache.set(id, s);
  }
  return s;
}

/** Typographic quotes and apostrophes for display; the wording is untouched. */
export function curly(s: string): string {
  return s
    .replace(/(^|[\s([{—–-])"/g, '$1“')
    .replace(/"/g, '”')
    .replace(/(^|[\s([{—–-])'/g, '$1‘')
    .replace(/'/g, '’');
}

/** Checks `text` is word for word in paper section `id`, then returns it with typographic quotes. */
export function V(id: string, text: string): string {
  if (!sectionText(id).includes(text)) console.error(`Not verbatim in paper §${id}: "${text}"`);
  return curly(text);
}

/** An inline quotation (rendered with typographic quotes) that must occur verbatim in section `id`. */
export function Q({ id, children }: { id: string; children: string }) {
  return <q class="s7-q">{V(id, children)}</q>;
}
