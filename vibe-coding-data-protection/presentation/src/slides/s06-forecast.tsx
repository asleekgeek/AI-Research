// §6.1–6.2: Gartner's forecasts against its one survey; what the CSA recommends and leaves out;
// the three organisations that publish their own practice.
import { FigTile } from '../components/Figure';
import { Chip } from '../components/Chip';
import { Src } from './s06-util';

const ORGS = [
  {
    name: 'Method',
    kind: 'Fintech',
    date: '21 Apr 2026',
    has: 'methodfi',
    quote: 'the same access controls and data handling restrictions as any other internal service',
    lead: 'Chat-generated apps get',
    practice: [
      'Secret values in a secret manager; secret scanning on every commit',
      'Non-root, read-only root filesystem, capabilities dropped; egress limited to DNS and HTTPS',
      'Deployment blocked on critical vulnerabilities; three review layers (scanners, AI PR review, human approval)',
      'PR-scoped previews on the private network, deleted when the PR closes',
    ],
    note: 'Outcomes are qualitative only.',
  },
  {
    name: 'Tenable',
    kind: '',
    date: '6 Oct 2026',
    has: 'tenable.com',
    quote: 'Governance works better than blanket bans, because prohibiting AI-aided development usually causes employees to keep their app development activities hidden',
    lead: '',
    practice: [
      'A five-tier model from Executive Staff through an AI Governance Board, AI Functional Leads, an enablement working group and community channels',
      '“Tenable has tied AI tool access directly to mandatory security training”',
    ],
    note: 'Records the costs: volume “can become overwhelming and disruptive for the IT and security teams”, token spend, “siloed data lakes”.',
  },
  {
    name: 'EXANTE',
    kind: 'Regulated brokerage',
    date: '27 Feb 2026',
    has: 'financemagnates',
    quote: 'proper, governed internal APIs ... Not direct database access',
    lead: '',
    practice: ['Managed environments', '“We insist that all vibe-coded work goes into version control”', 'Sharing and discovery'],
    note: 'On metrics: “We’re working on it”.',
  },
];

const CONVERGE = ['Governed APIs over direct data access', 'A managed runtime', 'Version control', 'Review before production', 'Training tied to access'];

export function ForecastVsObservation() {
  return (
    <div class="stack-lg">
      <section class="stack" aria-labelledby="s6f-g">
        <h2 id="s6f-g" class="eyebrow">Gartner: what is forecast, what is observed</h2>
        <div class="s6-fvo">
          <div class="s6-fvo-col stack">
            <div class="s6-fvo-kind">
              <span class="s6-fvo-word">Forecast</span>
              <span class="small muted">Strategic Planning Assumptions</span>
            </div>
            <FigTile n={36} />
            <p class="small">
              Visible only on a <Src id="6.1" has="tray.ai">vendor reprint page</Src>, as are the two-layer model (“development controls”, “pre-deployment validation”) and the agent safeguards <Chip code="PO" />. They are forecasts with no sample, method or baseline <Chip code="INF" />.
            </p>
          </div>
          <div class="s6-fvo-vs" aria-hidden="true">
            <span>not the same kind of evidence</span>
          </div>
          <div class="s6-fvo-col stack">
            <div class="s6-fvo-kind">
              <span class="s6-fvo-word">Observation</span>
              <span class="small muted">Gartner's one relevant survey</span>
            </div>
            <FigTile n={35} />
            <p class="small">
              Surveyed Mar–May 2025; respondents “suspect or have evidence that employees are using prohibited public GenAI” <Chip code="CP" />.
            </p>
          </div>
        </div>
        <div class="grid-2 s6-abstracts">
          <figure class="s6-abstract">
            <blockquote class="quote">
              The shift “raises security, compliance, and governance risks”; leaders should “enable and govern vibe coding effectively”.
              <cite>
                <Src id="6.1" has="8068765">
                  Govern Vibe Coding for Citizen Developers With Self-Service Platforms
                </Src>{' '}
                · ID 8068765 · 29 Jun 2026 · public abstract, no numbers <Chip code="CP" />
              </cite>
            </blockquote>
          </figure>
          <figure class="s6-abstract">
            <blockquote class="quote">
              “Ungoverned vibe coding creates unmanaged risk, bypassing existing security and governance controls”
              <cite>
                <Src id="6.1" has="8207229">
                  How to Govern Vibe Coding
                </Src>{' '}
                · ID 8207229 · 31 Jul 2026 · public abstract <Chip code="CP" />
              </cite>
            </blockquote>
          </figure>
        </div>
        <p class="small muted">Gartner has published at least three paywalled vibe-coding governance notes; the two above are quoted from their public abstracts.</p>
      </section>

      <hr class="rule" />

      <section class="stack" aria-labelledby="s6f-c">
        <h2 id="s6f-c" class="eyebrow">The CSA's governance-gap note: awareness, not gatekeeping</h2>
        <div class="split s6-csa">
          <figure class="stack" style={{ margin: 0 }}>
            <blockquote class="quote s6-bigquote">
              “a lightweight registration process—deliberately not a heavyweight review process at this stage” … “The goal of this initial step is awareness, not gatekeeping”
            </blockquote>
            <p class="small muted">
              <Src id="6.1" has="cloudsecurityalliance.org/research">
                CSA, The Vibe Coding Governance Gap
              </Src>
              , 2 Jun 2026 <Chip code="CP" />
            </p>
          </figure>
          <div class="grid-2 s6-csa-lists">
            <div class="stack">
              <h3 class="h3">What the note says</h3>
              <ul class="s6-ticks">
                <li>
                  Pair registration with monitoring for unregistered apps and “non-punitive framing” <Chip code="CP" />
                </li>
                <li>
                  Three review categories “warrant different levels of security review”: internal tools with non-sensitive data; apps processing PII or regulated data; apps incorporating AI API calls or agentic functionality <Chip code="CP" />
                </li>
                <li>
                  No major AI security framework (NIST AI RMF, OWASP LLM Top 10, CSA's own AICM) defines a citizen-developer role <Chip code="CP" />
                </li>
              </ul>
            </div>
            <div class="stack">
              <h3 class="h3">What it leaves out</h3>
              <ul class="s6-gaps">
                <li>
                  Control lists, owners, exceptions or kill-switch logic for the three categories <Chip code="CP" />
                </li>
                <li>
                  Amnesty programmes, kill switches, lifecycle management <Chip code="CP" />
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p class="small muted">
          Its statistics are inherited: “56% of employees use unauthorized AI tools ... only 23% use IT-governed alternatives” reaches it from IDC via Vectra AI, with no N, population or period located <Chip code="PO" />.
        </p>
        <p class="small">
          The CSA's separate{' '}
          <Src id="6.1" has="CSA_research_note_shadow">
            shadow-AI note
          </Src>{' '}
          (30 May 2026, “generated with AI assistance”, not through official review) frames governance as “redirection of productive behavior into monitored channels, not prohibition of it” and calls inventory gaps “the primary governance metric” <Chip code="CP" />. The T0–T3 tier model is therefore the authors' synthesis on a CSA skeleton <Chip code="PROP" /> (<a href="#s08-tiers">§8 tiers</a>).
        </p>
      </section>

      <hr class="rule" />

      <section class="stack" aria-labelledby="s6f-o">
        <h2 id="s6f-o" class="eyebrow">Organisations that publish their own practice: a bounded statement</h2>
        <p class="lead s6-bounded">
          Of about 40 sources reviewed in October 2026, <strong>three</strong> organisations describe their own vibe-coding governance in the first person. None is a bank, telco, public body or EU-headquartered large enterprise, and none publishes an approval SLA, registry schema, expiry rule or outcome metric <Chip code="CP" />.
        </p>
        <div class="grid-3 s6-orgs">
          {ORGS.map((o) => (
            <article class="card s6-org" key={o.name}>
              <header class="s6-org-head">
                <h3 class="s6-org-name">{o.name}</h3>
                <span class="eyebrow">{o.kind ? `${o.kind} · ${o.date}` : o.date}</span>
              </header>
              <p class="s6-org-quote">
                {o.lead ? `${o.lead} ` : ''}“{o.quote}”
              </p>
              <ul class="s6-org-list small">
                {o.practice.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <p class="small muted">{o.note}</p>
              <p class="s6-org-foot small">
                <Chip code="CP" />{' '}
                <Src id="6.2" has={o.has}>
                  {o.name === 'EXANTE' ? 'Finance Magnates' : o.name}
                </Src>
              </p>
            </article>
          ))}
        </div>
        <div class="s6-converge">
          <span class="eyebrow">All three converge on</span>
          <ul class="s6-converge-list">
            {CONVERGE.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
        <p class="s6-caution">
          That supports the direction of the paved-road thesis, but it is <strong>three self-reports, not comparative evidence</strong> <Chip code="INF" />.
        </p>
      </section>
    </div>
  );
}
