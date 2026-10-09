# Authoring slides

Read `../CLAUDE.md` (the hand-over brief and its seven rules) first. This file says how those rules are met in code.

## Where things live

| Path | What |
|---|---|
| `src/slides/sNN*.tsx` | One module per paper section (or part of one). Default export: `SlideDef[]`. Optional sibling `sNN*.css`. |
| `src/slides/registry.ts` | Imports every module in deck order. |
| `src/lib/data.ts` | Typed views over `../data/*.json` and the parsed paper: `fig(n)`, `table(id)`, `section(id)`, `datedIncidents`, `controls`, `phases`, `legend`, `DATE_OF_RECORD`. |
| `src/components/` | Shared primitives (below). |
| `src/generated/paper.json` | Built by `scripts/extract-paper.mjs`; never edit. |

## A slide

```tsx
import type { SlideDef } from './types';

const slides: SlideDef[] = [
  {
    slug: 's05-ladder',              // deep link: lowercase letters, digits, hyphens
    section: '5',                    // paper section number, or 'A' for appendix
    title: 'Prompts shift the trade-off; boundaries cap the damage',  // h1: the slide's claim, condensed from the paper
    short: 'Determinism ladder',     // overview / progress-rail label
    dek: 'Optional one-sentence standfirst.',
    paper: ['5.9'],                  // paper sections the "Paper text" panel (key S) shows verbatim
    flags: { dated: true, prop: true, legal: true },  // see "Notices"
    Body: () => <PaperTable id="5.9#1" />,
  },
];
export default slides;
```

The shell renders the kicker (§ and the paper's section heading), the `h1`, the dek and the notices. `Body` renders below. Use `h2`/`h3` (or the `.h2`/`.h3` classes on non-heading elements) inside `Body`, never another `h1`.

## The rules, in code

1. **No new numbers.** Numbers on a slide come from three places only:
   - `<FigTile n={…}/>` and `<FigRef n={…}/>` (a row of `data/key-figures.json`; `n` is its 1-based position).
   - `<PaperTable id="…"/>` (a paper table, cell for cell; ids are `<section>#<n>`, e.g. `1.2#1`, `3.2#2`, `10#1`).
   - Your condensed copy, quoting numbers exactly as the paper writes them. The end-to-end test fails if any number on any slide does not occur in the paper or the data files. Never compute a total, ratio, difference or count the paper does not state. UI counters ("12 of 40 shown") go inside an element with `data-chrome`; chart axis labels inside `data-derived`.
   - Charts: `<Bars specs max unit/>` only, with each `BarSpec` taken from a key figure. `display` must be a verbatim substring of that figure's `value` or `unit_denominator`, and `value` the first number in `display`; otherwise the bar renders "unverified" and the tests fail. Bars always start at zero on one linear scale.
2. **Confidence codes travel.** Any figure, verdict or claim the paper tags keeps its tag next to it: `<Chip code="CP"/>`, or it arrives automatically through `<Inline>`/`<PaperTable>`/`<FigTile>`. Do not drop chips for tidiness.
3. **Proposals stay labelled.** `flags.prop` renders the PROP banner; required on any slide built from §8 and on slides whose main content is a PROP design (behavioural test matrix, managed-settings baseline, discovery pipeline steps, AI Act three-question test, DPA checklist, proposed KPIs). Pass a string to say precisely which part is the proposal. Inside mixed slides, put `<Chip code="PROP"/>` on the proposed parts.
4. **Legal.** Every §7 slide sets `flags.legal` (renders the paper's own disclaimer verbatim). Present regulation and EDPB text as the paper does; never turn "likely", "may" or "for counsel" into a conclusion.
5. **Date of record.** `flags.dated` renders the 8–9 October 2026 badge. Required on slides showing vendor defaults, prices or regulatory status (§4.2–4.3, 4.4.2, 4.5.3–4.5.6, 4.6, 7.x, 8.2, 11).
6. **Units and currency** as the paper states them (USD list prices; EUR where the law states EUR). No conversions.
7. **Do not rewrite.** Condense; do not change meaning, strengthen a hedge, drop a denominator, or turn a conditional rate into a marginal one. When in doubt, quote the paper (`<blockquote class="quote">` with the source link the paper gives) or show the paper table. The paper's verbatim text is always one keypress away (`S`), so slides can be short.

## Primitives

| Component | Use |
|---|---|
| `FigTile n compact? label?` | Stat tile: label, value, denominator, chip, date, source link |
| `FigRef n` | Inline "chip + source" after a sentence that uses a key figure |
| `Chip code` / `Chips codes` / `LedgerChip text` | Evidence chips; ledger scale High/Medium/Low for incidents |
| `PaperTable id cols? rows? caption? tall? highlight? dim?` | A paper table; stacks into cards below 620px container width |
| `Inline nodes` | Renders parsed paper inline Markdown (links, code, tags) |
| `PaperText ids` | Verbatim paper sections (used by the drawer; usable in a slide) |
| `Bars specs max unit caption?` | Verified horizontal bar chart |
| `Tabs tabs label` | Accessible tabs; all panels stay in the DOM (tests read hidden panels too) |
| `Verdict kind` | Prevents / Detects / Limits / Enables / Weak / Anti-pattern / None pill with glyph |
| `DateOfRecord`, `PropNotice`, `LegalNotice` | Rendered by flags; use directly only for a second, scoped notice |
| `Cite href` | Link to a source the paper cites inline |

To get a paper paragraph verbatim: `section('4.4.2').blocks[0]` is `{t:'p', c: Inline[]}`; render with `<Inline nodes={…c}/>`.

CSS: use the tokens in `src/styles/tokens.css` (`var(--accent)`, `var(--line)`, `var(--cp)` …) and the helpers in `components.css` (`.grid-2/3/4`, `.split`, `.stack`, `.card`, `.quote`, `.lead`, `.eyebrow`, `.steps` for real sequences only). Never a literal colour. Layout must hold at 390 px wide with no sideways page scroll: wide things go in `.tbl-wrap` or `.chart-frame` (both `overflow-x: auto`). SVG text uses theme tokens via the `.chart` class; give every shape an explicit fill.

## Checks

```bash
npm run build      # extract paper, type-check, single-file build, artifact variant
npm test           # data integrity (vitest)
npx playwright test   # numbers, chips, notices, keyboard, deep links, phone overflow (uses dist/)
node scripts/screenshots.mjs [outDir] [slug…]   # PNGs at 1440 and 390 px, light and dark
```
