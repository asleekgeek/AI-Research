# Boundaries, Not Prompts — interactive presentation

An interactive, keyboard-driven presentation of the paper *Boundaries, not prompts, contain vibe-coded leaks* (`../paper/`), built from the hand-over's data files. Date of record: 8–9 October 2026.

It builds to **one self-contained HTML file**. Open `dist/index.html` from disk, drop it on any static host, or publish `dist/artifact.html` as a claude.ai Artifact. The only network request is Google Fonts; without it the page falls back to system faces.

## Quick start

```bash
npm ci
npm run dev          # http://localhost:5173 with hot reload
npm run build        # dist/index.html (+ dist/artifact.html)
npm run check        # build, unit tests, end-to-end guards
```

Node 20.19+ or 22.12+. End-to-end tests use Playwright 1.56.1 (Chromium build 1194); run `npx playwright install chromium` once if your machine does not have it.

## Using it

| Key | Action |
|---|---|
| `→` `PageDown` `Space` | Next slide (presenter clickers send PageDown/PageUp) |
| `←` `PageUp` `Shift+Space` | Previous slide |
| `Shift+→` / `Shift+←` | Next / previous section |
| `Home` / `End` | First / last slide |
| `O` | All slides |
| `S` | The paper's verbatim text behind the current slide |
| `L` | Evidence-confidence codes |
| `T` | Light / dark theme (follows the OS until you switch) |
| `?` | Shortcuts |

Every slide has a deep link (`index.html#s04-controls`); the bottom rail jumps between sections. On touch screens, swipe left or right. Interactive slides (timeline, controls matrix, boundary diagram, tables) keep their own arrow-key handling while focused.

## How the brief's rules are enforced

The hand-over brief (`../CLAUDE.md`) sets seven rules. They are enforced in code, not by convention:

| Rule | Mechanism |
|---|---|
| No new numbers | Charts render only `<Bars>` specs that are verified at runtime against `data/key-figures.json` (printed text must appear verbatim in the figure; plotted value must be its number). `tests/deck.spec.ts` walks every slide and fails on any number that does not occur in the paper or the data files. |
| Confidence codes travel | Figure tiles, table cells and inline paper text render the codes as chips; the tests fail if a figure tile lacks its chip or its source link. |
| Proposals stay labelled | Slides built from §8 (and other PROP designs) carry a PROP banner; the tests check every §8 slide. |
| Legal text is not advice | Every §7 slide shows the paper's own disclaimer; the tests check it. |
| Date of record | Slides drawn from sections with vendor defaults, prices or regulatory status show the 8–9 October 2026 badge; the tests check it. |
| Do not rewrite | Tables are the paper's tables, parsed from the Markdown at build time (`scripts/extract-paper.mjs`), and the paper's verbatim section text is one keypress away on every slide. |

`tests/data.test.ts` also checks the extraction against the hand-over's own counts: 24 tables, 381 source links, and the evidence-tag totals.

## Structure

```
presentation/
  index.html                 shell document (title, fonts, theme pre-paint)
  scripts/extract-paper.mjs  paper Markdown → src/generated/paper.json (+ number corpus)
  scripts/make-artifact.mjs  dist/index.html → dist/artifact.html (skeleton stripped for the Artifact host)
  scripts/screenshots.mjs    PNGs of every slide at 1440 / 390 px, light / dark
  src/App.tsx                deck shell: navigation, hash routing, dialogs, theme
  src/components/            chips, figure tiles, paper tables, bars, tabs, notices
  src/lib/data.ts            typed views over ../data/*.json and the parsed paper
  src/slides/                one module per paper section; registry.ts sets the order
  src/styles/                tokens (from the paper's reading page), base, shell, components
  tests/                     vitest data checks; Playwright guards on the built file
```

`AUTHORING.md` explains how to add or change a slide. `OUTLINE.md` is the outline and stack proposal written before the build.

## Moving it into a React or Next.js site

Source is written against the React API (`useState`, `useMemo` … imported from `react`); `vite.config.ts` aliases `react` to `preact/compat` to keep the bundle small. To reuse the slides in a React or Next.js app: install `react` and `react-dom`, drop the aliases, copy `src/` and `../data/`, run `scripts/extract-paper.mjs` as a prebuild step, and render `App` from a client component (`'use client'`). The CSS is plain and token-based, so it can live in a global stylesheet or a CSS module.
