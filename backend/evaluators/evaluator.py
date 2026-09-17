from abc import ABC, abstractmethod
from pydantic import BaseModel, Field
from backend.models.agent_run import AgentRun
from backend.models.test_case import TestCase


class EvaluationResult(BaseModel):
    evaluator_name: str
    score: float = Field(ge=0.0, le=1.0)
    passed: bool
    reason: str | None = None


class BaseEvaluator(ABC):
    name: str

    @abstractmethod
    def evaluate(self, test_case: TestCase, agent_run: AgentRun) -> EvaluationResult:
        """
        Compare what was expected (test_case) against what happened (agent_run).
        Return a scored EvaluationResult.
        """
        ...