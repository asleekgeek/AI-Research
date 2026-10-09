import type { SlideDef } from './types';
import { FigTile } from '../components/Figure';
import { Chip } from '../components/Chip';
import { Inline } from '../components/Inline';
import { CODES, DATE_OF_RECORD, legend, section, table } from '../lib/data';
import './s00.css';

const BOUNDARIES = [
  { id: 'B1', name: 'Builder identity and workspace', q: 'Who may create projects, connect data sources, publish externally, download code?' },
  { id: 'B2', name: 'Published-app ingress', q: 'Who can load the app and call its server routes, through every origin?' },
  { id: 'B3', name: 'The data and connector API', q: 'What may a principal read or change, through every surface?' },
  { id: 'B4', name: 'The agent execution plane', q: 'What can the coding agent read, install, transmit or destroy?' },
];

function Title() {
  return (
    <div class="stack-lg">
      <div class="title-grid">
        <section class="stack" aria-labelledby="t-bound">
          <h2 id="t-bound" class="eyebrow">Controls bind only at four boundaries the code does not own</h2>
          <ol class="boundary-list">
            {BOUNDARIES.map((b) => (
              <li key={b.id}>
                <span class="b-id">{b.id}</span>
                <span class="b-name">{b.name}</span>
                <span class="b-q">{b.q}</span>
              </li>
            ))}
          </ol>
          <p class="small muted">
            Core questions from the paper's boundary model (§4.1). At each boundary the paper gives the exact semantics, the dated vendor defaults, the behavioural test that proves the control works, and the documented bypass.
          </p>
        </section>
        <section class="stack" aria-labelledby="t-evidence">
          <h2 id="t-evidence" class="eyebrow">On the one exploit-confirmed benchmark of real deployed vibe-coded apps</h2>
          <FigTile n={14} />
          <FigTile n={15} compact />
        </section>
      </div>
      <hr class="rule" />
      <div class="grid-3 takeaways">
        <a class="takeaway" href="#s03-failure-modes">
          <span class="eyebrow">Evidence base</span>
          <span>In 20 incidents and seven large-scale scans verified against primary sources, the demonstrated capability was always one of four structural conditions.</span>
        </a>
        <a class="takeaway" href="#s05-ladder">
          <span class="eyebrow">Generation-time controls</span>
          <span>Prompts, rules files and AI review measurably shift the correctness-versus-security trade-off but never cap damage.</span>
        </a>
        <a class="takeaway" href="#s07-gdpr-tree">
          <span class="eyebrow">Legal layer</span>
          <span>Technology-neutral and already reaches every failure mode; GDPR notification is risk-thresholded rather than automatic.</span>
        </a>
      </div>
      <p class="small muted">
        Everything quantitative or evaluative carries an evidence-confidence tag; the tiered model, the rollout plan and the KPIs marked as proposals are the authors' design, not measured practice. Date of record {DATE_OF_RECORD}.
      </p>
    </div>
  );
}

function HowToRead() {
  const legendRows = table('0#1').rows;
  const terms = section('0').blocks[4];
  const dateOfRecord = section('0').blocks[0];
  return (
    <div class="stack-lg">
      <div class="legend-grid" role="list">
        {CODES.map((c, i) => (
          <div class="legend-item" role="listitem" key={c}>
            <Chip code={c} large />
            <div class="stack" style={{ gap: '4px' }}>
              <strong>{legend[c]}</strong>
              <span class="small">
                <Inline nodes={legendRows[i][1]} />
              </span>
            </div>
          </div>
        ))}
      </div>
      <div class="grid-2">
        <div class="card">
          <h2 class="h3">Date of record</h2>
          <p class="small">{dateOfRecord.t === 'p' && <Inline nodes={dateOfRecord.c} />}</p>
        </div>
        <div class="card">
          <h2 class="h3">Terminology</h2>
          <p class="small">{terms.t === 'p' && <Inline nodes={terms.c} />}</p>
        </div>
      </div>
      <p class="small muted">
        Press <kbd>S</kbd> on any slide for the paper's own text behind it, <kbd>L</kbd> for this legend, <kbd>O</kbd> for all slides.
      </p>
    </div>
  );
}

const slides: SlideDef[] = [
  {
    slug: 'title',
    section: '0',
    title: 'Boundaries, not prompts, contain vibe-coded leaks',
    short: 'Thesis',
    dek: 'Data leaks from vibe-coded applications and AI coding agents almost never come from clever-but-wrong generated code; they come from four structural conditions that the generated code cannot see and the builder does not know exist.',
    paper: ['0'],
    Body: Title,
  },
  {
    slug: 's00-how-to-read',
    section: '0',
    title: 'Every claim carries its evidence tag',
    short: 'How to read',
    dek: 'Six codes mark how directly each quantitative claim and control verdict was verified. They travel with the claim on every slide.',
    paper: ['0'],
    flags: { dated: true },
    Body: HowToRead,
  },
];
export default slides;
