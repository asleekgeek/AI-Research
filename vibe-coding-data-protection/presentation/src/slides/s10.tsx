import { useState } from 'react';
import type { SlideDef } from './types';
import { Chip } from '../components/Chip';
import { Inline } from '../components/Inline';
import { Verdict } from '../components/Verdict';
import { CODES, section } from '../lib/data';
import type { Code } from '../lib/types';
import { AssuranceCell, COL_ASSURANCE, COL_CONTROL, COL_PROPERTY, COL_TIER, MATRIX, PROP_CLASSES, PropertyPill, ROW_CLASS, ROW_TESTS, takeWantedFilter, type PropClass } from './s09-shared';
import './s10.css';

const ROWS = MATRIX.rows.map((_, i) => i);
const COL_PATH = MATRIX.headPlain.indexOf('Threat path interrupted');
const COL_LIMIT = MATRIX.headPlain.indexOf('Documented limitation or bypass');

/** Codes that appear in a row's evidence tier, for the tier filter. */
const ROW_CODES: Code[][] = MATRIX.rowsPlain.map((r) => CODES.filter((c) => r[COL_TIER].includes(`[${c}]`)));
const TIER_CODES: Code[] = CODES.filter((c) => ROW_CODES.some((rc) => rc.includes(c)));

/** The paper's definitions, verbatim from the §10 lead paragraph. */
const DEFS: { kind: string; label: string; def: string }[] = [
  { kind: 'prevents', label: 'Prevents', def: 'would have interrupted the named incident path by construction' },
  { kind: 'detects', label: 'Detects', def: 'would have surfaced the defect' },
  { kind: 'limits', label: 'Limits', def: 'reduces impact' },
];

function Definitions() {
  const lead = section('10').blocks[0];
  const leadText = lead.t === 'p' ? lead.c.map((n) => (n.t === 'text' ? n.v : '')).join('') : '';
  // Guard: the definitions shown must still be the paper's wording.
  for (const d of DEFS) if (!leadText.includes(d.def)) throw new Error(`§10 definition changed: ${d.label}`);
  return (
    <div class="stack">
      <dl class="t10-defs">
        {DEFS.map((d) => (
          <div key={d.kind}>
            <dt>
              <Verdict kind={d.kind}>{d.label}</Verdict>
            </dt>
            <dd>
              means the control <q>{d.def}</q>
            </dd>
          </div>
        ))}
      </dl>
      <p class="t10-caveat">
        Verdicts are inferences from the incident record and vendor semantics; no controlled efficacy study exists for any row <Chip code="INF" /> unless otherwise tagged.
      </p>
    </div>
  );
}

/** The rows the paper rates as demonstrating no protection (or none either way). */
function NoneBand() {
  const rows = ROWS.filter((r) => ROW_CLASS[r] === 'none');
  return (
    <section class="t10-none-band" aria-labelledby="t10-none-h">
      <h2 id="t10-none-h" class="h3">
        No demonstrated protection on the named path
      </h2>
      <ul class="t10-none-list">
        {rows.map((r) => (
          <li key={r}>
            <strong class="t10-none-control">
              <Inline nodes={MATRIX.rows[r][COL_CONTROL]} />
            </strong>
            <PropertyPill row={r} />
            <span class="small">
              <Inline nodes={MATRIX.rows[r][COL_LIMIT]} />
            </span>
            <span class="small muted">
              <Inline nodes={MATRIX.rows[r][COL_PATH]} /> · <Inline nodes={MATRIX.rows[r][COL_TIER]} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Matrix() {
  const [prop, setProp] = useState<PropClass | null>(null);
  const [tier, setTier] = useState<Code | null>(null);
  const [test, setTest] = useState<number | null>(() => takeWantedFilter());
  const shown = ROWS.filter((r) => (!prop || ROW_CLASS[r] === prop) && (!tier || ROW_CODES[r].includes(tier)) && (test === null || ROW_TESTS[r].includes(test)));
  const head = MATRIX.head;
  const label = MATRIX.headPlain;
  return (
    <div class="stack t10">
      <div class="filters t10-filters">
        <div class="filter-group" role="group" aria-labelledby="t10-f-prop">
          <span class="eyebrow" id="t10-f-prop">
            Property
          </span>
          <div class="seg">
            <button type="button" aria-pressed={prop === null} onClick={() => setProp(null)}>
              All
            </button>
            {PROP_CLASSES.map((p) => (
              <button type="button" key={p.key} aria-pressed={prop === p.key} onClick={() => setProp(prop === p.key ? null : p.key)}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div class="filter-group" role="group" aria-labelledby="t10-f-tier">
          <span class="eyebrow" id="t10-f-tier">
            Evidence tier includes
          </span>
          <div class="seg">
            <button type="button" aria-pressed={tier === null} onClick={() => setTier(null)}>
              Any
            </button>
            {TIER_CODES.map((c) => (
              <button type="button" key={c} aria-pressed={tier === c} onClick={() => setTier(tier === c ? null : c)} aria-label={`Evidence tier includes ${c}`}>
                <Chip code={c} />
              </button>
            ))}
          </div>
        </div>
        {test !== null && (
          <div class="filter-group">
            <span class="eyebrow">From §9</span>
            <button type="button" class="toggle" aria-pressed="true" onClick={() => setTest(null)} aria-label={`Showing controls that cite Test ${test}; remove this filter`}>
              Cites Test {test} <span aria-hidden="true">×</span>
            </button>
          </div>
        )}
        <span class="count" data-chrome aria-live="polite">
          {shown.length} of {ROWS.length} rows
        </span>
      </div>
      <div class="tbl-wrap t10-wrap" tabIndex={0} role="region" aria-label="Threat-path efficacy and limitations matrix" data-hscroll>
        <table class="ptable t10-table" data-paper-table="10#1">
          <thead>
            <tr>
              {head.map((h, ci) => (
                <th scope="col" key={ci} class={`t10-c${ci}`}>
                  <Inline nodes={h} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r} class={ROW_CLASS[r] === 'none' ? 't10-is-none' : undefined}>
                {head.map((_, ci) =>
                  ci === COL_CONTROL ? (
                    <th scope="row" key={ci} data-label={label[ci]}>
                      <Inline nodes={MATRIX.rows[r][ci]} />
                    </th>
                  ) : (
                    <td key={ci} data-label={label[ci]}>
                      {ci === COL_PROPERTY ? <PropertyPill row={r} /> : ci === COL_ASSURANCE ? <AssuranceCell nodes={MATRIX.rows[r][ci]} /> : <Inline nodes={MATRIX.rows[r][ci]} />}
                    </td>
                  ),
                )}
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={head.length} class="muted">
                  No row matches these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p class="small muted">
        Test references in the “Assurance test” column open that test in the <a href="#s09-tests">verification test matrix</a>. Rows shaded as warnings are those the paper rates as demonstrating
        no protection, or as not evidenced either way.
      </p>
    </div>
  );
}

function ThreatPaths() {
  return (
    <div class="stack-lg">
      <Definitions />
      <NoneBand />
      <Matrix />
    </div>
  );
}

const slides: SlideDef[] = [
  {
    slug: 's10-threat-paths',
    section: '10',
    title: 'Rate each control by the incident path it interrupts; some demonstrated none',
    short: 'Threat-path matrix',
    dek: 'This replaces the “works / theatre” table: every row names the threat path, the property, the documented limitation or bypass, and the test that gives assurance.',
    paper: ['10'],
    Body: ThreatPaths,
  },
];
export default slides;
