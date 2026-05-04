# Agent Engineering — common dev tasks
# Run `make help` to list targets.

.DEFAULT_GOAL := help
SHELL := /bin/bash

PHASES := \
	phase-01-foundations \
	phase-02-context-engineering \
	phase-03-single-agent \
	phase-04-multi-agent \
	phase-05-frameworks-sdk \
	phase-05-frameworks-langgraph \
	phase-06-evals \
	phase-07-production \
	phase-08-synthesize

# ---------------------------------------------------------------------------

.PHONY: help
help: ## Print this help.
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: install
install: ## Sync all workspaces and install pre-commit hooks.
	uv sync --all-packages
	uv run pre-commit install

.PHONY: lint
lint: ## Run ruff on the whole tree.
	uv run ruff check .

.PHONY: format
format: ## Format the whole tree with ruff format.
	uv run ruff format .

.PHONY: typecheck
typecheck: ## Run pyright on the whole tree.
	uv run pyright

.PHONY: test
test: ## Run the test suite (excluding live_api and eval markers).
	uv run pytest -m "not live_api and not eval"

.PHONY: test-live
test-live: ## Run live-API tests. Requires ANTHROPIC_API_KEY.
	uv run pytest -m "live_api"

.PHONY: eval
eval: ## Run the eval suite. Phase 6+. Requires ANTHROPIC_API_KEY.
	uv run --package phase-06-evals eval-kit run --suite golden

.PHONY: clean
clean: ## Remove caches and build artifacts.
	find . -type d \( -name __pycache__ -o -name .pytest_cache -o -name .ruff_cache -o -name .mypy_cache -o -name .pyright \) -exec rm -rf {} +
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	rm -rf .coverage htmlcov build dist

.PHONY: ci
ci: lint typecheck test ## What CI runs locally.

.PHONY: smoke
smoke: ## Smoke-test Phase 1 ReAct agent. Requires ANTHROPIC_API_KEY.
	uv run --package phase-01-foundations react-agent "What is 17 * 23, then divided by 4?"

.PHONY: langfuse-up
langfuse-up: ## Start self-hosted Langfuse (docker compose).
	cd infra/langfuse && docker compose up -d

.PHONY: langfuse-down
langfuse-down: ## Stop self-hosted Langfuse.
	cd infra/langfuse && docker compose down
