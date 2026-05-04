# `agent-shared`

Cross-phase utilities. Things that show up in two or more phases live here so they only have to be written once.

## What's in here

- **`telemetry`** — Langfuse hooks and OpenTelemetry helpers. Used from Phase 6 onward.
- **`safety`** — trust-label wrappers for untrusted content, exfiltration filters, audit-log helpers. Used from Phase 7 onward.
- **`budget`** — token / cost budget guards, model tiering helpers. Used from Phase 2 onward.
- **`testing`** — pytest fixtures and helpers shared across phase test suites.

## Discipline

A utility moves into `shared/` once it's used in two phases. Not before. Premature extraction is the second-most-common monorepo anti-pattern after no-extraction-at-all.

When extracting:

1. Land the utility in the second phase first, copy-pasted, with the comment `# TODO: extract to agent-shared once stable`.
2. After the phase ships and the API has stabilised, move it.
3. Update both consumers in the same PR. Tests stay green.
