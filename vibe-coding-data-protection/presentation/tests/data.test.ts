import { describe, expect, it } from 'vitest';
import { CODES, controls, datedIncidents, keyFigures, paper, phases, verdictClass } from '../src/lib/data';

describe('hand-over data files', () => {
  it('have the counts the brief states', () => {
    expect(keyFigures).toHaveLength(52);
    expect(datedIncidents).toHaveLength(35);
    expect(controls).toHaveLength(40);
    expect(phases).toHaveLength(4);
  });

  it('give every key figure a source URL, a date and a valid confidence code', () => {
    for (const f of keyFigures) {
      expect(f.source_url).toMatch(/^https:\/\//);
      expect(f.date.trim()).not.toBe('');
      expect(f.confidence_codes.length).toBeGreaterThan(0);
      for (const c of f.confidence_codes) expect(CODES).toContain(c);
    }
  });

  it('give every control a verdict class and valid evidence codes', () => {
    for (const c of controls) {
      expect(() => verdictClass(c.verdict)).not.toThrow();
      expect(c.confidence_codes.length).toBeGreaterThan(0);
      for (const code of c.confidence_codes) expect(CODES).toContain(code);
    }
  });

  it('parse every incident date into a range inside the timeline window', () => {
    for (const i of datedIncidents) {
      expect(i.end.getTime()).toBeGreaterThanOrEqual(i.start.getTime());
      expect(i.start.getUTCFullYear()).toBeGreaterThanOrEqual(2025);
      expect(i.end.getTime()).toBeLessThanOrEqual(Date.UTC(2026, 10, 1));
    }
  });
});

describe('paper extraction', () => {
  it('finds all 24 tables and 381 source links, with the tag totals the hand-over reports', () => {
    expect(Object.keys(paper.tables)).toHaveLength(24);
    const links: string[] = [];
    const tags: Record<string, number> = {};
    const walk = (n: any): void => {
      if (Array.isArray(n)) return n.forEach(walk);
      if (!n || typeof n !== 'object') return;
      if (n.t === 'a') links.push(n.href);
      if (n.t === 'tag') tags[n.v] = (tags[n.v] ?? 0) + 1;
      for (const k of ['c', 'items', 'blocks', 'rows', 'head', 'lead', 'sections']) if (n[k]) walk(n[k]);
    };
    walk(paper.lead);
    walk(paper.sections);
    walk(Object.values(paper.tables).filter((t) => !t.section.startsWith('appendix')));
    expect(links).toHaveLength(381);
    expect(tags).toEqual({ CP: 248, VR: 61, RR: 52, PO: 32, INF: 95, PROP: 19 });
  });

  it('agrees with the JSON on the appendix tables', () => {
    expect(paper.tables['appendix-a#1'].rows).toHaveLength(keyFigures.length);
    paper.tables['appendix-a#1'].rowsPlain.forEach((r, i) => expect(r[0]).toBe(keyFigures[i].figure));
  });
});
