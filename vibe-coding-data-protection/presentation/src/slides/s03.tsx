import type { SlideDef } from './types';
import { Chip } from '../components/Chip';
import { Bars } from '../components/Bars';
import { FigRef } from '../components/Figure';
import { PaperTable } from '../components/PaperTable';
import { Cite } from '../components/Figure';
import { IncidentTimeline } from './s03-timeline';
import './s03.css';

function FailureModes() {
  return (
    <div class="stack-lg">
      <div class="fm-grid">
        <section class="fm" aria-labelledby="fm1">
          <span class="fm-id">FM1</span>
          <h2 id="fm1" class="fm-name">Broken authorisation on an internet-reachable data API</h2>
          <p>
            The browser holds an intentionally public key and talks to PostgREST, Firebase or an equivalent. Exposure is decided by grants, RLS, column privileges, view and function ownership, and the logic of each policy.
          </p>
          <p class="fm-key">
            The key is not the defect; in every incident of this class the primary source says so <Chip code="CP" />
          </p>
          <ul class="fm-defects">
            <li>No RLS</li>
            <li>
              RLS with a permissive <code>USING (true)</code> policy
            </li>
            <li>
              <code>TO authenticated</code> with no tenant predicate: authentication without authorisation
            </li>
            <li>
              Inverted logic: the guard "blocks the people it should allow and allows the people it should block" <Chip code="PO" />
            </li>
            <li>
              <code>SECURITY DEFINER</code> functions or owner-privileged views that bypass RLS silently <Chip code="CP" />
            </li>
          </ul>
        </section>
        <section class="fm" aria-labelledby="fm2">
          <span class="fm-id">FM2</span>
          <h2 id="fm2" class="fm-name">Public&#8209;by&#8209;default publishing</h2>
          <p>
            Not a code defect. The platform publishes to the open internet unless the builder changes a setting; the app is indexed; nobody in the organisation knows it exists.
          </p>
          <p class="fm-key">
            The vendors' reply, "a public app is not a breach", is technically correct and is the point <Chip code="PO" />
          </p>
        </section>
        <section class="fm" aria-labelledby="fm3">
          <span class="fm-id">FM3</span>
          <h2 id="fm3" class="fm-name">Platform-side authorisation bugs</h2>
          <p>
            Base44's unauthenticated registration endpoints and Lovable's February–April 2026 ownership-check regression share one root cause: authentication without object-level authorisation. Chat histories, prompts and source trees are data stores held by the platform.
          </p>
          <p class="fm-key">
            No app-level control could have helped <Chip code="CP" />
            <Chip code="INF" />
          </p>
        </section>
        <section class="fm" aria-labelledby="fm4">
          <span class="fm-id">FM4</span>
          <h2 id="fm4" class="fm-name">Agent credential reach</h2>
          <p>
            An agent holding a credential that can mutate production, delete a volume or run <code>terraform destroy</code> does so, usually after a context mismatch, sometimes against explicit instructions. Where backups live in the same identity domain as the credential, they go too.
          </p>
          <p class="fm-key">
            The constant across Replit, Cursor/Claude, Claude Code, Kiro and Antigravity incidents is credential reach, not model vendor <Chip code="INF" />
          </p>
        </section>
      </div>
      <p class="small muted">
        No incident found in the May–October 2026 extension required a fifth category <Chip code="INF" />. <a href="#s03-timeline">See the incident timeline</a>.
      </p>
    </div>
  );
}

function Denominators() {
  return (
    <div class="stack-lg">
      <div class="denom-grid">
        <section class="stack" aria-labelledby="dn-red">
          <h2 id="dn-red" class="h3">
            RedAccess "Shadow Builders" <span class="muted">· May 2026</span>
          </h2>
          <Bars
            max={380000}
            specs={[
              { n: 11, label: 'Publicly accessible assets', value: 380000, display: '380,000+ assets' },
              { n: 11, label: 'Appeared built for corporate purposes', value: 5000, display: '5,000 corporate-purpose' },
              { n: 11, label: 'Sensitive data, no basic controls', value: 2000, display: '2,000 (40%)' },
            ]}
          />
          <p class="small">
            Treat the 2,000 as a credible, partly press-verified signal with an undisclosed denominator <Chip code="INF" />. Axios compressed two populations into one <Chip code="VR" />.
          </p>
        </section>
        <section class="stack" aria-labelledby="dn-esc">
          <h2 id="dn-esc" class="h3">
            Escape <span class="muted">· 29 Oct 2025</span>
          </h2>
          <Bars
            max={14600}
            specs={[
              { n: 9, label: 'Assets in the inventory', value: 14600, display: '14,600 assets' },
              { n: 9, label: 'Discovered web apps', value: 5600, display: '5,600 discovered web apps' },
              { n: 9, label: 'Apps tested after cleaning', value: 1400, display: '1,400' },
            ]}
          />
          <p class="small">
            The original report used 5,600 as the denominator: wrong by a factor of four. The PDF's "98 highly critical" and the landing page's "2,038 highly critical" cannot both be right under one definition <Chip code="VR" />.
          </p>
        </section>
        <section class="stack" aria-labelledby="dn-reeve">
          <h2 id="dn-reeve" class="h3">
            Reeve <span class="muted">· 19 Aug 2026</span>
          </h2>
          <Bars
            max={30998}
            specs={[
              { n: 13, label: 'Apps swept', value: 30998, display: '30,998 apps swept' },
              { n: 13, label: 'Checkable', value: 3680, display: '3,680 checkable' },
              { n: 13, label: 'Checkable apps on Lovable', value: 3553, display: '3,553 of checkable were Lovable', tone: 'ghost' },
              { n: 13, label: 'At least one readable table', value: 2096, display: '2,096' },
            ]}
          />
          <p class="small">Reeve's 57% is effectively a Lovable-to-Supabase figure <Chip code="VR" />.</p>
        </section>
        <section class="stack" aria-labelledby="dn-up">
          <h2 id="dn-up" class="h3">
            UpGuard <span class="muted">· 24 Sep 2026</span>
          </h2>
          <Bars
            max={300000}
            specs={[
              { n: 12, label: 'Domains probed', value: 300000, display: '~300,000 domains probed' },
              { n: 12, label: 'Supabase databases with readable tables', value: 16326, display: '16,326' },
            ]}
          />
          <p class="small">
            The scan does not establish that every site was AI-built <Chip code="PO" />. Over half of the databases had indicators of some PII <Chip code="VR" />.
          </p>
        </section>
        <section class="stack" aria-labelledby="dn-sym">
          <h2 id="dn-sym" class="h3">
            Symbiotic <span class="muted">· 2 Jun 2026</span>
          </h2>
          <Bars
            max={1072}
            specs={[
              { n: 6, label: 'Supabase-backed sites scanned', value: 1072, display: '1,072' },
              { n: 6, label: 'At least one finding', value: 1046, display: '1,046 of 1,072 (98%)' },
              { n: 6, label: 'Critical', value: 173, display: '173 (16%) critical' },
            ]}
          />
          <p class="small">
            Symbiotic's 39 "fully readable" of 1,072 and Reeve's 2,096 "at least one readable table" of 3,680 use different definitions and cannot be reconciled <Chip code="PO" />.
          </p>
        </section>
        <section class="stack denom-note" aria-labelledby="dn-why">
          <h2 id="dn-why" class="h3">Why they do not add up</h2>
          <p>
            Escape, Symbiotic, Reeve, Vibe App Scanner and UpGuard all over-sample Lovable launch directories, search dorking and certificate transparency <Chip code="VR" />.
          </p>
          <p>
            The one roughly comparable pair across 17 months, Palmer's 10.3% of showcase apps <FigRef n={1} /> against roughly 10.9% of 18,554 Lovable apps readable in Reeve's August 2026 sweep <Chip code="PO" />, shows absence of visible improvement, not evidence of stasis <Chip code="INF" />.
          </p>
          <p>
            The only randomly sampled population study is Deng, Fan and Meng's 200 deployed apps <Chip code="RR" />. <a href="#s05-population">See §5.8</a>.
          </p>
        </section>
      </div>
    </div>
  );
}

function Attribution() {
  return (
    <div class="stack-lg">
      <PaperTable id="3.5#1" tall caption="Paper table §3.5. The last column is the authors' inference." />
      <div class="grid-2">
        <div class="stack">
          <p class="lead">
            Vendor remediation after every incident targeted defaults and blast radius (private-by-default, dev/prod split, soft delete, explicit grants), never the correctness of customer authorisation logic <Chip code="INF" />
          </p>
        </div>
        <div class="stack small">
          <h2 class="eyebrow">Regulatory consequences to date</h2>
          <ul class="stack" style={{ gap: '6px' }}>
            <li>
              The Tea class action reached a settlement in principle on 30 June 2026 <Chip code="PO" />.
            </li>
            <li>No data protection authority decision on any ledger incident was found.</li>
            <li>
              The UK ICO opened a six-week call for evidence on agentic AI on 8 October 2026: "the fact AI agents act with autonomy is not an excuse for poor compliance" <Chip code="CP" />{' '}
              <Cite href="https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2026/10/ico-secures-changes-from-leading-ai-developers-as-scrutiny-extends-to-ai-agents/">ICO</Cite>.
            </li>
            <li>
              EU exposure is documented in at least five incidents <Chip code="CP" />
              <Chip code="PO" />.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const slides: SlideDef[] = [
  {
    slug: 's03-failure-modes',
    section: '3',
    title: 'Four structural conditions the generated code cannot see',
    short: 'Four failure modes',
    dek: 'Each one sits in a layer the generated code does not own: the data API, the publishing default, the platform, or the agent’s credentials.',
    paper: ['3.1'],
    Body: FailureModes,
  },
  {
    slug: 's03-timeline',
    section: '3',
    title: 'The incident ledger, March 2025 to October 2026',
    short: 'Incident timeline',
    dek: 'Incidents, large-scale scans, disclosures and the vendor and regulatory changes that followed, on one time axis drawn to scale.',
    paper: ['3.2', 'appendix-b'],
    Body: IncidentTimeline,
  },
  {
    slug: 's03-denominators',
    section: '3',
    title: 'Read every scan with its denominator',
    short: 'Scan denominators',
    dek: 'The headline scans count different populations, found by overlapping methods. Each chart below has its own linear scale, starting at zero.',
    paper: ['3.3', '3.4'],
    Body: Denominators,
  },
  {
    slug: 's03-attribution',
    section: '3',
    title: 'Which layer failed, and the one control that would have interrupted it',
    short: 'Layer attribution',
    paper: ['3.5'],
    Body: Attribution,
  },
];
export default slides;
