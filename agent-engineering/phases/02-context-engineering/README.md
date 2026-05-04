# Phase 2 — Context Engineering

> Take Phase 1's loop and make it survive long runs. Caching, compaction, scratchpads. The single highest-leverage skill in production agents.

## Build deliverable

Extend the Phase 1 ReAct agent with:

1. **Prompt caching** — cache breakpoints around the stable prefix; measured before/after cost on a fixed task.
2. **Sliding-window compaction with structured summaries** — survive 100+ tool calls without context overflow.
3. **Scratchpad files** — agent writes intermediate state to disk and reads on demand.
4. **Cost telemetry** — record per-turn token decomposition (cached / uncached / output) and total cost using `agent_shared.budget`.

The deliverable is a concrete number: *"X% cost reduction on a 100-turn run vs the Phase 1 baseline."*

## What's here

- `src/context_agent/caching.py` — cache-breakpoint placement helpers.
- `src/context_agent/compaction.py` — sliding window + summarization.
- `src/context_agent/scratchpad.py` — file-backed working memory.
- `src/context_agent/agent.py` — Phase 1's loop, extended.
- `tests/` — offline tests for the compaction / scratchpad logic.

## How to run

```bash
export ANTHROPIC_API_KEY=...
uv run --package phase-02-context-engineering context-agent --turns 100 "<long task>"
```

## Status

- [ ] Cache breakpoints placed; cache hit rate measured > 70%
- [ ] Sliding-window compaction implemented with structured summary slots
- [ ] Scratchpad pattern in use for at least one long task
- [ ] Cost reduction vs Phase 1 baseline measured and recorded in the post-mortem
- [ ] Post-mortem note in the Obsidian vault
