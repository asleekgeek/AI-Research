// §4.4.5 the same failure class on other BaaS; §4.4.6 what each secret-scanning control actually scans.
import { FigTile } from '../components/Figure';
import { Arrow, Part, Src, Tags } from './s04b-lib';

const S5 = '4.4.5';
const S6 = '4.4.6';

function OtherBaas() {
  return (
    <section class="stack-lg" aria-labelledby="ob-baas">
      <Part n="4.4.5" id="ob-baas" title="The same failure class on other BaaS" />
      <div class="grid-4 s4b-baas">
        <article class="s4b-bx">
          <h3 class="bx-name">Firestore</h3>
          <span class="bx-posture is-mixed">Test mode open · production mode locked</span>
          <p class="small">
            Test mode “allows anyone to read and overwrite your data”; production mode denies all client reads and writes while server SDKs “bypass all Cloud Firestore Security Rules”; rules “are not filters—queries are all or nothing”; the allow-all ruleset carries the warning “NEVER use this rule set in production” <Tags c={['CP']} />
          </p>
          <p class="small">
            App Check “prevents some, but not all, abuse vectors” and is complementary to Authentication and rules, not a substitute <Tags c={['CP']} />
          </p>
          <p class="bx-src small">
            <Src sec={S5} label="Firestore quickstart" /> · <Src sec={S5} label="Firestore security" /> · <Src sec={S5} label="rules and queries" /> · <Src sec={S5} label="Firebase App Check" />
          </p>
        </article>
        <article class="s4b-bx">
          <h3 class="bx-name">Neon Data API</h3>
          <span class="bx-posture is-open">No permission layer of its own</span>
          <p class="small">
            Neon's Data API “has no permission layer of its own”; its “Grant public schema access” option runs <code>ALTER DEFAULT PRIVILEGES</code> so future tables are auto-granted to <code>authenticated</code>: the pre-30-October Supabase posture, restricted to logged-in users <Tags c={['CP', 'INF']} />
          </p>
          <p class="bx-src small">
            <Src sec={S5} label="Neon Data API" />
          </p>
        </article>
        <article class="s4b-bx">
          <h3 class="bx-name">Convex</h3>
          <span class="bx-posture is-open">Functions public by default</span>
          <p class="small">
            No declarative row filter: “By default your Convex functions are public”, and only internal functions are shielded, so the behavioural cross-tenant test is the only test available <Tags c={['CP', 'INF']} />
          </p>
          <p class="bx-src small">
            <Src sec={S5} label="Convex" />
          </p>
        </article>
        <article class="s4b-bx">
          <h3 class="bx-name">PocketBase and Appwrite</h3>
          <span class="bx-posture is-locked">Locked by default</span>
          <p class="small">
            Their characteristic vibe-coding failure is generated code setting <code>""</code> rules or <code>Role.any()</code> to make a demo work <Tags c={['CP', 'INF']} />
          </p>
          <p class="bx-src small">
            <Src sec={S5} label="PocketBase" /> · <Src sec={S5} label="Appwrite" />
          </p>
        </article>
      </div>
    </section>
  );
}

function ScanDiagram() {
  return (
    <figure class="viz s4b-scan-wrap">
      <div class="s4b-scan">
        <div class="sc-stage sc-s1">
          <span class="eyebrow">Source</span>
          <strong>Repository</strong>
          <span class="sc-token is-key">hard-coded secret key</span>
        </div>
        <span class="sc-a sc-a1">
          <Arrow />
        </span>
        <div class="sc-stage sc-s2">
          <span class="eyebrow">Build</span>
          <strong>Framework inlines prefixed variables</strong>
          <span class="sc-token is-env">
            <code>NEXT_PUBLIC_</code> · <code>VITE_*</code>
          </span>
        </div>
        <span class="sc-a sc-a2">
          <Arrow />
        </span>
        <div class="sc-stage sc-s3">
          <span class="eyebrow">Build output</span>
          <strong>The browser bundle</strong>
          <span class="sc-token is-env">
            <code>dist/</code> · <code>.next/static</code>
          </span>
        </div>

        <div class="sc-scan sc-r1">
          <strong>Repository scanners</strong>
          <span class="small muted">gitleaks, TruffleHog, GitHub secret scanning</span>
          <span class="sc-yes">catch a hard-coded secret key</span>
          <span class="sc-no">miss an environment variable a build inlines</span>
        </div>
        <div class="sc-scan sc-r3">
          <strong>Build-output scanning</strong>
          <span class="sc-yes">the only check that catches the prefixed-variable leak</span>
          <span class="small">
            Netlify smart detection “scans for potential secrets in your repository code and build output” and fails the build, on Personal, Pro and Enterprise plans (<Src sec={S6} label="Netlify secret scanning" />) <Tags c={['CP']} />
          </span>
          <span class="small">
            Elsewhere, a post-build grep of <code>dist/</code> or <code>.next/static</code>, safelisting <code>sb_publishable_</code> and failing on <code>sb_secret_</code> or a legacy service-role JWT <Tags c={['PROP']} />
          </span>
        </div>
      </div>
      <figcaption>
        The decisive distinction for CI gating is what is scanned <Tags c={['INF']} />. Framework prefixes inline values into the browser bundle by design: Next.js “inline[s]” <code>NEXT_PUBLIC_</code> values at build time; Vite says <code>VITE_*</code> variables “should not contain sensitive information such as API keys” (<Src sec={S6} label="Next.js" />; <Src sec={S6} label="Vite" />) <Tags c={['CP']} />
      </figcaption>
    </figure>
  );
}

function PushProtection() {
  return (
    <div class="split s4b-push">
      <div class="stack">
        <FigTile n={44} compact />
        <p class="small">
          Vercel's Protected Source Maps (default for new projects since 14 May 2026; existing projects opt in) gate <code>.map</code> files behind Vercel Authentication, which protects code logic, not a <code>NEXT_PUBLIC_</code> value that sits in the minified bundle itself (<Src sec={S6} label="Vercel changelog" />) <Tags c={['CP', 'INF']} />
        </p>
      </div>
      <ul class="s4b-bullets">
        <li>
          GitHub push protection for repositories “Is disabled by default” and requires paid Secret Protection; user-level protection covers public repositories only; by default anyone with write access can bypass with a reason (<Src sec={S6} label="GitHub push protection" />; <Src sec={S6} label="GitHub pricing" />) <Tags c={['CP']} />
        </li>
        <li>
          GitHub added <code>supabase_oauth_access_token</code>, <code>supabase_scoped_personal_access_token</code> and <code>lovable_api_key</code> detectors on 5 October 2026; push-protection support for these is not stated (<Src sec={S6} label="GitHub changelog" />) <Tags c={['CP']} />
        </li>
        <li>
          Supabase auto-revokes secret keys found in public GitHub, post-commit; push protection was “planned, 2026” (<Src sec={S6} label="Supabase Security Retro 2025" />) <Tags c={['CP']} />
        </li>
        <li>
          gitleaks is “feature complete” with security patches only (<Src sec={S6} label="gitleaks" />) <Tags c={['CP']} />; TruffleHog verifies over 700 detector types against live APIs (<Src sec={S6} label="trufflehog" />) <Tags c={['CP']} />; neither README lists Supabase formats (gap).
        </li>
      </ul>
    </div>
  );
}

export function OtherBody() {
  return (
    <div class="stack-lg s4b">
      <OtherBaas />
      <hr class="rule" />
      <section class="stack-lg" aria-labelledby="ob-scan">
        <Part n="4.4.6" id="ob-scan" title="Bundle secrets: what each control actually scans" />
        <ScanDiagram />
        <PushProtection />
      </section>
    </div>
  );
}
