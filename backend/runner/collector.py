import time
import uuid
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any

from backend.models.agent_run import AgentRun, AgentRunStatus
from backend.models.trace import TraceEvent, TraceEventType


class TraceCollector(ABC):
    """
    Abstract interface for recording execution traces of an AI agent.
    """

    @abstractmethod
    def add_event(
        self,
        event_type: TraceEventType,
        data: dict[str, Any] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> TraceEvent:
        """Record a generic trace event."""
        pass

    @abstractmethod
    def record_tool_call(self, tool_name: str, arguments: dict[str, Any]) -> TraceEvent:
        """Record when an agent calls a tool."""
        pass

    @abstractmethod
    def record_tool_result(self, tool_name: str, result: Any) -> TraceEvent:
        """Record the output or return value of a tool call."""
        pass

    @abstractmethod
    def record_error(self, error: str) -> TraceEvent:
        """Record an error during agent execution."""
        pass

    @abstractmethod
    def record_start(self, input_text: str) -> TraceEvent:
        """Record when an agent begins execution."""
        pass

    @abstractmethod
    def record_plan(self, plan: str | dict[str, Any]) -> TraceEvent:
        """Record when an agent creates or updates a plan."""
        pass

    @abstractmethod
    def record_observation(self, observation: Any) -> TraceEvent:
        """Record an environment observation."""
        pass

    @abstractmethod
    def record_final_answer(self, output: str) -> TraceEvent:
        """Record the final answer produced by the agent."""
        pass

    @abstractmethod
    def record_end(self, status: str = "completed") -> TraceEvent:
        """Record when an agent completes execution."""
        pass

    @abstractmethod
    def to_agent_run(
        self,
        input: str,
        output: str | None = None,
        status: AgentRunStatus = AgentRunStatus.COMPLETED,
        metadata: dict[str, Any] | None = None,
    ) -> AgentRun:
        """Assemble all recorded events into a validated AgentRun."""
        pass


class MemoryTraceCollector(TraceCollector):
    """
    In-memory implementation of TraceCollector that measures latency
    and constructs an AgentRun upon completion.
    """

    def __init__(self, agent_name: str, agent_version: str):
        self.agent_name = agent_name
        self.agent_version = agent_version
        self.events: list[TraceEvent] = []
        self._start_time = time.perf_counter()

    def add_event(
        self,
        event_type: TraceEventType,
        data: dict[str, Any] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> TraceEvent:
        event = TraceEvent(
            event_id=str(uuid.uuid4()),
            timestamp=datetime.now(timezone.utc),
            step_number=len(self.events),   # auto-increments: 0, 1, 2, ...
            event_type=event_type,
            data=data or {},
            metadata=metadata or {},
        )
        self.events.append(event)
        return event

    def record_start(self, input_text: str) -> TraceEvent:
        return self.add_event(
            event_type=TraceEventType.AGENT_START,
            data={"input": input_text},
        )

    def record_tool_call(self, tool_name: str, arguments: dict[str, Any]) -> TraceEvent:
        return self.add_event(
            event_type=TraceEventType.TOOL_CALL,
            data={"tool_name": tool_name, "arguments": arguments},
        )

    def record_tool_result(self, tool_name: str, result: Any) -> TraceEvent:
        return self.add_event(
            event_type=TraceEventType.TOOL_RESULT,
            data={"tool_name": tool_name, "result": result},
        )

    def record_plan(self, plan: str | dict[str, Any]) -> TraceEvent:
        data = plan if isinstance(plan, dict) else {"plan": plan}
        return self.add_event(
            event_type=TraceEventType.PLAN,
            data=data,
        )

    def record_observation(self, observation: Any) -> TraceEvent:
        data = observation if isinstance(observation, dict) else {"observation": observation}
        return self.add_event(
            event_type=TraceEventType.OBSERVATION,
            data=data,
        )

    def record_final_answer(self, output: str) -> TraceEvent:
        return self.add_event(
            event_type=TraceEventType.FINAL_ANSWER,
            data={"output": output},
        )

    def record_error(self, error: str) -> TraceEvent:
        return self.add_event(
            event_type=TraceEventType.AGENT_ERROR,
            data={"error": error},
        )

    def record_end(self, status: str = "completed") -> TraceEvent:
        return self.add_event(
            event_type=TraceEventType.AGENT_END,
            data={"status": status},
        )

    def to_agent_run(
        self,
        input: str,
        output: str | None = None,
        status: AgentRunStatus = AgentRunStatus.COMPLETED,
        metadata: dict[str, Any] | None = None,
    ) -> AgentRun:
        latency_ms = (time.perf_counter() - self._start_time) * 1000.0

        return AgentRun(
            run_id=f"run-{uuid.uuid4().hex[:8]}",
            agent_name=self.agent_name,
            agent_version=self.agent_version,
            input=input,
            output=output,
            status=status,
            trace=self.events,
            latency_ms=round(latency_ms, 2),
            metadata=metadata or {},
        )