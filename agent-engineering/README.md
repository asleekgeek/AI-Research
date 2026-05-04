# Agent Engineering

> Hands-on curriculum and build artifacts for senior agent engineering. Eight phases, eight build deliverables, one production-shaped substrate.

This repository is the code companion to an eight-phase deep-dive curriculum on AI agents: foundations, context engineering, single sophisticated agents, multi-agent coordination, frameworks, evals & observability, production patterns, and synthesis. The curriculum notes (markdown + Mermaid diagrams) live in a private Obsidian vault; this repo is where the build deliverables actually run.

The aim is not breadth. The aim is **one well-engineered artifact per phase**, each one production-shaped enough to be honest, small enough to fit in a head.

## Why a monorepo

Each phase produces a build artifact that depends on patterns established in earlier phases. A monorepo keeps the dependency graph explicit and makes it trivial to extract reusable utilities into `shared/` once a pattern shows up twice. uv workspaces make this comfortable in 2026: one `uv sync`, one Python version, one lockfile, eight workspace members plus shared.

## Layout

```
agent-engineering/
├── phases/
│   ├── 01-foundations/          # Hand-rolled ReAct agent (~150 LOC)
│   ├── 02-context-engineering/  # Caching + compaction + scratchpad
│   ├── 03-single-agent/         # Obsidian Vault Curator
│   ├── 04-multi-agent/          # Research → Write → Critique pipeline
│   ├── 05-frameworks/           # Same pipeline in Agent SDK and LangGraph
│   ├── 06-evals/                # Golden sets + LLM-as-judge + CI gating
│   ├── 07-production/           # Hardened validator agent (HITL, durability, injection defense)
│   └── 08-synthesize/           # Decision tree, stack reference, post drafts
├── shared/                      # Cross-phase utilities (telemetry, safety, budgets)
├── docs/                        # ADRs and supplementary docs
├── infra/                       # Self-hosted Langfuse, Postgres for checkpoints
├── posts/                       # Drafts of public posts derived from the build work
├── tools/                       # Authoring utilities (Excalidraw → Obsidian, etc.)
└── .github/workflows/           # lint, test, eval-gating
```

Each phase is a uv workspace member with its own `pyproject.toml`, `src/`, and `tests/`. They depend on `agent-shared` and on Anthropic / framework packages as needed. Read each phase's `README.md` for its specific deliverable.

## Quickstart

Prereqs: [uv](https://docs.astral.sh/uv/), Python 3.12+, an `ANTHROPIC_API_KEY`.

```bash
# Clone
gh repo clone asleekgeek/agent-engineering
cd agent-engineering

# Install everything
uv sync --all-packages

# Smoke-test the Phase 1 ReAct agent
export ANTHROPIC_API_KEY=...
uv run --package phase-01-foundations react-agent "What is 17 * 23, then divided by 4?"

# Run the full test suite
uv run pytest

# Lint and type-check
uv run ruff check .
uv run pyright
```

## The Curriculum Phases

Quick orientation. Each phase has a focused build deliverable; the curriculum notes (in the Obsidian vault) cover the conceptual depth.

| # | Phase | Build deliverable |
|---|-------|-------------------|
| 1 | Foundations | `~150 LOC` ReAct agent on the Anthropic Messages API. Tools, termination, errors-as-signals. |
| 2 | Context Engineering | Same agent + prompt caching + sliding-window-with-summary compaction + scratchpad files. Measured before/after cost. |
| 3 | Single Sophisticated Agent | Obsidian Vault Curator — proposes index notes, finds orphans, suggests wikilinks. Skills, hooks, MCP. |
| 4 | Multi-Agent Coordination | Research → Write → Critique pipeline. Orchestrator + 3+ workers, structured returns, bounded fan-out. |
| 5 | Frameworks | Same Phase 4 pipeline implemented in **Claude Agent SDK** and **LangGraph**. Side-by-side comparison. |
| 6 | Evals & Observability | Golden set, code assertions, LLM-as-judge, Langfuse traces, CI eval-gating workflow. |
| 7 | Production Patterns | Hardened cluster validation agent — HITL gates, durability, prompt-injection defenses, audit log. |
| 8 | Synthesize & Teach | Decision tree note, personal stack reference, draft posts for `asleekgeek.com`. |

## Diagrams

Two diagram tools, two purposes:

- **Mermaid** — inline in the markdown notes for sequence diagrams, state machines, simple flowcharts. Diff-friendly, renders natively in GitHub PRs.
- **Excalidraw** — `.excalidraw` files in the Obsidian vault's `Diagrams/` directory, embedded into notes via `![[Diagrams/Name.excalidraw]]`. For layered, gestalt-carrying reference diagrams (the agent stack, decision trees, architecture overviews).

The full guidance lives in the Obsidian vault: `Workflow — Diagrams With Excalidraw + Mermaid`. The `tools/excalidraw_save.py` helper converts MCP-format elements into Obsidian-compatible `.excalidraw` files.

## Conventions

- **Python 3.12+, uv-managed workspaces.** No conda, no poetry, no per-phase venvs.
- **Strict ruff + pyright on the whole tree.** No "but it's just an experiment" exemptions in the main branch.
- **Tests with pytest + `pytest-asyncio`.** Each phase ships at least a smoke test.
- **CI gates on lint, type-check, tests, and (Phase 6+) eval regression.** PRs that fail any gate don't merge.
- **Conventional Commits** on `main`. The git log is the changelog.
- **No secrets in this repo.** `ANTHROPIC_API_KEY`, `LANGFUSE_*`, etc. via environment or 1Password / SOPS in private deployments.

## Build Discipline

This repo is structured so that the working state is always green and the next thing to build is always one phase ahead. The cadence:

1. Read the curriculum note for the phase.
2. Open the phase's `README.md` here — it spells out the build deliverable in concrete terms.
3. Implement the deliverable. Tests + lint + types pass before merging.
4. Update the phase README's "Status" section with what you built and any deviations.
5. Write the post-mortem note (3 sentences: what surprised, what didn't fit, what's next) into the Obsidian vault.
6. Move on.

The post-mortem step is the one most easily skipped and the one that compounds the most. Don't skip it.

## Related

- **Curriculum notes (private):** Obsidian vault, `AI Research/Phase N — *.md`
- **Project tracking:** Todoist project *Agent Engineering Mastery*
- **Public series:** `asleekgeek.com` agent engineering posts (ongoing)

## License

MIT. See [`LICENSE`](./LICENSE).
