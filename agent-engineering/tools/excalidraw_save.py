"""Convert MCP-format Excalidraw element lists into Obsidian-compatible .excalidraw files.

The Excalidraw MCP format is friendly for streaming + camera control: it includes
pseudo-elements (cameraUpdate, delete, restoreCheckpoint) that aren't part of the
on-disk schema, and it accepts shorthand like `label: { text: ... }` on shapes.
The Obsidian Excalidraw plugin (and excalidraw.com) expects the canonical schema
where every element has the full property set, with text being a separate element
bound to a container via `containerId`.

This helper does the translation so we can keep the source-of-truth elements
inline in our build scripts and produce both the live render (via create_view)
and the durable file (for Obsidian) from the same input.
"""

from __future__ import annotations

import json
import sys
import uuid
from pathlib import Path
from typing import Any

PSEUDO_TYPES = {"cameraUpdate", "delete", "restoreCheckpoint"}

# Default property set every Excalidraw element needs on disk. The MCP format
# omits these and falls back to defaults; the file format expects them present.
ELEMENT_DEFAULTS: dict[str, Any] = {
    "angle": 0,
    "strokeColor": "#1e1e1e",
    "backgroundColor": "transparent",
    "fillStyle": "solid",
    "strokeWidth": 2,
    "strokeStyle": "solid",
    "roughness": 1,
    "opacity": 100,
    "groupIds": [],
    "frameId": None,
    "roundness": None,
    "seed": 0,
    "version": 1,
    "versionNonce": 0,
    "isDeleted": False,
    "boundElements": [],
    "updated": 0,
    "link": None,
    "locked": False,
}


def _new_id() -> str:
    return uuid.uuid4().hex[:16]


def _normalize(elements: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Strip pseudo-elements; expand `label` shorthand to bound text elements."""
    out: list[dict[str, Any]] = []
    deleted_ids: set[str] = set()

    # First pass: collect deletions
    for el in elements:
        if el.get("type") == "delete":
            ids = el.get("ids", "")
            for i in ids.split(","):
                i = i.strip()
                if i:
                    deleted_ids.add(i)

    # Second pass: emit elements
    for el in elements:
        t = el.get("type")
        if t in PSEUDO_TYPES:
            continue
        if el.get("id") in deleted_ids:
            continue

        base = {**ELEMENT_DEFAULTS, **el}
        # Pop the shorthand label; we emit a separate text element.
        label = base.pop("label", None)
        # Ensure required keys
        base.setdefault("id", _new_id())
        base["seed"] = base.get("seed") or hash(base["id"]) & 0xFFFFFFFF
        base["versionNonce"] = base["versionNonce"] or hash(base["id"]) & 0xFFFFFFFF

        if label and t in ("rectangle", "ellipse", "diamond", "arrow"):
            text_id = f"t_{base['id']}"
            base["boundElements"] = [
                *base.get("boundElements", []),
                {"id": text_id, "type": "text"},
            ]
            out.append(base)

            text_props = {
                **ELEMENT_DEFAULTS,
                "type": "text",
                "id": text_id,
                "x": base["x"],
                "y": base["y"],
                "width": base.get("width", 100),
                "height": base.get("height", 30),
                "text": label["text"],
                "fontSize": label.get("fontSize", 16),
                "fontFamily": label.get("fontFamily", 1),
                "textAlign": "center",
                "verticalAlign": "middle",
                "strokeColor": label.get("strokeColor", "#1e1e1e"),
                "containerId": base["id"],
                "originalText": label["text"],
                "lineHeight": 1.25,
                "baseline": label.get("fontSize", 16),
                "seed": hash(text_id) & 0xFFFFFFFF,
                "versionNonce": hash(text_id) & 0xFFFFFFFF,
            }
            out.append(text_props)
        else:
            # Standalone text or unlabeled shape
            if t == "text":
                base.setdefault("text", "")
                base.setdefault("fontSize", 16)
                base.setdefault("fontFamily", 1)
                base.setdefault("textAlign", "left")
                base.setdefault("verticalAlign", "top")
                base.setdefault("originalText", base["text"])
                base.setdefault("lineHeight", 1.25)
                base.setdefault("baseline", base["fontSize"])
                # Estimate width if missing
                if "width" not in el:
                    base["width"] = int(len(base["text"]) * base["fontSize"] * 0.55)
                if "height" not in el:
                    base["height"] = int(base["fontSize"] * 1.4)
            out.append(base)

    return out


def to_excalidraw_file(elements: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "type": "excalidraw",
        "version": 2,
        "source": "https://excalidraw.com",
        "elements": _normalize(elements),
        "appState": {
            "gridSize": None,
            "viewBackgroundColor": "#ffffff",
        },
        "files": {},
    }


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: excalidraw_save.py <input.json> <output.excalidraw>", file=sys.stderr)
        return 2
    src = Path(sys.argv[1])
    dst = Path(sys.argv[2])
    elements = json.loads(src.read_text())
    payload = to_excalidraw_file(elements)
    dst.write_text(json.dumps(payload, indent=2))
    print(f"wrote {dst} ({len(payload['elements'])} elements)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
