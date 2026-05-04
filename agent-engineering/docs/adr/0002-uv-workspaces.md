# ADR 0002 — uv Workspaces As The Substrate

- **Status:** Accepted
- **Date:** 2026-05-01

## Context

Given a Python monorepo (ADR 0001), choose the dependency / packaging substrate. Options in 2026:

1. **uv workspaces** — Astral's modern stack. Single lockfile, fast, native workspace support, well-integrated with ruff and pyright.
2. **Poetry workspaces** — workspaces are a recent addition; tooling is mature but slower, and the resolver is less robust for complex graphs.
3. **Hatch + a custom orchestration script** — Hatch is the project manager; custom glue handles cross-package operations.
4. **pip-tools + per-package venvs** — what we'd have done in 2022. Heavy.

## Decision

uv workspaces.

## Reasoning

- **Speed.** uv is the fastest sync and resolution available. For a workspace with eight members and ten-plus dependencies each, the difference between uv (~seconds) and Poetry (~tens of seconds) compounds across every CI run and every local sync.
- **Single lockfile, deterministic.** `uv.lock` covers the entire workspace. CI runs against the same locked versions as local; no per-phase drift.
- **First-class `[tool.uv.workspace]`.** Members are declared explicitly; cross-member deps work via `[tool.uv.sources]` with `{ workspace = true }`. No magic.
- **Pairs naturally with ruff and pyright.** All three are the de facto modern stack in 2026.
- **GitHub Actions integration via `astral-sh/setup-uv`.** Caching is one line.
- **The curriculum advocates depth-over-breadth and matching tools to problem shape.** uv is the right shape for this problem.

## Consequences

- Contributors need uv installed locally. `curl -LsSf https://astral.sh/uv/install.sh | sh` or equivalent. Documented in the README quickstart.
- The lockfile must be committed. CI uses `--frozen` to enforce reproducible installs.
- If a contributor needs to use Poetry / Pipenv for a specific phase (third-party reasons), that phase can be extracted to its own repo. Hasn't happened, not expected to.

## Alternatives Considered

- **Poetry workspaces** — viable, slower, less idiomatic in 2026.
- **Hatch + custom glue** — more code to maintain for less benefit.
- **pip-tools** — strictly worse on every dimension.
