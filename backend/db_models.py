import uuid
from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field


# ── Reproducibility tables (ARCHITECTURE.md §7) ──────────────────────────────

class Agent(SQLModel, table=True):
    """
    Represents a unique named agent in the system.
    Multiple versions of the same agent link back here.
    """
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(unique=True, index=True)
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AgentVersion(SQLModel, table=True):
    """
    A specific versioned snapshot of an agent.
    Links to Agent and records framework + model used.
    """
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    agent_id: uuid.UUID = Field(foreign_key="agent.id", index=True)
    version: str
    framework: Optional[str] = None        # e.g. "langgraph", "custom"
    model_name: Optional[str] = None       # e.g. "gpt-4o", "nvidia/nemotron"
    notes: Optional[str] = None            # release notes / changelog
    created_at: datetime = Field(default_factory=datetime.utcnow)


class EvaluationDataset(SQLModel, table=True):
    """
    A named benchmark dataset with version tracking.
    Links EvaluationRun to the exact dataset used.
    """
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(index=True)
    version: str = "1.0"
    source_path: Optional[str] = None      # path to YAML/JSON file on disk
    test_case_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ── Core evaluation tables ────────────────────────────────────────────────────

class EvaluationRun(SQLModel, table=True):
    """
    A single evaluation run: one agent run against one test case.
    Expanded with reproducibility fields per ARCHITECTURE.md §7.
    """
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    # Original fields
    test_case_id: str
    test_case_name: str
    agent_name: str
    agent_version: str
    run_id: str                             # run_id from AgentRun
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Reproducibility fields (all optional for backwards compatibility)
    model_name: Optional[str] = None        # LLM model used by the agent
    dataset_name: Optional[str] = None      # which benchmark dataset
    dataset_version: Optional[str] = None   # version of that dataset
    evaluator_config: Optional[str] = None  # JSON list of evaluator names used

    # Foreign keys to new tables (nullable for backwards compat)
    agent_version_id: Optional[uuid.UUID] = Field(
        default=None, foreign_key="agentversion.id"
    )
    dataset_id: Optional[uuid.UUID] = Field(
        default=None, foreign_key="evaluationdataset.id"
    )


class EvaluationResult(SQLModel, table=True):
    """Result of a single evaluator for one EvaluationRun."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    run_id: uuid.UUID = Field(foreign_key="evaluationrun.id", index=True)
    evaluator_name: str
    score: float
    passed: bool
    reason: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


def create_db_and_tables(engine):
    SQLModel.metadata.create_all(engine)
