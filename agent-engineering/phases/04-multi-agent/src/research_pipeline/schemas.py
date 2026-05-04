"""Pydantic schemas for inter-agent contracts.

These are the structured-return shapes Phase 4 relies on. Workers return
JSON conforming to these models; the orchestrator validates on receipt.

Implemented during the Phase 4 build. The shapes here are intentionally
thin so they can grow as the build forces real decisions.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

Confidence = Literal["high", "medium", "low"]
Verdict = Literal["SHIP", "REVISE"]


class Source(BaseModel):
    title: str
    url: str
    credibility: str = "unknown"


class ResearchFindings(BaseModel):
    summary: str
    key_findings: list[str] = Field(default_factory=list)
    sources: list[Source] = Field(default_factory=list)
    open_questions: list[str] = Field(default_factory=list)
    confidence: Confidence = "medium"


class CriticVerdict(BaseModel):
    verdict: Verdict
    scores: dict[str, int] = Field(default_factory=dict)
    feedback: list[str] = Field(default_factory=list)
