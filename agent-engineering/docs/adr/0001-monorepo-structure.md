# ADR 0001 — Monorepo, Not Polyrepo

- **Status:** Accepted
- **Date:** 2026-05-01

## Context

The curriculum produces eight build deliverables across eight phases. Each deliverable depends on patterns established in earlier phases (Phase 2 builds on Phase 1's loop; Phase 6's eval suite tests Phase 1–5's outputs; Phase 7 hardens an agent shaped like Phase 3 / Phase 4). Cross-cutting utilities (telemetry, safety filters, budget tracking) show up in multiple phases.

Two reasonable shapes were considered:

1. **Polyrepo** — one repo per phase, plus a shared library repo.
2. **Monorepo** — single repo, workspaces per phase, one `shared/` workspace.

## Decision

Monorepo, with uv workspaces.

## Reasoning

- **Cross-phase refactoring is a 30-second move.** When a Phase 2 caching utility turns out to also be needed in Phase 4, it gets extracted into `shared/` in a single PR. In a polyrepo, the same change is a multi-repo dance with version pinning.
- **One lockfile, one Python version, one CI surface.** The cognitive overhead of N polyrepos for one curriculum is more than the discipline savings of repo isolation.
- **The curriculum is one body of work.** Splitting it across repos would obscure the through-line. The repo *is* the curriculum's code companion.
- **uv workspaces are first-class in 2026.** No tooling penalty for the monorepo choice.

## Consequences

- The repo will grow over time. A monorepo with eight workspace members and a `shared/` is comfortable; one with eighty would not be. If a phase outgrows the repo (e.g., the Phase 7 production agent becomes a real service deployed to the platform), it can be extracted into its own repo at that point — the seam is at the workspace boundary.
- Per-phase CI runs everything by default. Workflow `paths:` filters can be used later if test time becomes a problem.
- Public visibility is all-or-nothing for the repo. If a phase contains material that needs to stay private (real production credentials, internal incident details), it doesn't go in this repo at all — it lives in private infrastructure.

## Alternatives Considered

- **Polyrepo with submodules** — adds the worst of both worlds: monorepo's cognitive load *and* polyrepo's friction. Rejected.
- **Library + apps split (`packages/` + `apps/`)** — clean for shipping products; wrong for a curriculum where "phase" is the primary navigation axis. The current structure has a single `shared/` package, which is enough.
