"""Telemetry helpers — thin wrappers around Langfuse / OTel.

Langfuse is the default sink (self-hosted; see infra/langfuse). The wrapper
keeps Langfuse imports optional so phases that don't use it (1-2) don't pull
the dependency in.

Used by hooks in Phase 3+ and as the trace backbone in Phase 6+.
"""

from __future__ import annotations

import logging
import os
from contextlib import contextmanager
from dataclasses import dataclass
from typing import Any, Iterator

logger = logging.getLogger(__name__)


@dataclass
class TelemetryConfig:
    enabled: bool = False
    host: str | None = None
    public_key: str | None = None
    secret_key: str | None = None

    @classmethod
    def from_env(cls) -> TelemetryConfig:
        host = os.getenv("LANGFUSE_HOST")
        pk = os.getenv("LANGFUSE_PUBLIC_KEY")
        sk = os.getenv("LANGFUSE_SECRET_KEY")
        return cls(
            enabled=bool(host and pk and sk),
            host=host,
            public_key=pk,
            secret_key=sk,
        )


_GLOBAL: dict[str, Any] = {"client": None, "config": None}


def init(config: TelemetryConfig | None = None) -> None:
    """Initialise telemetry. No-op if disabled or already initialised."""
    if _GLOBAL["client"] is not None:
        return
    cfg = config or TelemetryConfig.from_env()
    _GLOBAL["config"] = cfg
    if not cfg.enabled:
        logger.debug("Telemetry disabled (set LANGFUSE_* env vars to enable).")
        return
    try:
        from langfuse import Langfuse  # type: ignore[import-not-found]
    except ImportError:
        logger.warning("LANGFUSE_* env vars set but `langfuse` package not installed.")
        return
    _GLOBAL["client"] = Langfuse(
        host=cfg.host,
        public_key=cfg.public_key,
        secret_key=cfg.secret_key,
    )


@contextmanager
def trace(name: str, **metadata: Any) -> Iterator[Any]:
    """Open a trace span. No-op if telemetry isn't initialised.

    Usage:
        with trace("agent_run", agent="vault_curator", run_id=run_id) as span:
            ...
            span.update(output={"status": "ok"})  # if Langfuse is wired
    """
    client = _GLOBAL["client"]
    if client is None:
        yield _NullSpan()
        return
    span = client.trace(name=name, metadata=metadata)
    try:
        yield span
    finally:
        if hasattr(span, "end"):
            span.end()


class _NullSpan:
    """Null-object span for when telemetry is disabled."""

    def update(self, **_: Any) -> None: ...
    def event(self, **_: Any) -> None: ...
    def end(self) -> None: ...
