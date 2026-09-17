import os
import tempfile
import yaml
from backend.adapters.custom import CustomAgentAdapter
from backend.evaluators.latency import LatencyEvaluator
from backend.evaluators.tool_selection import ToolSelectionEvaluator
from backend.experiments.manager import ExperimentManager
from backend.runner.collector import MemoryTraceCollector
from backend.runner.runner import AgentRunner


def test_agent_runner_single_test():
    adapter = CustomAgentAdapter("bot", "1.0", fn=lambda x: "done")
    evaluators = {"latency": LatencyEvaluator()}
    runner = AgentRunner(agent=adapter, evaluators=evaluators)

    from backend.models.test_case import TestCase
    tc = TestCase(id="c1", name="Test Case 1", input="hello", evaluators=["latency"])
    result = runner.run_test(tc)
    assert result.passed is True
    assert len(result.results) == 1
    assert result.results[0].evaluator_name == "latency"


def test_experiment_manager_run_and_compare():
    with tempfile.TemporaryDirectory() as tmpdir:
        # Create a mock dataset YAML
        dataset_content = {
            "name": "benchmark_demo",
            "description": "Demo benchmark",
            "test_cases": [
                {
                    "id": "tc_1",
                    "name": "Lookup",
                    "input": "find user",
                    "evaluators": ["tool_selection", "latency"],
                    "expected": {
                        "required_tools": ["lookup"],
                    },
                },
                {
                    "id": "tc_2",
                    "name": "Order",
                    "input": "order item",
                    "evaluators": ["tool_selection", "latency"],
                    "expected": {
                        "required_tools": ["buy"],
                    },
                },
            ],
        }
        yaml_path = os.path.join(tmpdir, "benchmark_demo.yaml")
        with open(yaml_path, "w", encoding="utf-8") as f:
            yaml.dump(dataset_content, f)

        # Agent 1: always calls right tools
        def agent_v1_fn(inp: str, coll: MemoryTraceCollector):
            if "find" in inp:
                coll.record_tool_call("lookup", {})
            else:
                coll.record_tool_call("buy", {})
            return "done"

        # Agent 2: misses a tool
        def agent_v2_fn(inp: str, coll: MemoryTraceCollector):
            coll.record_tool_call("wrong_tool", {})
            return "done"

        mgr = ExperimentManager(dataset_root=tmpdir)
        evals = {
            "tool_selection": ToolSelectionEvaluator(),
            "latency": LatencyEvaluator(),
        }

        res_v1 = mgr.run_experiment(
            name="exp_v1",
            adapter=CustomAgentAdapter("agent", "1.0", fn=agent_v1_fn),
            dataset_name="benchmark_demo",
            evaluators=evals,
        )
        assert res_v1.total_cases == 2
        assert res_v1.passed_count == 2
        assert res_v1.pass_rate == 1.0

        res_v2 = mgr.run_experiment(
            name="exp_v2",
            adapter=CustomAgentAdapter("agent", "2.0", fn=agent_v2_fn),
            dataset_name="benchmark_demo",
            evaluators=evals,
        )
        assert res_v2.passed_count < 2

        comp = mgr.compare_experiments(res_v1, res_v2)
        assert comp["regression_detected"] is True
        assert comp["pass_rate_delta"] < 0
