"""Three tools wired into the Phase 1 ReAct agent.

Each tool intentionally illustrates a different shape:
- `calculator` — pure compute, no IO.
- `read_file` — read-only IO, scoped by argument validation.
- `list_files` — directory listing, returns structured data.

Real production tools have stricter schemas, narrower descriptions, and
explicit error contracts. These three are the minimum to exercise the loop.
"""

from __future__ import annotations

import ast
import operator
import os
from pathlib import Path
from typing import Any

from react_agent.agent import Tool


# ---------------------------------------------------------------------------
# Calculator — pure compute
# ---------------------------------------------------------------------------

_BIN_OPS: dict[type[ast.operator], Any] = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
    ast.FloorDiv: operator.floordiv,
}
_UNARY_OPS: dict[type[ast.unaryop], Any] = {
    ast.UAdd: operator.pos,
    ast.USub: operator.neg,
}


def _safe_eval(node: ast.AST) -> float:
    """Evaluate a Python arithmetic AST. No names, no calls, no subscripts."""
    if isinstance(node, ast.Expression):
        return _safe_eval(node.body)
    if isinstance(node, ast.Constant):
        if isinstance(node.value, (int, float)):
            return float(node.value)
        raise ValueError(f"Unsupported constant: {node.value!r}")
    if isinstance(node, ast.BinOp):
        op = _BIN_OPS.get(type(node.op))
        if op is None:
            raise ValueError(f"Unsupported operator: {type(node.op).__name__}")
        return op(_safe_eval(node.left), _safe_eval(node.right))
    if isinstance(node, ast.UnaryOp):
        op = _UNARY_OPS.get(type(node.op))
        if op is None:
            raise ValueError(f"Unsupported unary operator: {type(node.op).__name__}")
        return op(_safe_eval(node.operand))
    raise ValueError(f"Unsupported AST node: {type(node).__name__}")


def _calculator_handler(args: dict[str, Any]) -> str:
    expr = args["expression"]
    try:
        tree = ast.parse(expr, mode="eval")
    except SyntaxError as exc:
        raise ValueError(f"Invalid expression syntax: {exc.msg}") from exc
    result = _safe_eval(tree)
    return str(result)


calculator = Tool(
    name="calculator",
    description=(
        "Evaluate a Python arithmetic expression. Supports +, -, *, /, %, **, //, "
        "unary +/-, and parentheses. Does NOT support variables, function calls, "
        "or comparisons. Use for any arithmetic the user asks about."
    ),
    input_schema={
        "type": "object",
        "properties": {
            "expression": {
                "type": "string",
                "description": "The arithmetic expression, e.g. '17 * 23 / 4'",
            },
        },
        "required": ["expression"],
    },
    handler=_calculator_handler,
)


# ---------------------------------------------------------------------------
# Filesystem — sandboxed read access
# ---------------------------------------------------------------------------


def _resolve_safe(root: Path, rel: str) -> Path:
    """Resolve `rel` under `root`, refusing escapes via .. or absolute paths."""
    p = (root / rel).resolve()
    root_resolved = root.resolve()
    if not str(p).startswith(str(root_resolved)):
        raise PermissionError(f"Path escapes sandbox: {rel!r}")
    return p


def make_filesystem_tools(root: Path) -> list[Tool]:
    """Build read-only filesystem tools scoped to `root`.

    Used by the smoke test and any agent that needs scoped FS access.
    """
    root = root.resolve()

    def _list_files_handler(args: dict[str, Any]) -> str:
        rel = args.get("path", ".")
        target = _resolve_safe(root, rel)
        if not target.is_dir():
            raise NotADirectoryError(f"{rel!r} is not a directory")
        entries = sorted(target.iterdir())
        return "\n".join(
            f"{'d' if e.is_dir() else 'f'}\t{e.name}" for e in entries
        )

    def _read_file_handler(args: dict[str, Any]) -> str:
        rel = args["path"]
        target = _resolve_safe(root, rel)
        if not target.is_file():
            raise FileNotFoundError(f"{rel!r} not found or not a file")
        if target.stat().st_size > 256 * 1024:
            raise ValueError(f"{rel!r} too large (>256KB); narrow your read.")
        return target.read_text(encoding="utf-8", errors="replace")

    list_files = Tool(
        name="list_files",
        description=(
            f"List files and directories under a path within the sandbox "
            f"({root}). Returns one entry per line, prefixed with 'd' or 'f'. "
            "Use to discover what's available before reading."
        ),
        input_schema={
            "type": "object",
            "properties": {
                "path": {
                    "type": "string",
                    "description": "Relative path under the sandbox. Defaults to '.'.",
                },
            },
        },
        handler=_list_files_handler,
    )

    read_file = Tool(
        name="read_file",
        description=(
            "Read a UTF-8 text file under the sandbox. Returns the full file "
            "content. Files larger than 256KB are refused; narrow your read or "
            "use list_files to find a specific file first."
        ),
        input_schema={
            "type": "object",
            "properties": {
                "path": {
                    "type": "string",
                    "description": "Relative path to the file under the sandbox.",
                },
            },
            "required": ["path"],
        },
        handler=_read_file_handler,
    )

    return [list_files, read_file]


def default_tools() -> list[Tool]:
    """Default toolset for the smoke test: calculator + cwd-scoped FS read."""
    return [calculator, *make_filesystem_tools(Path(os.getcwd()))]
