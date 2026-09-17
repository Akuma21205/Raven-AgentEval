from backend.models.trace import TraceEvent
from pydantic import BaseModel
from typing import Any
from enum import StrEnum

class AgentRunStatus(StrEnum):
    COMPLETED = "completed"
    FAILED = "failed"      # agent logic failed
    ERROR = "error"        # unexpected crash/exception
    RUNNING = "running"    # still in progress

class AgentRun(BaseModel):
    run_id: str
    agent_name: str
    agent_version: str
    input: str
    output: str | None = None
    status: AgentRunStatus
    trace: list[TraceEvent] = []
    latency_ms: float
    metadata: dict[str, Any] | None = None