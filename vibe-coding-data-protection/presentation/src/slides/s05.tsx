import type { SlideDef } from './types';
import { Bars } from '../components/Bars';
import { Chip } from '../components/Chip';
import { FigRef, FigTile } from '../components/Figure';
import { Inline } from '../components/Inline';
import { table } from '../lib/data';
import { FigSource, Fraction, Range, SkillChart } from './s05-viz';
import './s05.css';

function Benchmarks() {
  return (
    <div class="stack-lg">
      <div class="s5-two">
        <section class="stack" aria-labelledby="s5-sv">
          <span class="eyebrow">SusVibes · ICML 2026</span>
          <h2 id="s5-sv" class="h2">Passing the tests is not the same as passing the security tests</h2>
          <p class="small">
            200 Python feature-request tasks from 108 open-source repositories, each rebuilt from a CVE-linked fix. An agent passes only when its code satisfies the functional tests <em>and</em> the security tests for that CWE <Chip code="RR" />.
          </p>
          <Bars
            max={100}
            unit="%"
            specs={[
              { n: 19, label: 'SWE-agent + Claude 4 Sonnet: functional pass', value: 61.0, display: '61.0%', tone: 'ghost' },
              { n: 18, label: 'SWE-agent + Claude 4 Sonnet: secure and correct', value: 10.5, display: '10.5%' },
              { n: 18, label: 'OpenHands + Claude 4 Sonnet: secure and correct', value: 12.5, display: '12.5% best' },
              { n: 18, label: 'Claude Code + Claude 4 Sonnet: secure and correct', value: 6.0, display: '6.0% Claude Code' },
            ]}
          />
          <ul class="s5-notes small">
            <li>
              Every run already included the reminder "Make sure to follow best security practices and avoid common vulnerabilities" <Chip code="RR" />.
            </li>
            <li>
              Adding the exact target CWE left the joint rate at 10.5% while cutting the functional pass to 56.0% <FigRef n={20} />.
            </li>
            <li>
              "Over 80%" of functionally correct solutions were insecure (82.8% for SWE-agent + Claude 4 Sonnet) <Chip code="RR" />. SecPass is an upper bound on true security <Chip code="RR" />
              <Chip code="INF" />.
            </li>
            <li>
              The released v1.0 dataset holds 186 tasks, not 200 <Chip code="RR" />.
            </li>
          </ul>
          <p class="s5-verdict">It is not a measure of vibe-coded apps.</p>
        </section>

        <section class="stack" aria-labelledby="s5-vc">
          <span class="eyebrow">Veracode · March 2026</span>
          <h2 id="s5-vc" class="h2">"Flat at roughly 55%" rests on four CWEs, none of them authorisation</h2>
          <p class="small">
            80 tasks (4 languages × 4 CWEs: SQL injection, XSS, log injection, weak crypto), judged by Veracode's own SAST, with no security prompting by design <Chip code="VR" />.
          </p>
          <Bars
            max={100}
            unit="%"
            specs={[
              { n: 21, label: 'All models, overall security pass', value: 55, display: '55% overall' },
              { n: 21, label: 'Java', value: 29, display: 'Java 29%' },
              { n: 21, label: 'XSS', value: 15, display: 'XSS 15% pass' },
            ]}
          />
          <Range n={21} label="GPT-5-series with extended reasoning" display="70–72%" />
          <p class="small">
            The corrected statement: average security pass for frontier non-reasoning models stayed in a 45–55% band from 2023 to March 2026 on a vendor SAST-judged, four-CWE suite with no authorisation CWEs, with a documented exception for reasoning modes <Chip code="INF" />.
          </p>
          <p class="small muted">
            BaxBench independently finds reasoning models (o1, o3-mini, DeepSeek-R1) are the only class that benefits from generic security reminders <Chip code="RR" />.
          </p>
        </section>
      </div>
    </div>
  );
}

function Prompting() {
  return (
    <div class="stack-lg">
      <div class="s5-two">
        <section class="stack" aria-labelledby="s5-dr">
          <span class="eyebrow">Deng, Fan and Meng · real deployed vibe-coded apps</span>
          <h2 id="s5-dr" class="h2">Phrasing moved reintroduction more than model tier did</h2>
          <Bars
            max={100}
            unit="%"
            labelWidth="12rem"
            specs={[
              { n: 17, label: 'Baseline', value: 25.7, display: 'Baseline 25.7%', tone: 'ghost' },
              { n: 17, label: 'One-line "production-ready" framing', value: 11.0, display: 'production-ready 11.0%' },
              { n: 17, label: 'Security-hardening skill', value: 11.9, display: 'hardening skill 11.9%' },
              { n: 17, label: 'Long "professional" technical prompt', value: 45.7, display: 'professional prompt 45.7%', tone: 'alt' },
            ]}
            caption={<>Reintroduction rate over 1,680 runs of 70 confirmed vulnerabilities.</>}
          />
          <p class="small">
            A stronger model tier changed nothing (+0.5 pp); in 20.7% of reintroductions the agent "recognized the risk and still shipped the insecure code" <Chip code="RR" />.
          </p>
        </section>

        <section class="stack" aria-labelledby="s5-ur">
          <span class="eyebrow">Urmi et al. · synthetic tasks, single shot</span>
          <h2 id="s5-ur" class="h2">Security framing shifts severity shares among valid outputs</h2>
          <Bars
            max={100}
            unit="%"
            labelWidth="10rem"
            specs={[
              { n: 22, label: 'Any finding: from', value: 76.3, display: 'any finding 76.3%', tone: 'ghost' },
              { n: 22, label: 'Any finding: to', value: 72.0, display: '72.0%' },
              { n: 22, label: 'High severity: from', value: 20.8, display: 'High 20.8%', tone: 'ghost' },
              { n: 22, label: 'High severity: to', value: 13.6, display: '13.6%' },
              { n: 22, label: 'Low severity: from', value: 32.0, display: 'low 32.0%', tone: 'ghost' },
              { n: 22, label: 'Low severity: to', value: 43.5, display: '43.5%' },
            ]}
            caption={<>Shares of valid GPT-4o files; absolute counts were never reported.</>}
          />
          <p class="small">
            With a minimal prompt GPT-4o returned valid code on only 86 of 424 tasks; structured prompts raised that to about 380 <Chip code="RR" />. The result is evidence that security framing changes what the model writes, not evidence that prompting cannot reduce counts <Chip code="INF" />.
          </p>
        </section>

        <section class="stack" aria-labelledby="s5-sh">
          <span class="eyebrow">Shukla et al. · iteration</span>
          <h2 id="s5-sh" class="h2">Findings pile up over LLM-only rounds</h2>
          <Bars
            max={158}
            specs={[
              { n: 23, label: 'Feature-focused rounds', value: 158, display: 'feature-focused 158 findings', tone: 'alt' },
              { n: 23, label: 'Security-focused rounds', value: 38, display: 'Security-focused 38' },
            ]}
            caption={<>Findings by strategy, 400 samples, GPT-4o, 10 rounds.</>}
          />
          <p class="small">
            Per-sample means rose from about 2.1 (rounds 1–2) to 6.2 (rounds 8–10) <Chip code="RR" />. The abstract's "37.6% increase" has no defined baseline in the body and should not be quoted as a precise figure <Chip code="RR" />
            <Chip code="INF" />. The authors' operating rule, at most three LLM-only rounds between human reviews, is reasonable <Chip code="RR" />.
          </p>
        </section>

        <section class="stack" aria-labelledby="s5-sk">
          <span class="eyebrow">Supabase agent skill · vendor evaluation</span>
          <h2 id="s5-sk" class="h2">Directionally positive on six scenarios; MCP without the skill regressed one model</h2>
          <SkillChart />
          <p class="small">
            With n = 6 a swing of one scenario is about 17 pp; the deltas are within one or two scenarios <Chip code="INF" />. The Opus 4.6 regression when the MCP server was added without the skill shows that more tools without rules can reduce security outcomes <Chip code="VR" />
            <Chip code="INF" />.
          </p>
        </section>
      </div>
      <p class="lead">
        The cross-study pattern is a correctness tax; prompting helps on short tasks with reasoning-class models and concise framing, and does not help on long agentic trajectories, with weaker models, or where the model knows the risk and ships anyway <Chip code="INF" />.
      </p>
    </div>
  );
}

function AiReview() {
  return (
    <div class="stack-lg">
      <div class="s5-two">
        <section class="stack" aria-labelledby="s5-mp">
          <span class="eyebrow">MalPR-Bench · Chen et al.</span>
          <h2 id="s5-mp" class="h2">The reviewer found flaws in the diff, not flaws that were missing</h2>
          <p class="small">
            The one 2026 study that checks whether a reviewer identified the actual vulnerability. Cells are held-out malicious PRs; filled cells are those where CodeRabbit pointed at the true flaw <Chip code="RR" />.
          </p>
          <Fraction n={25} label="Evidence inside the touched files" display="16 of 24 in-diff" />
          <Fraction n={25} label="Evidence outside the touched files" display="0 of 7 out-of-diff" />
          <Fraction n={25} label="Absence-type (missing-check) cases" display="3 of 14 absence-type" />
          <p class="small">
            That is the profile of a missing RLS policy, a missing ownership check or an inverted guard <Chip code="INF" />. <FigSource n={25} />
          </p>
        </section>
        <section class="stack" aria-labelledby="s5-pr">
          <span class="eyebrow">What the other numbers measure</span>
          <h2 id="s5-pr" class="h2">Precision from two vendors' datasets cannot be merged, and neither reports recall</h2>
          <Range n={27} label="Augment dataset" display="20–68%" />
          <Range n={27} label="Signal65, CodeRabbit-commissioned" display="64–96%" />
          <p class="small muted">
            <span data-chrome>Ranges drawn on a 0 to 100% scale.</span> <FigSource n={27} />
          </p>
          <div class="grid-2">
            <FigTile n={26} compact />
            <FigTile n={49} compact />
          </div>
          <p class="small">
            Copilot Autofix's figure is a remediation-speed metric for CodeQL-detected alerts, not a detection result <Chip code="VR" />.
          </p>
        </section>
      </div>
      <p class="lead">
        A clean AI review is not evidence of absence; use it to find and fix faster and keep deterministic scanners and behavioural tests as the gate <Chip code="INF" />.
      </p>
    </div>
  );
}

function Packages() {
  return (
    <div class="stack-lg">
      <div class="grid-3">
        <FigTile n={28} compact />
        <FigTile n={29} compact />
        <FigTile n={30} compact />
      </div>
      <div class="s5-two">
        <section class="stack" aria-labelledby="s5-ladder-pk">
          <h2 id="s5-ladder-pk" class="h2">
            Evidence ladder as of October 2026 <Chip code="INF" />
          </h2>
          <ol class="s5-evidence">
            <li class="yes">
              <span class="s5-ev-state">Confirmed</span> Hallucination
            </li>
            <li class="yes">
              <span class="s5-ev-state">Confirmed</span> Registration of hallucinated names, once with malicious code
            </li>
            <li class="yes">
              <span class="s5-ev-state">Confirmed</span> Autonomous agents installing hallucinated names from skill files
            </li>
            <li class="no">
              <span class="s5-ev-state">Not documented</span> Victim compromise
            </li>
          </ol>
          <p class="small">
            <code>unused-imports</code> (npm) is "a real malicious package" on a name LLMs produce instead of <code>eslint-plugin-unused-imports</code>, "potentially an intentional slopsquatting attack" whose intent Aikido "can't prove" <Chip code="VR" />. The CSA's "tens of thousands of downloads" line conflates a benign placeholder with the malicious package and should not be repeated as malicious reach <Chip code="INF" />.
          </p>
        </section>
        <section class="stack" aria-labelledby="s5-gt">
          <h2 id="s5-gt" class="h2">CVEs attributed to AI-authored code</h2>
          <FigTile n={31} />
          <p class="small">The researcher calls the count a lower bound reflecting "detection blind spots" <Chip code="RR" />.</p>
        </section>
      </div>
    </div>
  );
}

function Population() {
  return (
    <div class="stack-lg">
      <div class="grid-3">
        <FigTile n={14} />
        <FigTile n={15} />
        <FigTile n={16} />
      </div>
      <div class="s5-two">
        <section class="stack" aria-labelledby="s5-meth">
          <h2 id="s5-meth" class="h2">
            How the sample was drawn <Chip code="RR" />
          </h2>
          <ol class="steps small">
            <li>Fingerprinted 74,800 repositories (Claude Code <code>.claude/</code> and Lovable meta tags)</li>
            <li>Kept 9,041 with at least 90% AI-authored commits and lines</li>
            <li>Found 1,007 deployed</li>
            <li>Randomly sampled 200 deployed web apps</li>
            <li>Confirmed 1,186 vulnerabilities by two-author manual exploitability review (κ = 0.87)</li>
          </ol>
          <p class="small muted">
            The only randomly sampled population study; the large scans are not independent samples (paper §3.4). <a href="#s03-denominators">See the scan denominators</a>.
          </p>
        </section>
        <section class="stack" aria-labelledby="s5-find">
          <h2 id="s5-find" class="h2">
            What it found <Chip code="RR" />
          </h2>
          <ul class="s5-notes small">
            <li>Median 6 vulnerabilities per vulnerable app; 65.77% Critical or High.</li>
            <li>Broken Access Control: 339 findings (28.58%) in 64.0% of apps, 77% of them backend. Injection in 54.0%; Authentication Failures in 51.5%.</li>
            <li>Root causes: knowledge defects 63.4% (of which "hidden security rules" 55.5%), objective defects 23.1% ("demo-oriented design" 14.7%), memory defects 13.5%.</li>
          </ul>
          <blockquote class="quote">
            "generated apps should be treated as prototypes"
            <cite>
              The authors' advice <Chip code="RR" />{' '}
              <a href="https://arxiv.org/html/2606.23130v4" target="_blank" rel="noopener noreferrer">
                arXiv 2606.23130v4
              </a>
            </cite>
          </blockquote>
          <p class="small">
            No study counts cross-tenant or RLS-correctness failures separately, and no study measures builder expertise; "non-developer builders" is inferred from platform, not measured <Chip code="INF" />.
          </p>
        </section>
      </div>
    </div>
  );
}

function Ladder() {
  const t = table('5.9#1');
  const rungs = t.rows.map((r, i) => ({ r, i })).reverse();
  return (
    <div class="stack-lg">
      <div class="s5-ladder" role="list" aria-label="Revised determinism ladder, most deterministic first">
        <div class="s5-ladder-axis" aria-hidden="true">
          <span>More deterministic</span>
        </div>
        <div class="s5-rungs">
          {rungs.map(({ r, i }) => (
            <article class="s5-rung" role="listitem" key={i} data-rung={i}>
              <div class="s5-rung-name">
                <h2 class="h3">
                  <Inline nodes={r[0]} />
                </h2>{' '}
                <span class="small muted">
                  <Inline nodes={r[1]} />
                </span>
              </div>
              {' '}
              <div class="s5-rung-ev small">
                <span class="eyebrow">{t.headPlain[2]}</span>{' '}
                <span>
                  <Inline nodes={r[2]} />
                </span>
              </div>
              {' '}
              <div class="s5-rung-verdict">
                <span class="eyebrow">{t.headPlain[3]}</span>{' '}
                <strong>
                  <Inline nodes={r[3]} />
                </strong>
              </div>
            </article>
          ))}
        </div>
      </div>
      <p class="small muted">
        Rungs and wording are the paper's table §5.9, shown with the most deterministic rung at the top. No new evidence in this pass measures the last three rungs (deterministic in-loop checks, secure templates and generator defaults, hard boundaries); their verdicts rest on the incident record and architecture reasoning, as the audit (A12) observed <Chip code="INF" />.
      </p>
    </div>
  );
}

const slides: SlideDef[] = [
  {
    slug: 's05-benchmarks',
    section: '5',
    title: 'The benchmarks measure developer agents on narrow suites, not vibe-coded apps',
    short: 'Benchmarks',
    dek: 'SusVibes scores developer agents on CVE-derived Python tasks; Veracode scores models on a four-CWE suite. Neither samples vibe-coded apps.',
    paper: ['5.1', '5.2'],
    Body: Benchmarks,
  },
  {
    slug: 's05-prompting',
    section: '5',
    title: 'Prompting shifts the correctness-versus-security trade-off; whether that helps depends on model, task and phrasing',
    short: 'Prompting, iteration, skills',
    dek: 'Nothing in this evidence caps damage; that is the job of the boundaries.',
    paper: ['5.3', '5.4', '5.5'],
    Body: Prompting,
  },
  {
    slug: 's05-ai-review',
    section: '5',
    title: 'AI review has structurally low recall for authorisation bugs',
    short: 'AI review',
    dek: 'Reviewers identified flaws inside the diff far more often than flaws that were missing.',
    paper: ['5.6'],
    Body: AiReview,
  },
  {
    slug: 's05-packages',
    section: '5',
    title: 'Package hallucination is measured and persistent; a documented victim compromise is not',
    short: 'Hallucinated packages',
    paper: ['5.7'],
    Body: Packages,
  },
  {
    slug: 's05-population',
    section: '5',
    title: 'In the one random sample of deployed vibe-coded apps, 182 of 200 were vulnerable',
    short: 'Population evidence',
    dek: 'Broken Access Control appeared in 64.0% of them, and over half of all confirmed findings traced to the platform\'s "hidden security rules".',
    paper: ['5.8'],
    Body: Population,
  },
  {
    slug: 's05-ladder',
    section: '5',
    title: 'Prompts are never a control; demonstrable risk reduction lives in hard boundaries',
    short: 'Determinism ladder',
    paper: ['5.9'],
    Body: Ladder,
  },
];
export default slides;
