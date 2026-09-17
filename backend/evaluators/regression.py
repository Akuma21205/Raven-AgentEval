"""
Regression Detection Engine — based on docs/EVALUATION.md §5 and docs/TDLR.md.

Compares benchmark results from two agent versions and flags regressions.

Key regressions detected:
  - Task Success rate drop
  - Tool selection accuracy drop
  - Tool argument accuracy drop
  - Trajectory efficiency drop
  - Latency increase > threshold
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import TYPE_CHECKING

from backend.evaluators.evaluator import EvaluationResult

if TYPE_CHECKING:
    from backend.runner.runner import TestRunResult

# Minimum delta to flag as a regression (configurable)
_SCORE_DROP_THRESHOLD = 0.05   # 5% score drop
_LATENCY_INCREASE_THRESHOLD = 0.15  # 15% latency increase


@dataclass
class MetricDelta:
    metric: str
    v1_score: float
    v2_score: float
    delta: float          # v2 - v1 (negative = regression)
    is_regression: bool

    def __str__(self) -> str:
        arrow = "↓" if self.delta < 0 else "↑"
        flag = " 🚨" if self.is_regression else " ✅"
        return (
            f"  {self.metric:<28} v1={self.v1_score:.2f}  "
            f"v2={self.v2_score:.2f}  {arrow}{abs(self.delta):.2f}{flag}"
        )


@dataclass
class CaseRegression:
    """A specific test case that passed in v1 but failed in v2."""
    test_case_id: str
    test_case_name: str
    metric: str
    v1_score: float
    v2_score: float


@dataclass
class RegressionReport:
    agent_name: str
    v1_version: str
    v2_version: str
    regression_detected: bool
    metric_deltas: list[MetricDelta]
    regressions: list[str]              # human-readable regression messages
    case_regressions: list[CaseRegression]  # per-test-case regressions

    def __str__(self) -> str:
        lines = [
            f"\n{'='*60}",
            f"  REGRESSION REPORT: {self.agent_name}",
            f"  v1={self.v1_version}  vs  v2={self.v2_version}",
            f"{'='*60}",
        ]

        if self.regression_detected:
            lines.append("  🚨 REGRESSION DETECTED\n")
        else:
            lines.append("  ✅ No regressions detected\n")

        lines.append("Metric Comparison:")
        for delta in self.metric_deltas:
            lines.append(str(delta))

        if self.regressions:
            lines.append("\nRegression Details:")
            for msg in self.regressions:
                lines.append(f"  • {msg}")

        if self.case_regressions:
            lines.append("\nPer-Test-Case Regressions:")
            for cr in self.case_regressions:
                lines.append(
                    f"  [{cr.test_case_id}] {cr.test_case_name} — "
                    f"{cr.metric}: {cr.v1_score:.2f} → {cr.v2_score:.2f}"
                )

        lines.append("=" * 60)
        return "\n".join(lines)


class RegressionDetector:
    """
    Compares two sets of benchmark results (v1 vs v2) and flags regressions.

    Usage:
        detector = RegressionDetector()
        report = detector.compare(v1_results, v2_results, agent_name="my_agent",
                                  v1_version="1.0", v2_version="2.0")
    """

    def compare(
        self,
        v1_results: list[TestRunResult],
        v2_results: list[TestRunResult],
        agent_name: str = "agent",
        v1_version: str = "v1",
        v2_version: str = "v2",
    ) -> RegressionReport:
        """
        Compare two benchmark runs and return a RegressionReport.

        - v1_results and v2_results must be run on the same test cases (matched by test_case.id).
        - Metrics are aggregated as averages across all test cases.
        """
        v1_avg = self._average_scores(v1_results)
        v2_avg = self._average_scores(v2_results)
        v1_latency = self._average_latency(v1_results)
        v2_latency = self._average_latency(v2_results)

        metric_deltas: list[MetricDelta] = []
        regressions: list[str] = []

        # Score metric regressions
        all_metrics = sorted(set(v1_avg.keys()) | set(v2_avg.keys()))
        for metric in all_metrics:
            v1_score = v1_avg.get(metric, 0.0)
            v2_score = v2_avg.get(metric, 0.0)
            delta = v2_score - v1_score
            is_regression = delta < -_SCORE_DROP_THRESHOLD

            metric_deltas.append(MetricDelta(
                metric=metric,
                v1_score=v1_score,
                v2_score=v2_score,
                delta=delta,
                is_regression=is_regression,
            ))

            if is_regression:
                pct = abs(delta) * 100
                regressions.append(
                    f"{metric} dropped by {pct:.1f}% "
                    f"({v1_score:.2f} → {v2_score:.2f})"
                )

        # Latency regression
        if v1_latency and v2_latency:
            latency_delta_pct = (v2_latency - v1_latency) / max(v1_latency, 1e-9)
            if latency_delta_pct > _LATENCY_INCREASE_THRESHOLD:
                regressions.append(
                    f"Average latency increased by {latency_delta_pct * 100:.1f}% "
                    f"({v1_latency:.1f}ms → {v2_latency:.1f}ms)"
                )
                metric_deltas.append(MetricDelta(
                    metric="latency_ms (avg)",
                    v1_score=v1_latency,
                    v2_score=v2_latency,
                    delta=v2_latency - v1_latency,
                    is_regression=True,
                ))

        # Per-test-case regressions (pass → fail)
        case_regressions = self._per_case_regressions(v1_results, v2_results)

        return RegressionReport(
            agent_name=agent_name,
            v1_version=v1_version,
            v2_version=v2_version,
            regression_detected=len(regressions) > 0,
            metric_deltas=metric_deltas,
            regressions=regressions,
            case_regressions=case_regressions,
        )

    # ── Helpers ───────────────────────────────────────────────

    def _average_scores(self, runs: list[TestRunResult]) -> dict[str, float]:
        """Aggregate per-evaluator average scores across all test cases."""
        totals: dict[str, list[float]] = {}
        for run in runs:
            for result in run.results:
                totals.setdefault(result.evaluator_name, []).append(result.score)
        return {k: sum(v) / len(v) for k, v in totals.items()}

    def _average_latency(self, runs: list[TestRunResult]) -> float:
        if not runs:
            return 0.0
        return sum(r.agent_run.latency_ms for r in runs) / len(runs)

    def _per_case_regressions(
        self,
        v1_results: list[TestRunResult],
        v2_results: list[TestRunResult],
    ) -> list[CaseRegression]:
        """Find individual test cases that passed in v1 but regressed in v2."""
        # Index v2 by test_case id -> evaluator_name -> result
        v2_index: dict[str, dict[str, EvaluationResult]] = {}
        for run in v2_results:
            tc_id = run.test_case.id
            v2_index[tc_id] = {r.evaluator_name: r for r in run.results}

        case_regressions: list[CaseRegression] = []
        for v1_run in v1_results:
            tc_id = v1_run.test_case.id
            v2_run_results = v2_index.get(tc_id, {})

            for v1_result in v1_run.results:
                metric = v1_result.evaluator_name
                v2_result = v2_run_results.get(metric)
                if not v2_result:
                    continue

                delta = v2_result.score - v1_result.score
                if delta < -_SCORE_DROP_THRESHOLD:
                    case_regressions.append(CaseRegression(
                        test_case_id=tc_id,
                        test_case_name=v1_run.test_case.name,
                        metric=metric,
                        v1_score=v1_result.score,
                        v2_score=v2_result.score,
                    ))

        return case_regressions
