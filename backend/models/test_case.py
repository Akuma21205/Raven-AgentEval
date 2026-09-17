from typing import Any
from pydantic import BaseModel


# --- Sub-model 1 ---
# Captures what tools the agent is expected/forbidden to use
# and what arguments they should be called with.
class ExpectedBehavior(BaseModel):
    required_tools: list[str] = []         # must call these tools
    forbidden_tools: list[str] = []        # must never call these
    allowed_tools: list[str] = []          # may call these (optional)
    expected_arguments: dict[str, dict[str, Any]] = {}  # { "get_order": { "order_id": "123" } }
    expected_output: str | None = None

# --- Sub-model 2 ---
# Captures the expected sequence of actions (trajectory).
class TrajectoryExpectation(BaseModel):
    required_sequence: list[str] = []     # tools must appear in this order
    optional_steps: list[str] = []        # tools that are okay but not required


# --- Sub-model 3 ---
# Performance constraints for a test case.
# All optional — not every test needs a latency cap.
class Constraints(BaseModel):
    max_tool_calls: int | None = None
    max_latency_ms: float | None = None


# --- Top-level model ---
# A TestCase composes all the above.
class TestCase(BaseModel):
    __test__ = False

    id: str
    name: str
    description: str | None = None
    input: str                                              # the user's task/query

    expected: ExpectedBehavior = ExpectedBehavior()        # defaults to empty (permissive)
    trajectory: TrajectoryExpectation = TrajectoryExpectation()
    constraints: Constraints = Constraints()

    evaluators: list[str] = []                             # which evaluators to run e.g. ["task_success", "tool_selection"]
