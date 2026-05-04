# Phase 4 — Multi-Agent Coordination: Research → Write → Critique

> Orchestrator + parallel research workers + writer + critic. The canonical orchestrator-worker pipeline, built carefully enough to be a reference implementation.

## Build deliverable

A pipeline that, given a topic:

1. **Orchestrator** decomposes the topic into 3–5 *independent* sub-questions.
2. **Research workers** (one per sub-question, in parallel) investigate each, returning structured JSON findings.
3. **Writer agent** synthesizes the findings into a draft article.
4. **Critic agent** scores the draft on a rubric and either approves or returns feedback.
5. Up to 2 revision cycles before shipping.

Hard bounds:

- ≤ 5 research workers per topic
- ≤ 2 revision cycles
- ≤ 30 total tool calls in the orchestrator's own context

## Calibrating exercise

After the pipeline works, build the *same task* as a single agent with strong context engineering (Phase 2 patterns: scratchpad, structured state). Run both on a fixed eval set. Record:

- Cost per run
- Wall-clock per run
- Quality score (manual or LLM-as-judge)

The honest answer for *this* task is probably "multi-agent wins on quality and parallelism, costs more." Document the actual numbers in the post-mortem.

## What's here

- `src/research_pipeline/orchestrator.py` — top-level coordinator
- `src/research_pipeline/workers.py` — research / writer / critic agents
- `src/research_pipeline/schemas.py` — Pydantic models for inter-agent contracts
- `src/research_pipeline/cli.py` — entry point
- `tests/` — schema tests + a `live_api` end-to-end on a fixed topic

## How to run

```bash
export ANTHROPIC_API_KEY=...
uv run --package phase-04-multi-agent research-pipeline \
  "the production economics of long-running agents in 2026"
```

## Status

- [ ] Orchestrator decomposes topics into independent sub-questions
- [ ] Research workers run in parallel, return structured JSON
- [ ] Writer produces a draft from structured findings
- [ ] Critic scores against the rubric and gates the revision loop
- [ ] Single-agent baseline implemented for comparison
- [ ] Cost / wall-clock / quality numbers recorded for both variants
- [ ] Post-mortem note in the Obsidian vault
