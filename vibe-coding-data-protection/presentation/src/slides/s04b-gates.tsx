// §4.4.1–4.4.2: the four PostgreSQL gates on a Supabase Data API request, the two side paths,
// and what the 30 October 2026 grant change does and does not do.
import { useState } from 'react';
import { Arrow, Part, Src, Tags, useId } from './s04b-lib';

interface Stop {
  key: string;
  n?: string;
  name: string;
  signal: any;
  side?: boolean;
  flag?: string;
  points: any[];
}

const S1 = '4.4.1';

const STOPS: Stop[] = [
  {
    key: 'schema',
    n: '1',
    name: 'Schema exposure',
    signal: 'Data API off: no endpoint responds',
    points: [
      <>
        With the Data API disabled “none of the auto-generated REST endpoints respond, regardless of grants or RLS” (<Src sec={S1} label="Supabase hardening guide" />) <Tags c={['CP']} />
      </>,
      <>
        The GraphQL path (pg_graphql) follows the same grants and RLS; introspection is off by default from 1.6.0; pg_graphql stopped being enabled by default on new projects on 18 May 2026 (<Src sec={S1} label="Supabase GraphQL" />; <Src sec={S1} label="changelog 45329" />) <Tags c={['CP']} />
      </>,
    ],
  },
  {
    key: 'grants',
    n: '2',
    name: 'Table and column grants',
    signal: (
      <>
        <code>42501</code> before any policy runs
      </>
    ),
    flag: '30 October 2026 change acts here',
    points: [
      <>
        “Grants decide whether a role can run an operation on the table at all”; “A missing grant raises a <code>42501</code> error before any policy runs”; and “Adding policies doesn't take those grants back” (<Src sec={S1} label="Supabase RLS docs" />) <Tags c={['CP']} />
      </>,
      <>
        PostgREST's model is that “All authorization happens in the database”; requests with no JWT run as the anonymous role, and a JWT role claim causes <code>SET LOCAL ROLE</code> for the request (<Src sec={S1} label="PostgREST auth" />) <Tags c={['CP']} />
      </>,
    ],
  },
  {
    key: 'rls',
    n: '3',
    name: 'Row-level security',
    signal: 'No policy: default-deny',
    points: [
      <>
        When enabled, “If no policy exists for the table, a default-deny policy is used”; permissive policies combine with <code>OR</code>, restrictive with <code>AND</code>; superusers, <code>BYPASSRLS</code> roles and table owners bypass it; referential-integrity checks “always bypass row security” and can be a covert channel (<Src sec={S1} label="PostgreSQL ddl-rowsecurity" />) <Tags c={['CP']} />
      </>,
      <>
        An <code>UPDATE</code> policy needs a corresponding <code>SELECT</code> policy, and without <code>WITH CHECK</code> “the <code>using</code> expression decides both which rows are visible and which new rows are allowed”, so a user can reassign a row's <code>user_id</code> to another user (<Src sec={S1} label="Supabase SKILL.md" />) <Tags c={['CP']} />
      </>,
      <>
        Authorisation claims must come from <code>app_metadata</code> (<code>raw_app_meta_data</code>), never <code>user_metadata</code>, which “can be modified by authenticated end users” <Tags c={['CP']} />
      </>,
      <>
        Security Advisor lints 0008 and 0024 are presence and pattern checks; they cannot tell whether a predicate matches the tenancy model <Tags c={['INF']} />
      </>,
    ],
  },
  {
    key: 'columns',
    n: '4',
    name: 'Column privileges',
    signal: 'Independent of RLS',
    points: [
      <>
        Column privileges work “independently from RLS” but break <code>select *</code> for restricted roles and are labelled “an advanced feature” (<Src sec={S1} label="Supabase column-level security" />) <Tags c={['CP']} />
      </>,
    ],
  },
  {
    key: 'views',
    name: 'Views',
    side: true,
    signal: 'bypass RLS by default',
    points: [
      <>
        Views “bypass RLS by default because they are usually created with the <code>postgres</code> user”; on Postgres 15+ <code>security_invoker = true</code> makes a view obey the invoking user's policies (<Src sec={S1} label="PostgreSQL CREATE VIEW" />) <Tags c={['CP']} />
      </>,
      <>
        Security Advisor lint 0010 flags a security definer view (<Src sec={S1} label="Supabase database advisors" />) <Tags c={['CP']} />
      </>,
    ],
  },
  {
    key: 'functions',
    name: 'Functions',
    side: true,
    signal: 'any role can run them by default',
    points: [
      <>
        “By default, any role can run a database function”, including <code>anon</code>; a <code>security definer</code> function owned by <code>postgres</code> has <code>bypassrls</code> and “can return rows the caller isn't allowed to read”; without a pinned <code>search_path</code> a caller can hijack an unqualified name (<Src sec={S1} label="Supabase database functions" />) <Tags c={['CP']} />
      </>,
      <>
        The agent skill's rule is blunt: “Never add <code>SECURITY DEFINER</code> to resolve a permission error; it silently removes access control” <Tags c={['CP']} />
      </>,
      <>
        Security Advisor lints 0028/0029 (security definer functions executable by anon/authenticated) and 0011 (mutable search path) (<Src sec={S1} label="Supabase database advisors" />) <Tags c={['CP']} />
      </>,
    ],
  },
];

function StopButton({ s, i, sel, setSel, panel }: { s: Stop; i: number; sel: number; setSel: (i: number) => void; panel: string }) {
  return (
    <button type="button" class={`gp-stop${s.side ? ' is-side' : ''}`} aria-pressed={i === sel} aria-controls={panel} onClick={() => setSel(i)}>
      <span class="gp-head">
        {s.n && <span class="gp-n">{s.n}</span>}
        <span class="gp-name">{s.name}</span>
      </span>
      <span class="gp-sig">{s.signal}</span>
      {s.flag && <span class="gp-flag">{s.flag}</span>}
    </button>
  );
}

function Pipeline() {
  const [sel, setSel] = useState(0);
  const panel = useId('gate');
  const s = STOPS[sel];
  const b = (i: number) => <StopButton s={STOPS[i]} i={i} sel={sel} setSel={setSel} panel={panel} />;
  return (
    <section class="stack" aria-labelledby="b3-pipe">
      <Part n="4.4.1" id="b3-pipe" title="Four gates, in order, then two side paths around them">
        <p class="small muted">Select a gate or a side path for its documented semantics.</p>
      </Part>
      <div class="s4b-gp-wrap">
        <div class="s4b-gp" role="group" aria-label="Gates on a Data API request">
          <div class="gp-end gp-req">
            <strong>Request</strong>
            <span>
              no JWT: anonymous role; JWT role claim: <code>SET LOCAL ROLE</code>
            </span>
          </div>
          <span class="gp-a gp-a1">
            <Arrow />
          </span>
          <div class="gp-g1">{b(0)}</div>
          <span class="gp-a gp-a2">
            <Arrow />
          </span>
          <div class="gp-g2">{b(1)}</div>
          <span class="gp-a gp-a3">
            <Arrow />
          </span>
          <div class="gp-g3">{b(2)}</div>
          <span class="gp-a gp-a4">
            <Arrow />
          </span>
          <div class="gp-g4">{b(3)}</div>
          <span class="gp-a gp-a5">
            <Arrow />
          </span>
          <div class="gp-end gp-res">
            <strong>Rows</strong>
            <span>returned to the caller</span>
          </div>
          <div class="gp-u">
            <span class="gp-u-label">Side paths that bypass all four unless configured</span>
            <div class="gp-u-stops">
              {b(4)}
              {b(5)}
            </div>
          </div>
        </div>
      </div>
      <div class="s4b-gp-panel card" id={panel} role="region" aria-label={`${s.side ? 'Side path' : `Gate ${s.n}`}: ${s.name}`}>
        <h3 class="gp-panel-title">
          <span class="eyebrow">{s.side ? 'Side path' : `Gate ${s.n} of the four`}</span>
          {s.name}
        </h3>
        <ul class="s4b-bullets">
          {s.points.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ---- The 30 October 2026 change ----------------------------------------------------------------

const T0 = Date.UTC(2026, 3, 28);
const T1 = Date.UTC(2026, 9, 30);
const at = (t: number) => ((t - T0) / (T1 - T0)) * 100;
const MARKS = [
  { t: T0, date: '28 April 2026', label: 'Changelog 45329 published', kind: '' },
  { t: Date.UTC(2026, 4, 30), date: '30 May 2026', label: 'New default for all new projects (“gradual rollout over a few weeks”)', kind: '' },
  { t: Date.UTC(2026, 9, 8, 12), date: '8–9 October 2026', label: 'Date of record of this paper', kind: 'record' },
  { t: T1, date: '30 October 2026', label: 'Applied to all existing projects', kind: 'key' },
];
const MONTHS = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map((m, i) => ({ m, t: Date.UTC(2026, 4 + i, 1) }));

function DateStrip() {
  return (
    <figure class="viz">
      <div class="s4b-strip-wrap">
        <ol class="s4b-strip" aria-label="Rollout dates of changelog 45329">
          {MARKS.map((m, i) => (
            <li key={m.date} class={`st-mark st-${i % 2 ? 'down' : 'up'}${i === 0 ? ' is-first' : ''}${i === MARKS.length - 1 ? ' is-last' : ''}${m.kind ? ` is-${m.kind}` : ''}`} style={{ ['--at' as any]: `${at(m.t)}%` }}>
              <span class="st-dot" aria-hidden="true" />
              <span class="st-text">
                <strong>{m.date}</strong>
                <span>{m.label}</span>
              </span>
            </li>
          ))}
        </ol>
        <div class="st-axis" aria-hidden="true">
          {MONTHS.map((m) => (
            <span key={m.m} class="st-tick" style={{ ['--at' as any]: `${at(m.t)}%` }}>
              {m.m}
            </span>
          ))}
        </div>
      </div>
      <figcaption>
        <span class="scale-note" data-chrome>
          Dates placed to scale.
        </span>{' '}
        Whether the 30 October rollout for existing projects is instantaneous or gradual like the May rollout is not stated; test after the date <Tags c={['INF']} />
      </figcaption>
    </figure>
  );
}

function DoesDoesNot() {
  const S2 = '4.4.2';
  return (
    <div class="grid-2 s4b-dd">
      <section class="s4b-does" aria-labelledby="b3-does">
        <h3 id="b3-does" class="h3">
          What it does <Tags c={['CP']} />
        </h3>
        <ul class="s4b-bullets">
          <li>
            New tables in <code>public</code> no longer receive the default <code>select, insert, update, delete</code> grants to <code>anon</code>, <code>authenticated</code> and <code>service_role</code>.
          </li>
          <li>
            Without an explicit <code>GRANT</code>, PostgREST returns <code>42501</code> with the hint “GRANT SELECT ON public.your_table TO anon;”.
          </li>
        </ul>
      </section>
      <section class="s4b-doesnot" aria-labelledby="b3-doesnot">
        <h3 id="b3-doesnot" class="h3">
          What it does not do: the changelog's verbatim limits <Tags c={['CP']} />
        </h3>
        <ul class="s4b-bullets">
          <li>“Existing tables are not affected in your project, they keep their current grants and stay reachable”</li>
          <li>“RLS behavior remains unchanged”</li>
          <li>Direct connections “will not affect you”</li>
          <li>
            <code>storage</code>, <code>auth</code>, <code>realtime</code>, custom schemas and self-hosted deployments are out of scope
          </li>
        </ul>
        <p class="small muted">
          <Src sec={S2} label="Supabase changelog 45329" />, published 28 April 2026
        </p>
      </section>
    </div>
  );
}

function Consequences() {
  const S2 = '4.4.2';
  return (
    <section class="stack" aria-labelledby="b3-cons">
      <h3 id="b3-cons" class="h3">
        Three consequences the audit did not draw <Tags c={['INF']} />
      </h3>
      <ol class="grid-3 s4b-cons">
        <li class="card">
          <span class="eyebrow">RPC</span>
          <h4 class="h3">
            Function <code>EXECUTE</code> is untouched
          </h4>
          <p class="small">
            The changelog's early-adoption SQL revokes default privileges on tables and sequences only; the hardening guide separately revokes <code>EXECUTE</code> on functions from <code>anon</code>, <code>authenticated</code>, <code>service_role</code> and <code>public</code> (<Src sec={S2} label="Supabase hardening guide" />) <Tags c={['CP']} />.
          </p>
          <p class="small">
            <strong>A new RPC function in <code>public</code> therefore stays callable by <code>anon</code> after 30 October</strong> unless the project also applies the function revokes; RPC exposure is a separate audit item.
          </p>
        </li>
        <li class="card">
          <span class="eyebrow">Event trigger</span>
          <h4 class="h3">The RLS auto-enable trigger must be verified, not assumed</h4>
          <p class="small">
            <code>ensure_rls</code> on <code>ddl_command_end</code> is a per-database object only <code>postgres</code> can create, covers only <code>public</code>, enables RLS but adds no grants or policies, and “Existing tables still need RLS enabled manually” (<Src sec={S2} label="Supabase event triggers" />) <Tags c={['CP']} />.
          </p>
          <p class="small">
            Check a builder-provisioned project with <code>select evtname from pg_event_trigger</code>.
          </p>
        </li>
        <li class="card">
          <span class="eyebrow">Owner roles</span>
          <h4 class="h3">Default privileges are per creating role</h4>
          <p class="small">
            The default-privilege statements are issued <code>for role postgres</code>; PostgreSQL default privileges are per creating role, so tables created by a different owner role would not be covered.
          </p>
          <p class="small muted">PostgreSQL semantics; not discussed by Supabase.</p>
        </li>
      </ol>
    </section>
  );
}

function KeyModel() {
  const S2 = '4.4.2';
  return (
    <div class="split s4b-keys">
      <section class="stack" aria-labelledby="b3-keys">
        <h3 id="b3-keys" class="h3">
          Key model <Tags c={['CP']} />
        </h3>
        <div class="grid-2 s4b-keypair">
          <div class="s4b-key">
            <code class="k-prefix">sb_publishable_</code>
            <span>
              Designed to be public; maps to <code>anon</code> or <code>authenticated</code>.
            </span>
          </div>
          <div class="s4b-key is-secret">
            <code class="k-prefix">sb_secret_</code>
            <span>
              Maps to <code>service_role</code>, bypasses RLS; rejected with HTTP 401 when sent from a browser.
            </span>
          </div>
        </div>
        <p class="small muted">
          Legacy JWT <code>anon</code> and <code>service_role</code> keys are “deprecated by the end of 2026”, removal “Late 2026, TBC”; projects restored since 1 November 2025 receive no legacy keys (<Src sec={S2} label="Supabase API keys" />; <Src sec={S2} label="changelog 29260" />). The OpenAPI schema at <code>/rest/v1/</code> is no longer served to <code>anon</code> callers since 8 April 2026 (<Src sec={S2} label="changelog 42949" />), which removes the enumeration step Wiz used at Moltbook but not the data path.
        </p>
      </section>
      <section class="stack" aria-labelledby="b3-priv">
        <h3 id="b3-priv" class="h3">
          Privileged paths to audit on any project <Tags c={['INF']} />
        </h3>
        <ul class="s4b-bullets">
          <li>
            Anything using a secret or <code>service_role</code> key
          </li>
          <li>
            <code>security definer</code> functions and views in exposed schemas
          </li>
          <li>
            Custom roles with <code>bypassrls</code>
          </li>
          <li>Direct Postgres connection strings held by apps or agents</li>
        </ul>
      </section>
    </div>
  );
}

function Closing() {
  return (
    <section class="s4b-close" aria-label="What secure by default means after 30 October">
      <p class="s4b-close-q">
        “Secure by default” after 30 October therefore means only that a new table the agent forgets to grant is unreachable via REST and GraphQL. A table the agent does grant to <code>anon</code> with no RLS, or with a <code>USING (true)</code> policy, is as exposed as before.
      </p>
      <p class="s4b-close-k">
        Grants are necessary, not sufficient; RLS is necessary, not sufficient; both plus correct policy logic are required <Tags c={['INF']} />
      </p>
    </section>
  );
}

export function GatesBody() {
  return (
    <div class="stack-lg s4b">
      <Pipeline />
      <hr class="rule" />
      <section class="stack-lg" aria-labelledby="b3-oct">
        <Part n="4.4.2" id="b3-oct" title="What the 30 October 2026 change does and does not do">
          <p class="small muted">
            Changelog 45329 is precise <Tags c={['CP']} />.
          </p>
        </Part>
        <DateStrip />
        <DoesDoesNot />
        <Consequences />
        <KeyModel />
      </section>
      <Closing />
    </div>
  );
}
