#!/usr/bin/env node
// Parses the paper Markdown into a JSON tree the slides render from, so every table cell and
// every "paper text" panel is the paper's own wording, not a retyped copy.
//
// Output (src/generated/paper.json):
//   title, lead            the H1 and the opening BLUF paragraph
//   sections[]             one per heading: { id, level, title, parent, blocks[] }
//   tables{}               keyed "<section id>#<n>": { id, section, head, rows }
//   corpusNumbers[]        every numeric token in the paper and the data files (for the no-new-numbers guard)
//
// Inline nodes: {t:'text',v} {t:'b',c} {t:'i',c} {t:'code',v} {t:'a',href,c} {t:'tag',v}
// Blocks:       {t:'p',c} {t:'ol',items} {t:'table',id} {t:'code',lang,text}

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const paperPath = join(root, 'paper', 'vibe-coding-enterprise-data-protection.md');
const dataDir = join(root, 'data');
const outDir = join(here, '..', 'src', 'generated');

const TAGS = new Set(['CP', 'VR', 'RR', 'PO', 'INF', 'PROP']);

/** Find the index of the bracket that closes the one at `open`, honouring nesting. */
function matchClose(s, open, o, c) {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === o) depth++;
    else if (s[i] === c && --depth === 0) return i;
  }
  return -1;
}

export function parseInline(src) {
  const out = [];
  let buf = '';
  const flush = () => {
    if (buf) out.push({ t: 'text', v: buf });
    buf = '';
  };
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    // Evidence tag: **[CP]**
    if (src.startsWith('**[', i)) {
      const m = /^\*\*\[([A-Z]+)\]\*\*/.exec(src.slice(i));
      if (m && TAGS.has(m[1])) {
        flush();
        out.push({ t: 'tag', v: m[1] });
        i += m[0].length;
        continue;
      }
    }
    if (ch === '`') {
      const end = src.indexOf('`', i + 1);
      if (end > i) {
        flush();
        out.push({ t: 'code', v: src.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }
    if (ch === '[') {
      const close = matchClose(src, i, '[', ']');
      if (close > i && src[close + 1] === '(') {
        const pclose = matchClose(src, close + 1, '(', ')');
        if (pclose > close) {
          flush();
          out.push({ t: 'a', href: src.slice(close + 2, pclose), c: parseInline(src.slice(i + 1, close)) });
          i = pclose + 1;
          continue;
        }
      }
    }
    if (src.startsWith('**', i)) {
      const end = src.indexOf('**', i + 2);
      if (end > i + 2) {
        flush();
        out.push({ t: 'b', c: parseInline(src.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }
    if (ch === '*' && src[i + 1] !== ' ' && src[i + 1] !== '*') {
      const end = src.indexOf('*', i + 1);
      if (end > i + 1 && src[end - 1] !== ' ') {
        flush();
        out.push({ t: 'i', c: parseInline(src.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
    }
    buf += ch;
    i++;
  }
  flush();
  return out;
}

/** Split a Markdown table row on pipes that are outside code spans. */
function splitRow(line) {
  const cells = [];
  let cur = '';
  let inCode = false;
  const body = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  for (const ch of body) {
    if (ch === '`') inCode = !inCode;
    if (ch === '|' && !inCode) {
      cells.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  cells.push(cur.trim());
  return cells;
}

function headingId(level, text) {
  const num = /^(\d+(?:\.\d+)*)\.?\s/.exec(text);
  if (num) return num[1];
  if (/^Appendix/i.test(text)) return 'appendix';
  const letter = /^\(([a-z])\)\s/.exec(text);
  if (letter) return `appendix-${letter[1]}`;
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function parsePaper(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const sections = [];
  const tables = {};
  let title = '';
  let lead = null;
  let current = null;
  const stack = [];
  let i = 0;

  const pushBlock = (b) => {
    if (current) current.blocks.push(b);
    else if (b.t === 'p' && !lead) lead = b.c;
  };

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const text = h[2].trim();
      if (level === 1) {
        title = text;
        i++;
        continue;
      }
      while (stack.length && stack[stack.length - 1].level >= level) stack.pop();
      const id = headingId(level, text);
      current = {
        id,
        level,
        title: text.replace(/^(\d+(?:\.\d+)*)\.?\s+/, '').replace(/^\([a-z]\)\s+/, ''),
        number: /^(\d+(?:\.\d+)*)/.exec(text)?.[1] ?? null,
        parent: stack.length ? stack[stack.length - 1].id : null,
        blocks: [],
      };
      sections.push(current);
      stack.push(current);
      i++;
      continue;
    }
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const body = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) body.push(lines[i++]);
      i++;
      pushBlock({ t: 'code', lang, text: body.join('\n') });
      continue;
    }
    if (line.trim().startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(lines[i++]);
      const [headLine, , ...bodyLines] = rows;
      const n = Object.keys(tables).filter((k) => k.startsWith(`${current.id}#`)).length + 1;
      const id = `${current.id}#${n}`;
      tables[id] = {
        id,
        section: current.id,
        head: splitRow(headLine).map(parseInline),
        headPlain: splitRow(headLine),
        rows: bodyLines.map((l) => splitRow(l).map(parseInline)),
        rowsPlain: bodyLines.map((l) => splitRow(l)),
      };
      pushBlock({ t: 'table', id });
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(parseInline(lines[i].replace(/^\d+\.\s+/, '')));
        i++;
      }
      pushBlock({ t: 'ol', items });
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !/^(#|\||```|\d+\.\s)/.test(lines[i])) para.push(lines[i++]);
    pushBlock({ t: 'p', c: parseInline(para.join(' ')) });
  }
  return { title, lead, sections, tables };
}

/** Numeric tokens as they appear on screen, plus a comma-free variant, for the no-new-numbers guard. */
export function numberTokens(text) {
  const set = new Set();
  for (const m of text.matchAll(/\d+(?:[.,]\d+)*/g)) {
    const tok = m[0].replace(/[.,]+$/, '');
    set.add(tok);
    set.add(tok.replace(/,/g, ''));
  }
  return set;
}

function main() {
  const md = readFileSync(paperPath, 'utf8');
  const paper = parsePaper(md);
  let corpus = md;
  for (const f of readdirSync(dataDir)) if (f.endsWith('.json')) corpus += '\n' + readFileSync(join(dataDir, f), 'utf8');
  const corpusNumbers = [...numberTokens(corpus)].sort();
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'paper.json'), JSON.stringify(paper));
  writeFileSync(join(outDir, 'corpus-numbers.json'), JSON.stringify(corpusNumbers));
  const nTables = Object.keys(paper.tables).length;
  console.log(`extract-paper: ${paper.sections.length} sections, ${nTables} tables, ${corpusNumbers.length} corpus number tokens`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
