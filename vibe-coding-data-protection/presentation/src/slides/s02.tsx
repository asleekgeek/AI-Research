import { useState } from 'react';
import type { SlideDef } from './types';
import { Chip, Chips } from '../components/Chip';
import { Inline, plain } from '../components/Inline';
import { section, table } from '../lib/data';
import { SourceLink, codesIn, linkIn } from './s01-helpers';
import './s02.css';

// ---- s02-audit-a1-a12 -------------------------------------------------------------------------

/** The verdict label exactly as the paper's table prints it, with a glyph so it reads without colour. */
function VerdictPill({ text }: { text: string }) {
  const refined = /refined/i.test(text);
  return (
    <span class={`aud-verdict${refined ? ' is-refined' : ''}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={refined ? 'M2.5 13.5l4 4 7.5-8.5M19 4.5v7M15.5 8h7' : 'M5 12.5l4.5 4.5L19 7.5'} />
      </svg>
      {text}
    </span>
  );
}

function AuditGrid() {
  const t = table('2.1#1');
  const rows = t.rows.map((r) => ({ id: plain(r[0]), finding: r[1], verdict: plain(r[2]), adds: r[3], codes: codesIn(r[3]) }));
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const allOpen = rows.every((r) => open.has(r.id));
  const toggle = (id: string) =>
    setOpen((s) => {
      const x = new Set(s);
      if (x.has(id)) x.delete(id);
      else x.add(id);
      return x;
    });
  return (
    <div class="stack-lg">
      <p class="lead aud-lead">
        The audit (8 October 2026) was a technical and evidentiary critique that checked a subset of consequential claims against primary sources. Its executive judgment, that the thesis is sound and the certainty labels are not, is correct.
      </p>
      <div class="stack">
        <div class="aud-bar">
          <h2 class="eyebrow">
            {t.headPlain[1]} · {t.headPlain[2]}
          </h2>
          <button type="button" class="toggle" aria-pressed={allOpen} onClick={() => setOpen(allOpen ? new Set() : new Set(rows.map((r) => r.id)))}>
            Expand all
          </button>
        </div>
        <ul class="aud-grid">
          {rows.map((r) => {
            const o = open.has(r.id);
            return (
              <li key={r.id} class={`aud-card${o ? ' is-open' : ''}`}>
                <div class="aud-top">
                  <span class="aud-id">{r.id}</span>
                  <VerdictPill text={r.verdict} />
                </div>
                <p class="aud-finding">
                  <Inline nodes={r.finding} />
                </p>
                <button type="button" class="aud-toggle" aria-expanded={o} aria-controls={`aud-p-${r.id}`} onClick={() => toggle(r.id)}>
                  <span class="aud-toggle-icon" aria-hidden="true" />
                  <span class="aud-toggle-label">{t.headPlain[3]}</span>
                  <Chips codes={r.codes} />
                </button>
                <div id={`aud-p-${r.id}`} class="aud-adds" hidden={!o}>
                  <Inline nodes={r.adds} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// ---- s02-audit-gaps ---------------------------------------------------------------------------

/** §2.3 item 1, condensed; the other six items are short enough to show verbatim. */
function GapA3() {
  return (
    <>
      Did not state that the 30 October change leaves function <code>EXECUTE</code> defaults untouched, the specific reason an agent-created RPC can remain anonymously callable in a project that believes itself "secure by default" <Chip code="CP" />/<Chip code="INF" />. Nor did it note that the RLS event trigger is opt-in per project, or that the default-privilege revokes are issued <code>for role postgres</code> and would not cover tables created by another owner role <Chip code="INF" />.
    </>
  );
}

function Gaps() {
  const items = (section('2.3').blocks[0] as { t: 'ol'; items: any[] }).items;
  return (
    <ol class="ag-gaps">
      {items.map((nodes, i) => {
        const [lead, ...rest] = nodes;
        return (
          <li key={i}>
            <span class="ag-n" aria-hidden="true">
              {i + 1}
            </span>
            <p>
              <strong class="ag-gap-title">{lead.t === 'b' ? plain(lead.c) : ''}</strong> {i === 0 ? <GapA3 /> : <Inline nodes={lead.t === 'b' ? rest : nodes} />}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

const QUOTES = [
  { who: 'Anthropic', lead: 'Bash deny rules are not', q: 'a security boundary around the program', src: 'Claude Code permissions' },
  { who: 'GitHub', lead: 'The Copilot firewall', q: 'should not be considered a comprehensive security solution', src: 'GitHub Docs' },
  { who: 'Cursor', lead: 'Auto-review is', q: 'not a security boundary', src: 'Cursor Run modes' },
];

function SectionsBJ() {
  const s = (label: string) => linkIn('2.2', label);
  return (
    <ul class="ruled ag-bj">
      <li>
        <span class="ag-k">B</span>
        <div class="stack ag-body">
          <h3 class="h3">Incident evidence</h3>
          <p>
            The ledger the audit asked for is supplied in <a href="#s03-timeline">section 3.2</a> for 12 core and 8 new incidents; every audit judgment in section B is upheld. Three "open" items are now resolvable:
          </p>
          <ul class="ag-sub">
            <li>
              the CVSS gap is a Scope-metric difference (researcher <code>S:U</code> 8.26 vs MITRE <code>S:C</code> 9.3) <Chip code="CP" /> <SourceLink href={s('Palmer')}>Palmer</SourceLink> <SourceLink href={s('MITRE CVE JSON')}>MITRE CVE JSON</SourceLink>
            </li>
            <li>
              the Escape denominator is 1,400 <Chip code="VR" />
            </li>
            <li>
              the RedAccess 5,000/2,000 is reconciled from the PDF <Chip code="VR" />
            </li>
          </ul>
          <p>
            The Lovable regression scope remains contested, but Lovable's own concession that free-tier projects were public by default until November 2025 narrows the gap for free-tier users <Chip code="CP" /> <SourceLink href={s('Lovable')}>Lovable</SourceLink>
          </p>
        </div>
      </li>
      <li>
        <span class="ag-k">C</span>
        <div class="stack ag-body">
          <h3 class="h3">Statistics</h3>
          <p>
            All seven items executed in section 5. On C7 (slopsquatting) the audit's direction was right, but a positive case existed seven weeks before the audit date <Chip code="VR" />
          </p>
        </div>
      </li>
      <li>
        <span class="ag-k">D</span>
        <div class="stack ag-body">
          <h3 class="h3">Vendor capability</h3>
          <p>The four-boundary model is adopted as the organising principle of section 4; the eight-column buyer-validation matrix was built and dated (section 4.2).</p>
        </div>
      </li>
      <li>
        <span class="ag-k">E</span>
        <div class="stack ag-body">
          <h3 class="h3">Agent controls</h3>
          <p>
            The audit's warning that "deterministic" must not mean "cannot be bypassed" is confirmed in the vendors' own words <Chip code="CP" />
          </p>
          <div class="ag-quotes">
            {QUOTES.map((x) => (
              <figure key={x.who} class="ag-quote">
                <blockquote>
                  <p>
                    {x.lead} <q>{x.q}</q>
                  </p>
                </blockquote>
                <figcaption>
                  {x.who} · <SourceLink href={s(x.src)}>{x.src}</SourceLink>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </li>
      <li>
        <span class="ag-k">F–J</span>
        <div class="stack ag-body">
          <h3 class="h3">Adopted</h3>
          <p>
            F is extended with the controller/processor analysis for personal sign-ups (7.1) and the DORA Art. 30(3)(e) audit-rights gap (7.8); G's "Discovery" item is now a verified finding; H's seven invariants and I's ten tests are carried into section 9; every P0, P1 and P2 rewrite item in J is executed.
          </p>
        </div>
      </li>
    </ul>
  );
}

function AuditGaps() {
  return (
    <div class="stack-lg">
      <div class="ag-layout">
        <section class="stack" aria-labelledby="ag-gaps-h">
          <h2 id="ag-gaps-h" class="eyebrow">
            {section('2.3').title}
          </h2>
          <Gaps />
        </section>
        <section class="stack" aria-labelledby="ag-bj-h">
          <h2 id="ag-bj-h" class="eyebrow">
            Audit sections B–J
          </h2>
          <SectionsBJ />
        </section>
      </div>
      <div class="ag-closing">
        <p class="closing-line">None of these reverses an audit conclusion; they are gaps in a review that was explicit about not being line-by-line.</p>
        <p class="muted">The audit's instruction to obtain qualified legal review before publication stands and is repeated in section 11.</p>
      </div>
    </div>
  );
}

const slides: SlideDef[] = [
  {
    slug: 's02-audit-a1-a12',
    section: '2',
    title: "Fresh research confirms all twelve of the audit's priority corrections",
    short: 'Audit A1–A12',
    dek: 'Fresh primary-source research confirms all twelve priority corrections, refines eight of them, and finds the audit itself incomplete or out of date in six places.',
    paper: ['2.1'],
    flags: { dated: true },
    Body: AuditGrid,
  },
  {
    slug: 's02-audit-gaps',
    section: '2',
    title: "The audit's gaps are real, but none reverses its conclusions",
    short: 'Audit gaps',
    dek: 'Where the audit was incomplete or wrong, and where its sections B–J now stand.',
    paper: ['2.2', '2.3'],
    flags: { dated: true },
    Body: AuditGaps,
  },
];
export default slides;
