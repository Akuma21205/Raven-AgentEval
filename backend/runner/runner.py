from pydantic import BaseModel

from backend.adapters.base import BaseAgentAdapter
from backend.evaluators.evaluator import BaseEvaluator, EvaluationResult
from backend.models.agent_run import AgentRun
from backend.models.test_case import TestCase


class TestRunResult(BaseModel):
    __test__ = False

    test_case: TestCase
    agent_run: AgentRun
    results: list[EvaluationResult]
    passed: bool


class AgentRunner:
    def __init__(self, agent: BaseAgentAdapter, evaluators: dict[str, BaseEvaluator]):
        self.agent = agent
        self.evaluators = evaluators

    def run_test(self, test_case: TestCase) -> TestRunResult:
        """
        Execute the agent on a single test case and run all requested evaluators.
        """
        agent_run = self.agent.run(test_case.input)

        results: list[EvaluationResult] = []
        for eval_name in test_case.evaluators:
            evaluator = self.evaluators.get(eval_name)
            if evaluator:
                res = evaluator.evaluate(test_case, agent_run)
                results.append(res)

        # Overall pass if all individual evaluators passed (or if no evaluators were specified)
        passed = all(r.passed for r in results) if results else True

        return TestRunResult(
            test_case=test_case,
            agent_run=agent_run,
            results=results,
            passed=passed,
        )

    def run_suite(self, test_cases: list[TestCase]) -> list[TestRunResult]:
        """
        Execute the agent against a batch of test cases.
        """
        return [self.run_test(tc) for tc in test_cases]