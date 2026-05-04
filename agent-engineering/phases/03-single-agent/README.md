# Phase 3 — Single Sophisticated Agent: Obsidian Vault Curator

> Build one agent well before you orchestrate ten. The Vault Curator is the canonical Phase 3 deliverable: real value, bounded scope, every Phase 3 pattern exercised.

## Build deliverable

A polished single agent on the Claude Agent SDK that periodically scans an Obsidian vault and produces a structured "Vault Review" note suggesting:

- Orphan notes (no incoming or outgoing wikilinks)
- New index notes for emerging clusters of related notes
- Wikilinks the author probably meant to add
- Stale notes (unedited for >N months, low link density)

It writes proposed changes to a `Vault Review YYYY-MM-DD.md` review note — never directly to existing notes.

## Patterns exercised

- **Tool design** — at least 5 tools (`list_notes`, `read_note`, `search_vault`, `analyze_links`, `write_review_note`) with strong descriptions and strict schemas
- **Skills** — at least one `SKILL.md` loaded on demand for procedural memory
- **Hooks** — pre-turn (cache breakpoint), post-tool (telemetry), on-finish (write review)
- **Termination** — single-pass run, external success check (the review note is the artifact)
- **Cost discipline** — cached system prompt, paginated tool results

## What's here

- `src/vault_curator/agent.py` — the Vault Curator agent.
- `src/vault_curator/tools.py` — the five tools above.
- `src/vault_curator/cli.py` — entry point.
- `skills/` — `SKILL.md` files (`crafting-index-notes`, `wikilink-conventions`, `vault-style-guide`).
- `tests/` — offline tests + a `live_api` end-to-end against a fixture vault.

## How to run

```bash
export ANTHROPIC_API_KEY=...
export VAULT_PATH=/path/to/your/obsidian/vault
uv run --package phase-03-single-agent vault-curator --vault "$VAULT_PATH" --output review.md
```

## Status

- [ ] 5 tools wired, with descriptions worth publishing
- [ ] At least 1 skill loaded on demand
- [ ] Hooks for telemetry and termination guards
- [ ] Runs end-to-end against a real Obsidian vault and produces a useful review
- [ ] Post-mortem note in the Obsidian vault
