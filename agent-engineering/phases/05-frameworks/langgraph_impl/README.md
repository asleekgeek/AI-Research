# Phase 5 — LangGraph Implementation

The Phase 4 pipeline rebuilt on **LangGraph**. Typed state, explicit graph, durable checkpointing via Postgres, `Send` API for parallel research fan-out, `interrupt()` for any HITL gate.

## What's here

- `src/langgraph_pipeline/state.py` — typed `AgentState` (TypedDict / Pydantic).
- `src/langgraph_pipeline/graph.py` — node functions and graph wiring.
- `src/langgraph_pipeline/checkpointer.py` — Postgres checkpointer setup.
- `src/langgraph_pipeline/cli.py` — entry point.

## Why LangGraph here

This is the framework you reach for when **state and durability are first-class concerns**. The whole point of the comparison is that LangGraph's verbosity buys you durability the SDK implementation has to roll itself.

## Compare against

`../sdk_impl/` — same pipeline, different substrate. The point is the comparison.
