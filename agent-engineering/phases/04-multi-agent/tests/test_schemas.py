from __future__ import annotations

from research_pipeline.schemas import (
    CriticVerdict,
    ResearchFindings,
    Source,
)


def test_research_findings_minimal() -> None:
    f = ResearchFindings(summary="something")
    assert f.summary == "something"
    assert f.confidence == "medium"
    assert f.sources == []


def test_research_findings_full() -> None:
    f = ResearchFindings(
        summary="x",
        key_findings=["a", "b"],
        sources=[Source(title="t", url="https://example.com")],
        open_questions=["q"],
        confidence="high",
    )
    assert f.confidence == "high"
    assert f.sources[0].credibility == "unknown"


def test_critic_verdict_shipped() -> None:
    v = CriticVerdict(verdict="SHIP", scores={"substance": 5})
    assert v.verdict == "SHIP"
    assert v.scores["substance"] == 5


def test_critic_verdict_rejects_unknown_verdict_string() -> None:
    import pytest

    with pytest.raises(Exception):
        CriticVerdict(verdict="MAYBE")  # type: ignore[arg-type]
