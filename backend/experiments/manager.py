"""
Experiment Manager — based on docs/ARCHITECTURE.md §1 (peer to AgentRunner).

An Experiment groups:
  - A named benchmark dataset
  - A specific agent version (adapter)
  - A set of evaluators
  - A composite score + grade across all test cases

Usage:
    from backend.experiments.manager import ExperimentManager
    from backend.adapters.custom import CustomAgentAdapter
    from backend.evaluators.latency import LatencyEvaluator
    from backend.evaluators.tool_selection import ToolSelectionEvaluator

    adapter = CustomAgentAdapter("my_agent", "1.0", fn=my_fn)
    manager = ExperimentManager()

    result = manager.run_experiment(
        name="order_mgmt_v1",
        adapter=adapter,
        dataset_name="order_management",
        evaluators={
            "tool_selection": ToolSelectionEvaluator(),
            "latency": LatencyEvaluator(),
        },
    )
    print(result)
"""
from __future__ import annotations

import time
from dataclasses import dataclass, field

from pydantic import BaseModel

from backend.adapters.base import BaseAgentAdapter
from backend.datasets.manager import DatasetManager
from backend.evaluators.composite import calculate_composite_score, CompositeScore
from backend.evaluators.evaluator import BaseEvaluator
from backend.runner.runner import AgentRunner, TestRunResult


class ExperimentResult(BaseModel):
    """
    Aggregated result of running a full benchmark dataset through an agent.
    """
    experiment_name: str
    agent_name: str
    agent_version: str
    dataset_name: str

    test_results: list[TestRunResult]

    # Aggregate stats
    total_cases: int
    passed_count: int
    failed_count: int
    pass_rate: float                  # 0.0 – 1.0

    composite_score: float
    grade: str

    total_latency_ms: float
    avg_latency_ms: float

    model_config = {"arbitrary_types_allowed": True}

    def __str__(self) -> str:
        lines = [
            f"\n{'='*60}",
            f"  EXPERIMENT: {self.experiment_name}",
            f"  Agent:   {self.agent_name} @ {self.agent_version}",
            f"  Dataset: {self.dataset_name}",
            f"{'='*60}",
            f"  Composite Score : {self.composite_score:.2f}  ({self.grade})",
            f"  Pass Rate       : {self.pass_rate * 100:.1f}%  "
            f"({self.passed_count}/{self.total_cases} passed)",
            f"  Avg Latency     : {self.avg_latency_ms:.1f}ms",
            "",
            "  Per-Case Results:",
        ]
        for res in self.test_results:
            status = "✅" if res.passed else "❌"
            scores = "  ".join(
                f"{r.evaluator_name}={r.score:.2f}" for r in res.results
            )
            lines.append(f"    {status} [{res.test_case.id}] {res.test_case.name}")
            lines.append(f"       {scores}")
        lines.append("=" * 60)
        return "\n".join(lines)


class ExperimentManager:
    """
    Orchestrates a complete evaluation experiment:
      1. Loads dataset from DatasetManager
      2. Runs all test cases through the adapter via AgentRunner
      3. Evaluates each run with the provided evaluators
      4. Computes composite score and aggregated statistics

    This is the top-level entry point for a full benchmark run,
    as described in ARCHITECTURE.md §1.
    """

    def __init__(self, dataset_root: str | None = None):
        self._dataset_manager = DatasetManager(dataset_root=dataset_root)

    def run_experiment(
        self,
        name: str,
        adapter: BaseAgentAdapter,
        dataset_name: str,
        evaluators: dict[str, BaseEvaluator],
    ) -> ExperimentResult:
        """
        Run a full benchmark experiment.

        Args:
            name:          Human-readable experiment name (e.g. "order_mgmt_v1").
            adapter:       The agent adapter to evaluate.
            dataset_name:  Name of the benchmark dataset to load (e.g. "order_management").
            evaluators:    Dict mapping evaluator name → evaluator instance.

        Returns:
            ExperimentResult with per-case results and aggregate stats.
        """
        # 1. Load dataset
        test_cases = self._dataset_manager.load_dataset(dataset_name)

        # 2. Build runner and execute all test cases
        runner = AgentRunner(agent=adapter, evaluators=evaluators)
        test_results: list[TestRunResult] = []

        for test_case in test_cases:
            result = runner.run_test(test_case)
            test_results.append(result)

        # 3. Aggregate stats
        total = len(test_results)
        passed = sum(1 for r in test_results if r.passed)
        failed = total - passed

        total_latency = sum(r.agent_run.latency_ms for r in test_results)
        avg_latency = total_latency / total if total > 0 else 0.0

        # 4. Composite score across all evaluator results from all cases
        all_eval_results = [r for run in test_results for r in run.results]
        composite: CompositeScore = calculate_composite_score(all_eval_results)

        return ExperimentResult(
            experiment_name=name,
            agent_name=adapter.agent_name,
            agent_version=adapter.agent_version,
            dataset_name=dataset_name,
            test_results=test_results,
            total_cases=total,
            passed_count=passed,
            failed_count=failed,
            pass_rate=round(passed / total, 4) if total > 0 else 0.0,
            composite_score=composite.overall_score,
            grade=composite.grade,
            total_latency_ms=round(total_latency, 2),
            avg_latency_ms=round(avg_latency, 2),
        )

    def compare_experiments(
        self,
        v1_result: ExperimentResult,
        v2_result: ExperimentResult,
    ) -> dict:
        """
        Quick comparison of two ExperimentResults.
        Returns a dict with score delta, pass rate delta, and latency delta.
        """
        return {
            "composite_score_delta": round(
                v2_result.composite_score - v1_result.composite_score, 4
            ),
            "pass_rate_delta": round(
                v2_result.pass_rate - v1_result.pass_rate, 4
            ),
            "avg_latency_delta_ms": round(
                v2_result.avg_latency_ms - v1_result.avg_latency_ms, 2
            ),
            "regression_detected": (
                v2_result.composite_score < v1_result.composite_score - 0.05
                or v2_result.pass_rate < v1_result.pass_rate - 0.05
            ),
        }
