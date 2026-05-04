# tools/

Utility scripts that support the curriculum's authoring workflow but aren't part of any phase's runtime.

## `excalidraw_save.py`

Convert Excalidraw MCP-format element lists into proper `.excalidraw` files that the Obsidian Excalidraw plugin (and excalidraw.com) render natively.

Usage:

```bash
python3 tools/excalidraw_save.py path/to/elements.json path/to/output.excalidraw
```

Why this exists: the Excalidraw MCP returns elements in a streaming-friendly shorthand (with `cameraUpdate` pseudo-elements and shorthand `label: { text: ... }` on shapes). The on-disk Excalidraw schema is more verbose and expects text as separate elements bound to containers via `containerId`. This script does the translation so we can author once and produce both the live render (via the MCP) and the durable file (for Obsidian) from a single source.

See `[[Workflow — Diagrams With Excalidraw + Mermaid]]` in the vault for the broader diagram workflow.
