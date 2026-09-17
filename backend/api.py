import json
import uuid

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlmodel import Session, select

from backend.database import engine, get_session
from backend.datasets.manager import DatasetLoadError, DatasetManager
from backend.db_models import Agent, AgentVersion, EvaluationDataset
from backend.db_models import EvaluationResult as DBEvaluationResult
from backend.db_models import EvaluationRun, create_db_and_tables
from backend.evaluators.composite import calculate_composite_score
from backend.evaluators.evaluator import EvaluationResult
from backend.evaluators.latency import LatencyEvaluator
from backend.evaluators.recovery import RecoveryEvaluator
from backend.evaluators.regression import RegressionDetector
from backend.evaluators.semantic import SemanticSimilarityEvaluator
from contextlib import asynccontextmanager
from backend.evaluators.task_success import TaskSuccessEvaluator
from backend.evaluators.tool_selection import ToolArgumentEvaluator, ToolSelectionEvaluator
from backend.evaluators.trajectory import TrajectoryEfficiencyEvaluator
from backend.models.agent_run import AgentRun
from backend.models.test_case import TestCase


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables(engine)
    yield


app = FastAPI(title="AgentEval", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


EVALUATOR_REGISTRY = {
    "latency":               LatencyEvaluator(),
    "tool_selection":        ToolSelectionEvaluator(),
    "tool_argument":         ToolArgumentEvaluator(),
    "trajectory_efficiency": TrajectoryEfficiencyEvaluator(),
    "task_success":          TaskSuccessEvaluator(),
    "recovery":              RecoveryEvaluator(),
    "semantic_similarity":   SemanticSimilarityEvaluator(),  # EVALUATION.md §3
}

_dataset_manager = DatasetManager()


# ── Request / Response models ─────────────────────────────────────────────────

class EvaluateRequest(BaseModel):
    test_case: TestCase
    agent_run: AgentRun
    # Reproducibility fields (ARCHITECTURE.md §7)
    model_name: str | None = None
    dataset_name: str | None = None
    dataset_version: str | None = None

class RunDetail(BaseModel):
    run: EvaluationRun
    results: list[DBEvaluationResult]
    composite_score: float | None = None
    grade: str | None = None

class CompareRequest(BaseModel):
    """Compare two agent versions by their stored run IDs."""
    v1_run_id: uuid.UUID
    v2_run_id: uuid.UUID
    agent_name: str = "agent"

class DatasetInfo(BaseModel):
    name: str
    test_case_count: int
    test_case_ids: list[str]


# ── Core evaluation endpoint ──────────────────────────────────────────────────

@app.post("/evaluate")
def evaluate(
    request: EvaluateRequest,
    session: Session = Depends(get_session),
) -> list[EvaluationResult]:
    """Submit a pre-recorded AgentRun against a TestCase for evaluation."""
    test_case = request.test_case
    agent_run = request.agent_run

    # Persist the run record (with reproducibility fields)
    db_run = EvaluationRun(
        test_case_id=test_case.id,
        test_case_name=test_case.name,
        agent_name=agent_run.agent_name,
        agent_version=agent_run.agent_version,
        run_id=agent_run.run_id,
        model_name=request.model_name,
        dataset_name=request.dataset_name,
        dataset_version=request.dataset_version,
        evaluator_config=json.dumps(test_case.evaluators),
    )
    session.add(db_run)
    session.commit()
    session.refresh(db_run)

    # Run each requested evaluator and persist results
    results: list[EvaluationResult] = []
    for name in test_case.evaluators:
        evaluator = EVALUATOR_REGISTRY.get(name)
        if evaluator:
            evaluation = evaluator.evaluate(test_case, agent_run)
            session.add(DBEvaluationResult(
                run_id=db_run.id,
                evaluator_name=evaluation.evaluator_name,
                score=evaluation.score,
                passed=evaluation.passed,
                reason=evaluation.reason,
            ))
            results.append(evaluation)

    session.commit()
    return results


# ── Run history endpoints ─────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/runs")
def list_runs(session: Session = Depends(get_session)) -> list[EvaluationRun]:
    """Return all evaluation runs, most recent first."""
    return session.exec(
        select(EvaluationRun).order_by(EvaluationRun.created_at.desc())
    ).all()


@app.get("/runs/{run_id}")
def get_run(run_id: uuid.UUID, session: Session = Depends(get_session)) -> RunDetail:
    """Return a single evaluation run with results and composite score."""
    run = session.get(EvaluationRun, run_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"Run {run_id} not found.")

    db_results = session.exec(
        select(DBEvaluationResult).where(DBEvaluationResult.run_id == run_id)
    ).all()

    # Compute composite score from stored results
    eval_results = [
        EvaluationResult(
            evaluator_name=r.evaluator_name,
            score=r.score,
            passed=r.passed,
            reason=r.reason,
        )
        for r in db_results
    ]
    composite = calculate_composite_score(eval_results) if eval_results else None

    return RunDetail(
        run=run,
        results=list(db_results),
        composite_score=composite.overall_score if composite else None,
        grade=composite.grade if composite else None,
    )


# ── Dataset management endpoints ──────────────────────────────────────────────

@app.get("/datasets")
def list_datasets() -> list[str]:
    """List all available benchmark datasets."""
    return _dataset_manager.list_datasets()


@app.get("/datasets/{name}")
def get_dataset(name: str) -> DatasetInfo:
    """Load a named dataset and return its test case metadata."""
    try:
        test_cases = _dataset_manager.load_dataset(name)
    except DatasetLoadError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return DatasetInfo(
        name=name,
        test_case_count=len(test_cases),
        test_case_ids=[tc.id for tc in test_cases],
    )


@app.get("/datasets/{name}/test-cases")
def get_dataset_test_cases(name: str) -> list[TestCase]:
    """Return the full TestCase objects for a named dataset."""
    try:
        return _dataset_manager.load_dataset(name)
    except DatasetLoadError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ── Regression comparison endpoint ───────────────────────────────────────────

@app.post("/compare")
def compare_runs(
    request: CompareRequest,
    session: Session = Depends(get_session),
) -> dict:
    """
    Compare two stored evaluation runs and return a regression report.
    Accepts v1_run_id and v2_run_id (UUIDs of rows in EvaluationRun).
    """
    def _load_run_results(run_id: uuid.UUID) -> tuple[EvaluationRun, list[DBEvaluationResult]]:
        run = session.get(EvaluationRun, run_id)
        if not run:
            raise HTTPException(status_code=404, detail=f"Run {run_id} not found.")
        results = session.exec(
            select(DBEvaluationResult).where(DBEvaluationResult.run_id == run_id)
        ).all()
        return run, list(results)

    v1_run, v1_db_results = _load_run_results(request.v1_run_id)
    v2_run, v2_db_results = _load_run_results(request.v2_run_id)

    # Build lightweight TestRunResult-like structures for the detector
    # We compare at the evaluator-score level directly
    def _build_metric_map(db_results: list[DBEvaluationResult]) -> dict[str, float]:
        return {r.evaluator_name: r.score for r in db_results}

    v1_metrics = _build_metric_map(v1_db_results)
    v2_metrics = _build_metric_map(v2_db_results)

    # Detect regressions by comparing metric maps
    all_metrics = sorted(set(v1_metrics) | set(v2_metrics))
    THRESHOLD = 0.05
    regressions = []
    metric_deltas = []

    for metric in all_metrics:
        v1_score = v1_metrics.get(metric, 0.0)
        v2_score = v2_metrics.get(metric, 0.0)
        delta = v2_score - v1_score
        is_regression = delta < -THRESHOLD

        metric_deltas.append({
            "metric": metric,
            "v1_score": round(v1_score, 3),
            "v2_score": round(v2_score, 3),
            "delta": round(delta, 3),
            "is_regression": is_regression,
        })

        if is_regression:
            regressions.append(
                f"{metric} dropped by {abs(delta) * 100:.1f}% "
                f"({v1_score:.2f} → {v2_score:.2f})"
            )

    return {
        "agent_name": request.agent_name,
        "v1": {"run_id": str(request.v1_run_id), "version": v1_run.agent_version},
        "v2": {"run_id": str(request.v2_run_id), "version": v2_run.agent_version},
        "regression_detected": len(regressions) > 0,
        "regressions": regressions,
        "metric_deltas": metric_deltas,
    }


# ── Agent & AgentVersion management endpoints (ARCHITECTURE.md §5) ──────────

class CreateAgentRequest(BaseModel):
    name: str
    description: str | None = None

class CreateAgentVersionRequest(BaseModel):
    version: str
    framework: str | None = None
    model_name: str | None = None
    notes: str | None = None


@app.post("/agents", status_code=201)
def create_agent(
    request: CreateAgentRequest,
    session: Session = Depends(get_session),
) -> Agent:
    """Register a new agent entity."""
    existing = session.exec(select(Agent).where(Agent.name == request.name)).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"Agent '{request.name}' already exists.")
    agent = Agent(name=request.name, description=request.description)
    session.add(agent)
    session.commit()
    session.refresh(agent)
    return agent


@app.get("/agents")
def list_agents(session: Session = Depends(get_session)) -> list[Agent]:
    """List all registered agents."""
    return session.exec(select(Agent).order_by(Agent.created_at.desc())).all()


@app.post("/agents/{agent_name}/versions", status_code=201)
def create_agent_version(
    agent_name: str,
    request: CreateAgentVersionRequest,
    session: Session = Depends(get_session),
) -> AgentVersion:
    """Register a new version for an existing agent."""
    agent = session.exec(select(Agent).where(Agent.name == agent_name)).first()
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_name}' not found.")
    version = AgentVersion(
        agent_id=agent.id,
        version=request.version,
        framework=request.framework,
        model_name=request.model_name,
        notes=request.notes,
    )
    session.add(version)
    session.commit()
    session.refresh(version)
    return version


@app.get("/agents/{agent_name}/versions")
def list_agent_versions(
    agent_name: str,
    session: Session = Depends(get_session),
) -> list[AgentVersion]:
    """List all versions of a given agent."""
    agent = session.exec(select(Agent).where(Agent.name == agent_name)).first()
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_name}' not found.")
    return session.exec(
        select(AgentVersion)
        .where(AgentVersion.agent_id == agent.id)
        .order_by(AgentVersion.created_at.desc())
    ).all()


# ── Experiment run endpoint (ARCHITECTURE.md §1 — Experiment Manager) ────────

class ExperimentRunRequest(BaseModel):
    """
    Request to run a full benchmark experiment via the API.
    The adapter runs inside the server process using a registered adapter name.
    NOTE: For remote/external agents, use the batch /evaluate endpoint instead.
    """
    experiment_name: str
    dataset_name: str
    evaluator_names: list[str] = ["tool_selection", "tool_argument", "latency"]


@app.post("/experiments/run")
def run_experiment_summary(request: ExperimentRunRequest) -> dict:
    """
    Returns metadata about a requested experiment configuration.
    Full execution requires the adapter to be run server-side.
    Use this endpoint to validate dataset + evaluator config before running.
    """
    # Validate dataset exists
    try:
        test_cases = _dataset_manager.load_dataset(request.dataset_name)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

    # Validate evaluator names
    unknown = [e for e in request.evaluator_names if e not in EVALUATOR_REGISTRY]
    if unknown:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown evaluator(s): {unknown}. "
                   f"Valid options: {list(EVALUATOR_REGISTRY.keys())}",
        )

    return {
        "experiment_name": request.experiment_name,
        "dataset_name": request.dataset_name,
        "test_case_count": len(test_cases),
        "test_case_ids": [tc.id for tc in test_cases],
        "evaluators": request.evaluator_names,
        "status": "ready",
        "message": (
            "Configuration is valid. "
            "Submit individual runs via POST /evaluate or use ExperimentManager "
            "directly from Python: backend.experiments.manager.ExperimentManager"
        ),
    }