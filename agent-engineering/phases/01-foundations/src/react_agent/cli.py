"""CLI entry point: `uv run react-agent "<goal>"`."""

from __future__ import annotations

import argparse
import logging
import sys

from react_agent.agent import Agent, AgentConfig
from react_agent.tools import default_tools


def main() -> int:
    parser = argparse.ArgumentParser(
        prog="react-agent",
        description="A hand-rolled ReAct agent on the Anthropic Messages API.",
    )
    parser.add_argument("goal", help="What you want the agent to do.")
    parser.add_argument(
        "--model",
        default="claude-sonnet-4-5",
        help="Anthropic model id (default: claude-sonnet-4-5).",
    )
    parser.add_argument(
        "--max-iterations",
        type=int,
        default=25,
        help="Loop guard. Default 25.",
    )
    parser.add_argument(
        "-v", "--verbose", action="store_true", help="Verbose logging."
    )
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    agent = Agent(
        tools=default_tools(),
        config=AgentConfig(
            model=args.model,
            max_iterations=args.max_iterations,
        ),
    )

    try:
        output = agent.run(args.goal)
    except Exception as exc:
        print(f"Agent failed: {type(exc).__name__}: {exc}", file=sys.stderr)
        return 2

    print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
