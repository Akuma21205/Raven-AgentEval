from backend.evaluators.evaluator import BaseEvaluator, EvaluationResult
from backend.models.agent_run import AgentRun
from backend.models.test_case import TestCase


class LatencyEvaluator(BaseEvaluator):
    """
    Checks whether the agent completed the task within the allowed latency budget.

    Scoring:
    - If no max_latency_ms is defined in constraints -> pass by default (score 1.0)
    - If actual latency <= max_latency_ms -> score 1.0, passed
    - If actual latency > max_latency_ms -> score = max_latency_ms / actual_latency_ms
      (proportional penalty - the further over budget, the lower the score)
    """
    name = "latency"

    def evaluate(self, test_case: TestCase, agent_run: AgentRun) -> EvaluationResult:
        max_latency_ms = test_case.constraints.max_latency_ms

        # No constraint defined -> pass by default
        if max_latency_ms is None:
            return EvaluationResult(
                evaluator_name=self.name,
                score=1.0,
                passed=True,
                reason="No latency constraint defined - pass by default.",
            )

        actual_ms = agent_run.latency_ms

        if actual_ms <= max_latency_ms:
            return EvaluationResult(
                evaluator_name=self.name,
                score=1.0,
                passed=True,
                reason=f"Latency {actual_ms:.1f}ms is within budget of {max_latency_ms:.1f}ms.",
            )

        # Proportional score: how close were we to the budget?
        score = round(max_latency_ms / actual_ms, 2)

        return EvaluationResult(
            evaluator_name=self.name,
            score=score,
            passed=False,
            reason=(
                f"Latency {actual_ms:.1f}ms exceeded budget of {max_latency_ms:.1f}ms "
                f"(+{actual_ms - max_latency_ms:.1f}ms over)."
            ),
        )
