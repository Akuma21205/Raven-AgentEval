from abc import ABC, abstractmethod
from backend.models.agent_run import AgentRun
from typing import Any


class BaseAgentAdapter(ABC):
    agent_name: str
    agent_version: str

    @abstractmethod
    def run(self, input: str, config: dict[str, Any] | None = None) -> AgentRun:
        pass