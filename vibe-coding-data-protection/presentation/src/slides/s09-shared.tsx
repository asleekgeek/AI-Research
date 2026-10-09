// Shared by the §9 test matrix and the §10 threat-path matrix. Every value is read from the paper's
// tables 9#1 and 10#1; the only parsing is of test references written in the "Assurance test" column.
import { table } from '../lib/data';
import type { Inline as Node } from '../lib/types';
import { Inline } from '../components/Inline';
import { Verdict } from '../components/Verdict';

export const TESTS = table('9#1');
export const MATRIX = table('10#1');

/** Matches "Test 1", "Tests 3–6", "Tests 4–5 against BFF endpoints", "Compare with Test 4", "Test 10 fails". */
const TEST_REF = /Tests?\s+(\d+)(?:\s*[–-]\s*(\d+))?/g;

/** Test numbers a §10 row cites in its "Assurance test" column; a range cites every test in it. */
export function citedTests(assurance: string): number[] {
  const out = new Set<number>();
  for (const m of assurance.matchAll(TEST_REF)) {
    const a = Number(m[1]);
    const b = m[2] ? Number(m[2]) : a;
    for (let i = a; i <= b; i++) out.add(i);
  }
  return [...out];
}

const COL_ASSURANCE = MATRIX.headPlain.indexOf('Assurance test');
const COL_PROPERTY = MATRIX.headPlain.indexOf('Property');
const COL_CONTROL = MATRIX.headPlain.indexOf('Control');
const COL_TIER = MATRIX.headPlain.indexOf('Evidence tier');
if ([COL_ASSURANCE, COL_PROPERTY, COL_CONTROL, COL_TIER].includes(-1)) throw new Error('Paper table 10#1 columns changed');
export { COL_ASSURANCE, COL_PROPERTY, COL_CONTROL, COL_TIER };

export const ROW_TESTS: number[][] = MATRIX.rowsPlain.map((r) => citedTests(r[COL_ASSURANCE]));

/** Rows of 10#1 whose "Assurance test" cites test `n`. */
export function rowsCiting(n: number): number[] {
  return ROW_TESTS.flatMap((t, i) => (t.includes(n) ? [i] : []));
}

/** Property classes, by the Property value's leading word; the full Property text is always shown. */
export type PropClass = 'prevents' | 'detects' | 'limits' | 'reduces' | 'enables' | 'none';
export const PROP_CLASSES: { key: PropClass; label: string }[] = [
  { key: 'prevents', label: 'Prevents' },
  { key: 'detects', label: 'Detects' },
  { key: 'limits', label: 'Limits' },
  { key: 'reduces', label: 'Reduces' },
  { key: 'enables', label: 'Enables' },
  { key: 'none', label: 'None or not evidenced' },
];

export function propClass(property: string): PropClass {
  if (/^Prevents\b/.test(property)) return 'prevents';
  if (/^Detects\b/.test(property)) return 'detects';
  if (/^Limits\b/.test(property)) return 'limits';
  if (/^Reduces\b/.test(property)) return 'reduces';
  if (/^Enables\b/.test(property)) return 'enables';
  if (/^(None|Not evidenced)\b/.test(property)) return 'none';
  throw new Error(`Unclassified property: ${property}`);
}

export const ROW_CLASS: PropClass[] = MATRIX.rowsPlain.map((r) => propClass(r[COL_PROPERTY]));

/** The Property cell as a glyph pill carrying the paper's full wording. */
export function PropertyPill({ row }: { row: number }) {
  const text = MATRIX.rowsPlain[row][COL_PROPERTY];
  const cls = ROW_CLASS[row];
  // "Not evidenced either way" is grouped with "None…" for filtering but drawn with its own glyph.
  const kind = cls === 'none' && /^Not evidenced/.test(text) ? 'unevidenced' : cls;
  return (
    <Verdict kind={kind}>
      <span>
        <Inline nodes={MATRIX.rows[row][COL_PROPERTY]} />
      </span>
    </Verdict>
  );
}

// ---- Cross-slide handoff: §10 opens §9 on a test; §9 opens §10 filtered to that test ----------

let wantedTest: number | null = null;
let wantedFilter: number | null = null;

export function openTest(n: number) {
  wantedTest = n;
}
export function takeWantedTest(): number | null {
  const n = wantedTest;
  wantedTest = null;
  return n;
}
export function openMatrixFor(n: number) {
  wantedFilter = n;
}
export function takeWantedFilter(): number | null {
  const n = wantedFilter;
  wantedFilter = null;
  return n;
}

/** Renders an "Assurance test" cell with each test reference as a link to the §9 slide. */
export function AssuranceCell({ nodes }: { nodes: Node[] }) {
  return (
    <>
      {nodes.map((n, i) => {
        if (n.t !== 'text') return <Inline key={i} nodes={[n]} />;
        const parts: any[] = [];
        let last = 0;
        for (const m of n.v.matchAll(TEST_REF)) {
          const at = m.index ?? 0;
          if (at > last) parts.push(n.v.slice(last, at));
          const first = Number(m[1]);
          parts.push(
            <a key={`${i}-${at}`} href="#s09-tests" class="t10-testlink" onClick={() => openTest(first)} title="Open this test in the verification test matrix (§9)">
              {m[0]}
            </a>,
          );
          last = at + m[0].length;
        }
        if (last < n.v.length) parts.push(n.v.slice(last));
        return <span key={i}>{parts}</span>;
      })}
    </>
  );
}
