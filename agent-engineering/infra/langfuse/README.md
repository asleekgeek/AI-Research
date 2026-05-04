# Self-Hosted Langfuse

Langfuse is the default observability sink for Phase 6 onwards. Self-hosted because the curriculum's traces are not data that should leave the lab — they include prompts, retrieved documents, and (during Phase 7) cluster-state snippets.

## Run it

The official Langfuse docker-compose is the right starting point and it's actively maintained — point at it rather than copying it here:

```bash
git clone https://github.com/langfuse/langfuse.git ~/langfuse
cd ~/langfuse
docker compose up -d
```

Default port: `http://localhost:3000`. Sign in, create a project, copy the public + secret keys, drop them in your repo's `.env`:

```
LANGFUSE_HOST=http://localhost:3000
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
```

`make langfuse-up` / `make langfuse-down` in this repo's Makefile assume the Langfuse compose is at `infra/langfuse/docker-compose.yml`. If you symlink or copy it here, both targets just work; otherwise update the Makefile to point at your clone.

## In production

The on-prem deployment story is the same shape: Postgres + ClickHouse + a small VM (or a couple of pods on the platform). Langfuse runs comfortably on the existing infrastructure footprint. For the GitOps-managed deployment, the Helm chart (`langfuse/langfuse-k8s`) is the canonical path.

## Why self-hosted, not cloud

Sovereignty preference and cost. The curriculum produces 1000s of traces a month; the cloud bill compounds. The self-host story is mature enough in 2026 that the only reason to choose cloud is "we don't want to operate Postgres," and on a platform that already operates Postgres for half-a-dozen other things, that's not a reason.
