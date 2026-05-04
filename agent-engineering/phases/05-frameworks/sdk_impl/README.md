# Phase 5 — SDK Implementation

The Phase 4 pipeline rebuilt on the **Claude Agent SDK**. Subagents-as-tools, hooks for telemetry and budget guards, MCP-shaped tools. Optimised for the orchestrator-worker pattern's natural shape.

## What's here

- `src/sdk_pipeline/orchestrator.py` — top-level agent with subagent tools.
- `src/sdk_pipeline/subagents.py` — research / writer / critic as `@subagent` definitions.
- `src/sdk_pipeline/tools.py` — `web_search`, `web_fetch` (or stubs for tests).
- `src/sdk_pipeline/cli.py` — entry point.

## Compare against

`../langgraph_impl/` — same pipeline, different substrate. The point is the comparison.
