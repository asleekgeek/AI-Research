"""A minimal ReAct-style agent on top of the Anthropic Messages API.

No framework. ~150 lines including tool registry, termination guards, and
loop-detection. Every line is the loop you'd otherwise depend on a framework
to provide.

Build this, run it, instrument it, watch it fail. That experience is the
foundation everything else compiles to.
"""

from __future__ import annotations

import hashlib
import json
import logging
from collections import Counter
from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any

import anthropic

logger = logging.getLogger(__name__)

ToolHandler = Callable[[dict[str, Any]], str]


# ---------------------------------------------------------------------------
# Tool model
# ---------------------------------------------------------------------------


@dataclass
class Tool:
    """A tool the agent can call.

    The handler is a plain function: dict in, str out. Errors should *not* be
    swallowed silently — let them propagate, the loop will package them as
    structured tool_result errors so the model can self-correct.
    """

    name: str
    description: str
    input_schema: dict[str, Any]
    handler: ToolHandler

    def as_api_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "input_schema": self.input_schema,
        }


# ---------------------------------------------------------------------------
# Agent config
# ---------------------------------------------------------------------------


@dataclass
class AgentConfig:
    model: str = "claude-sonnet-4-5"
    system: str = (
        "You are a careful, methodical assistant. Think step by step, "
        "use tools when they help, and stop when the user's goal is met."
    )
    max_tokens: int = 1024
    max_iterations: int = 25
    repeat_threshold: int = 4  # same canonical tool call this many times → halt


class AgentError(RuntimeError):
    """Base for agent-loop errors."""


class IterationLimitExceeded(AgentError):
    """The loop ran past max_iterations without terminating."""


class RepeatedCallDetected(AgentError):
    """The agent called the same tool with the same args N times in a row."""


# ---------------------------------------------------------------------------
# Agent
# ---------------------------------------------------------------------------


@dataclass
class Agent:
    tools: list[Tool]
    config: AgentConfig = field(default_factory=AgentConfig)
    client: anthropic.Anthropic = field(default_factory=anthropic.Anthropic)

    def __post_init__(self) -> None:
        self._tool_index: dict[str, Tool] = {t.name: t for t in self.tools}
        self._call_history: Counter[str] = Counter()

    def run(self, user_input: str) -> str:
        messages: list[dict[str, Any]] = [{"role": "user", "content": user_input}]

        for iteration in range(self.config.max_iterations):
            logger.debug("iteration=%d, messages=%d", iteration, len(messages))

            response = self.client.messages.create(
                model=self.config.model,
                max_tokens=self.config.max_tokens,
                system=self.config.system,
                tools=[t.as_api_dict() for t in self.tools],
                messages=messages,
            )

            messages.append({"role": "assistant", "content": response.content})

            if response.stop_reason == "end_turn":
                return self._extract_text(response.content)

            if response.stop_reason == "tool_use":
                tool_results = []
                for block in response.content:
                    if block.type != "tool_use":
                        continue
                    self._record_call(block.name, block.input)
                    tool_results.append(self._execute(block))
                messages.append({"role": "user", "content": tool_results})
                continue

            # max_tokens, refusal, pause_turn, ... — surface explicitly.
            raise AgentError(
                f"Unexpected stop_reason={response.stop_reason!r} on iteration {iteration}"
            )

        raise IterationLimitExceeded(
            f"Agent did not terminate within {self.config.max_iterations} iterations"
        )

    # ----- internals -----

    def _execute(self, block: Any) -> dict[str, Any]:
        tool = self._tool_index.get(block.name)
        if tool is None:
            return self._error_result(
                block.id,
                f"Unknown tool: {block.name!r}. "
                f"Available tools: {sorted(self._tool_index)}",
            )
        try:
            result = tool.handler(block.input)
        except Exception as exc:  # surface to the model as a recoverable signal
            return self._error_result(
                block.id, f"{type(exc).__name__}: {exc}"
            )
        return {
            "type": "tool_result",
            "tool_use_id": block.id,
            "content": result,
        }

    def _record_call(self, name: str, args: dict[str, Any]) -> None:
        sig = self._call_signature(name, args)
        self._call_history[sig] += 1
        if self._call_history[sig] >= self.config.repeat_threshold:
            raise RepeatedCallDetected(
                f"Tool {name!r} called {self._call_history[sig]} times "
                f"with the same args — likely stuck. Aborting."
            )

    @staticmethod
    def _call_signature(name: str, args: dict[str, Any]) -> str:
        canonical = json.dumps(args, sort_keys=True, default=str)
        return f"{name}:{hashlib.sha256(canonical.encode()).hexdigest()[:16]}"

    @staticmethod
    def _error_result(tool_use_id: str, message: str) -> dict[str, Any]:
        return {
            "type": "tool_result",
            "tool_use_id": tool_use_id,
            "content": message,
            "is_error": True,
        }

    @staticmethod
    def _extract_text(blocks: list[Any]) -> str:
        return "\n".join(b.text for b in blocks if getattr(b, "type", None) == "text")
