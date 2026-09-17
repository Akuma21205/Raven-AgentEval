from datetime import datetime
from typing import Any
from pydantic import BaseModel
from enum import StrEnum

class ToolCallStatus(StrEnum):
    SUCCESS = "success"
    FAILED = "failed"
    TIMEOUT = "timeout"

class ToolCall(BaseModel):
    tool_name: str
    arguments: dict[str, Any]
    timestamp: datetime
    duration_ms: float
    status: ToolCallStatus
    result: dict | str | None
