# Setup — Push This Repo To GitHub

This scaffold lives at `/mnt/user-data/outputs/agent-engineering/`. Three steps to get it on GitHub and verified.

## 1. Move the directory and init git

```bash
# Move it wherever your dev tree lives. Adjust the destination.
mv ~/Downloads/agent-engineering ~/code/agent-engineering
cd ~/code/agent-engineering

git init -b main
git add .
git commit -m "feat: scaffold curriculum repo with uv workspaces and Phase 1 ReAct agent

- monorepo with uv workspaces, Python 3.12+
- shared/ package with budget, safety, telemetry primitives
- phases/01-foundations: complete ReAct agent (loop, tools, CLI, tests)
- phases/02-08: scaffolded with READMEs, pyprojects, stub packages, smoke tests
- .github/workflows: lint, test, eval-gating
- pre-commit, ruff, pyright, pytest configured
- docs/adr: 0001 monorepo, 0002 uv workspaces"
```

## 2. Create the GitHub repo

Public:

```bash
gh repo create agent-engineering \
  --public \
  --source=. \
  --push \
  --description "Hands-on curriculum and build artifacts for senior agent engineering"
```

Private (recommended until first post is live):

```bash
gh repo create agent-engineering \
  --private \
  --source=. \
  --push \
  --description "Hands-on curriculum and build artifacts for senior agent engineering"
```

## 3. Verify locally

```bash
# Install uv if you haven't:
#   curl -LsSf https://astral.sh/uv/install.sh | sh

# One sync to set up everything:
uv sync --all-packages

# Run the test suite (offline, no API needed):
uv run pytest -m "not live_api and not eval"

# Lint and type-check:
uv run ruff check .
uv run pyright

# Smoke-test Phase 1 against the real API (requires ANTHROPIC_API_KEY):
export ANTHROPIC_API_KEY=sk-ant-...
make smoke
```

If `make smoke` returns something containing `97` (the answer to `17 * 23 / 4`), the workspace is wired correctly and you're ready to start Phase 2.

## 4. Set up branch protection (optional but recommended)

```bash
gh api repos/{owner}/agent-engineering/branches/main/protection \
  --method PUT \
  --field required_status_checks[strict]=true \
  --field required_status_checks[contexts][]=lint \
  --field required_status_checks[contexts][]=typecheck \
  --field required_status_checks[contexts][]=test \
  --field enforce_admins=false \
  --field required_pull_request_reviews=null \
  --field restrictions=null
```

This makes `main` non-pushable except via PR with green CI. Solo project — non-pushable to your future self at 11pm.

## 5. Add secrets for Phase 6+

Once you're past Phase 5 and the eval workflow becomes meaningful:

```bash
gh secret set ANTHROPIC_API_KEY
# (paste when prompted)
```

The eval workflow self-skips until `phases/06-evals/src/eval_kit/runner.py` exists, so it won't fire spuriously during earlier phases.

## What's next in the workflow

Per the established flow — Todoist outline → deep research → Obsidian docs/diagrams → GitHub repo (✓) → **Linear integration** — the next step is wiring Linear to track:

- The post series (one issue per planned post on `asleekgeek.com`)
- Any cross-phase work that doesn't fit cleanly into a single phase's checklist
- External commitments derived from the curriculum (talks, workshops, consulting work that uses these patterns)

Linear's GitHub integration on this repo means PRs can reference Linear issue IDs and the issues will auto-update on merge. Set that up on the Linear side via Settings → Integrations → GitHub.


## Authoring workflow

The curriculum's authoring rhythm:

1. **Todoist** — outline / break down the phase deliverable.
2. **Obsidian vault** — write the deep-dive .md note with Mermaid diagrams inline.
3. **Excalidraw diagrams** — for the layered / spatial / reference-grade diagrams. Save as `.excalidraw` files under `Diagrams/` in the vault, embed back via `![[Diagrams/Name.excalidraw]]`. Use `tools/excalidraw_save.py` if generating programmatically.
4. **This repo** — implement the build deliverable; tests + lint + types green; PR with conventional commit.
5. **Linear** — issue for any cross-phase or post-series work.
6. **Post-mortem** — three-sentence note in the vault.

The vault's `Workflow — Diagrams With Excalidraw + Mermaid` note is the canonical reference for which diagram tool fits which job.
