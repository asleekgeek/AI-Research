# Phase 5 — Frameworks: Same Pipeline, Two Frameworks

> The most calibrating exercise in the curriculum. Implement the Phase 4 pipeline twice — Claude Agent SDK and LangGraph — measure the differences, decide your default stack with real numbers in hand.

## Build deliverable

Two implementations of the Phase 4 research → write → critique pipeline:

1. **`sdk_impl/`** — Claude Agent SDK (Python). Subagent-as-tool primitive. Orchestrator dispatches research workers via the SDK's subagent mechanism, hooks for telemetry, MCP-shaped tools.
2. **`langgraph_impl/`** — LangGraph (Python). Typed state machine. Each agent is a node. `Send` API for parallel research fan-out. Postgres checkpointer. `interrupt()` for any HITL gate.

Both must:

- Decompose the topic into 3-5 sub-questions
- Dispatch parallel research workers
- Synthesize via writer
- Critique via separate critic
- Allow ≤2 revisions
- Hard-cap at 30 total tool calls

Then **measure both** across:

- Lines of code (signal: framework verbosity)
- Lines of "real logic" vs. boilerplate
- Cost per run
- Wall-clock per run
- Debuggability (subjective, but written down)
- Failure recovery (kill the process mid-run; what happens?)

The output of this phase is not "the better framework wins." It's **a calibrated decision about which framework fits which problem shape**, recorded in [[Framework Comparison Matrix]] in the Obsidian vault.

## What's here

```
phases/05-frameworks/
├── README.md                 (this file)
├── sdk_impl/                 (workspace member)
│   ├── pyproject.toml
│   ├── README.md
│   ├── src/sdk_pipeline/
│   └── tests/
└── langgraph_impl/           (workspace member)
    ├── pyproject.toml
    ├── README.md
    ├── src/langgraph_pipeline/
    └── tests/
```

## How to run

```bash
export ANTHROPIC_API_KEY=...

# SDK implementation
uv run --package phase-05-frameworks-sdk sdk-pipeline "topic"

# LangGraph implementation
uv run --package phase-05-frameworks-langgraph langgraph-pipeline "topic"
```

## Status

- [ ] SDK implementation runs end-to-end
- [ ] LangGraph implementation runs end-to-end
- [ ] Both produce comparable outputs on a fixed topic
- [ ] Cost / LOC / wall-clock numbers recorded
- [ ] Crash recovery tested on the LangGraph variant
- [ ] Decision matrix updated in `[[Framework Comparison Matrix]]`
- [ ] Post-mortem note in the Obsidian vault: "What I changed my mind about after building both"
