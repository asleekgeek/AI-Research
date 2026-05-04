# Phase 1 — Foundations

> The ~150-LOC ReAct agent. Thin loop, real tools, honest termination. Build it, run it, watch it fail, then move to Phase 2.

## Build deliverable

A hand-rolled ReAct-style agent on the Anthropic Messages API. No framework. The point is to make the loop explicit so every framework you use later is legible.

What the agent does:

1. Takes a user goal.
2. Calls the model with a tool definition list.
3. If the model returns `tool_use`, executes the tool, sends the result back.
4. Loops until `end_turn` or a termination guard fires.
5. Returns the final text.

What the loop *exposes* (which frameworks hide):

- Termination is your responsibility. `max_iterations` is not optional.
- Errors are first-class messages back to the model. `is_error: true` plus a useful string lets the model self-correct.
- The message list is the agent's working memory. Compaction (Phase 2) manipulates this list.
- There is no magic. Any framework you use later is a layer over something that resembles this code.

## What's here

- `src/react_agent/agent.py` — the loop, tool registry, termination guards.
- `src/react_agent/tools.py` — example tools (calculator + filesystem).
- `src/react_agent/cli.py` — entry point for `uv run react-agent "<goal>"`.
- `tests/test_agent.py` — offline tests (no API calls) plus a live-API test marked `live_api`.

## Run it

```bash
export ANTHROPIC_API_KEY=...
uv run --package phase-01-foundations react-agent "What is 17 * 23, then divided by 4?"
```

Or from the repo root: `make smoke`.

## Failure modes to watch for

You should *deliberately* induce each of these at least once during this phase. Notes go in the post-mortem.

- **Infinite loop** — give the model a tool that always returns the same answer; watch the loop oscillate.
- **Tool hallucination** — describe a tool poorly; watch the model pick the wrong one.
- **Cost blow-up** — remove the `max_iterations` guard, run on an open-ended task, abort manually.
- **Premature termination** — give the model a task it can plausibly fake completion on, watch it stop early.

The point isn't to fix all four here — that's Phases 2, 3, 6, 7. The point is to *feel* the failure surface so the rest of the curriculum has a referent.

## Status

- [ ] Agent loop runs end-to-end on the smoke prompt
- [ ] At least 3 real tools (calculator + 2 others) wired up
- [ ] Termination guards measured against pathological prompts
- [ ] Post-mortem note in the Obsidian vault
