"""Phase 1 tests.

Offline tests exercise the loop's mechanics without hitting the API. The
`live_api` test is opt-in (run with `pytest -m live_api`) and requires
ANTHROPIC_API_KEY.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any
from unittest.mock import MagicMock

import pytest

from react_agent.agent import (
    Agent,
    AgentConfig,
    IterationLimitExceeded,
    RepeatedCallDetected,
    Tool,
)
from react_agent.tools import calculator, make_filesystem_tools


# ---------------------------------------------------------------------------
# Tool tests — pure logic, no API
# ---------------------------------------------------------------------------


class TestCalculator:
    def test_basic_arithmetic(self) -> None:
        assert calculator.handler({"expression": "17 * 23"}) == "391.0"

    def test_division(self) -> None:
        assert calculator.handler({"expression": "391 / 4"}) == "97.75"

    def test_parens_and_precedence(self) -> None:
        assert calculator.handler({"expression": "(2 + 3) * 4"}) == "20.0"

    def test_unary_minus(self) -> None:
        assert calculator.handler({"expression": "-5 + 3"}) == "-2.0"

    def test_rejects_function_call(self) -> None:
        with pytest.raises(ValueError):
            calculator.handler({"expression": "__import__('os').system('ls')"})

    def test_rejects_variable_reference(self) -> None:
        with pytest.raises(ValueError):
            calculator.handler({"expression": "x + 1"})


class TestFilesystemTools:
    def test_list_and_read_within_sandbox(self, tmp_path: Path) -> None:
        (tmp_path / "hello.txt").write_text("world")
        list_files, read_file = make_filesystem_tools(tmp_path)

        listing = list_files.handler({"path": "."})
        assert "hello.txt" in listing
        assert read_file.handler({"path": "hello.txt"}) == "world"

    def test_refuses_path_escape(self, tmp_path: Path) -> None:
        list_files, _ = make_filesystem_tools(tmp_path)
        with pytest.raises(PermissionError):
            list_files.handler({"path": "../../../etc"})

    def test_refuses_oversized_file(self, tmp_path: Path) -> None:
        big = tmp_path / "big.txt"
        big.write_text("x" * (300 * 1024))
        _, read_file = make_filesystem_tools(tmp_path)
        with pytest.raises(ValueError):
            read_file.handler({"path": "big.txt"})


# ---------------------------------------------------------------------------
# Loop tests — mock the Anthropic client
# ---------------------------------------------------------------------------


def _block(type_: str, **kwargs: Any) -> Any:
    """Build a mock response block (assistant content)."""
    block = MagicMock()
    block.type = type_
    for k, v in kwargs.items():
        setattr(block, k, v)
    return block


def _response(stop_reason: str, content: list[Any]) -> Any:
    r = MagicMock()
    r.stop_reason = stop_reason
    r.content = content
    return r


class TestAgentLoop:
    def test_immediate_end_turn(self) -> None:
        client = MagicMock()
        client.messages.create.return_value = _response(
            "end_turn", [_block("text", text="42")]
        )
        agent = Agent(tools=[calculator], client=client)
        assert agent.run("hi") == "42"

    def test_one_tool_call_then_end(self) -> None:
        client = MagicMock()
        client.messages.create.side_effect = [
            _response(
                "tool_use",
                [
                    _block(
                        "tool_use",
                        id="t1",
                        name="calculator",
                        input={"expression": "2 + 2"},
                    )
                ],
            ),
            _response("end_turn", [_block("text", text="The answer is 4.0")]),
        ]
        agent = Agent(tools=[calculator], client=client)
        assert "4.0" in agent.run("What is 2+2?")

    def test_iteration_limit_enforced(self) -> None:
        client = MagicMock()
        client.messages.create.return_value = _response(
            "tool_use",
            [
                _block(
                    "tool_use",
                    id="t1",
                    name="calculator",
                    input={"expression": "1+1"},
                )
            ],
        )
        agent = Agent(
            tools=[calculator],
            client=client,
            config=AgentConfig(max_iterations=3, repeat_threshold=999),
        )
        with pytest.raises(IterationLimitExceeded):
            agent.run("loop forever")

    def test_repeated_call_detection(self) -> None:
        """Same tool, same args, threshold times → halt."""
        client = MagicMock()
        client.messages.create.return_value = _response(
            "tool_use",
            [
                _block(
                    "tool_use",
                    id="t1",
                    name="calculator",
                    input={"expression": "1+1"},
                )
            ],
        )
        agent = Agent(
            tools=[calculator],
            client=client,
            config=AgentConfig(max_iterations=20, repeat_threshold=3),
        )
        with pytest.raises(RepeatedCallDetected):
            agent.run("stuck")

    def test_unknown_tool_returns_error_result(self) -> None:
        """An unknown tool name produces an is_error tool_result, not a crash."""
        client = MagicMock()
        client.messages.create.side_effect = [
            _response(
                "tool_use",
                [_block("tool_use", id="t1", name="nonexistent", input={})],
            ),
            _response("end_turn", [_block("text", text="ok")]),
        ]
        agent = Agent(tools=[calculator], client=client)
        agent.run("test")

        # Inspect the second call's `messages` to confirm an error tool_result was sent.
        second_call_kwargs = client.messages.create.call_args_list[1].kwargs
        last_message = second_call_kwargs["messages"][-1]
        assert last_message["role"] == "user"
        assert last_message["content"][0]["is_error"] is True


# ---------------------------------------------------------------------------
# Live-API smoke test (opt-in)
# ---------------------------------------------------------------------------


@pytest.mark.live_api
@pytest.mark.skipif(
    not os.getenv("ANTHROPIC_API_KEY"),
    reason="ANTHROPIC_API_KEY not set",
)
def test_smoke_live_api() -> None:
    agent = Agent(tools=[calculator])
    output = agent.run("What is 17 * 23, divided by 4?")
    # Loose check — the model should produce *some* answer near the right one.
    assert "97" in output
