from datetime import datetime, timezone
from backend.models.agent_run import AgentRun, AgentRunStatus
from backend.models.test_case import TestCase, ExpectedBehavior, Constraints
from backend.models.trace import TraceEvent, TraceEventType
from backend.evaluators.composite import calculate_composite_score
from backend.evaluators.latency import LatencyEvaluator
from backend.evaluators.recovery import RecoveryEvaluator
from backend.evaluators.semantic import SemanticSimilarityEvaluator
from backend.evaluators.tool_selection import (
    ToolArgumentEvaluator,
    ToolSelectionEvaluator,
    _match_arg_value,
)
from backend.evaluators.trajectory import TrajectoryEfficiencyEvaluator


def test_tool_selection_exact_and_violations():
    evaluator = ToolSelectionEvaluator()

    test_case = TestCase(
        id="case_1",
        name="Test Tools",
        input="Find order",
        expected=ExpectedBehavior(
            expected_tools=["get_order"],
            forbidden_tools=["cancel_order"],
            allowed_tools=["get_order", "lookup_user"],
        ),
    )

    # Valid run
    run_valid = AgentRun(
        run_id="run_1",
        agent_name="agent",
        agent_version="1.0",
        input="Find order",
        status=AgentRunStatus.COMPLETED,
        latency_ms=100.0,
        trace=[
            TraceEvent(
                event_id="e1",
                event_type=TraceEventType.TOOL_CALL,
                timestamp=datetime.now(timezone.utc),
                data={"tool_name": "get_order"},
            )
        ],
    )
    res = evaluator.evaluate(test_case, run_valid)
    assert res.score == 1.0
    assert res.passed is True

    # Violation: used forbidden tool
    run_forbidden = AgentRun(
        run_id="run_2",
        agent_name="agent",
        agent_version="1.0",
        input="Find order",
        status=AgentRunStatus.COMPLETED,
        latency_ms=100.0,
        trace=[
            TraceEvent(
                event_id="e1",
                event_type=TraceEventType.TOOL_CALL,
                timestamp=datetime.now(timezone.utc),
                data={"tool_name": "get_order"},
            ),
            TraceEvent(
                event_id="e2",
                event_type=TraceEventType.TOOL_CALL,
                timestamp=datetime.now(timezone.utc),
                data={"tool_name": "cancel_order"},
            ),
        ],
    )
    res_forb = evaluator.evaluate(test_case, run_forbidden)
    assert res_forb.passed is False
    assert res_forb.score == 0.0

    # Violation: used tool outside allowed set
    run_unallowed = AgentRun(
        run_id="run_3",
        agent_name="agent",
        agent_version="1.0",
        input="Find order",
        status=AgentRunStatus.COMPLETED,
        latency_ms=100.0,
        trace=[
            TraceEvent(
                event_id="e1",
                event_type=TraceEventType.TOOL_CALL,
                timestamp=datetime.now(timezone.utc),
                data={"tool_name": "delete_database"},
            )
        ],
    )
    res_unallowed = evaluator.evaluate(test_case, run_unallowed)
    assert res_unallowed.passed is False
    assert res_unallowed.score == 0.0


def test_tool_argument_matching_modes():
    # Unit tests for _match_arg_value
    assert _match_arg_value("123", "123")[0] is True
    assert _match_arg_value("123", "456")[0] is False
    assert _match_arg_value("$contains:ord", "order_123")[0] is True
    assert _match_arg_value("$contains:xyz", "order_123")[0] is False
    assert _match_arg_value("$startswith:ord_", "ord_456")[0] is True
    assert _match_arg_value("$endswith:_001", "order_001")[0] is True
    assert _match_arg_value(r"$regex:^\d+$", "12345")[0] is True
    assert _match_arg_value(r"$regex:^\d+$", "abc")[0] is False
    assert _match_arg_value("$type:str", "hello")[0] is True
    assert _match_arg_value("$type:int", 42)[0] is True
    assert _match_arg_value("$type:int", "42")[0] is False
    assert _match_arg_value("$range:1,100", 50)[0] is True
    assert _match_arg_value("$range:1,100", 150)[0] is False


def test_trajectory_efficiency():
    evaluator = TrajectoryEfficiencyEvaluator()
    test_case = TestCase(
        id="case_traj",
        name="Traj Test",
        input="Find order",
        constraints=Constraints(max_steps=5, timeout_seconds=10),
    )

    # 3 steps taken, max_steps is 5 -> optimal is 5 if optimal_steps not specified
    # Or optimal_steps can be configured in constraints
    run = AgentRun(
        run_id="run_traj",
        agent_name="agent",
        agent_version="1.0",
        input="Find order",
        status=AgentRunStatus.COMPLETED,
        latency_ms=100.0,
        trace=[
            TraceEvent(event_id=f"e{i}", event_type=TraceEventType.TOOL_CALL, timestamp=datetime.now(timezone.utc))
            for i in range(3)
        ],
    )
    res = evaluator.evaluate(test_case, run)
    assert res.score > 0.0
    assert res.passed is True


def test_recovery_evaluator():
    evaluator = RecoveryEvaluator()
    test_case = TestCase(id="c_rec", name="Rec", input="x")

    # Clean run -> 1.0
    run_clean = AgentRun(
        run_id="r1",
        agent_name="a",
        agent_version="1",
        input="x",
        status=AgentRunStatus.COMPLETED,
        latency_ms=10.0,
        trace=[],
    )
    assert evaluator.evaluate(test_case, run_clean).score == 1.0

    # Error + recovery attempted + success -> 1.0
    run_recovered = AgentRun(
        run_id="r2",
        agent_name="a",
        agent_version="1",
        input="x",
        output="Recovered successfully",
        status=AgentRunStatus.COMPLETED,
        latency_ms=20.0,
        trace=[
            TraceEvent(event_id="e1", event_type=TraceEventType.AGENT_ERROR, timestamp=datetime.now(timezone.utc)),
            TraceEvent(event_id="e2", event_type=TraceEventType.TOOL_CALL, timestamp=datetime.now(timezone.utc)),
            TraceEvent(event_id="e3", event_type=TraceEventType.FINAL_ANSWER, timestamp=datetime.now(timezone.utc)),
        ],
    )
    assert evaluator.evaluate(test_case, run_recovered).score == 1.0

    # Error + no recovery -> 0.0
    run_failed = AgentRun(
        run_id="r3",
        agent_name="a",
        agent_version="1",
        input="x",
        status=AgentRunStatus.ERROR,
        latency_ms=20.0,
        trace=[
            TraceEvent(event_id="e1", event_type=TraceEventType.AGENT_ERROR, timestamp=datetime.now(timezone.utc)),
        ],
    )
    assert evaluator.evaluate(test_case, run_failed).score == 0.0


def test_semantic_similarity_evaluator():
    evaluator = SemanticSimilarityEvaluator()
    test_case = TestCase(
        id="c_sem",
        name="Sem",
        input="x",
        expected=ExpectedBehavior(expected_output="Your order has arrived."),
    )

    run = AgentRun(
        run_id="r_sem",
        agent_name="a",
        agent_version="1",
        input="x",
        output="Your order has arrived.",
        status=AgentRunStatus.COMPLETED,
        latency_ms=10.0,
    )
    res = evaluator.evaluate(test_case, run)
    assert res.score == 1.0
    assert res.passed is True


def test_composite_score_and_grading():
    from backend.evaluators.evaluator import EvaluationResult
    results = [
        EvaluationResult(evaluator_name="task_success", score=1.0, passed=True, reason=""),
        EvaluationResult(evaluator_name="tool_selection", score=1.0, passed=True, reason=""),
        EvaluationResult(evaluator_name="trajectory_efficiency", score=0.9, passed=True, reason=""),
        EvaluationResult(evaluator_name="latency", score=1.0, passed=True, reason=""),
    ]
    comp = calculate_composite_score(results)
    assert comp.overall_score >= 0.9
    assert comp.grade in ("A", "B")
