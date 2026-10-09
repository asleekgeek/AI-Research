import { useRef, useState } from 'react';
import type { SlideDef } from './types';
import { Inline } from '../components/Inline';
import { IconLink } from '../components/Icons';
import { COL_ASSURANCE, COL_CONTROL, COL_TIER, MATRIX, PropertyPill, TESTS, openMatrixFor, rowsCiting, takeWantedTest } from './s09-shared';
import './s09.css';

const COL = {
  num: TESTS.headPlain.indexOf('#'),
  invariant: TESTS.headPlain.indexOf('Invariant'),
  principal: TESTS.headPlain.indexOf('Principal / starting state'),
  action: TESTS.headPlain.indexOf('Action'),
  expected: TESTS.headPlain.indexOf('Expected observation'),
};

function TestPanel({ i }: { i: number }) {
  const row = TESTS.rows[i];
  const n = Number(TESTS.rowsPlain[i][COL.num]);
  const citing = rowsCiting(n);
  return (
    <div class="t9-panel-body">
      <header class="stack" style={{ gap: '4px' }}>
        <span class="eyebrow">Test {TESTS.rowsPlain[i][COL.num]} · invariant</span>
        <h2 class="t9-inv-title">
          <Inline nodes={row[COL.invariant]} />
        </h2>
      </header>
      <ol class="t9-scenario" aria-label="Test procedure">
        <li>
          <span class="t9-scn-label">
            <Inline nodes={TESTS.head[COL.principal]} />
          </span>
          <span class="t9-scn-text">
            <Inline nodes={row[COL.principal]} />
          </span>
        </li>
        <li>
          <span class="t9-scn-label">
            <Inline nodes={TESTS.head[COL.action]} />
          </span>
          <span class="t9-scn-text">
            <Inline nodes={row[COL.action]} />
          </span>
        </li>
        <li class="is-pass">
          <span class="t9-scn-label">
            <Inline nodes={TESTS.head[COL.expected]} />
          </span>
          <span class="t9-scn-text">
            <Inline nodes={row[COL.expected]} />
          </span>
        </li>
      </ol>
      <section class="t9-cited" aria-label="Controls in the threat-path matrix that cite this test">
        <h3 class="h3">Controls in the threat-path matrix (§10) that cite this test</h3>
        {citing.length ? (
          <>
            <ul class="t9-cited-list">
              {citing.map((r) => (
                <li key={r}>
                  <div class="t9-cited-head">
                    <strong>
                      <Inline nodes={MATRIX.rows[r][COL_CONTROL]} />
                    </strong>
                    <PropertyPill row={r} />
                  </div>
                  <span class="small muted">
                    Assurance test: <Inline nodes={MATRIX.rows[r][COL_ASSURANCE]} /> · <Inline nodes={MATRIX.rows[r][COL_TIER]} />
                  </span>
                </li>
              ))}
            </ul>
            <a class="t9-go" href="#s10-threat-paths" onClick={() => openMatrixFor(n)}>
              Show these controls in the threat-path matrix
            </a>
          </>
        ) : (
          <>
            <p class="small muted">No control in the §10 matrix names this test in its “Assurance test” column.</p>
            <a class="t9-go" href="#s10-threat-paths">
              Open the threat-path matrix
            </a>
          </>
        )}
      </section>
    </div>
  );
}

function Tests() {
  const rows = TESTS.rows.map((_, i) => i);
  const [active, setActive] = useState(() => {
    const want = takeWantedTest();
    const at = want === null ? -1 : TESTS.rowsPlain.findIndex((r) => Number(r[COL.num]) === want);
    return at >= 0 ? at : 0;
  });
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent) => {
    const last = rows.length - 1;
    let n = active;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = active === last ? 0 : active + 1;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = active === 0 ? last : active - 1;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = last;
    else return;
    e.preventDefault();
    setActive(n);
    refs.current[n]?.focus();
  };
  return (
    <div class="stack-lg">
      <p class="lead">
        Each test states the principal and starting state, the action, and the observation that constitutes a pass. The seven invariants from the audit are preserved and extended with database-level
        assertions.
      </p>
      <div class="t9">
        <div class="t9-side">
        <div class="t9-list" role="tablist" aria-label="Verification tests" aria-orientation="vertical" onKeyDown={onKey as any}>
          {rows.map((i) => {
            const num = TESTS.rowsPlain[i][COL.num];
            const cited = rowsCiting(Number(num)).length > 0;
            return (
              <button
                key={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`t9-tab-${i}`}
                aria-selected={i === active}
                aria-controls={`t9-panel-${i}`}
                tabIndex={i === active ? 0 : -1}
                class="t9-tab"
                onClick={() => setActive(i)}
              >
                <span class="t9-num">{num}</span>
                <span class="t9-tab-inv">
                  <Inline nodes={TESTS.rows[i][COL.invariant]} />
                </span>
                <span class={`t9-mark${cited ? ' is-cited' : ''}`} title={cited ? 'Cited by controls in the §10 matrix' : 'Not cited in the §10 matrix'}>
                  {cited && <IconLink />}
                  <span class="visually-hidden">{cited ? 'cited in the threat-path matrix' : 'not cited in the threat-path matrix'}</span>
                </span>
              </button>
            );
          })}
        </div>
        <p class="small muted t9-key">
          <span class="t9-legend">
            <IconLink />
          </span>{' '}
          marks a test that a control in the threat-path matrix names as its assurance test.
        </p>
        </div>
        <div class="t9-panels">
          {rows.map((i) => (
            <div key={i} role="tabpanel" id={`t9-panel-${i}`} aria-labelledby={`t9-tab-${i}`} hidden={i !== active} tabIndex={0} class="t9-panel">
              <TestPanel i={i} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const slides: SlideDef[] = [
  {
    slug: 's09-tests',
    section: '9',
    title: 'Each test names a principal, an action and the observation that counts as a pass',
    short: 'Verification tests',
    dek: 'Select a test to see its procedure and which controls in the threat-path matrix name it as their assurance.',
    paper: ['9'],
    Body: Tests,
  },
];
export default slides;
