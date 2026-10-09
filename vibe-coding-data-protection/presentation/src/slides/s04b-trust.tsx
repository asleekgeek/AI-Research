// §4.4.3: where the authorisation decision binds to the caller's identity and tenant, per path.
import { Arrow, Src, Tags } from './s04b-lib';

const S = '4.4.3';

interface Hop {
  name: any;
  note?: any;
  /** Where the paper puts the binding of identity and tenant on this path. */
  bind?: 'db' | 'app';
  bindNote?: any;
}

interface Path {
  id: string;
  title: string;
  tone: 'db' | 'app' | 'cond';
  hops: Hop[];
  weak: any;
  verdict: any;
  basis: any;
}

const PATHS: Path[] = [
  {
    id: 'A',
    title: 'Browser to PostgREST with a publishable key, verified grants and RLS',
    tone: 'db',
    hops: [
      { name: 'Browser', note: 'publishable key' },
      { name: 'PostgREST' },
      { name: 'Postgres', note: 'grants + RLS', bind: 'db', bindNote: <>sees the real <code>sub</code> and claims on every request</> },
    ],
    weak: (
      <>
        Policy-logic correctness (needs the tests in <a href="#s04-b3-test-matrix">4.4.4</a>); privileged side paths (security-definer RPC, non-invoker views, public buckets); no natural place for rate limiting, business validation or audit beyond <code>db-pre-request</code> hooks.
      </>
    ),
    verdict: <>The enforcement point is Postgres, which cannot be bypassed by the client. An internet-reachable API is inherent.</>,
    basis: (
      <>
        The hardening guide describes <code>db-pre-request</code> hooks for “rate limiting, extra API key checks, or blocking direct access to certain objects” (<Src sec={S} label="Supabase hardening guide" />)
      </>
    ),
  },
  {
    id: 'B1',
    title: "BFF forwarding the user's JWT",
    tone: 'db',
    hops: [
      { name: 'Browser' },
      { name: 'BFF', note: "forwards the user's JWT; adds rate limiting, audit, validation, composition" },
      { name: 'Postgres', note: 'RLS of the signed-in user', bind: 'db', bindNote: 'RLS remains the enforcement point' },
    ],
    weak: <>Compromise of the BFF yields only the current caller's rights unless the secret key is also exfiltrated.</>,
    verdict: <>This is the least-privilege BFF.</>,
    basis: (
      <>
        Edge Functions default to <code>verify_jwt = true</code>; <code>auth: 'user'</code> yields a client “scoped to the caller's Row Level Security (RLS) policies” (<Src sec={S} label="Supabase Edge Functions auth" />). “A secret key bypasses RLS only when the request carries no user access token” (<Src sec={S} label="Supabase RLS docs" />)
      </>
    ),
  },
  {
    id: 'B2',
    title: 'BFF with a secret key and no user token',
    tone: 'app',
    hops: [
      { name: 'Browser' },
      { name: 'BFF', note: 'secret key, no user token', bind: 'app', bindNote: 'tenant binding depends on every query carrying the right filter' },
      { name: 'Postgres', note: 'RLS removed from the path' },
    ],
    weak: (
      <>
        One missing <code>where org_id = ...</code> is a cross-tenant leak, and a BOLA on any endpoint exposes the whole database: the confused deputy the audit described.
      </>
    ),
    verdict: <>Strictly weaker than Path A unless the BFF's authorisation is itself verified by the same cross-tenant tests.</>,
    basis: (
      <>
        Supabase treats this as the exception: “<code>ctx.supabaseAdmin</code> bypasses Row Level Security, so filter by the caller's ID”; “Use <code>ctx.supabaseAdmin</code> only for work that has to cross those policies” (<Src sec={S} label="Supabase Edge Functions auth" nth={1} />)
      </>
    ),
  },
  {
    id: 'B3',
    title: 'BFF with a dedicated Postgres role over a direct connection',
    tone: 'cond',
    hops: [
      { name: 'Browser' },
      { name: 'BFF', note: 'dedicated role, direct connection' },
      {
        name: 'Postgres',
        note: 'grants and RLS designed explicitly',
        bind: 'db',
        bindNote: (
          <>
            per-request identity can be propagated with <code>SET LOCAL ROLE</code> and <code>set_config('request.jwt.claims', ...)</code> in a transaction
          </>
        ),
      },
    ],
    weak: (
      <>
        The role must not have <code>BYPASSRLS</code> and must not own the tables (owners bypass RLS unless <code>FORCE ROW LEVEL SECURITY</code>).
      </>
    ),
    verdict: <>The 30 October change does not apply; grants and RLS must be designed explicitly.</>,
    basis: (
      <>
        Identity propagation mirrors PostgREST (<Src sec={S} label="PostgreSQL ddl-rowsecurity" />)
      </>
    ),
  },
];

function Flow({ hops }: { hops: Hop[] }) {
  return (
    <ol class="pf">
      {hops.map((h, i) => (
        <li key={i} class={`pf-hop${h.bind ? ` is-bind bind-${h.bind}` : ''}`}>
          {i > 0 && <Arrow down />}
          <span class="pf-node">
            <strong>{h.name}</strong>
            {h.note && <span class="pf-note">{h.note}</span>}
          </span>
          {h.bind && (
            <span class="pf-bind">
              <span class="pf-bind-k">{h.bind === 'db' ? 'Binds here' : 'Binds in app code'}</span> {h.bindNote}
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

function PathCard({ p }: { p: Path }) {
  return (
    <article class={`s4b-path tone-${p.tone}`} aria-labelledby={`path-${p.id}`}>
      <header class="p-head">
        <span class="p-id" aria-hidden="true">
          {p.id}
        </span>
        <h3 id={`path-${p.id}`}>
          <span class="visually-hidden">Path {p.id}: </span>
          {p.title}
        </h3>
      </header>
      <Flow hops={p.hops} />
      <dl class="p-facts">
        <div>
          <dt>Weak where</dt>
          <dd>{p.weak}</dd>
        </div>
        <div class="p-verdict">
          <dt>
            Paper's verdict <Tags c={['INF']} />
          </dt>
          <dd>{p.verdict}</dd>
        </div>
      </dl>
      <details class="more">
        <summary>Documented basis</summary>
        <p class="small">
          {p.basis} <Tags c={['CP']} />
        </p>
      </details>
    </article>
  );
}

function Engines() {
  return (
    <div class="split s4b-engines">
      <section class="stack" aria-labelledby="tp-eng">
        <h2 id="tp-eng" class="h2">
          Authorisation engines are decision points, not enforcement points
        </h2>
        <div class="s4b-de" aria-hidden="true">
          <span class="de-box">
            <strong>Engine</strong>
            <span>Cedar · OPA · OpenFGA · Oso</span>
            <span class="de-k">decides</span>
          </span>
          <span class="de-link">
            <Arrow />
            <span>decision must reach the query</span>
          </span>
          <span class="de-box is-enf">
            <strong>Query predicate</strong>
            <span>in the BFF, on every request</span>
            <span class="de-k">enforces</span>
          </span>
        </div>
        <ul class="s4b-bullets small">
          <li>
            Cedar defaults to <code>Deny</code> (<Src sec={S} label="Cedar" />); OPA “decouples policy decision-making from policy enforcement” (<Src sec={S} label="OPA" />); Oso returns “a boolean, a list, or logic to run against your database” (<Src sec={S} label="Oso" />) <Tags c={['CP']} />
          </li>
          <li>
            In Path A they are irrelevant; in Path B their decision must be reflected in the query predicate, otherwise the engine approves while the secret-key query over-fetches <Tags c={['INF']} />
          </li>
        </ul>
      </section>
      <section class="stack" aria-labelledby="tp-owasp">
        <h3 id="tp-owasp" class="h3">
          The BFF's acceptance criteria, from the OWASP Authorization Cheat Sheet <Tags c={['CP']} />
        </h3>
        <ul class="s4b-checks">
          <li>Deny by default</li>
          <li>Validate on every request</li>
          <li>Never rely on client-side checks</li>
          <li>Log</li>
          <li>Test</li>
        </ul>
        <p class="small">
          <Src sec={S} label="OWASP">
            OWASP cheat sheet
          </Src>
        </p>
        <h3 class="h3">
          Governed low-code platforms implement Path B1/B3 by construction <Tags c={['CP']} />
        </h3>
        <ul class="s4b-bullets small">
          <li>
            Superblocks apps “never connect directly to business systems” (<Src sec={S} label="Superblocks" />)
          </li>
          <li>
            Retool permissions are per resource and group (<Src sec={S} label="Retool" />)
          </li>
          <li>
            ServiceNow Build Agent apps inherit ACLs (<Src sec={S} label="ServiceNow" />)
          </li>
        </ul>
      </section>
    </div>
  );
}

export function TrustBody() {
  return (
    <div class="stack-lg s4b">
      <p class="small muted">
        Four paths, each analysed by the authors <Tags c={['INF']} /> and grounded in vendor documentation <Tags c={['CP']} />. The highlighted hop is where that binding happens.
      </p>
      <div class="s4b-paths">
        {PATHS.map((p) => (
          <PathCard key={p.id} p={p} />
        ))}
      </div>
      <hr class="rule" />
      <Engines />
      <p class="s4b-caveat">
        No vendor publishes breach-outcome comparisons between direct-RLS and BFF architectures; this analysis is reasoning from documented semantics <Tags c={['INF']} />
      </p>
    </div>
  );
}
