"""Token and cost budgeting for agent runs.

A `BudgetTracker` accumulates token usage across a run, decomposes it by
cache hit / miss / output, and enforces a hard ceiling. Used by hooks in
Phase 3+ and by the production agent in Phase 7.

The cost numbers below are *illustrative defaults*; real pricing should be
configured per environment. Pricing changes; budgets shouldn't break when
it does. See https://docs.claude.com for current rates.
"""

from __future__ import annotations

from dataclasses import dataclass, field


# Per-million-token prices in USD. Sonnet-class defaults for 2026.
# Override via BudgetTracker(..., pricing=...) for other tiers.
@dataclass(frozen=True)
class ModelPricing:
    input_uncached: float = 3.00
    input_cached_read: float = 0.30
    input_cached_write: float = 3.75
    output: float = 15.00


SONNET_PRICING = ModelPricing()
HAIKU_PRICING = ModelPricing(
    input_uncached=0.80,
    input_cached_read=0.08,
    input_cached_write=1.00,
    output=4.00,
)
OPUS_PRICING = ModelPricing(
    input_uncached=15.00,
    input_cached_read=1.50,
    input_cached_write=18.75,
    output=75.00,
)


class BudgetExceededError(RuntimeError):
    """Raised when an agent's accumulated cost or tokens exceeds the ceiling."""


@dataclass
class BudgetTracker:
    """Accumulate and enforce token / cost budgets across an agent run.

    Example:
        budget = BudgetTracker(max_usd=2.00, pricing=SONNET_PRICING)
        # ... after each model call:
        budget.record(
            input_uncached=2_000,
            input_cached_read=18_000,
            input_cached_write=0,
            output=400,
        )
        budget.check()  # raises BudgetExceededError if over
    """

    max_usd: float
    pricing: ModelPricing = field(default_factory=lambda: SONNET_PRICING)

    input_uncached: int = 0
    input_cached_read: int = 0
    input_cached_write: int = 0
    output: int = 0

    def record(
        self,
        *,
        input_uncached: int = 0,
        input_cached_read: int = 0,
        input_cached_write: int = 0,
        output: int = 0,
    ) -> None:
        self.input_uncached += input_uncached
        self.input_cached_read += input_cached_read
        self.input_cached_write += input_cached_write
        self.output += output

    @property
    def total_tokens(self) -> int:
        return (
            self.input_uncached
            + self.input_cached_read
            + self.input_cached_write
            + self.output
        )

    @property
    def cost_usd(self) -> float:
        p = self.pricing
        return (
            self.input_uncached * p.input_uncached
            + self.input_cached_read * p.input_cached_read
            + self.input_cached_write * p.input_cached_write
            + self.output * p.output
        ) / 1_000_000

    def check(self) -> None:
        """Raise if the accumulated cost has exceeded the ceiling."""
        if self.cost_usd > self.max_usd:
            raise BudgetExceededError(
                f"Budget exceeded: ${self.cost_usd:.4f} > ${self.max_usd:.4f} "
                f"(tokens: in_uncached={self.input_uncached}, "
                f"in_cached_read={self.input_cached_read}, "
                f"in_cached_write={self.input_cached_write}, "
                f"out={self.output})"
            )

    def summary(self) -> dict[str, float | int]:
        return {
            "input_uncached": self.input_uncached,
            "input_cached_read": self.input_cached_read,
            "input_cached_write": self.input_cached_write,
            "output": self.output,
            "total_tokens": self.total_tokens,
            "cost_usd": round(self.cost_usd, 6),
        }
