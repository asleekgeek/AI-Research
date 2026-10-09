import type { SlideDef } from './types';
import { Inline, plain } from '../components/Inline';
import { capFirst, para, splitOn, splitOnce, splitTrailingSentence, stripLead, stripTrail } from './s01-helpers';
import './s12.css';

/** §12, first paragraph: the three changes, condensed with the paper's hedges kept. */
const CHANGES = [
  {
    ord: 'First',
    head: 'The leak class is structural and stable',
    body: (
      <>
        <p>
          The one random-sample study, the five non-independent scans and twenty incidents agree that the dominant defect is authorisation on a reachable data API, created by the same mechanism the agents use to build (programmatic table creation without grants and policies), and that seventeen months of model releases have not visibly moved the exposure rate.
        </p>
        <p>
          Vendors changed defaults at the storage layer, which closes the new-table path on Supabase from 30 October 2026 but leaves existing tables, RPC <code>EXECUTE</code> and every other BaaS where they were.
        </p>
      </>
    ),
  },
  {
    ord: 'Second',
    head: 'The agent plane has a documented, vendor-acknowledged anatomy',
    body: (
      <p>
        Sandboxes bound shell commands and nothing else; MCP, hooks and file tools run on the host; allowlists bound destinations, not exfiltration; and the only categorical control anyone has shipped is Replit's removal of production from the agent's reach.
      </p>
    ),
  },
  {
    ord: 'Third',
    head: 'The legal picture is more precise and less dramatic than "every exposure is a reportable breach"',
    body: <p>The EDPB framework already decides each failure mode, the AI Act does not reach a CRUD tool, and DORA bites through contract terms that consumer-grade builders do not offer.</p>,
  },
];

/** Where the paper treats each decision (navigation aid; slugs from the deck outline). */
const WHERE = [
  { label: 'B3 · §4.4', href: '#s04-b3-trust-paths' },
  { label: 'B1 · §4.2', href: '#s04-b1-vendors' },
  { label: 'B4 · §4.5.5', href: '#s04-b4-recovery' },
  { label: 'B4 · §4.5.6', href: '#s04-b4-recovery' },
  { label: '§6.3', href: '#s06-registry-lifecycle' },
];

function Conclusion() {
  const [head, rest] = splitOnce(para('12', 1), ': ');
  const items = splitOn(rest, '; ');
  const [last, closing] = splitTrailingSentence(items[items.length - 1]);
  items[items.length - 1] = last;
  const decisions = items.map((n) => capFirst(stripLead(stripTrail(n, /\.$/), /^and /)));
  if (decisions.length !== WHERE.length) throw new Error('s12-conclusion: §12 decision list changed');
  return (
    <div class="cc-layout">
      <section class="stack" aria-labelledby="cc-changes-h">
        <h2 id="cc-changes-h" class="eyebrow">
          Three things changed
        </h2>
        <ol class="cc-changes">
          {CHANGES.map((c) => (
            <li key={c.ord}>
              <span class="eyebrow cc-ord">{c.ord}</span>
              <h3 class="cc-head">{c.head}</h3>
              <div class="cc-body">{c.body}</div>
            </li>
          ))}
        </ol>
      </section>
      <section class="stack cc-decide" aria-labelledby="cc-decide-h">
        <h2 id="cc-decide-h" class="eyebrow">
          Decide these first
        </h2>
        <p class="cc-intro">{plain(head)}:</p>
        <ul class="cc-checklist">
          {decisions.map((d, i) => (
            <li key={i}>
              <input type="checkbox" id={`cc-d${i}`} />
              <label for={`cc-d${i}`}>
                <Inline nodes={d} />
              </label>
              <a class="cc-where" href={WHERE[i].href} title={`Where the paper covers this: ${WHERE[i].label}`}>
                {WHERE[i].label}
              </a>
            </li>
          ))}
        </ul>
        <p class="closing-line cc-closing">
          <Inline nodes={closing} />
        </p>
      </section>
    </div>
  );
}

const slides: SlideDef[] = [
  {
    slug: 's12-conclusion',
    section: '12',
    title: 'Five decisions that generated code cannot override',
    short: 'Conclusion',
    dek: 'Three things changed between the original report and this paper, and they leave a short list of decisions to settle.',
    paper: ['12'],
    flags: { dated: true },
    Body: Conclusion,
  },
];
export default slides;
