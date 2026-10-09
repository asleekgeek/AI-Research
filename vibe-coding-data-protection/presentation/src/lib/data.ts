// Typed access to the hand-over's data files. Nothing here invents a value: every export is a
// view over data/*.json or the paper tables parsed by scripts/extract-paper.mjs.
import keyFiguresJson from '@data/key-figures.json';
import incidentsJson from '@data/incident-timeline.json';
import controlsJson from '@data/controls-by-boundary.json';
import rolloutJson from '@data/rollout-phases.json';
import legendJson from '@data/evidence-legend.json';
import paperJson from '../generated/paper.json';
import type { Code, Control, Incident, KeyFigure, Paper, PaperTable, Phase, Section } from './types';

export const paper = paperJson as unknown as Paper;
export const keyFigures = keyFiguresJson.rows as KeyFigure[];
export const incidents = incidentsJson.rows as Incident[];
export const controls = controlsJson.rows as Control[];
export const phases = rolloutJson.rows as Phase[];
export const legend = legendJson.codes as Record<Code, string>;
export const CODES: Code[] = ['CP', 'VR', 'RR', 'PO', 'INF', 'PROP'];

/** The date the paper verified vendor defaults, prices and regulatory statuses. */
export const DATE_OF_RECORD = '8–9 October 2026';

/** Key figures are referred to by their 1-based position in appendix table (a). */
export function fig(n: number): KeyFigure {
  const f = keyFigures[n - 1];
  if (!f) throw new Error(`No key figure #${n}`);
  return f;
}

export function table(id: string): PaperTable {
  const t = paper.tables[id];
  if (!t) throw new Error(`No paper table ${id}`);
  return t;
}

export function section(id: string): Section {
  const s = paper.sections.find((x) => x.id === id);
  if (!s) throw new Error(`No paper section ${id}`);
  return s;
}

/** A section plus all of its descendants, in document order. */
export function sectionTree(id: string): Section[] {
  const out: Section[] = [];
  const ids = new Set([id]);
  for (const s of paper.sections) {
    if (s.id === id || (s.parent && ids.has(s.parent))) {
      ids.add(s.id);
      out.push(s);
    }
  }
  return out;
}

export function codesOf(text: string): Code[] {
  return CODES.filter((c) => new RegExp(`\\b${c}\\b`).test(text));
}

// ---- Incidents -------------------------------------------------------------------------------

export interface DatedIncident extends Incident {
  idx: number;
  start: Date;
  end: Date;
  /** How the source states the date; drives how the mark is drawn. */
  precision: 'day' | 'month' | 'range';
  lane: Lane;
}

export type Lane = 'App authorisation' | 'Builder platform' | 'Agent plane' | 'Supply chain' | 'Defaults and storage' | 'Vendor and regulatory';
export const LANES: Lane[] = ['App authorisation', 'Builder platform', 'Agent plane', 'Supply chain', 'Defaults and storage', 'Vendor and regulatory'];

function laneOf(layer: string): Lane {
  if (/^App authori/i.test(layer)) return 'App authorisation';
  if (/^Builder platform/i.test(layer)) return 'Builder platform';
  if (/^Agent plane/i.test(layer)) return 'Agent plane';
  if (/^Supply chain/i.test(layer)) return 'Supply chain';
  if (/Organisational defaults|storage ACL/i.test(layer)) return 'Defaults and storage';
  return 'Vendor and regulatory';
}

const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));
const lastDay = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

/** Parses the ledger's date forms: 2025-03-18 · 2025-12 · 2025-07 (early) · 2025-08 to 2025-12 · 2026-09-20 to 26 */
export function parseIncidentDate(s: string): { start: Date; end: Date; precision: DatedIncident['precision'] } {
  let m = /^(\d{4})-(\d{2})-(\d{2}) to (\d{2})$/.exec(s);
  if (m) return { start: utc(+m[1], +m[2], +m[3]), end: utc(+m[1], +m[2], +m[4]), precision: 'range' };
  m = /^(\d{4})-(\d{2}) to (\d{4})-(\d{2})$/.exec(s);
  if (m) return { start: utc(+m[1], +m[2], 1), end: utc(+m[3], +m[4], lastDay(+m[3], +m[4])), precision: 'range' };
  m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m) {
    const d = utc(+m[1], +m[2], +m[3]);
    return { start: d, end: d, precision: 'day' };
  }
  m = /^(\d{4})-(\d{2}) \(early\)$/.exec(s);
  if (m) return { start: utc(+m[1], +m[2], 1), end: utc(+m[1], +m[2], 10), precision: 'month' };
  m = /^(\d{4})-(\d{2})$/.exec(s);
  if (m) return { start: utc(+m[1], +m[2], 1), end: utc(+m[1], +m[2], lastDay(+m[1], +m[2])), precision: 'month' };
  throw new Error(`Unparsed incident date: ${s}`);
}

export const datedIncidents: DatedIncident[] = incidents
  .map((r, idx) => ({ ...r, idx, ...parseIncidentDate(r.date), lane: laneOf(r.layer) }))
  .sort((a, b) => a.start.getTime() - b.start.getTime() || a.idx - b.idx);

// ---- Controls --------------------------------------------------------------------------------

export type VerdictClass = 'Prevents' | 'Detects' | 'Limits' | 'Enables' | 'Weak' | 'Anti-pattern';
export const VERDICT_CLASSES: VerdictClass[] = ['Prevents', 'Detects', 'Limits', 'Enables', 'Weak', 'Anti-pattern'];

/** The verdict's own leading word, used only to filter; the full verdict text is always shown. */
export function verdictClass(verdict: string): VerdictClass {
  const w = /^[A-Za-z-]+/.exec(verdict)?.[0] ?? '';
  const hit = VERDICT_CLASSES.find((v) => v.toLowerCase() === w.toLowerCase());
  if (!hit) throw new Error(`Unclassified verdict: ${verdict}`);
  return hit;
}

export const BOUNDARIES = ['B1 Builder identity', 'B2 Ingress', 'B3 Data API', 'B4 Agent plane', 'Cross-cutting'] as const;
export type BoundaryKey = (typeof BOUNDARIES)[number];
