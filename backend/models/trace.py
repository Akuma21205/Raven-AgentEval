from typing import Any
from pydantic import BaseModel
from datetime import datetime
from enum import Enum


class TraceEventType(str, Enum):
    AGENT_START = "agent_start"
    PLAN = "plan"
    AGENT_END = "agent_end"
    AGENT_ERROR = "agent_error"
    TOOL_CALL = "tool_call"
    TOOL_RESULT = "tool_result"
    OBSERVATION = "observation"
    FINAL_ANSWER = "final_answer"

class TraceEvent(BaseModel):
    event_type: TraceEventType
    event_id: str
    timestamp: datetime
    step_number: int = 0          # position in the execution sequence (0-indexed)
    data: dict[str, Any] = {}
    metadata: dict = {}