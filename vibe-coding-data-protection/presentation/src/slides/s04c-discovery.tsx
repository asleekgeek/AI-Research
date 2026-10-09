// s04-discovery: paper §4.6. The certificate panel shows only what the paper's own probes recorded.
import { Bars } from '../components/Bars';
import { Chip } from '../components/Chip';
import { FigTile } from '../components/Figure';
import type { BarSpec } from '../lib/charts';
import { Q, Src, Srcs } from './s04c-parts';

interface Zone {
  zone: string;
  presented?: any;
  issuer?: string;
  hosts: string[];
  hostsNote?: string;
}

/** Direct TLS probes, 9 October 2026, as reported in paper §4.6.1 [CP] (own verification). */
const ZONES: Zone[] = [
  {
    zone: '*.lovable.app',
    presented: (
      <>
        <code>CN=lovable.app</code>, SAN <code>*.lovable.app</code>
      </>
    ),
    issuer: 'Google Trust Services',
    hosts: ['nonexistent-probe-xyz123.lovable.app'],
  },
  {
    zone: '*.replit.app',
    presented: (
      <>
        <code>replit.app</code> presented <code>*.replit.app</code>
      </>
    ),
    hosts: [],
  },
  {
    zone: '*.vercel.app',
    hosts: ['next-blog-starter.vercel.app', 'nextjs-dashboard.vercel.app', 'v0-portfolio.vercel.app'],
    hostsNote: 'HTTP 200',
  },
  {
    zone: '*.netlify.app',
    presented: (
      <>
        <code>*.netlify.app, O=Netlify, Inc</code>
      </>
    ),
    issuer: 'DigiCert',
    hosts: ['docs-example.netlify.app'],
  },
  {
    zone: '*.base44.app',
    issuer: "Let's Encrypt",
    hosts: [],
  },
];

function Certificates() {
  return (
    <figure class="dsc-fig">
      <ul class="dsc-certs" aria-label="One wildcard certificate per platform zone">
        {ZONES.map((z) => (
          <li class="dsc-cert" key={z.zone}>
            <span class="eyebrow">One certificate</span>
            <code class="dsc-zone">{z.zone}</code>
            {z.presented && <span class="dsc-presented">{z.presented}</span>}
            {z.issuer && <span class="dsc-issuer">Issuer: {z.issuer}</span>}
            {z.hosts.length > 0 && (
              <div class="dsc-covered">
                <span class="dsc-covered-label">Covered{z.hostsNote ? ` (${z.hostsNote})` : ''}</span>
                <ul class="dsc-hosts" aria-label={`Probed hosts covered by ${z.zone}`}>
                  {z.hosts.map((h) => (
                    <li key={h}>
                      <code>{h}</code>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
      <div class="dsc-ct" role="group" aria-label="What a Certificate Transparency log records">
        <span class="dsc-ct-label">Certificate Transparency log</span>
        <div class="dsc-ct-rows">
          <div class="dsc-ct-row is-seen">
            <span class="dsc-ct-key">Sees only</span>
            <span class="dsc-ct-val">
              {ZONES.map((z) => (
                <code key={z.zone}>{z.zone}</code>
              ))}
            </span>
          </div>
          <div class="dsc-ct-row is-unseen">
            <span class="dsc-ct-key">Never records</span>
            <span class="dsc-ct-val">the per-app hostname on a platform subdomain</span>
          </div>
          <div class="dsc-ct-row is-seen">
            <span class="dsc-ct-key">Does record</span>
            <span class="dsc-ct-val is-text">
              custom domains, which get per-domain certificates: Vercel <Q>will automatically try to generate a certificate for every domain once it is added to a project</Q> <Chip code="CP" />{' '}
              <Src s="4.6.1" t="Vercel SSL" />
            </span>
          </div>
        </div>
      </div>
      <figcaption class="small">
        Direct TLS probes on 9 October 2026: all five platform subdomains are served under a single wildcard certificate, live apps included <Chip code="CP" /> (own verification). Per-app hostnames on
        platform subdomains therefore never appear in Certificate Transparency logs.
      </figcaption>
    </figure>
  );
}

const YIELD: BarSpec[] = [
  { n: 8, label: 'Search dorking', value: 58.2, display: '58.2%' },
  { n: 8, label: 'Common Crawl', value: 23.1, display: '23.1%' },
  { n: 8, label: 'DNS brute-force', value: 13.7, display: '13.7%' },
  { n: 8, label: 'crt.sh (Certificate Transparency)', value: 4.8, display: '4.8%', tone: 'alt' },
];

function Yield() {
  return (
    <div class="stack">
      <h3 class="h3">Symbiotic's own pipeline corroborates the blind spot</h3>
      <Bars
        specs={YIELD}
        max={100}
        unit="%"
        caption={<>Share of the 1,085 confirmed sites each source found; crt.sh produced 52 of them, against dorking 632, Common Crawl 251 and DNS brute-force 149.</>}
      />
    </div>
  );
}

function Attribution() {
  return (
    <div class="stack">
      <h3 class="h3">Attribution must come from content, not certificates</h3>
      <p class="small">
        Platform subdomains share one certificate and one IP pool, so EASM products that attribute by certificate names or netblocks (Censys's discovery paths, Defender EASM seeds) cannot attribute
        these apps to a customer. Attribution must come from content (brand tokens, logos, corporate email domains), HTML/JS fingerprints (Escape used Shodan this way), search indexes and Common
        Crawl, or inside signals <Chip code="CP" />/<Chip code="INF" />
      </p>
      <p class="small muted">
        Sources: <Srcs s="4.6.1" ts={['Symbiotic', 'Censys ASM', 'Defender EASM', 'Escape methodology']} />
      </p>
    </div>
  );
}

const STEPS: { name: string; when?: string; body: any }[] = [
  {
    name: 'Inside the sanctioned tenants',
    when: 'day 1, no cost',
    body: (
      <>
        Export Lovable Security insights filtered to <Q>Externally published</Q> and <Q>no owner</Q>; Power Platform Inventory CSV or API; Replit team Deployments; Vercel and Netlify project lists
        with protection settings, remembering team defaults do not retro-apply <Chip code="CP" />
      </>
    ),
  },
  {
    name: 'Identity and email signals',
    when: 'days 1–7',
    body: (
      <>
        IdP sign-in and OAuth consent logs for builder domains; email-metadata scanning of vendor welcome and billing mails recovers historical sign-ups <Chip code="VR" />; expense-feed and
        unfederated-access detection <Chip code="VR" />; corporate-card and corporate-email registration checks <Chip code="PO" />
      </>
    ),
  },
  {
    name: 'SSE/CASB/browser telemetry',
    when: 'days 1–14',
    body: (
      <>
        SWG and CASB logs for builder consoles and the five platform zones, using the GenAI app-type categories in Cloudflare Gateway, Netskope CCI and Defender for Cloud Apps <Chip code="CP" />;
        access logs show platform use, not what was deployed <Chip code="PO" />. No vendor documentation confirms that published-app domains are catalogued as distinct apps (gap).
      </>
    ),
  },
  {
    name: 'Outside-in enumeration',
    when: 'weeks 1–3',
    body: (
      <>
        Search dorking with brand tokens restricted to the five platform zones, Common Crawl index queries, DNS brute-force of brand tokens under platform zones, GitHub code search, urlscan.io,
        Wayback; Shodan/Censys HTML fingerprint searches; CT monitoring <strong>only</strong> for the corporate domain, known custom domains and Lovable branded URLs <Chip code="VR" />/
        <Chip code="CP" />
      </>
    ),
  },
  {
    name: 'Passive triage',
    when: 'continuous',
    body: (
      <>
        Fetch the bundle, look for <code>*.supabase.co</code> URLs and key formats, attempt an anonymous read only <Chip code="VR" />.{' '}
        <strong>Write and delete probes must not be run against assets the company does not own</strong> <Chip code="INF" />
      </>
    ),
  },
  {
    name: 'Register, gate, repeat',
    body: (
      <>
        Move finds into the sanctioned tenant with team defaults set (Vercel <Q>All Deployments</Q>, Replit <Q>Require</Q>, Lovable <Q>Workspace</Q>, Base44 Apps SSO); put custom-domain apps behind
        an IdP gate with origin validation <Chip code="CP" />
      </>
    ),
  },
];

function Pipeline() {
  return (
    <div class="stack">
      <p class="small">
        Six steps, each tied to documented sources <Chip code="PROP" />. The order runs from the sanctioned tenants outward.
      </p>
      <ol class="steps dsc-steps">
        {STEPS.map((s) => (
          <li key={s.name}>
            <div class="dsc-step">
              <div class="dsc-step-head">
                <strong class="dsc-step-name">{s.name}</strong>
                {s.when && <span class="dsc-when">{s.when}</span>}
              </div>
              <p class="small">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <p class="small muted">
        Step sources: <Srcs s="4.6.2" ts={['Nudge Security', 'Torii, vendor comparison', 'TechTarget', 'Cloudflare', 'Netskope CCI', 'VentureBeat']} />
      </p>
    </div>
  );
}

function Costs() {
  return (
    <div class="split dsc-costs">
      <FigTile n={43} />
      <div class="stack">
        <ul class="b4-ticks">
          <li>Vercel Authentication on All Deployments: free</li>
          <li>Netlify Pro: USD 20/month</li>
          <li>Lovable Business: about USD 50/month (third-party, July 2026)</li>
          <li>Replit Core USD 20, Pro USD 100, Enterprise USD 10,000–200,000 annual commitment</li>
          <li>Power Apps Premium: USD 20/user/month</li>
        </ul>
        <p class="small">
          <Chip code="CP" />/<Chip code="PO" /> <Srcs s="4.6.2" ts={['Replit pricing', 'Replit Enterprise', 'Netlify pricing']} />
        </p>
        <p class="small">
          crt.sh, Common Crawl and search operators are free; no published, independently evaluated accuracy figures exist for any dedicated vibe-app scanner <Chip code="INF" />
        </p>
      </div>
    </div>
  );
}

export function Discovery() {
  return (
    <div class="stack-lg b4">
      <section class="b4-block" aria-labelledby="dsc-cert">
        <header class="b4-block-head">
          <span class="eyebrow">§4.6.1 · verified finding</span>
          <h2 id="dsc-cert" class="h2">
            One wildcard certificate per platform zone
          </h2>
        </header>
        <Certificates />
        <div class="split dsc-evidence">
          <Yield />
          <Attribution />
        </div>
      </section>
      <section class="b4-block" aria-labelledby="dsc-pipe">
        <header class="b4-block-head">
          <span class="eyebrow">§4.6.2 · authors' proposal</span>
          <h2 id="dsc-pipe" class="h2">
            The pipeline, from inside the tenant outward
          </h2>
        </header>
        <Pipeline />
      </section>
      <section class="b4-block" aria-labelledby="dsc-cost">
        <header class="b4-block-head">
          <span class="eyebrow">Cost anchors</span>
          <h2 id="dsc-cost" class="h2">
            What the tooling costs
          </h2>
        </header>
        <Costs />
      </section>
    </div>
  );
}
