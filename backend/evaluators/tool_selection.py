import re
from typing import Any

from backend.evaluators.evaluator import BaseEvaluator, EvaluationResult
from backend.models.agent_run import AgentRun
from backend.models.test_case import TestCase
from backend.models.trace import TraceEventType


class ToolSelectionEvaluator(BaseEvaluator):
    """
    Checks if the agent used the correct tools for the task.

    Implements all four modes from EVALUATION.md §2.2:
    1. Forbidden Tool Detection  — any forbidden tool → fail (score 0.0)
    2. Allowed Tool Set          — tools outside allowed set are penalised
    3. Required Tool Set         — score = required_hit / total_required
    4. (Exact match enforced via required + allowed together)
    """
    name = "tool_selection"

    def evaluate(self, test_case: TestCase, agent_run: AgentRun) -> EvaluationResult:
        required = test_case.expected.required_tools
        forbidden = test_case.expected.forbidden_tools

        # Extract tool names from the trace (only tool_call events)
        tools_called = [
            event.data["tool_name"]
            for event in agent_run.trace
            if event.event_type == TraceEventType.TOOL_CALL
            and "tool_name" in event.data
        ]

        # Check forbidden tools first — immediate fail
        forbidden_used = [t for t in tools_called if t in forbidden]
        if forbidden_used:
            return EvaluationResult(
                evaluator_name=self.name,
                score=0.0,
                passed=False,
                reason=f"Forbidden tool(s) used: {forbidden_used}",
            )

        # --- Check 2: Allowed tools (EVALUATION.md §2.2 — Allowed Tool Set) ---
        # If an allowed set is defined, any tool outside it is a violation.
        allowed_tools = test_case.expected.allowed_tools
        if allowed_tools:
            disallowed_used = [t for t in tools_called if t not in allowed_tools]
            if disallowed_used:
                # Proportional penalty: fraction of calls that were disallowed
                disallowed_count = len(disallowed_used)
                total_calls = len(tools_called)
                penalty = disallowed_count / total_calls
                score = round(1.0 - penalty, 2)
                return EvaluationResult(
                    evaluator_name=self.name,
                    score=score,
                    passed=False,
                    reason=(
                        f"Tool(s) used outside allowed set: {disallowed_used}. "
                        f"Allowed: {allowed_tools}"
                    ),
                )

        # If no required tools specified, pass by default
        if not required:
            return EvaluationResult(
                evaluator_name=self.name,
                score=1.0,
                passed=True,
                reason="No required tools specified — pass by default.",
            )

        # Score = fraction of required tools that were actually called
        tools_called_set = set(tools_called)
        missing = [t for t in required if t not in tools_called_set]
        score = (len(required) - len(missing)) / len(required)

        return EvaluationResult(
            evaluator_name=self.name,
            score=round(score, 2),
            passed=len(missing) == 0,
            reason=(
                f"All required tools called."
                if not missing
                else f"Missing required tool(s): {missing}"
            ),
        )

class ToolArgumentEvaluator(BaseEvaluator):
    """
    Checks whether the agent passed the correct arguments to each tool.
    Implements EVALUATION.md §2.3 matching modes via a special-prefix syntax.

    Matching modes (in expected_arguments values):
      - Exact match (default)     : "123"          → actual == "123"
      - Contains                  : "$contains:ord" → "ord" in actual
      - Starts with               : "$startswith:ord_"
      - Ends with                 : "$endswith:_001"
      - Regex                     : "$regex:^\\d+$"
      - Type check                : "$type:str"  or "$type:int" / "$type:float"
      - Numeric range             : "$range:1,100"  → 1 <= actual <= 100

    Scoring:
    - If no expected_arguments are defined → pass by default (score 1.0)
    - score = correct_args / total_expected_args  (across all tools)
    - passed = score == 1.0
    """
    name = "tool_argument"

    def evaluate(self, test_case: TestCase, agent_run: AgentRun) -> EvaluationResult:
        expected_arguments = test_case.expected.expected_arguments

        # No expectations → pass by default
        if not expected_arguments:
            return EvaluationResult(
                evaluator_name=self.name,
                score=1.0,
                passed=True,
                reason="No expected arguments specified — pass by default.",
            )

        # Build a lookup: tool_name → list of argument dicts (from trace)
        actual_calls: dict[str, list[dict]] = {}
        for event in agent_run.trace:
            if event.event_type == TraceEventType.TOOL_CALL and "tool_name" in event.data:
                tool_name = event.data["tool_name"]
                args = event.data.get("arguments", {})
                actual_calls.setdefault(tool_name, []).append(args)

        total_expected = 0
        total_correct = 0
        mismatches: list[str] = []

        for tool_name, expected_args in expected_arguments.items():
            calls_for_tool = actual_calls.get(tool_name, [])

            if not calls_for_tool:
                # Tool was never called — all expected args are wrong
                total_expected += len(expected_args)
                mismatches.append(f"'{tool_name}' was never called (expected args: {list(expected_args.keys())})")
                continue

            # Use the first call for this tool (most common case)
            # If called multiple times, pick the call that matches best
            best_correct = 0
            best_mismatch: list[str] = []

            for actual_args in calls_for_tool:
                correct = 0
                call_mismatches: list[str] = []
                for arg_name, expected_val in expected_args.items():
                    actual_val = actual_args.get(arg_name)
                    matched, match_reason = _match_arg_value(expected_val, actual_val)
                    if matched:
                        correct += 1
                    else:
                        call_mismatches.append(
                            f"'{tool_name}.{arg_name}': {match_reason} (got {actual_val!r})"
                        )
                if correct > best_correct:
                    best_correct = correct
                    best_mismatch = call_mismatches

            total_expected += len(expected_args)
            total_correct += best_correct
            mismatches.extend(best_mismatch)

        score = round(total_correct / total_expected, 2) if total_expected > 0 else 1.0
        passed = score == 1.0

        return EvaluationResult(
            evaluator_name=self.name,
            score=score,
            passed=passed,
            reason=(
                "All tool arguments matched."
                if passed
                else f"Argument mismatches: {'; '.join(mismatches)}"
            ),
        )


# ── Argument Matching Engine (EVALUATION.md §2.3) ──────────────────────────
# Supports special prefix syntax inside expected_arguments values.
# Plain values fall through to exact match — fully backward compatible.

_TYPE_MAP: dict[str, type] = {
    "str": str,
    "int": int,
    "float": float,
    "bool": bool,
    "list": list,
    "dict": dict,
}


def _match_arg_value(expected: Any, actual: Any) -> tuple[bool, str]:
    """
    Compare `actual` against `expected` using the appropriate matcher.

    Returns (matched: bool, reason: str) where reason describes the
    expectation (used in mismatch messages).

    Matching modes triggered by string prefixes:
      $contains:<substring>      — str(actual) contains substring
      $startswith:<prefix>       — str(actual) starts with prefix
      $endswith:<suffix>         — str(actual) ends with suffix
      $regex:<pattern>           — re.search(pattern, str(actual))
      $type:<typename>           — isinstance(actual, mapped_type)
      $range:<lo>,<hi>           — lo <= float(actual) <= hi
      (anything else)            — actual == expected  (exact match)
    """
    if not isinstance(expected, str) or not expected.startswith("$"):
        # Plain value — exact match
        matched = actual == expected
        reason = f"expected exactly {expected!r}" if not matched else ""
        return matched, reason

    # Parse prefix and operand
    if ":" not in expected:
        # Malformed matcher — fall back to exact
        return actual == expected, f"expected exactly {expected!r}"

    prefix, operand = expected.split(":", maxsplit=1)

    if prefix == "$contains":
        matched = operand in str(actual)
        return matched, f"expected value to contain {operand!r}"

    if prefix == "$startswith":
        matched = str(actual).startswith(operand)
        return matched, f"expected value to start with {operand!r}"

    if prefix == "$endswith":
        matched = str(actual).endswith(operand)
        return matched, f"expected value to end with {operand!r}"

    if prefix == "$regex":
        try:
            matched = bool(re.search(operand, str(actual)))
        except re.error as e:
            return False, f"invalid regex {operand!r}: {e}"
        return matched, f"expected value to match regex {operand!r}"

    if prefix == "$type":
        expected_type = _TYPE_MAP.get(operand)
        if expected_type is None:
            return False, f"unknown type name {operand!r} (use str/int/float/bool/list/dict)"
        matched = isinstance(actual, expected_type)
        return matched, f"expected value of type {operand}"

    if prefix == "$range":
        try:
            lo_str, hi_str = operand.split(",", maxsplit=1)
            lo, hi = float(lo_str.strip()), float(hi_str.strip())
            matched = lo <= float(actual) <= hi
        except (ValueError, TypeError):
            return False, f"could not evaluate range {operand!r} with actual={actual!r}"
        return matched, f"expected value in range [{lo}, {hi}]"

    # Unknown prefix — fall back to exact
    return actual == expected, f"expected exactly {expected!r}"