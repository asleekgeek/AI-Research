// §4.4.4: the behavioural authorisation test matrix (authors' proposal), the assertion discipline,
// the paper's migration and pgTAP test verbatim, and the documented tooling with its tags.
import { useState } from 'react';
import { section } from '../lib/data';
import { Inline } from '../components/Inline';
import { Src, Tags, useId } from './s04b-lib';

const S = '4.4.4';

const PRINCIPALS = [
  { key: 'anon', name: 'Anonymous', note: 'publishable-key caller, no Authorization header' },
  { key: 'A', name: 'Tenant A user', note: 'authenticated' },
  { key: 'B', name: 'Tenant B user', note: 'authenticated' },
] as const;
const SURFACES = [
  { key: 'rest', name: 'REST table', path: '/rest/v1/invoices' },
  { key: 'gql', name: 'GraphQL, if enabled', path: '/graphql/v1' },
  { key: 'rpc', name: 'Each RPC function', path: '/rest/v1/rpc/<fn>' },
  { key: 'storage', name: 'Storage object', path: '/storage/v1/object/<bucket>/...' },
] as const;
const OPS = ['select', 'insert', 'update', 'upsert', 'delete'] as const;

/** The six cases of the paper's pgTAP example, placed by principal and operation; `expect` restates its assertion. */
const CASES: { n: string; who: 'anon' | 'A' | 'B'; op: (typeof OPS)[number]; expect: string; asTenantB?: boolean }[] = [
  { n: '1', who: 'anon', op: 'select', expect: '42501' },
  { n: '2', who: 'A', op: 'select', expect: '1 row' },
  { n: '3', who: 'B', op: 'select', expect: 'empty' },
  { n: '4', who: 'B', op: 'insert', expect: '42501', asTenantB: true },
  { n: '5', who: 'B', op: 'update', expect: '0 rows', asTenantB: true },
  { n: '6', who: 'B', op: 'update', expect: '42501', asTenantB: true },
];

const code = () => section(S).blocks.flatMap((b) => (b.t === 'code' ? [b.text] : []));

/** One case's lines, verbatim from the paper's pgTAP block: from its "-- n." comment to the next. */
function caseText(n: string): { title: string; sql: string } {
  const t = code()[1];
  const re = /^-- (\d)\. (.*)$/gm;
  const marks = [...t.matchAll(re)];
  const i = marks.findIndex((m) => m[1] === n);
  if (i < 0) throw new Error(`No pgTAP case ${n}`);
  const start = marks[i].index! + marks[i][0].length + 1;
  const end = i + 1 < marks.length ? marks[i + 1].index! : t.indexOf('select * from finish');
  return { title: marks[i][2], sql: t.slice(start, end).trimEnd() };
}

function Matrix() {
  const [sel, setSel] = useState('1');
  const panel = useId('case');
  const c = CASES.find((x) => x.n === sel)!;
  const ct = caseText(sel);
  const who = PRINCIPALS.find((p) => p.key === c.who)!;
  return (
    <section class="stack" aria-labelledby="tm-grid">
      <header class="s4b-part">
        <span class="eyebrow">Behavioural, not presence</span>
        <h2 id="tm-grid" class="h2">
          Three principals × four surfaces × five operations <Tags c={['PROP']} />
        </h2>
        <p class="small muted">
          Assembled from documented patterns <Tags c={['CP']} />. Select a numbered cell to see that case's test, verbatim from the paper.
        </p>
      </header>
      <div class="s4b-tm">
        {PRINCIPALS.map((p) => (
          <div class="tm-one" key={p.key}>
            <table class="tm-table">
              <caption>
                <strong>{p.name}</strong> <span class="muted">{p.note}</span>
              </caption>
              <thead>
                <tr>
                  <th scope="col">
                    <span class="visually-hidden">Surface</span>
                  </th>
                  {OPS.map((o) => (
                    <th scope="col" key={o}>
                      {o}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SURFACES.map((s) => (
                  <tr key={s.key}>
                    <th scope="row">
                      <span class="tm-surf">{s.name}</span>
                    </th>
                    {OPS.map((o) => {
                      const hits = CASES.filter((x) => x.who === p.key && x.op === o);
                      const sql = s.key === 'rest';
                      return (
                        <td key={o} class={hits.length ? 'has-case' : 'is-open'}>
                          {hits.length ? (
                            hits.map((h) => (
                              <button
                                key={h.n}
                                type="button"
                                class={`tm-case${sql ? '' : ' is-http'}`}
                                aria-pressed={h.n === sel}
                                aria-controls={panel}
                                onClick={() => setSel(h.n)}
                                aria-label={sql ? `Case ${h.n}, expects ${h.expect}` : `Case ${h.n}, re-run over HTTP`}
                              >
                                <span class="tm-n">{h.n}</span>{' '}
                                {sql && <span class="tm-x">{h.expect}</span>}{' '}
                              </button>
                            ))
                          ) : (
                            <span class="tm-dot" aria-label="Not covered by the minimal example" role="img" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      <ul class="tm-legend small">
        <li>
          <span class="tm-case tm-swatch" aria-hidden="true">
            <span class="tm-n">n</span>
          </span>
          Case n of the paper's pgTAP example, with its expected result
        </li>
        <li>
          <span class="tm-case is-http tm-swatch" aria-hidden="true">
            <span class="tm-n">n</span>
          </span>
          The same case re-run over HTTP against that surface <Tags c={['PROP']} />
        </li>
        <li>
          <span class="tm-dot" aria-hidden="true" /> In the matrix; not in the minimal example
        </li>
      </ul>
      <div class="s4b-case card" id={panel} role="region" aria-label={`Case ${c.n}`}>
        <div class="case-head">
          <span class="case-n">{c.n}</span>
          <div class="stack" style={{ gap: '2px' }}>
            <h3 class="h3">{ct.title}</h3>
            <span class="small muted">
              {who.name} · {c.op} · expects <code>{c.expect}</code>
              {c.asTenantB && ' · runs under the tenant B claims set in case 3'}
            </span>
          </div>
        </div>
        <pre class="codeblock">
          <code>{ct.sql}</code>
        </pre>
        <p class="small muted">
          Over HTTP: publishable key with no <code>Authorization</code> header for the anonymous case; signed-in tenant A and B JWTs for the rest, asserting on body row counts or <code>returning</code> values <Tags c={['PROP']} />
        </p>
      </div>
    </section>
  );
}

function Discipline() {
  return (
    <section class="stack" aria-labelledby="tm-disc">
      <h2 id="tm-disc" class="h2">
        Why HTTP status cannot be the assertion
      </h2>
      <p class="small muted">
        The matrix asserts on <strong>row counts and SQLSTATE</strong>, not HTTP status <Tags c={['PROP']} />. The assertion discipline is the point:
      </p>
      <div class="s4b-disc" role="table" aria-label="What a broken or a working policy returns">
        <div role="row" class="dc-head">
          <span role="columnheader">Request</span>
          <span role="columnheader">What comes back</span>
          <span role="columnheader">Assert on</span>
        </div>
        <div role="row">
          <span role="rowheader">
            RLS-filtered <code>SELECT</code>
          </span>
          <span role="cell">succeeds with zero rows</span>
          <span role="cell" class="dc-assert">row count</span>
        </div>
        <div role="row">
          <span role="rowheader">
            <code>UPDATE</code> or <code>DELETE</code> of invisible rows
          </span>
          <span role="cell">succeeds affecting zero rows</span>
          <span role="cell" class="dc-assert">
            affected rows (<code>returning</code>)
          </span>
        </div>
        <div role="row">
          <span role="rowheader">Missing grant, or a <code>WITH CHECK</code> violation</span>
          <span role="cell">
            <code>42501</code>
          </span>
          <span role="cell" class="dc-assert">SQLSTATE</span>
        </div>
      </div>
      <p class="s4b-callout-line">
        A test that checks only for 200/204 passes on a broken policy; a <code>42501</code> is the correct expectation for anonymous access to tenant data after 30 October <Tags c={['INF']} />
      </p>
    </section>
  );
}

function Code() {
  const [mig, test] = code();
  const lead = section(S).blocks[2];
  return (
    <section class="stack" aria-labelledby="tm-code">
      <h2 id="tm-code" class="h2">
        Minimal example: one tenant-bound table and six tests
      </h2>
      <p class="small">{lead.t === 'p' && <Inline nodes={lead.c} />}</p>
      <details class="more s4b-code">
        <summary>
          Migration: <code>{mig.split('\n')[0].replace(/^-- /, '')}</code>
        </summary>
        <pre class="codeblock">
          <code>{mig}</code>
        </pre>
      </details>
      <details class="more s4b-code">
        <summary>
          pgTAP test: <code>{test.split('\n')[0].replace(/^-- /, '')}</code>
        </summary>
        <pre class="codeblock">
          <code>{test}</code>
        </pre>
      </details>
    </section>
  );
}

function Tooling() {
  return (
    <section class="stack" aria-labelledby="tm-tools">
      <h2 id="tm-tools" class="h2">
        Documented tooling, as of October 2026
      </h2>
      <ul class="s4b-tools">
        <li>
          <span class="tl-name">pgTAP</span>
          <span>
            via <code>supabase test db</code>, with <code>set local role</code> and <code>set local "request.jwt.claims"</code> for impersonation (<Src sec={S} label="Supabase testing overview" />)
          </span>
          <Tags c={['CP']} />
        </li>
        <li>
          <span class="tl-name">supabase_test_helpers</span>
          <span>
            basejump extension 0.0.6: <code>tests.create_supabase_user</code>, <code>tests.authenticate_as</code>, <code>tests.clear_authentication</code>, <code>tests.rls_enabled</code> (<Src sec={S} label="Supabase pgTAP extended" />)
          </span>
          <Tags c={['CP']} />
        </li>
        <li class="tl-warn">
          <span class="tl-name">RLS Tester</span>
          <span>
            Supabase feature preview (24 April 2026). <strong>SELECT-only</strong>, so it cannot detect missing <code>WITH CHECK</code> or UPDATE-without-SELECT defects (<Src sec={S} label="changelog 45233" />)
            <span class="tl-ops" aria-label="Operations covered: select only" role="img">
              {OPS.map((o) => (
                <span key={o} class={o === 'select' ? 'on' : undefined} aria-hidden="true">
                  {o}
                </span>
              ))}
            </span>
          </span>
          <Tags c={['CP']} />
        </li>
        <li>
          <span class="tl-name">SupaShield</span>
          <span>
            Community CLI that generates anonymous and authenticated CRUD tests in rolled-back transactions (<Src sec={S} label="GitHub" />)
          </span>
          <Tags c={['RR']} />
        </li>
        <li>
          <span class="tl-name">Lovable Deep scan</span>
          <span>
            with Aikido, “dynamic AI penetration testing” (<Src sec={S} label="Lovable security" />)
          </span>
          <Tags c={['VR']} />
        </li>
        <li>
          <span class="tl-name">HTTP tests</span>
          <span>
            Application-level HTTP tests cannot use transactions for isolation and must sign in real users (<Src sec={S} label="Supabase testing overview" nth={1} />)
          </span>
          <Tags c={['CP']} />
        </li>
      </ul>
      <ul class="s4b-bullets small">
        <li>
          Storage follows RLS on <code>storage.objects</code>; upsert needs INSERT plus SELECT plus UPDATE or “file replacement (upsert) silently fails”; service keys bypass Storage RLS entirely (<Src sec={S} label="Supabase storage access control" />) <Tags c={['CP']} />
        </li>
        <li>
          The Supabase agent skill tells agents to run advisors before committing migrations but not to write cross-tenant tests; an organisation's <code>AGENTS.md</code> or <code>CLAUDE.md</code> should require this matrix explicitly <Tags c={['INF', 'PROP']} />
        </li>
      </ul>
    </section>
  );
}

export function MatrixBody() {
  return (
    <div class="stack-lg s4b">
      <Matrix />
      <hr class="rule" />
      <div class="split s4b-tm-lower">
        <Discipline />
        <Code />
      </div>
      <hr class="rule" />
      <Tooling />
    </div>
  );
}
