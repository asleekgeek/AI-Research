import { useMemo, useState } from 'react';
import type { SlideDef } from './types';
import { Chip } from '../components/Chip';
import { Cite, FigTile } from '../components/Figure';
import { Inline, plain } from '../components/Inline';
import { PaperTable } from '../components/PaperTable';
import { PropNotice } from '../components/Notices';
import { Tabs } from '../components/Tabs';
import { section, table } from '../lib/data';
import { Flow, Note, type FlowStep } from './s07-flow';
import { DateStrip, type StripRow } from './s07-strip';
import { Q, V } from './s07-text';
import './s07.css';

// Source links exactly as the paper cites them in §7.
const SRC = {
  edpb: 'https://www.edpb.europa.eu/system/files/2023-04/edpb_guidelines_202209_personal_data_breach_notification_v2.0_en.pdf',
  praxikon: 'https://www.praxikon.com/en/avg/digital-omnibus/datalekmelding',
  whitecase: 'https://www.whitecase.com/insight-alert/eu-digital-omnibus-what-changes-lie-ahead-data-act-gdpr-and-ai-act',
  gdpr: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj',
  wp29: 'https://www.edpb.europa.eu/our-work-tools/general-guidance/endorsed-wp29-guidelines_en',
  aiOj: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202601744',
  aiFaq50: 'https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act',
  aiTimeline: 'https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act',
  aiArt4: 'https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-4',
  aiGuidelines: 'https://digital-strategy.ec.europa.eu/en/library/commission-publishes-guidelines-ai-system-definition-facilitate-first-ai-acts-rules-application',
  cms: 'https://cms.law/en/pol/legal-updates/eu-commission-issues-guidelines-on-the-definition-of-ai-systems',
  aiConsolidated: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02024R1689-20260727',
  nis2Mirror: 'https://www.nis-2-directive.com/NIS_2_Directive_Article_21.html',
  nis2: 'https://eur-lex.europa.eu/eli/dir/2022/2555/oj/eng',
  dora28: 'https://www.digital-operational-resilience-act.com/Article_28.html',
  dora30: 'https://www.digital-operational-resilience-act.com/Article_30.html',
  dora: 'https://eur-lex.europa.eu/eli/reg/2022/2554/oj/eng',
  kirkland: 'https://www.kirkland.com/publications/kirkland-alert/2026/09/the-eu-cyber-resilience-act',
  dla: 'https://www.dlapiper.com/en/insights/publications/2026/02/cyber-resilience-act-the-fine-line-between-saas-and-digital-products',
  ncsc: 'https://www.ncsc.gov.uk/news/ncsc-ceo-seize-disruptive-vibe-coding-opportunity-to-make-software-more-secure',
  ico: 'https://ico.org.uk/for-organisations/report-a-breach/personal-data-breach/personal-data-breaches-a-guide/',
  hunton: 'https://www.hunton.com/privacy-and-cybersecurity-law-blog/newly-approved-ccpa-regulations-have-staggered-deadlines-for-compliance',
  skadden: 'https://www.skadden.com/insights/publications/2026/06/colorado-repeals-and-replaces-its-ai-act',
  lovableEnt: 'https://docs.lovable.dev/introduction/lovable-for-enterprise',
  csa: 'https://labs.cloudsecurityalliance.org/research/csa-research-note-vibe-coding-ai-governance-gap-20260602-csa/',
  nist: 'https://csrc.nist.gov/projects/ssdf/publications',
  cycode: 'https://cycode.com/blog/owasp-top-10-agentic-applications/',
  lovableDpa: 'https://lovable.dev/data-processing-agreement',
  vercelDpa: 'https://vercel.com/legal/dpa',
  replitTos: 'https://replit.com/terms-of-service',
  cursor: 'https://cursor.com/security',
};

/** A dated gap the paper records: shown as a gap, never filled in. */
function Gap({ children }: { children: any }) {
  return (
    <p class="s7-gap">
      <span class="s7-gap-h">Gap</span> <span>{children}</span>
    </p>
  );
}

// ---- s07-gdpr-tree ------------------------------------------------------------------------------

const TREE: FlowStep[] = [
  {
    kind: 'q',
    tag: (
      <>
        Is there a personal data breach? · Art. 4(12) <Chip code="CP" />
      </>
    ),
    title: (
      <>
        Did <Q id="7.1">a breach of security</Q> lead to <Q id="7.1">the accidental or unlawful destruction, loss, alteration, unauthorised disclosure of, or access to, personal data</Q>?
      </>
    ),
    branches: [
      {
        ans: 'No',
        tone: 'stop',
        body: (
          <>
            Not a personal data breach; {V('7.1', 'an unexploited vulnerability is an Art. 32 weakness, not by itself a notifiable breach')}. <Chip code="CP" />
          </>
        ),
      },
    ],
    next: 'Yes',
    notesLabel: 'EDPB guidance on what counts as a breach',
    notes: (
      <>
        <Note head="EDPB para 17 · breach types">
          Confidentiality, integrity and availability. <Chip code="CP" />
        </Note>
        <Note head="EDPB para 19 · permanent loss">
          <Q id="7.1">A breach will always be regarded as an availability breach when there has been a permanent loss of, or destruction of, personal data</Q> <Chip code="CP" />
        </Note>
      </>
    ),
  },
  {
    kind: 'always',
    tag: (
      <>
        Every breach · Art. 33(5) <Chip code="CP" />
      </>
    ),
    title: <>Document the breach, notifiable or not.</>,
    next: 'Then',
  },
  {
    kind: 'q',
    tag: (
      <>
        Notify the authority? · Art. 33 <Chip code="CP" />
      </>
    ),
    title: (
      <>
        Is the breach <Q id="7.1">unlikely to result in a risk</Q>?
      </>
    ),
    branches: [{ ans: 'Yes', tone: 'stop', body: <>Art. 33 does not require notifying the supervisory authority; the breach stays documented.</> }],
    next: 'No',
    notesLabel: 'EDPB guidance on assessing risk',
    notes: (
      <Note head="EDPB paras 20–22 · temporary loss">
        A temporary loss restored from backup is still a breach of security, to be documented and assessed case by case: hospital data could present a risk; a media company's newsletter is unlikely to. <Chip code="CP" />
      </Note>
    ),
  },
  {
    kind: 'act',
    tag: (
      <>
        Supervisory authority · Art. 33 <Chip code="CP" />
      </>
    ),
    title: (
      <>
        Notify <Q id="7.1">without undue delay and, where feasible, not later than 72 hours after having become aware of it</Q>.
      </>
    ),
    next: 'Then',
    notesLabel: 'EDPB guidance on when the clock starts, and on processors',
    notes: (
      <>
        <Note head="EDPB para 31 · awareness">
          <Q id="7.1">a reasonable degree of certainty that a security incident has occurred that has led to personal data being compromised</Q> <Chip code="CP" />
        </Note>
        <Note head="EDPB paras 34 and 33">
          A short investigation is permitted before the clock starts; the lost-USB example says notify even when access cannot be established. <Chip code="CP" />
        </Note>
        <Note head="EDPB para 44 · processors">
          A processor <Q id="7.1">must notify the controller 'without undue delay'</Q> and <Q id="7.1">does not need to first assess the likelihood of risk</Q>. <Chip code="CP" />
        </Note>
      </>
    ),
  },
  {
    kind: 'q',
    tag: (
      <>
        Tell individuals? · Art. 34 <Chip code="CP" />
      </>
    ),
    title: (
      <>
        Is the breach <Q id="7.1">likely to result in a high risk</Q>?
      </>
    ),
    branches: [
      { ans: 'Yes', tone: 'act', body: <>Communicate the breach to the individuals concerned.</> },
      { ans: 'No', tone: 'stop', body: <>Art. 34 does not require communication to individuals.</> },
    ],
  },
];

function GdprTree() {
  return (
    <div class="stack-lg">
      <figure class="s7-figure">
        <Flow steps={TREE} label="GDPR breach decision tree, Articles 4(12), 33 and 34, as presented in EDPB Guidelines 9/2022" />
        <figcaption class="small muted">
          Rules as the EDPB quotes them in <Cite href={SRC.edpb}>Guidelines 9/2022 v2.0</Cite>, paras 28–29, 82–83, 121 <Chip code="CP" />. The tree is regulator guidance, not an opinion on a specific incident.
        </figcaption>
      </figure>

      <section class="s7-omni" aria-labelledby="s7-omni-h">
        <div class="s7-omni-head">
          <h2 id="s7-omni-h" class="h3">
            The law in force, and the Digital Omnibus proposal beside it
          </h2>
          <p class="small muted">
            COM(2025) 837, 19 Nov 2025. As of September 2026: a Parliament draft report (22 Jun 2026) and Council working-party activity, but no committee vote or trilogue; the EDPB–EDPS Joint Opinion 2/2026 welcomed the direction <Chip code="PO" /> (<Cite href={SRC.praxikon}>Praxikon, 15 Sep 2026</Cite>; <Cite href={SRC.whitecase}>White &amp; Case</Cite>).
          </p>
        </div>
        <div class="s7-vs" role="table" aria-label="Breach notification: law in force compared with the Digital Omnibus proposal">
          <div class="s7-vs-row s7-vs-head" role="row">
            <span role="columnheader" class="s7-vs-k">
              <span class="visually-hidden">Element</span>
            </span>
            <span role="columnheader" class="s7-vs-law">
              Law in force <Chip code="CP" />
            </span>
            <span role="columnheader" class="s7-vs-prop">
              Proposal only <Chip code="PO" />
            </span>
          </div>
          <div class="s7-vs-row" role="row">
            <span role="rowheader" class="s7-vs-k">
              Notify the authority
            </span>
            <span role="cell" class="s7-vs-law">
              unless <Q id="7.1">unlikely to result in a risk</Q>
            </span>
            <span role="cell" class="s7-vs-prop">
              only where <Q id="7.1">likely to result in a high risk</Q>
            </span>
          </div>
          <div class="s7-vs-row" role="row">
            <span role="rowheader" class="s7-vs-k">
              Deadline
            </span>
            <span role="cell" class="s7-vs-law s7-vs-big">72 hours</span>
            <span role="cell" class="s7-vs-prop s7-vs-big">96 hours</span>
          </div>
          <div class="s7-vs-row" role="row">
            <span role="rowheader" class="s7-vs-k">
              Where
            </span>
            <span role="cell" class="s7-vs-law">The supervisory authority</span>
            <span role="cell" class="s7-vs-prop">An ENISA single entry point</span>
          </div>
        </div>
        <p class="s7-inforce">
          <strong>{V('7.1', '72 hours and the "unlikely to result in a risk" threshold are the law in force')}.</strong> <Chip code="CP" />
        </p>
      </section>
    </div>
  );
}

// ---- s07-gdpr-failure-modes ---------------------------------------------------------------------

function FailureModes() {
  const t = table('7.1#1');
  /** The paper's "As above" cells point up the table; resolve to the row that states the text. */
  const source = (ri: number, ci: number) => {
    let r = ri;
    while (r > 0 && /^As above/.test(plain(t.rows[r][ci]))) r--;
    return r;
  };
  const fmId = (ri: number) => plain(t.rows[ri][0]).split(' ')[0];
  const Cell = ({ ri, ci }: { ri: number; ci: number }) => {
    const src = source(ri, ci);
    return (
      <>
        <Inline nodes={t.rows[ri][ci]} />
        {src !== ri && (
          <span class="s7-asabove">
            <span class="s7-asabove-h">“As above” is the {fmId(src)} row:</span> <Inline nodes={t.rows[src][ci]} />
          </span>
        )}
      </>
    );
  };
  const tabs = t.rows.map((row, ri) => {
    const name = plain(row[0]);
    const id = fmId(ri);
    const rest = name.slice(id.length).trim();
    return {
      id: id.toLowerCase(),
      label: (
        <>
          <span class="s7-fm-id">{id}</span> <span class="s7-fm-name">{rest}</span>
        </>
      ),
      panel: (
        <div class="s7-fm">
          <h2 class="h2 s7-fm-title">
            <span class="s7-fm-id">{id}</span> {rest}
          </h2>
          <Flow
            compact
            label={`${name}: the three steps`}
            steps={[1, 2, 3].map((ci) => ({ kind: 'q', tag: <Inline nodes={t.head[ci]} />, body: <Cell ri={ri} ci={ci} /> }))}
          />
          <div class="s7-fm-foot">
            <div class="s7-fm-card is-always">
              <p class="s7-tag">
                <Inline nodes={t.head[4]} />
              </p>
              <p>
                <Cell ri={ri} ci={4} />
              </p>
            </div>
            <div class="s7-fm-card">
              <p class="s7-tag">
                <Inline nodes={t.head[5]} />
              </p>
              <p>
                <Cell ri={ri} ci={5} />
              </p>
            </div>
          </div>
        </div>
      ),
    };
  });

  return (
    <div class="stack-lg">
      <div class="stack">
        <Tabs tabs={tabs} label="Failure modes" />
        <p class="small muted">
          Cell for cell from the paper's §7.1 table, which applies the EDPB rules on the previous slide (<Cite href={SRC.edpb}>Guidelines 9/2022 v2.0</Cite>) to each failure mode. Press <kbd>S</kbd> for the paper's full text.
        </p>
      </div>

      <div class="grid-2 s7-roles">
        <section class="stack" aria-labelledby="s7-roles-h">
          <h2 id="s7-roles-h" class="h3">
            Controller and processor roles for personal sign-ups
          </h2>
          <p class="small">
            An employee's personal account creates a contract between the individual and the platform, not between the employer and the platform. Absent an Art. 28(3) contract the platform may well be an independent controller for what it receives (Lovable's DPA says so for Service Data); the employer's exposure is then an uncontrolled disclosure to a third party and an Art. 28/32 failure. <Chip code="INF" />
          </p>
          <p class="s7-counsel">Fact-specific and for counsel.</p>
        </section>
        <section class="stack" aria-labelledby="s7-contest-h">
          <h2 id="s7-contest-h" class="h3">
            No supervisory-authority decision as of October 2026
          </h2>
          <p class="small">
            None applies Art. 33/34 to a vibe-coded app; the EDPB's framework already supplies the analysis, and the contested points will be: <Chip code="INF" />
          </p>
          <ul class="s7-contest">
            <li>awareness timing</li>
            <li>exposure without proven access</li>
            <li>who is controller for prompt and chat content</li>
          </ul>
        </section>
      </div>

      <section class="stack s7-reg" aria-labelledby="s7-reg-h">
        <h2 id="s7-reg-h" class="h3">
          §7.2 · The app registry feeds Art. 30 and Art. 35 without one record per app
        </h2>
        <PropNotice>
          How registry entries feed the GDPR records is the authors' proposal. The Art. 30 and Art. 35 requirements on the right are the regulation's <Chip code="CP" />.
        </PropNotice>
        <div class="s7-map">
          <div class="s7-map-row s7-map-head" aria-hidden="true">
            <span>
              Registry, per app <Chip code="PROP" />
            </span>
            <span />
            <span>
              GDPR record it serves <Chip code="CP" />
            </span>
          </div>
          <ul class="s7-map-list">
            <li class="s7-map-row">
              <span class="s7-map-from">
                Each app linked by purpose to the activity records it serves; where none exists the app has surfaced a new processing activity and the DPO creates one. <Chip code="PROP" />
              </span>
              <span class="s7-map-arrow" aria-hidden="true" />
              <span class="s7-map-to">
                <span class="visually-hidden">feeds: </span>Art. 30 records, kept per processing activity (<Cite href={SRC.gdpr}>EUR-Lex GDPR</Cite>). <Chip code="CP" />
              </span>
            </li>
            <li class="s7-map-row">
              <span class="s7-map-from">
                The app's authorisation model, publishing setting and backup arrangement. <Chip code="PROP" />
              </span>
              <span class="s7-map-arrow" aria-hidden="true" />
              <span class="s7-map-to">
                <span class="visually-hidden">feeds: </span>Art. 30(1)(g): <Q id="7.2">where possible, a general description of the technical and organisational security measures</Q> <Chip code="CP" />
              </span>
            </li>
            <li class="s7-map-row">
              <span class="s7-map-from">
                The vendor's DPA status. <Chip code="PROP" />
              </span>
              <span class="s7-map-arrow" aria-hidden="true" />
              <span class="s7-map-to">
                <span class="visually-hidden">feeds: </span>The Art. 28 recipient entry.
              </span>
            </li>
            <li class="s7-map-row">
              <span class="s7-map-from">
                DPIA screening as a questionnaire, not an automatic trigger. <Chip code="PROP" />
              </span>
              <span class="s7-map-arrow" aria-hidden="true" />
              <span class="s7-map-to">
                <span class="visually-hidden">feeds: </span>Art. 35(1): processing <Q id="7.2">likely to result in a high risk</Q>. The WP248 criteria most often met by citizen-built apps are new technology, sensitive data, vulnerable subjects, scale, matching datasets and systematic monitoring, two or more generally requiring a DPIA (<Cite href={SRC.wp29}>EDPB endorsed WP29 guidelines</Cite>). <Chip code="CP" /> <span class="muted">Wording from prior knowledge; not re-opened.</span>
              </span>
            </li>
          </ul>
        </div>
        <p class="small">
          The registry is nonetheless the strongest Art. 24 accountability evidence available when an authority asks about an app that leaked. <Chip code="INF" />
        </p>
      </section>
    </div>
  );
}

// ---- s07-ai-act ---------------------------------------------------------------------------------

const AI_STEPS: FlowStep[] = [
  {
    kind: 'q',
    tag: (
      <>
        Is it an AI system? · Art. 3(1) <Chip code="PROP" />
      </>
    ),
    title: V('7.3', 'Does any component infer outputs (predictions, content, recommendations, decisions) from inputs rather than executing human-written rules?'),
    branches: [
      {
        ans: 'No',
        tone: 'stop',
        body: (
          <>
            <strong>{V('7.3', 'not an AI system; GDPR, NIS2/DORA and CRA only.')}</strong> {V('7.3', 'The coding assistant that wrote it is an AI system whose provider is the vendor; the enterprise is a deployer, which is what engages Art. 4.')}
          </>
        ),
      },
    ],
    next: 'Yes',
    notesLabel: 'What the definition excludes',
    notes: (
      <Note head="Outside the definition · Art. 3(1)">
        Under Art. 3(1) and the Commission's February 2025 guidelines (C(2025) 924), systems <Q id="7.3">based on the rules defined solely by natural persons to automatically execute operations</Q> and <Q id="7.3">basic data processing systems</Q> are outside the definition. <Chip code="CP" /> <Cite href={SRC.aiGuidelines}>Commission guidelines</Cite>; <Cite href={SRC.cms}>CMS summary</Cite>
      </Note>
    ),
  },
  {
    kind: 'q',
    tag: (
      <>
        Provider? · Art. 3(3) <Chip code="PROP" />
      </>
    ),
    title: V('7.3', 'If yes, is the enterprise placing that component into service under its own name (a branded support bot calling an LLM API)?'),
    branches: [
      {
        ans: 'Yes',
        tone: 'act',
        body: (
          <>
            It is <strong>likely the provider</strong> of that AI system (Art. 3(3): <Q id="7.3">has an AI system ... developed and ... puts the AI system into service under its own name</Q>) and also the deployer internally. Art. 50(1) (inform people they interact with an AI system) and, for generative output, 50(2) (machine-readable marking) apply from 2 August 2026. <Chip code="CP" />
          </>
        ),
      },
      {
        ans: 'Open',
        tone: 'flag',
        body: <>{V('7.3', 'Whether an enterprise merely wrapping a third-party GPAI model is the "provider" for 50(2) is contested and awaits the code of practice; flag for counsel.')}</>,
      },
    ],
    next: 'Then',
    notesLabel: 'Art. 50 fines',
    notes: <FigTile n={50} compact />,
  },
  {
    kind: 'q',
    tag: (
      <>
        High-risk? · Annex III <Chip code="PROP" />
      </>
    ),
    title: V('7.3', 'Does the use case fall in Annex III (employment, education, credit, essential services)?'),
    branches: [
      {
        ans: 'Yes',
        tone: 'act',
        body: <>{V('7.3', 'If yes, high-risk obligations apply from 2 December 2027; the CSA\'s "drift into high-risk use cases" risk is real, so the registry records intended use.')}</>,
      },
    ],
    notesLabel: 'Superseded date',
    notes: (
      <Note head="CSA research note">
        {V('7.3', 'The CSA note\'s "August 2, 2026" high-risk date was accurate when written and is superseded')}. <Chip code="CP" />
      </Note>
    ),
  },
];

const AI_DATES: StripRow[] = [
  { at: '2026-07-27', dateText: '27 Jul 2026', label: <>Regulation (EU) 2026/1744 in force (adopted 8 Jul 2026; OJ 24 Jul)</> },
  { at: '2026-08-02', open: true, dateText: '2 Aug 2026', label: <>Art. 50 transparency applies</> },
  { at: '2026-08-02', until: '2026-12-02', tone: 'grace', dateText: '2 Dec 2026', label: <>Grace period ends for the Art. 50(2) marking duty, only for generative systems already on the market</> },
  { at: '2027-12-02', open: true, dateText: '2 Dec 2027', label: <>Annex III high-risk obligations (moved to this date)</> },
  { at: '2028-08-02', open: true, dateText: '2 Aug 2028', label: <>Annex I (moved to this date)</> },
];

function AiAct() {
  return (
    <div class="stack-lg">
      <section class="stack" aria-labelledby="s7-ai-q">
        <h2 id="s7-ai-q" class="eyebrow">
          Three questions of the deployed app <Chip code="PROP" />
        </h2>
        <Flow steps={AI_STEPS} label="AI Act: three questions of the deployed app (authors' framing)" />
      </section>

      <section class="stack" aria-labelledby="s7-ai-dates">
        <h2 id="s7-ai-dates" class="eyebrow">
          Dates after Regulation (EU) 2026/1744, to scale <Chip code="CP" />
        </h2>
        <DateStrip
          rows={AI_DATES}
          label="AI Act application dates"
          caption={
            <>
              Bars run from the date a duty applies; the hatched bar is the Art. 50(2) grace window; the dashed line is the date of record. <Chip code="CP" /> <Cite href={SRC.aiOj}>EUR-Lex OJ L 2026/1744</Cite> · <Cite href={SRC.aiFaq50}>Commission FAQ on Art. 50</Cite> · <Cite href={SRC.aiTimeline}>AI Act Service Desk timeline</Cite>
            </>
          }
        />
      </section>

      <div class="grid-2">
        <section class="stack" aria-labelledby="s7-art4">
          <h2 id="s7-art4" class="eyebrow">
            Art. 4 as amended
          </h2>
          <blockquote class="quote s7-quote">
            Providers and deployers <Q id="7.3">take measures to support the development of AI literacy</Q>. <Q id="7.3">This obligation does not require providers or deployers to guarantee any specific level of AI literacy of any individual</Q>
            <cite>
              <Cite href={SRC.aiArt4}>AI Act Service Desk, Art. 4</Cite> <Chip code="CP" />
            </cite>
          </blockquote>
          <p class="small">
            {V('7.3', 'Art. 4 is a duty of effort; training on BaaS authorisation, secrets and publishing defaults is a natural way to evidence it')}. <Chip code="INF" />
          </p>
        </section>
        <section class="stack" aria-labelledby="s7-ai-gap">
          <h2 id="s7-ai-gap" class="eyebrow">
            Before relying on Art. 50
          </h2>
          <Gap>
            The verbatim post-Omnibus text of Art. 50(1)–(5) was not extracted in this pass; sources report no substantive amendment to those paragraphs; confirm against the <Cite href={SRC.aiConsolidated}>consolidated text</Cite> before publication.
          </Gap>
        </section>
      </div>
    </div>
  );
}

// ---- s07-nis2-dora-cra --------------------------------------------------------------------------

function Nis2() {
  const chain = [
    {
      what: 'The app’s development',
      clause: '21(2)(e)',
      quote: 'security in network and information systems acquisition, development and maintenance, including vulnerability handling',
    },
    {
      what: 'The builder, as a supplier',
      clause: '21(2)(d) and 21(3)',
      quote: 'supply chain security, including security-related aspects concerning the relationships between each entity and its direct suppliers or service providers',
      extra: (
        <>
          21(3): each supplier's <Q id="7.4">secure development procedures</Q> <Chip code="CP" />
        </>
      ),
    },
    { what: 'The app estate', clause: '21(2)(i)', quote: '... asset management' },
    { what: 'Backups', clause: '21(2)(c)', quote: 'business continuity, such as backup management and disaster recovery' },
  ];
  return (
    <div class="stack">
      <Flow
        label="NIS2: when Article 21 reaches a citizen-built app"
        steps={[
          {
            kind: 'q',
            tag: <>Scope · NIS2</>,
            title: <>Is the organisation an essential or important entity in scope of NIS2?</>,
            branches: [
              {
                ans: 'No',
                tone: 'stop',
                body: (
                  <>
                    {V('7.4', 'None of this is universal; it attaches to in-scope entities, is proportionate and varies with national transposition')}. <Chip code="CP" />
                  </>
                ),
              },
            ],
            next: 'Yes',
          },
          {
            kind: 'act',
            tag: (
              <>
                Applicability chain, an inference <Chip code="INF" />
              </>
            ),
            title: <>The citizen-built app is a system the entity uses for its operations, so Art. 21 reaches it here:</>,
            body: (
              <ul class="s7-chain">
                {chain.map((c) => (
                  <li key={c.clause}>
                    <span class="s7-chain-what">{c.what}</span>
                    <span class="s7-chain-clause">Art. {c.clause}</span>
                    <span class="s7-chain-q">
                      <Q id="7.4">{c.quote}</Q> <Chip code="CP" />
                    </span>
                    {c.extra && <span class="s7-chain-q">{c.extra}</span>}
                  </li>
                ))}
              </ul>
            ),
          },
        ]}
      />
      <p class="small">
        Art. 21(2) also requires <Q id="7.4">(g) basic cyber hygiene practices and cybersecurity training</Q>. <Chip code="CP" /> <Cite href={SRC.nis2Mirror}>NIS2 Art. 21 mirror</Cite> · <Cite href={SRC.nis2}>EUR-Lex Directive 2022/2555</Cite>
      </p>
    </div>
  );
}

function Dora() {
  return (
    <div class="stack">
      <p class="small">
        DORA (applying since 17 Jan 2025) makes financial entities <Q id="7.4">at all times ... fully responsible</Q> (Art. 28(1)) and requires pre-contract assessment (28(4)). <Chip code="CP" /> <Cite href={SRC.dora28}>DORA Art. 28</Cite> · <Cite href={SRC.dora30}>Art. 30</Cite> · <Cite href={SRC.dora}>EUR-Lex DORA</Cite>
      </p>
      <div class="s7-nest">
        <div class="s7-nest-out">
          <p class="s7-nest-h">
            <span class="s7-nest-k">Art. 28(3)</span>
            <span>
              A register of <strong>all</strong> ICT contractual arrangements
            </span>
          </p>
          <p class="small">
            Distinguishing those supporting critical or important functions. <Chip code="CP" />
          </p>
          <p class="small">
            A builder hosting an app used by a financial entity is an ICT third-party service provider; every such arrangement, including a shadow personal sign-up, belongs in the 28(3) register and its absence is itself a gap. <Chip code="INF" />
          </p>
        </div>
        <div class="s7-nest-in">
          <p class="s7-nest-h">
            <span class="s7-nest-k">Art. 30(3)</span>
            <span>Only for critical or important functions</span>
          </p>
          <p class="small">
            Requires <Q id="7.4">unrestricted</Q> rights of access, inspection and audit, participation in threat-led penetration testing, and exit terms. <Chip code="CP" />
          </p>
          <p class="small">
            The decisive qualifier: most prototypes are not critical or important, but anything on a payments, onboarding or regulatory-reporting path may be. For those, Lovable's DPA (no audit clause) and Vercel's DPA (audit rights <Q id="7.4">satisfied by</Q> SOC 2 reports) do not supply 30(3)(e) on standard terms. <Chip code="CP" />
            <Chip code="INF" />
          </p>
        </div>
      </div>
      <Gap>No competent authority has named AI builders as a supply-chain category.</Gap>
    </div>
  );
}

const CRA_DATES: StripRow[] = [
  { at: '2026-09-11', open: true, dateText: '11 Sep 2026', label: <>Art. 14 reporting applies</> },
  { at: '2027-12-11', open: true, dateText: '11 Dec 2027', label: <>Essential requirements, vulnerability handling, documentation and conformity assessment</> },
];

function Cra() {
  return (
    <div class="stack-lg">
      <div class="s7-scope">
        <section class="s7-scope-col is-in" aria-labelledby="s7-cra-in">
          <h3 id="s7-cra-in" class="s7-scope-h">
            Inside: <Q id="7.5">products with digital elements placed on the market</Q> <Chip code="PO" />
          </h3>
          <ul>
            <li>downloadable or installable software</li>
            <li>embedded software</li>
            <li>“software plus cloud” where remote data processing is essential</li>
          </ul>
          <p class="s7-scope-ex">
            A vibe-coded mobile or desktop app distributed commercially is inside, and its backend may be a remote data processing solution. <Chip code="INF" />
          </p>
        </section>
        <section class="s7-scope-col is-out" aria-labelledby="s7-cra-out">
          <h3 id="s7-cra-out" class="s7-scope-h">
            Outside <Chip code="PO" />
          </h3>
          <ul>
            <li>
              <Q id="7.5">Pure SaaS is generally excluded</Q> and falls under NIS2/DORA instead
            </li>
            <li>internal tools never placed on the market</li>
          </ul>
          <p class="s7-scope-ex">
            A vibe-coded SaaS with a Supabase backend is normally outside the CRA. <Chip code="INF" />
          </p>
        </section>
      </div>
      <p class="small muted">
        Regulation (EU) 2024/2847 · <Cite href={SRC.kirkland}>Kirkland</Cite> · <Cite href={SRC.dla}>DLA Piper</Cite>
      </p>

      <div class="s7-cra-dates">
        <div class="stack">
          <h3 class="eyebrow">
            Dates, to scale <Chip code="PO" />
          </h3>
          <DateStrip rows={CRA_DATES} label="Cyber Resilience Act application dates" caption={<>Dashed line: the date of record.</>} />
          <div class="s7-clock" role="group" aria-label="Art. 14 reporting clocks">
            <p class="s7-clock-h small">
              Art. 14, for actively exploited vulnerabilities and severe incidents: <Chip code="PO" />
            </p>
            <ol class="s7-clock-list">
              <li>
                <strong>early warning</strong> 24 hours
              </li>
              <li>
                <strong>notification</strong> 72 hours
              </li>
              <li>
                <strong>final report</strong> 14 days or one month
              </li>
            </ol>
          </div>
        </div>
        <FigTile n={51} compact />
      </div>
      <p class="small">
        The manufacturer of an in-scope app then owes Art. 14 reporting today and Annex I (<Q id="7.5">secure by default configuration</Q>, <Q id="7.5">without known exploitable vulnerabilities</Q>) from December 2027. <Chip code="INF" />
      </p>
      <Gap>The Commission's separate guidance on remote data processing was not located as published.</Gap>
    </div>
  );
}

function UkUs() {
  return (
    <div class="grid-2 s7-ukus">
      <section class="stack" aria-labelledby="s7-uk">
        <h3 id="s7-uk" class="h2">
          United Kingdom
        </h3>
        <blockquote class="quote s7-quote">
          <Q id="7.6">The AI tools we use to develop code must be designed and trained from the outset ... so that they do not introduce or propagate unintended vulnerabilities</Q>
          <cite>
            NCSC CEO Richard Horne, RSAC keynote, 24 March 2026 · <Cite href={SRC.ncsc}>NCSC</Cite> <Chip code="CP" />
          </cite>
        </blockquote>
        <p class="small">
          An NCSC blog the same day said AI-produced code <Q id="7.6">currently poses intolerable risks for many organisations</Q>. <Chip code="CP" />
        </p>
        <ul class="s7-list">
          <li>
            UK GDPR breach rules mirror the EU text, so the §7.1 tree applies with the ICO as regulator (<Cite href={SRC.ico}>ICO breach guide</Cite>). <Chip code="CP" /> <span class="muted">Prior knowledge; not re-opened.</span>
          </li>
          <li>
            The ICO's 8 October 2026 call for evidence on agentic AI is not vibe-coding-specific. <Chip code="CP" />
          </li>
        </ul>
        <Gap>No ICO guidance addresses low-code or AI-generated code.</Gap>
      </section>
      <section class="stack" aria-labelledby="s7-us">
        <h3 id="s7-us" class="h2">
          United States
        </h3>
        <ul class="s7-list">
          <li>
            <strong>California CCPA regulations</strong> (effective 1 Jan 2026): documented risk assessments from 1 January 2026, attestations due by 1 April 2028; independent cybersecurity audits certified from 1 April 2028 (revenue over USD 100 million), 2029 and 2030 (<Cite href={SRC.hunton}>Hunton</Cite>). <Chip code="CP" /> An unregistered vibe-coded app fails such an audit by omission. <Chip code="INF" />
          </li>
          <li>
            <strong>Colorado</strong>: SB 24-205 repealed and replaced on 14 May 2026 by SB 189, the Automated Decision-Making Technology Act, effective 1 January 2027 if AG rulemaking completes; notice, explanation and human-review rights; no algorithmic-discrimination duty of care or impact assessments (<Cite href={SRC.skadden}>Skadden</Cite>). <Chip code="CP" />
          </li>
        </ul>
        <FigTile n={52} compact />
        <ul class="s7-list">
          <li>
            <strong>HIPAA</strong>: a builder that signs no BAA is unusable for PHI, which excludes Lovable (<Cite href={SRC.lovableEnt}>Lovable for Enterprise</Cite>). SEC Form 8-K Item 1.05 and NYDFS Part 500's asset inventory (500.13) are the disclosure and inventory hooks. <Chip code="CP" />
          </li>
          <li>
            Live US obligations on app features are transparency and notice duties (Colorado from 2027, Texas TRAIGA and Illinois HB 3773 from 1 Jan 2026), not EU-style conformity assessment. <Chip code="INF" />
          </li>
        </ul>
        <Gap>No US regulator guidance on vibe coding was found.</Gap>
      </section>
    </div>
  );
}

function Nis2DoraCra() {
  return (
    <Tabs
      label="Instrument"
      tabs={[
        { id: 'nis2', label: 'NIS2', panel: <Nis2 /> },
        { id: 'dora', label: 'DORA', panel: <Dora /> },
        {
          id: 'cra',
          label: (
            <>
              <span class="s7-wide">Cyber Resilience Act</span>
              <abbr class="s7-narrow" title="Cyber Resilience Act">
                CRA
              </abbr>
            </>
          ),
          panel: <Cra />,
        },
        { id: 'ukus', label: 'UK and US', panel: <UkUs /> },
      ]}
    />
  );
}

// ---- s07-standards-dpa --------------------------------------------------------------------------

function ClauseMap() {
  const t = table('7.7#1');
  const [fw, setFw] = useState<number | null>(null);
  const [q, setQ] = useState('');
  const cols = fw === null ? t.head.map((_, i) => i) : [0, fw];
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return t.rows.map((_, i) => i).filter((ri) => !needle || cols.some((ci) => plain(t.rows[ri][ci]).toLowerCase().includes(needle)));
  }, [q, fw]);
  return (
    <section class="stack" aria-labelledby="s7-map-h">
      <div class="s7-std-head">
        <h2 id="s7-map-h" class="h2">
          §7.7 · Standards clause map
        </h2>
        <ul class="s7-std-notes small">
          <li>
            The CSA states that none of NIST AI RMF, OWASP's LLM Top 10 or its own AICM provides <Q id="7.7">dedicated, accessible guidance for citizen developers</Q> (<Cite href={SRC.csa}>CSA</Cite>). <Chip code="CP" />
          </li>
          <li>
            NIST SP 800-218A (July 2024) is a profile for building generative AI models, not for using AI to write software; SSDF 1.2 is an initial public draft (<Cite href={SRC.nist}>NIST CSRC</Cite>). <Chip code="CP" />
          </li>
          <li>
            OWASP's Agentic Top 10 (9 Dec 2025) supplies ASI02 Tool Misuse, ASI03 Identity and Privilege Abuse and ASI05 Unexpected Code Execution (<Cite href={SRC.cycode}>Cycode summary</Cite>). <Chip code="RR" />
          </li>
        </ul>
      </div>
      <p class="small muted s7-iso">{V('7.7', 'ISO 27001:2022 Annex A control numbers and CIS Controls below are from prior knowledge of stable texts and were not re-fetched.')}</p>
      <div class="filters" role="search" aria-label="Filter the clause map">
        <div class="filter-group">
          <span class="eyebrow" id="s7-fw-l">
            Framework
          </span>
          <div class="seg" role="group" aria-labelledby="s7-fw-l">
            <button type="button" aria-pressed={fw === null} onClick={() => setFw(null)}>
              All
            </button>
            {t.headPlain.slice(1).map((h, k) => (
              <button type="button" key={h} aria-pressed={fw === k + 1} onClick={() => setFw(k + 1)}>
                {h}
              </button>
            ))}
          </div>
        </div>
        <div class="filter-group">
          <label class="eyebrow" for="s7-map-q">
            Search
          </label>
          <input id="s7-map-q" class="search" type="search" value={q} placeholder="e.g. backups or ASI03" onInput={(e) => setQ((e.target as HTMLInputElement).value)} autocomplete="off" />
        </div>
        <p class="count" data-chrome aria-live="polite">
          {rows.length} of {t.rows.length} controls
        </p>
      </div>
      {rows.length ? (
        <div class="s7-cmap">
          <PaperTable id="7.7#1" cols={cols} rows={rows} caption="Paper table §7.7: control in this paper mapped to clauses" />
        </div>
      ) : (
        <p class="s7-empty">No control matches “{q}”.</p>
      )}
    </section>
  );
}

function DpaPattern() {
  const checklist = section('7.8').blocks[2];
  return (
    <section class="stack" aria-labelledby="s7-dpa-h">
      <h2 id="s7-dpa-h" class="h2">
        §7.8 · DPA procurement checklist
      </h2>
      <div class="s7-dpa">
        <div class="stack">
          <h3 class="eyebrow">
            The pattern across the three documents read <Chip code="CP" />
          </h3>
          <p class="small muted">
            <Cite href={SRC.lovableDpa}>Lovable DPA</Cite>, page updated 6 Nov 2025 · <Cite href={SRC.vercelDpa}>Vercel DPA</Cite>, effective 31 Mar 2026 · <Cite href={SRC.replitTos}>Replit ToS</Cite>, 3 Aug 2026
          </p>
          <ul class="s7-pattern">
            <li>
              <strong>Processor only</strong> for a defined class of Customer Personal Data; independent controller for service, usage or log data
            </li>
            <li>
              <strong>Training prohibitions</strong> attach to the processor class only
            </li>
            <li>
              <strong>Audit rights</strong> replaced by SOC 2 or ISO reports
            </li>
            <li>
              <strong>Deletion</strong> <Q id="7.8">commercially reasonable</Q> or <Q id="7.8">may persist in backups</Q>
            </li>
            <li>
              <strong>Breach notice</strong> <Q id="7.8">without undue delay</Q> with no hour commitment
            </li>
            <li>
              <strong>Sub-processor objection</strong> windows of 5–20 days with termination as the sole remedy
            </li>
          </ul>
          <details class="more">
            <summary>What each document says beyond the pattern</summary>
            <ul class="s7-list small">
              <li>
                Lovable's §10.1 bars training on Customer Personal Data while §9.1(c) permits <Q id="7.8">training or tuning proprietary machine-learning models</Q> on Service Data; the two <Q id="7.8">appear to conflict</Q>. <Chip code="CP" />
              </li>
              <li>
                Replit's ToS grants a licence to <Q id="7.8">copy, display, distribute, perform, reformat, and modify your content</Q> and to access private apps for <Q id="7.8">troubleshooting, improving our service</Q>, and does not state whether content trains models; its DPA and Commercial Agreement were not read (gap). <Chip code="CP" />
              </li>
              <li>
                Cursor's security page says Privacy Mode means <Q id="7.8">we will not train on your data</Q>, inheritable by team members, without using the words <Q id="7.8">zero data retention</Q> (<Cite href={SRC.cursor}>Cursor security</Cite>). <Chip code="CP" />
              </li>
            </ul>
          </details>
        </div>
        <div class="stack s7-checklist">
          <h3 class="eyebrow">
            Checklist <Chip code="PROP" />, grounded in Art. 28(3) <Chip code="CP" />
          </h3>
          {checklist.t === 'ol' && (
            <ol class="s7-check">
              {checklist.items.map((it, i) => (
                <li key={i}>
                  <span>
                    <Inline nodes={it} />
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}

function StandardsDpa() {
  return (
    <div class="stack-lg">
      <ClauseMap />
      <hr class="rule" />
      <DpaPattern />
    </div>
  );
}

// ---- Deck ---------------------------------------------------------------------------------------

const slides: SlideDef[] = [
  {
    slug: 's07-gdpr-tree',
    section: '7',
    title: 'GDPR breach notification is risk-thresholded, not automatic',
    short: 'GDPR decision tree',
    dek: 'A breach is notified to the authority unless it is unlikely to result in a risk, and communicated to individuals only where the risk is high. Every breach is documented, notifiable or not.',
    paper: ['7.1'],
    flags: { legal: true, dated: true },
    Body: GdprTree,
  },
  {
    slug: 's07-gdpr-failure-modes',
    section: '7',
    title: 'The EDPB framework already supplies the analysis for each failure mode',
    short: 'Tree per failure mode',
    dek: 'The same three steps applied to each of the four failure modes, cell for cell from the paper’s table; then who is controller for personal sign-ups, and how the app registry feeds the GDPR records.',
    paper: ['7.1', '7.2'],
    flags: { legal: true, dated: true },
    Body: FailureModes,
  },
  {
    slug: 's07-ai-act',
    section: '7',
    title: 'The AI Act regulates the deployed app’s behaviour, not how its code was written',
    short: 'AI Act test',
    dek: 'A vibe-coded CRUD tool is not an “AI system”. An LLM feature placed into service under the enterprise’s own name likely makes it the provider, with Art. 50 transparency applying from 2 August 2026.',
    paper: ['7.3'],
    flags: {
      legal: true,
      dated: true,
      prop: 'The three-question test is the authors’ framing of Art. 3(1) and the Commission’s February 2025 guidelines; the statutory text, dates and fines shown with it are the regulation’s.',
    },
    Body: AiAct,
  },
  {
    slug: 's07-nis2-dora-cra',
    section: '7',
    title: 'NIS2 and DORA duties attach only to in-scope entities',
    short: 'NIS2, DORA, CRA, UK, US',
    dek: 'Neither instrument names AI builders or coding assistants, and DORA’s strongest clauses reach only critical or important functions. The Cyber Resilience Act turns on whether a product is placed on the market.',
    paper: ['7.4', '7.5', '7.6'],
    flags: { legal: true, dated: true },
    Body: Nis2DoraCra,
  },
  {
    slug: 's07-standards-dpa',
    section: '7',
    title: 'The clauses exist; what is missing is a citizen-developer role',
    short: 'Clause map and DPA checklist',
    dek: 'The paper’s controls map onto existing GDPR, ISO/IEC 27001, NIST SSDF and OWASP clauses. The three vendor documents read share one contractual pattern; the authors propose a procurement checklist grounded in Art. 28(3).',
    paper: ['7.7', '7.8'],
    flags: {
      legal: true,
      dated: true,
      prop: 'The eight-item DPA checklist is the authors’ proposal, grounded in Art. 28(3); the clause map and the pattern across the contracts are read from the sources.',
    },
    Body: StandardsDpa,
  },
];
export default slides;
