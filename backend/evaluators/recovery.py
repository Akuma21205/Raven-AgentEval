"""
Recovery Evaluator — based on docs/EVALUATION.md §2.8.

Evaluates whether an agent can detect failures and recover from them.

Score:
  1.0 — no failure occurred at all (clean run)
  1.0 — failure occurred AND recovery attempted AND task succeeded
  0.5 — failure occurred AND recovery attempted BUT task still failed
  0.0 — failure occurred AND no recovery was attempted at all

Recovery is detected by checking:
  - AGENT_ERROR event in trace (failure detected)
  - Any TOOL_CALL event *after* the first AGENT_ERROR (recovery attempted)
  - agent_run.output is not None (recovery successful)
"""
from __future__ import annotations

from backend.evaluators.evaluator import BaseEvaluator, EvaluationResult
from backend.models.agent_run import AgentRun
from backend.models.test_case import TestCase
from backend.models.trace import TraceEventType


class RecoveryEvaluator(BaseEvaluator):
    """
    Scores an agent's ability to detect failures and recover gracefully.

    Scoring follows EVALUATION.md §2.8:
      - Failure Detected  (AGENT_ERROR in trace)
      - Recovery Attempted (TOOL_CALL after the first error)
      - Recovery Successful (agent still produced output)
    """
    name = "recovery"

    def evaluate(self, test_case: TestCase, agent_run: AgentRun) -> EvaluationResult:
        events = agent_run.trace

        # --- Step 1: Find the index of the first AGENT_ERROR event ---
        first_error_index: int | None = None
        for i, event in enumerate(events):
            if event.event_type == TraceEventType.AGENT_ERROR:
                first_error_index = i
                break

        # No error in trace → clean run, full score
        if first_error_index is None:
            return EvaluationResult(
                evaluator_name=self.name,
                score=1.0,
                passed=True,
                reason="No errors detected — clean execution.",
            )

        # --- Step 2: Check if agent attempted recovery (any TOOL_CALL after error) ---
        events_after_error = events[first_error_index + 1:]
        recovery_attempted = any(
            e.event_type == TraceEventType.TOOL_CALL for e in events_after_error
        )

        if not recovery_attempted:
            return EvaluationResult(
                evaluator_name=self.name,
                score=0.0,
                passed=False,
                reason="Failure detected but no recovery attempted (no tool call after error).",
            )

        # --- Step 3: Check if recovery succeeded (agent produced final output) ---
        recovery_successful = agent_run.output is not None and agent_run.output.strip() != ""

        if recovery_successful:
            return EvaluationResult(
                evaluator_name=self.name,
                score=1.0,
                passed=True,
                reason="Failure detected, recovery attempted, and task completed successfully.",
            )

        return EvaluationResult(
            evaluator_name=self.name,
            score=0.5,
            passed=False,
            reason="Recovery attempted after failure, but agent did not produce a final output.",
        )
