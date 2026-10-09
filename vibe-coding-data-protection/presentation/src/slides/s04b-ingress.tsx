// §4.3 Boundary B2: what an identity-aware proxy covers, and what it leaves reachable.
import { controls, verdictClass } from '../lib/data';
import { FigTile } from '../components/Figure';
import { Verdict } from '../components/Verdict';
import { IconShield } from '../components/Icons';
import { Arrow, Part, Src, Tags } from './s04b-lib';

/** A control's verdict exactly as appendix (c) / controls-by-boundary.json states it. */
function ControlVerdict({ starts }: { starts: string }) {
  const c = controls.find((x) => x.control.startsWith(starts));
  if (!c) throw new Error(`No control "${starts}"`);
  return (
    <span class="s4b-cv">
      <Verdict kind={verdictClass(c.verdict)}>{c.verdict}</Verdict> <Tags c={c.confidence_codes.filter((x, i, a) => a.indexOf(x) === i)} />
      <span class="small muted"> {c.bypass_limitation}</span>
    </span>
  );
}

function PathDiagram() {
  return (
    <figure class="viz s4b-ig-wrap">
      <div class="s4b-ig">
        <div class="ig-node ig-vis">
          <strong>Any visitor</strong>
          <span>on the internet, reaching three entry points</span>
        </div>

        <span class="ig-a1">
          <Arrow />
        </span>
        <div class="ig-node ig-e1">
          <span class="ig-n">1</span>
          <strong>Custom domain</strong>
          <span>the one hostname the proxy fronts</span>
        </div>
        <span class="ig-b1">
          <Arrow />
        </span>
        <div class="ig-node ig-px">
          <IconShield />
          <strong>Identity-aware proxy</strong>
          <span>IdP on every request to the hostname</span>
        </div>
        <span class="ig-c1">
          <Arrow />
        </span>
        <div class="ig-node ig-org">
          <strong>App origin</strong>
          <span>the proxy depends on it validating a signed assertion, or being unreachable except through the proxy</span>
        </div>

        <span class="ig-a2">
          <Arrow open />
        </span>
        <div class="ig-node ig-e2">
          <span class="ig-n">2</span>
          <strong>Platform subdomain and previews</strong>
          <span>
            for example <code>*.vercel.app</code>
          </span>
        </div>
        <div class="ig-skip ig-s2">
          <span>no proxy on this path</span>
        </div>

        <span class="ig-a3">
          <Arrow open />
        </span>
        <div class="ig-node ig-e3">
          <span class="ig-n">3</span>
          <strong>Direct BaaS endpoint</strong>
          <span>the data API the browser calls itself</span>
        </div>
        <div class="ig-skip ig-s3">
          <span>no proxy on this path</span>
        </div>
        <div class="ig-node ig-db">
          <strong>Database</strong>
          <span>boundary B3 controls: grants, RLS, column privileges</span>
        </div>
      </div>
      <figcaption>Request paths to an app on a platform subdomain with an identity-aware proxy on its custom domain. Dashed paths never pass through the proxy.</figcaption>
    </figure>
  );
}

function Requirement() {
  return (
    <section class="stack" aria-labelledby="b2-req">
      <h2 id="b2-req" class="h3">
        The requirement is therefore three-part <Tags c={['INF']} />
      </h2>
      <ol class="s4b-req">
        <li>
          <span class="ig-n" aria-hidden="true">
            1
          </span>
          <div class="stack" style={{ gap: '6px' }}>
            <strong>IAP on the custom domain, with origin validation</strong>
            <ControlVerdict starts="Identity-aware proxy" />
          </div>
        </li>
        <li>
          <span class="ig-n" aria-hidden="true">
            2
          </span>
          <div class="stack" style={{ gap: '6px' }}>
            <strong>Platform-level protection on the platform subdomain and previews</strong>
            <span class="small">
              Vercel's own docs say <code>*.vercel.app</code> URLs stay public unless Deployment Protection covers “All Deployments” (<Src sec="4.3.1" label="Vercel KB" />) <Tags c={['CP']} />
            </span>
          </div>
        </li>
        <li>
          <span class="ig-n" aria-hidden="true">
            3
          </span>
          <div class="stack" style={{ gap: '6px' }}>
            <strong>Boundary B3 controls on the data path</strong>
            <span class="small">
              Grants, RLS and column privileges in the database: <a href="#s04-b3-gates">the four gates</a>.
            </span>
          </div>
        </li>
      </ol>
    </section>
  );
}

function ProxyQuotes() {
  return (
    <section class="stack-lg" aria-labelledby="b2-iap">
      <Part n="4.3.1" id="b2-iap" title="Every mainstream proxy depends on the origin">
        <p class="small muted">
          All four mainstream IAPs depend on the origin being unreachable except through the proxy, or on the origin validating a signed assertion.
        </p>
      </Part>
      <div class="grid-4 s4b-quotes">
        <article class="s4b-q">
          <h3 class="eyebrow">Cloudflare Access</h3>
          <p>
            “To secure your origin, you must validate the application token issued by Cloudflare Access”; publicly routable origins must protect the origin IP by other means.
          </p>
          <p class="s4b-q-foot">
            <Tags c={['CP']} /> <Src sec="4.3.1" label="Cloudflare" />
          </p>
        </article>
        <article class="s4b-q">
          <h3 class="eyebrow">Google IAP</h3>
          <p>
            Apps must “use signed headers”; on Compute Engine or GKE anyone reaching the serving port bypasses IAP; on Cloud Run the auto-assigned <code>run.app</code> URL “might be directly accessible” unless disabled or ingress-restricted.
          </p>
          <p class="s4b-q-foot">
            <Tags c={['CP']} /> <Src sec="4.3.1" label="Google IAP" />
          </p>
        </article>
        <article class="s4b-q">
          <h3 class="eyebrow">Entra Application Proxy</h3>
          <p>
            “Passthrough preauthentication doesn't trigger Microsoft Entra authentication, so Conditional Access Policies can't be enforced”; P1/P2 licence required.
          </p>
          <p class="s4b-q-foot">
            <Tags c={['CP']} /> <Src sec="4.3.1" label="Entra app proxy FAQ" />
          </p>
        </article>
        <article class="s4b-q">
          <h3 class="eyebrow">Zscaler ZPA</h3>
          <p>App Connectors “do not accept inbound connections”.</p>
          <p class="s4b-q-foot">
            <Tags c={['CP']} /> <Src sec="4.3.1" label="Zscaler" />
          </p>
        </article>
      </div>
    </section>
  );
}

function Weak() {
  return (
    <div class="grid-2 s4b-weak">
      <section class="stack" aria-labelledby="b2-pw">
        <Part n="4.3.2" id="b2-pw" title="A password is a shared secret, not an identity" />
        <ControlVerdict starts="Password protection" />
        <div class="s4b-pw">
          <FigTile n={42} compact />
          <ul class="s4b-bullets small">
            <li>
              Password protection is a shared secret with no per-user revocation; on Vercel it is included on Enterprise (<Src sec="4.3.2" label="Vercel Deployment Protection" />) <Tags c={['CP']} />
            </li>
            <li>
              Replit documents it as “different from private access tied to an authenticated identity” (<Src sec="4.3.2" label="Replit" />) <Tags c={['CP']} />
            </li>
            <li>
              Vercel Shareable Links and the automation bypass header are documented bypasses of Vercel Authentication <Tags c={['CP']} />
            </li>
          </ul>
        </div>
      </section>
      <section class="stack" aria-labelledby="b2-funnel">
        <Part n="4.3.3" id="b2-funnel" title="Tailscale Funnel is an anti-pattern" />
        <ControlVerdict starts="Tailscale Funnel" />
        <blockquote class="quote">
          “Anyone with the Funnel URL can reach the shared resource”
          <cite>
            Funnel exposes a local service to the public internet; no visitor sign-in is described. <Src sec="4.3.3" label="Tailscale Funnel" /> <Tags c={['CP']} />
          </cite>
        </blockquote>
        <blockquote class="quote">
          “Enabling Funnel through the CLI adds a default that lets all autogroup:member users use it”
          <cite>
            <Src sec="4.3.3" label="Tailscale Funnel" /> <Tags c={['CP']} />
          </cite>
        </blockquote>
        <p class="small muted">Serve is the tailnet-only equivalent.</p>
      </section>
    </div>
  );
}

export function IngressBody() {
  return (
    <div class="stack-lg s4b">
      <PathDiagram />
      <Requirement />
      <hr class="rule" />
      <ProxyQuotes />
      <hr class="rule" />
      <Weak />
    </div>
  );
}
