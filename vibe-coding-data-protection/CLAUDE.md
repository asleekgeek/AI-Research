# Project: Vibe Coding Data Protection — interactive presentation

## What this repository is

A research hand-over. It contains a finished practitioner paper on how companies identify, mitigate and address data-leakage, data-integrity and process-integrity risk from AI app builders (Lovable, Replit, Base44, Bolt, v0) and AI coding agents (Claude Code, Cursor, Copilot), plus all the evidence behind it. The job in this repo is to turn the paper into an interactive presentation (web page or app). The research is done; do not redo it.

## File map

- `paper/vibe-coding-enterprise-data-protection.md` — the paper. Narrative source of truth. ~29,500 words, 24 tables, 381 inline source links. Numbered sections 0–12 plus an appendix.
- `paper/vibe-coding-enterprise-data-protection.pdf` — same content, 56 pages A4, for reading.
- `paper/web/reading-page.html` — a single-file HTML rendering of the paper (sidebar contents, evidence-tag chips, light/dark tokens). Reuse its token names and tag colours if useful; it is a reading page, not the presentation.
- `data/key-figures.json` — 52 figures: value, unit/denominator, source URL, date, confidence. Use these for every number on screen.
- `data/incident-timeline.json` — 35 incidents Mar 2025–Oct 2026: date, layer, capability demonstrated, impact, remediation, confidence.
- `data/controls-by-boundary.json` — 40 controls: boundary, enforcement locus, verdict, bypass/limitation, evidence tier.
- `data/rollout-phases.json` — the four rollout phases (authors' proposal): window, actions, exit criterion, owner, evidence.
- `data/evidence-legend.json` — the six confidence codes.
- `research-notes/*.md` — seven primary-source research notes (~550 KB). Each claim in the paper traces to one of these. Consult when a slide needs the exact quote, URL or caveat behind a figure.
- `sources/01-original-report-opus.md` — the original research report that the paper reviews in §1.
- `sources/02-independent-accuracy-audit.md` — the independent audit of that report, reviewed in §2.

## Rules that must hold in anything built here

1. **No new numbers.** Every figure shown comes from `data/key-figures.json` or a table in the paper, with its source URL and confidence code attached. If a figure is not there, it is not shown.
2. **Confidence codes travel with the claim.** CP / VR / RR / PO / INF / PROP (see `data/evidence-legend.json`) must be visible wherever a figure or verdict appears. Do not drop them for visual tidiness; render them as a chip.
3. **Proposals stay labelled.** The tier model (§8), rollout plan (§8), proposed KPIs (§6) and tier thresholds are the authors' design, tagged PROP. Never present them as industry standard.
4. **Legal content is regulation text, not advice.** §7 presents EDPB guidance and regulation articles. Keep the paper's wording that qualified legal review is required before use.
5. **Date of record is 8–9 October 2026.** Vendor defaults, prices and regulatory statuses are as verified on those dates. Surface that date on any slide that shows them.
6. **Units** are metric; currency as documented (USD list prices, EUR where the source gives EUR).
7. **Do not rewrite the paper.** Condense for slides, but do not change a claim's meaning, strengthen a hedge, or merge a conditional rate into a marginal one (the paper is explicit about denominators; keep them).

## Suggested structure for the presentation (mirror the paper's sections)

1. Thesis (BLUF) — boundaries, not prompts
2. What the original research got right and wrong (§1) — the correction table
3. What the audit caught and what it missed (§2)
4. Four failure modes and the incident timeline (§3) — `incident-timeline.json`
5. Four security boundaries and the controls at each (§4) — `controls-by-boundary.json`, filterable by boundary / verdict / evidence tier
6. What the evidence says about prompts, skills and AI review (§5) — the revised determinism ladder
7. Governance operating model (§6) — documented vs proposed KPIs, survey ledger
8. Legal layer (§7) — Art. 33/34 decision trees as flowcharts, AI Act three-question test
9. Tiers and rollout (§8, PROP) — `rollout-phases.json`
10. Verification test matrix (§9) and threat-path efficacy matrix (§10)
11. Open gaps (§11)

## Conventions

- Static, self-contained output preferred (single HTML or a small Vite/React/Next.js app that builds to static files). Must work at phone width and in light and dark themes.
- Keyboard navigation for slides; deep links to sections.
- Every chart drawn to scale from the JSON; no illustrative numbers.

## The presentation (built)

The interactive presentation lives in `presentation/` (Vite + Preact via the React API, building to one self-contained `dist/index.html`). Read `presentation/AUTHORING.md` before changing a slide. Before committing, run from `presentation/`:

```bash
npm run check   # extract paper, type-check, build, vitest data checks, Playwright guards
```

The Playwright guards enforce rules 1–5 above on the built file: every number on every slide must occur in the paper or the data files; figure tiles keep their chip and source link; §8 slides show the PROP banner; §7 slides show the legal disclaimer; dated sections show the date of record.
