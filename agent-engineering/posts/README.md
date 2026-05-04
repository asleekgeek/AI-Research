# Posts

Drafts of public posts for `asleekgeek.com`, distilled from the curriculum's build work.

This directory and `phases/08-synthesize/posts/` overlap intentionally:

- `phases/08-synthesize/posts/` is the **per-phase deliverable** — the posts produced during Phase 8 specifically.
- `posts/` (this directory) is the **ongoing publication pipeline** — any post derived from any phase, in any phase of drafting.

In practice, treat this as the canonical location for anything in flight that isn't strictly a Phase 8 deliverable.

## Workflow

1. Draft in the Obsidian vault. Wikilinks resolve there; the content lives next to its conceptual scaffolding.
2. When ready for review, copy to this directory.
3. Open a PR. Review on the PR; iterate.
4. After merge, publish via the Sanity / Next.js pipeline.
5. The merged file stays here as the source of truth post-publish.

## Conventions

- Filename: `YYYY-MM-DD-slug.md`.
- Front-matter: `title`, `subtitle`, `published_at`, `tags`, `canonical_url`.
- One post = one specific claim, defended with depth. No surveys.
- Cite primary sources. Specifically: link to the Anthropic post, not the Twitter thread about the post.
- C64-to-modern-AI narrative anchor lives in the engineering judgment, not in decoration.
