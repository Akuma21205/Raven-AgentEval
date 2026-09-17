from backend.evaluators.evaluator import BaseEvaluator, EvaluationResult
from backend.models.agent_run import AgentRun
from backend.models.test_case import TestCase
from backend.models.trace import TraceEventType


class TrajectoryEfficiencyEvaluator(BaseEvaluator):
    """
    Evaluates execution trajectory quality per EVALUATION.md §2.4 and §2.5.

    Two checks:
    1. Efficiency score (EVALUATION.md §2.5):
         Efficiency = optimal_steps / actual_steps
       `optimal_steps` is taken from `constraints.max_tool_calls`.
       Capped at 1.0 (agent cannot score above perfect).

    2. Required sequence check (EVALUATION.md §2.4):
       The required_sequence must appear as a subsequence in the trace.
       Sequence failure hard-caps the final score at 0.0.

    Final score = efficiency_score if sequence passes, else 0.0.
    """
    name = "trajectory_efficiency"

    def evaluate(self, test_case: TestCase, agent_run: AgentRun) -> EvaluationResult:
        # --- Extract ordered list of tool names from the trace ---
        tools_called = [
            event.data["tool_name"]
            for event in agent_run.trace
            if event.event_type == TraceEventType.TOOL_CALL
            and "tool_name" in event.data
        ]
        actual_steps = len(tools_called)

        # --- Check 1: Efficiency score (EVALUATION.md §2.5) ---
        # optimal_steps = max_tool_calls (the expected/target step count)
        optimal_steps = test_case.constraints.max_tool_calls
        if optimal_steps is not None and actual_steps > 0:
            efficiency_score = round(min(optimal_steps / actual_steps, 1.0), 2)
        else:
            # No constraint defined or no tools called → full score
            efficiency_score = 1.0

        # --- Check 2: Required sequence (EVALUATION.md §2.4) ---
        required_sequence = test_case.trajectory.required_sequence
        sequence_ok = True
        sequence_reason = ""
        if required_sequence:
            if not _is_subsequence(required_sequence, tools_called):
                sequence_ok = False
                sequence_reason = (
                    f"Required sequence {required_sequence} not found "
                    f"in trace order {tools_called}."
                )

        # Sequence failure is a hard fail regardless of efficiency
        if not sequence_ok:
            return EvaluationResult(
                evaluator_name=self.name,
                score=0.0,
                passed=False,
                reason=sequence_reason,
            )

        passed = efficiency_score >= 1.0
        reason = (
            "All trajectory checks passed."
            if passed
            else (
                f"Efficiency: {efficiency_score:.2f} "
                f"(used {actual_steps} steps, optimal is {optimal_steps})."
            )
        )
        return EvaluationResult(
            evaluator_name=self.name,
            score=efficiency_score,
            passed=passed,
            reason=reason,
        )


def _is_subsequence(required: list[str], actual: list[str]) -> bool:
    """
    Returns True if every item in `required` appears in `actual`
    in the same relative order (not necessarily contiguous).
    """
    it = iter(actual)
    return all(item in it for item in required)