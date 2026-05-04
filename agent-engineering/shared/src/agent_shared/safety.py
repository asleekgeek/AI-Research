"""Safety primitives — trust labels for untrusted content, exfiltration filters.

The lethal-trifecta defense (Phase 7): private data + untrusted content +
external comms = exfiltration risk. These utilities make it harder for a
Phase 1-style ReAct loop to be turned into an exfiltration vector.

Used aggressively from Phase 7 onward; the abstractions are useful earlier
for any agent that touches user-supplied content.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Literal

TrustLevel = Literal["trusted", "mixed", "untrusted"]


@dataclass(frozen=True)
class WrappedContent:
    """Content with an explicit trust level. Convert to a string with .render()."""

    content: str
    trust: TrustLevel
    source: str | None = None

    def render(self) -> str:
        if self.trust == "trusted":
            return self.content
        attrs = f"trust={self.trust!r}"
        if self.source:
            attrs += f" source={self.source!r}"
        return f"<external_content {attrs}>\n{self.content}\n</external_content>"


def wrap_untrusted(content: str, source: str | None = None) -> str:
    """Shorthand: wrap content as untrusted with explicit markers.

    Use anywhere a tool returns content from outside the agent's trust
    boundary — web pages, user uploads, cluster annotations, etc.
    """
    return WrappedContent(content, "untrusted", source).render()


# --------------------------------------------------------------------------
# Exfiltration detection
# --------------------------------------------------------------------------

# These patterns are not exhaustive — they're a tripwire layer, not a
# complete defense. The architectural defense is tool scoping (Phase 7).
_SECRET_PATTERNS: tuple[tuple[str, re.Pattern[str]], ...] = (
    ("aws_access_key", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("github_pat", re.compile(r"\bghp_[A-Za-z0-9]{36}\b")),
    ("github_oauth", re.compile(r"\bgho_[A-Za-z0-9]{36}\b")),
    ("anthropic_key", re.compile(r"\bsk-ant-[A-Za-z0-9_\-]{20,}\b")),
    ("openai_key", re.compile(r"\bsk-[A-Za-z0-9]{20,}\b")),
    ("private_key", re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----")),
    ("jwt", re.compile(r"\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b")),
)


@dataclass(frozen=True)
class ExfiltrationFinding:
    pattern_name: str
    span: tuple[int, int]
    snippet: str


def scan_for_exfil(content: str, *, snippet_chars: int = 40) -> list[ExfiltrationFinding]:
    """Scan content for known secret-shaped patterns. Returns findings, not bool.

    Callers decide what to do — refuse, redact, alert, audit.
    """
    findings: list[ExfiltrationFinding] = []
    for name, pattern in _SECRET_PATTERNS:
        for match in pattern.finditer(content):
            start, end = match.span()
            snippet = content[max(0, start - 5) : min(len(content), end + 5)]
            if len(snippet) > snippet_chars:
                snippet = snippet[:snippet_chars] + "…"
            findings.append(ExfiltrationFinding(name, (start, end), snippet))
    return findings


def assert_no_exfil(content: str) -> None:
    """Raise if content matches any exfil pattern. Use as a hard gate on external writes."""
    findings = scan_for_exfil(content)
    if findings:
        names = ", ".join(sorted({f.pattern_name for f in findings}))
        raise ExfiltrationDetected(
            f"Potential secrets detected in output: {names}. "
            f"{len(findings)} match(es). Refusing to send externally."
        )


class ExfiltrationDetected(RuntimeError):
    """Raised when scan_for_exfil finds candidate secrets in outbound content."""
