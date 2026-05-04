# Phase 6 — Evals & Observability

> The discipline phase. Where most agent projects quietly die in production. The leap from level-0 (vibes) to level-2 (golden set + code assertions in CI) is the single highest-leverage move in the curriculum.

## Build deliverable

A reusable `eval_kit` package that any phase's agent can be wired against, plus:

1. **Golden set** — 30 hand-curated examples for the Phase 3 Vault Curator agent (the canonical eval target).
2. **Code assertions** — deterministic checks that don't need an LLM (output shape, tool-call counts, token caps, no-destructive-actions checks).
3. **LLM-as-judge** — rubric-based scoring on dimensions code can't capture, with calibration anchors and position-bias mitigation.
4. **Langfuse integration** — full trace capture for every eval run, dashboarded.
5. **Regression CI step** — `.github/workflows/eval.yml` already exists; this phase makes it actually do something.
6. **Comparison output** — structured PR comment showing baseline vs candidate, dimension by dimension.

## What's here

- `src/eval_kit/runner.py` — runs an agent against a suite, captures results.
- `src/eval_kit/golden.py` — golden-set loader + schema.
- `src/eval_kit/assertions.py` — code-assertion library.
- `src/eval_kit/judge.py` — LLM-as-judge with rubric calibration.
- `src/eval_kit/compare.py` — baseline-vs-candidate diff for CI.
- `src/eval_kit/cli.py` — `eval-kit run` / `eval-kit compare`.
- `golden/` — fixture golden sets per phase (`phase-03-vault-curator.jsonl`, etc.).
- `tests/` — offline tests for the kit itself.

## How to run

```bash
export ANTHROPIC_API_KEY=...
export LANGFUSE_HOST=...

# Run the golden suite, write candidate.json
uv run --package phase-06-evals eval-kit run --suite golden --output candidate.json

# Compare against main's baseline
uv run --package phase-06-evals eval-kit compare \
  --baseline-ref origin/main --candidate candidate.json
```

## Status

- [ ] `eval_kit` package landed with runner / golden / judge / compare
- [ ] 30-example golden set for the Vault Curator
- [ ] Code assertions cover output shape, tool counts, token caps, safety
- [ ] LLM-as-judge with calibration anchors and randomized ordering
- [ ] Langfuse self-hosted, traces flowing
- [ ] `.github/workflows/eval.yml` running on PRs and gating merges
- [ ] Eval maturity at level 2+ on the curve in [[Production Eval Playbook]]
- [ ] Post-mortem note: "What surprised me about eval design"
