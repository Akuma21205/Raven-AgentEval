"""
Composite Score Calculator — based on docs/EVALUATION.md §4.

Formula:
    Overall Score = 0.40 × Task Success
                  + 0.20 × Tool Selection Accuracy
                  + 0.15 × Tool Argument Accuracy
                  + 0.15 × Trajectory Efficiency
                  + 0.10 × Latency (Reliability)

Weights are configurable and auto-normalized if some metrics are absent.
"""
from __future__ import annotations

from dataclasses import dataclass, field

from backend.evaluators.evaluator import EvaluationResult

# Default weights from docs/EVALUATION.md §4
DEFAULT_WEIGHTS: dict[str, float] = {
    "task_success": 0.40,
    "tool_selection": 0.20,
    "tool_argument": 0.15,
    "trajectory_efficiency": 0.15,
    "latency": 0.10,
}


@dataclass
class CompositeScore:
    overall_score: float
    grade: str
    weighted_breakdown: dict[str, float]  # evaluator_name -> weighted contribution
    present_metrics: list[str]
    missing_metrics: list[str]

    def __str__(self) -> str:
        lines = [
            f"Overall Score : {self.overall_score:.2f}  ({self.grade})",
            "Breakdown:",
        ]
        for name, contribution in self.weighted_breakdown.items():
            lines.append(f"  {name:<28} {contribution:.3f}")
        if self.missing_metrics:
            lines.append(f"Missing metrics (skipped): {', '.join(self.missing_metrics)}")
        return "\n".join(lines)


def _grade(score: float) -> str:
    if score >= 0.90:
        return "A"
    if score >= 0.75:
        return "B"
    if score >= 0.55:
        return "C"
    return "F"


def calculate_composite_score(
    results: list[EvaluationResult],
    custom_weights: dict[str, float] | None = None,
) -> CompositeScore:
    """
    Compute a weighted composite score from a list of EvaluationResult objects.

    - Uses DEFAULT_WEIGHTS unless custom_weights are provided.
    - Weights are automatically re-normalized when some metrics are absent
      so they always sum to 1.0.
    - Each absent metric is excluded from the denominator.

    Args:
        results: List of EvaluationResult from the runner.
        custom_weights: Optional dict mapping evaluator names to weights.

    Returns:
        CompositeScore with overall_score, grade, and weighted_breakdown.
    """
    weights = custom_weights if custom_weights else DEFAULT_WEIGHTS

    # Index results by evaluator name for quick lookup
    result_map: dict[str, EvaluationResult] = {r.evaluator_name: r for r in results}

    present_metrics = [name for name in weights if name in result_map]
    missing_metrics = [name for name in weights if name not in result_map]

    if not present_metrics:
        return CompositeScore(
            overall_score=0.0,
            grade="F",
            weighted_breakdown={},
            present_metrics=[],
            missing_metrics=list(weights.keys()),
        )

    # Normalize weights to sum to 1.0 using only present metrics
    total_weight = sum(weights[name] for name in present_metrics)
    normalized = {name: weights[name] / total_weight for name in present_metrics}

    weighted_breakdown: dict[str, float] = {}
    overall_score = 0.0

    for name in present_metrics:
        contribution = normalized[name] * result_map[name].score
        weighted_breakdown[name] = round(contribution, 4)
        overall_score += contribution

    overall_score = round(overall_score, 4)

    return CompositeScore(
        overall_score=overall_score,
        grade=_grade(overall_score),
        weighted_breakdown=weighted_breakdown,
        present_metrics=present_metrics,
        missing_metrics=missing_metrics,
    )
