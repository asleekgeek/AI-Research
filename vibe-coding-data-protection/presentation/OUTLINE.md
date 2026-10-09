# Presentation outline and stack

Proposal written before the build, per the hand-over's starting prompt. The build follows it; deviations are noted at the bottom.

## Stack

| Decision | Choice | Why |
|---|---|---|
| Output | One self-contained `dist/index.html` (no network needed except Google Fonts, which fall back to system faces) | Brief asks for static, self-contained; opens from `file://`, any static host, or as a claude.ai Artifact |
| Build | Vite 8 + `vite-plugin-singlefile` | Inlines JS/CSS into one file; fast dev server |
| UI | TypeScript + JSX written against the React API, aliased to `preact/compat` | ~10 KB runtime instead of ~190 KB; components port to Next.js by deleting the alias |
| Charts and diagrams | Hand-written SVG, one linear scale per chart, theme tokens for every colour | No chart library; every mark is computed from `data/*.json` |
| Paper content | `scripts/extract-paper.mjs` parses the paper Markdown at build time into blocks, tables and inline nodes (`src/generated/paper.json`) | Tables on slides are the paper's tables, cell for cell; every slide can open the verbatim section text |
| Data | `data/*.json` imported directly from the hand-over folder, never copied | One source of truth |
| Tests | Vitest (data integrity, chart-spec values) and Playwright on the built file | Mechanically enforces the brief's rules (see "Guards") |

## Navigation model

- Linear deck of slides grouped by paper section (§0–§12, then appendix).
- Keys: `→`/`PageDown`/`Space` next, `←`/`PageUp`/`Shift+Space` previous, `Shift+→`/`Shift+←` next/previous section, `Home`/`End`, `O` overview, `S` paper text for this slide, `L` evidence legend, `T` theme, `?` help, `Esc` closes.
- Deep links are bare hash tokens (`#s04-controls`), which also survive the Artifact viewer's hash rules.
- Phone: slides become scrolling cards; swipe left/right; bottom bar with previous/next.

## Slide outline (mirrors the paper)

| § | Slide (deep link) | Content | Data / visual |
|---|---|---|---|
| 0 | `title` | Thesis: boundaries, not prompts | Figures #14, #15; four boundaries |
| 0 | `s00-how-to-read` | Evidence legend, date of record, terminology | §0 legend table |
| 1 | `s01-what-holds` | What the original report got right | Vendor remediations with sources |
| 1 | `s01-corrections` | The 24 corrections, browsable | §1.2 table |
| 2 | `s02-audit-a1-a12` | Audit priority corrections and verdicts | §2.1 table |
| 2 | `s02-audit-gaps` | Where the audit was incomplete | §2.3 list |
| 3 | `s03-failure-modes` | Four failure modes | §3.1 |
| 3 | `s03-timeline` | 35 incidents, Mar 2025 – Oct 2026, to scale | `incident-timeline.json` |
| 3 | `s03-denominators` | Read every scan with its denominator | Figures #6, #9, #11, #12, #13 |
| 3 | `s03-attribution` | Layer attribution and the single interrupting control | §3.5 table |
| 4 | `s04-boundary-model` | Four boundaries diagram | §4.1 table |
| 4 | `s04-controls` | 40 controls, filterable by boundary / verdict / evidence tier | `controls-by-boundary.json` |
| 4 | `s04-b1-vendors` | Dated buyer-validation matrix; which identity "SSO" gates | §4.2.1, §4.2.2 tables |
| 4 | `s04-b2-ingress` | Identity-aware proxies, passwords, Funnel | Figure #42 |
| 4 | `s04-b3-gates` | Four Postgres gates, side paths, the 30 Oct 2026 change | §4.4.1–4.4.2 |
| 4 | `s04-b3-trust-paths` | Paths A, B1, B2, B3 | §4.4.3 |
| 4 | `s04-b3-test-matrix` | Behavioural authorisation matrix (PROP) and pgTAP example | §4.4.4 |
| 4 | `s04-b4-agent-plane` | What is enforced outside the model; MCP | §4.5.1–4.5.3 |
| 4 | `s04-b4-baseline` | Managed-settings baseline (PROP) | §4.5.4 table |
| 4 | `s04-b4-recovery` | Dev/prod split, credential brokering, isolated backups | Figures #45–47 |
| 4 | `s04-discovery` | Wildcard certificates and the discovery pipeline | Figure #8, #43 |
| 5 | `s05-benchmarks` | SusVibes and Veracode with denominators | Figures #18–21 |
| 5 | `s05-prompting` | Prompting, iteration, skills | Figures #17, #22–24 |
| 5 | `s05-review-packages` | AI review recall; hallucinated packages | Figures #25–31, #49 |
| 5 | `s05-population` | The one random-sample study | Figures #14–16 |
| 5 | `s05-ladder` | Revised determinism ladder | §5.9 table |
| 6 | `s06-forecast-vs-observation` | Gartner/CSA, named organisations | Figures #35, #36 |
| 6 | `s06-registry-lifecycle` | Registry schema; lifecycle defaults | §6.3 table |
| 6 | `s06-kpis` | KPIs documented vs proposed; bans vs enablement | §6.5 table; figures #34, #40, #41 |
| 6 | `s06-surveys` | Survey and telemetry ledger | §6.7 table |
| 7 | `s07-gdpr-tree` | Art. 33/34 decision tree as a flowchart | §7.1 |
| 7 | `s07-gdpr-failure-modes` | The tree per failure mode | §7.1 table |
| 7 | `s07-ai-act` | Three-question "AI system" test as a flowchart | §7.3; figure #50 |
| 7 | `s07-nis2-dora-cra` | In-scope qualifiers; CRA; UK and US | §7.4–7.6; figures #51, #52 |
| 7 | `s07-standards-dpa` | Clause map; DPA checklist | §7.7 table; §7.8 |
| 8 | `s08-tiers` | T0–T3 (PROP) | §8.1 table |
| 8 | `s08-rollout` | Phased rollout on a day axis (PROP) | `rollout-phases.json`, §8.2 |
| 9 | `s09-tests` | 15 verification tests, linked to §10 | §9 table |
| 10 | `s10-threat-paths` | Threat-path efficacy matrix | §10 table |
| 11 | `s11-open-gaps` | Open gaps; dates most likely to move | §11 |
| 12 | `s12-conclusion` | Three changes; five decisions | §12 |
| A | `a-key-figures` | All 52 figures, filterable | `key-figures.json` |
| A | `a-colophon` | Provenance, rules, legal note, shortcuts | — |

## Guards (how the brief's rules are enforced)

1. **No new numbers.** Charts and stat tiles read only `key-figures.json`; each chart spec names the figure it draws from and a unit test checks every plotted value appears in that figure's `value` text. A Playwright test walks every slide and checks every number on screen (outside navigation chrome and chart axes) exists in the paper or the data files.
2. **Confidence chips travel.** Figure tiles and table cells render the code as a chip; a test fails if a figure tile lacks its chip or source link.
3. **Proposals stay labelled.** Slides drawn from §8 (and the PROP parts of §4, §6, §7) carry a visible PROP banner; a test checks it.
4. **Legal content.** §7 slides carry the paper's "not legal advice; qualified legal review required" notice; a test checks it.
5. **Date of record.** Slides showing vendor defaults, prices or regulatory status carry the 8–9 October 2026 badge; a test checks it.
6. **Do not rewrite.** Slide copy condenses; the paper's own text for every slide is one keypress away (`S`).
