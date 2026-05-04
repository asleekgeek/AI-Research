# Phase 7 — Production Patterns: Hardened Cluster Validator

> The phase where the agent stops being a project and starts being infrastructure. Generic patterns; the cluster-validator shape from your own AKS work as the worked case study.

## Build deliverable

A production-hardened cluster validation agent that runs as a Kubernetes CronJob and validates that the cluster's infrastructure is in the desired state (network policies, RBAC, resource quotas, GPU operator config, observability stack health).

The Phase 1–6 patterns get composed into a single artefact that's actually safe to run on a real cluster.

### Patterns applied

1. **Phase-based architecture** — discover → analyze → report. Each phase is a node; nodes are checkpointed.
2. **Durability** — LangGraph Postgres checkpointer; CronJob restart resumes mid-run.
3. **HITL gates on all writes** — `dry_run=True` by default; Slack approval required for any tool that mutates cluster state.
4. **Trust-labeled untrusted content** — every cluster annotation, label, and configmap value flows through `agent_shared.safety.wrap_untrusted` before reaching the model.
5. **Output filtering on external writes** — `agent_shared.safety.assert_no_exfil` runs before any Slack / Notion / S3 write.
6. **Tool scoping per phase** — discover phase has read-only tools; report phase has write tools but no read tools. Phases don't share contexts.
7. **Audit log** — every tool call above the "annotation-only" threshold writes a structured audit record to Postgres.
8. **Budget guards** — `agent_shared.budget.BudgetTracker` with a per-run ceiling.
9. **Eval coverage** — wired into Phase 6's `eval_kit`; PR changes gated by regression CI.
10. **Observability** — Langfuse traces with cluster name, environment, and run ID tags.

## What's here

```
phases/07-production/
├── README.md
├── pyproject.toml
├── src/validator/
│   ├── agent.py             # Top-level agent (LangGraph)
│   ├── phases/              # discover.py, analyze.py, report.py
│   ├── state.py             # Pydantic state models
│   ├── tools/               # cluster_read.py, cluster_write.py (gated), slack.py
│   └── safety/              # injection-aware wrappers, exfil filters wired
├── deploy/                  # K8s manifests
│   ├── cronjob.yaml
│   ├── rbac.yaml
│   └── secrets.yaml         # SOPS-encrypted in real deployments
└── tests/                   # Offline + live-cluster integration tests
```

## How to run

Locally (against `kubectl` context):

```bash
export ANTHROPIC_API_KEY=...
export POSTGRES_URL=...
export SLACK_HITL_WEBHOOK=...
uv run --package phase-07-production validator --cluster $(kubectl config current-context) --dry-run
```

In the cluster (CronJob):

```bash
kubectl apply -f phases/07-production/deploy/
```

## Status

- [ ] Phase-based architecture wired on LangGraph
- [ ] Postgres checkpointer; verified mid-run resume after killed pod
- [ ] HITL gates wired to Slack; dry-run default proven
- [ ] Trust-labeled untrusted content; tested with adversarial pod annotations
- [ ] Output filtering wired; tested with synthetic secrets in cluster state
- [ ] Tool scoping verified — discover phase cannot reach write tools
- [ ] Audit log writing to Postgres; queryable
- [ ] Budget guard tested at the ceiling
- [ ] Eval coverage in Phase 6 includes 5+ adversarial cluster states
- [ ] Langfuse traces flowing in production
- [ ] Post-mortem note in the Obsidian vault: "Three things I almost shipped that prompt injection would have broken"
