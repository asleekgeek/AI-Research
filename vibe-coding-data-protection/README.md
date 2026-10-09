# Hand-over: Vibe Coding Data Protection → interactive presentation

Prepared 9 October 2026. Everything Claude Code needs is in this folder; nothing depends on the chat it came from.

## Contents

| Path | What it is | Use it for |
|---|---|---|
| `CLAUDE.md` | Project brief Claude Code reads automatically at start-up | Rules, file map, suggested structure |
| `paper/vibe-coding-enterprise-data-protection.md` | The paper (Markdown, ~29,500 words, 24 tables, 381 source links) | Narrative source of truth |
| `paper/vibe-coding-enterprise-data-protection.pdf` | Same paper, 56 pages A4 | Reading |
| `paper/web/reading-page.html` | Single-file HTML rendering with sidebar contents and evidence chips | Reference for tokens/tag colours; not the presentation |
| `data/key-figures.json` | 52 figures with value, denominator, source URL, date, confidence | Every number on screen |
| `data/incident-timeline.json` | 35 incidents, Mar 2025 – Oct 2026 | Timeline visual |
| `data/controls-by-boundary.json` | 40 controls across the four boundaries | Filterable controls matrix |
| `data/rollout-phases.json` | Four rollout phases (authors' proposal) | Roadmap visual |
| `data/evidence-legend.json` | The six confidence codes | Chip legend |
| `research-notes/` | Seven primary-source research notes (~550 KB) | Exact quotes, URLs, caveats behind any claim |
| `sources/01-original-report-opus.md` | The original research report (reviewed in paper §1) | Context for the "what changed" slides |
| `sources/02-independent-accuracy-audit.md` | The independent audit (reviewed in paper §2) | Context for the "what the audit missed" slides |

## How to hand it to Claude Code

1. Unzip this folder somewhere Claude Code can work, ideally as a fresh git repository:
   ```bash
   unzip vibe-coding-handover.zip && cd vibe-coding-handover && git init && git add -A && git commit -m "Research hand-over"
   ```
2. Start Claude Code in that directory. It reads `CLAUDE.md` on start-up, so the rules and file map are already in context:
   ```bash
   claude
   ```
3. Give it the task. A starting prompt that references the right files:

   > Read `paper/vibe-coding-enterprise-data-protection.md` in full, then the four JSON files in `data/`. Build an interactive presentation of the paper as a static web app: one page per numbered section, keyboard-navigable, deep-linkable, phone-friendly, light and dark. Draw the incident timeline from `data/incident-timeline.json`, a filterable controls matrix from `data/controls-by-boundary.json`, the four-boundary diagram from §4, the Art. 33/34 decision trees in §7 as flowcharts, and the rollout from `data/rollout-phases.json`. Every figure must carry its confidence chip and link to its source URL from `data/key-figures.json`. Follow the rules in `CLAUDE.md`; do not introduce numbers that are not in the data files or the paper. Start by proposing the slide outline and the stack, then build.

   If Claude Code should look at a specific file at any point, reference it with `@` in the prompt (for example `@research-notes/incident_evidence_ledger.md`).

4. Claude Code running on the web or in the desktop app works the same way once the folder is a repository it can open; push it to GitHub and point the session at the repo.

Documentation for the CLI, if needed: https://docs.claude.com/en/docs/claude-code/overview

## Provenance

- The paper was produced by a coordinated deep-research pass on 8–9 October 2026: seven parallel primary-source research strands (incident ledger, data-layer controls, platform/identity matrix, agent execution plane, empirical evidence, regulation and standards, governance operating models), then one synthesis pass.
- It reviews two prior documents (in `sources/`): the original research report and an independent accuracy audit of it. Section 1 of the paper states what the original got right and wrong; Section 2 states which audit corrections were confirmed, refined, or found incomplete.
- Evidence confidence is tagged on every quantitative claim and control verdict: CP Confirmed-primary (248), VR Vendor-reported (61), RR Researcher-reported (52), PO Press-only (32), INF Author-inference (95), PROP Proposal (19).

## Known limits to keep in view

- Vendor defaults, prices and regulatory statuses are as verified 8–9 October 2026 and change monthly; re-check in a trial tenant before procurement.
- Legal sections present regulation and EDPB text, not advice; obtain qualified legal review before external use.
- Section 11 of the paper lists primary sources that could not be located and vendor behaviours that were not verified. Do not fill those gaps with assumptions in the presentation.
