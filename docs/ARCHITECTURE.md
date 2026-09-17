# AgentEval — System Architecture

## 1. Architecture Overview

AgentEval is composed of six primary layers:

```
                         ┌──────────────────┐
                         │    Developer     │
                         └────────┬─────────┘
                                  │
                     CLI / SDK / Dashboard
                                  │
                                  ▼
                    ┌─────────────────────┐
                    │   Evaluation API    │
                    │      FastAPI        │
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼

  Dataset Manager        Agent Runner        Experiment Manager

         │                     │                     │
         │                     ▼                     │
         │              Trace Collector              │
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               ▼

                    ┌─────────────────────┐
                    │  Evaluation Engine  │
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼

 Deterministic       LLM-Based Judge       Trajectory Evaluator
   Evaluators          Evaluators

                               │
                               ▼

                    ┌─────────────────────┐
                    │   Results Storage   │
                    │    PostgreSQL       │
                    └──────────┬──────────┘
                               │
                               ▼

                    ┌─────────────────────┐
                    │   React Dashboard   │
                    └─────────────────────┘
```

---

## 2. Core Components

### 2.1 Agent SDK

The SDK provides a standard interface for connecting AI agents to AgentEval.

```python
from agenteval import Agent

agent = Agent(
    name="customer-support-agent",
    version="1.0"
)

agent.run(task)
```

The SDK is responsible for:

- Executing agents
- Capturing traces
- Capturing tool calls
- Measuring latency
- Recording metadata

---

### 2.2 Agent Runner

The Agent Runner executes the target agent against evaluation scenarios.

**Pipeline:**

```
Test Case
    ↓
Agent Input
    ↓
Agent Execution
    ↓
Trace Collection
    ↓
Execution Result
```

Each execution produces an `AgentRun`.

**Example:**

```json
{
  "run_id": "run_001",
  "agent_version": "1.0",
  "test_case_id": "case_001",
  "status": "completed",
  "latency_ms": 2140
}
```

---

### 2.3 Trace Collector

The Trace Collector captures the execution trajectory.

**Example:**

```
User Input

↓ Step 1

Agent Action: search_knowledge_base()

↓ Observation

Policy found

↓ Step 2

Agent Action: get_order(order_id=123)

↓ Observation

Order status returned

↓ Step 3

Final Answer
```

> The trace becomes the **primary input** for trajectory evaluation.

---

### 2.4 Dataset Manager

The Dataset Manager stores structured evaluation scenarios.

Each test case defines:

- Input
- Expected Outcome
- Expected Tools
- Expected Tool Arguments
- Expected Behavior
- Evaluation Rules

**Example:**

```json
{
  "id": "refund_case_001",
  "input": "I want a refund for order 123",
  "expected_tools": [
    "get_order",
    "process_refund"
  ],
  "evaluation": {
    "task_success": true,
    "tool_accuracy": true
  }
}
```

---

### 2.5 Evaluation Engine

The Evaluation Engine processes:

- Test Case
- Agent Trace
- Agent Output

...and produces **Evaluation Scores**.

**Architecture:**

```
Evaluation Engine
        │
 ┌──────┼───────────┐
 ▼      ▼           ▼

Task   Tool       Trajectory
Eval   Eval         Eval

        │
        ▼

Metric Aggregator

        │
        ▼

Final Evaluation Report
```

---

### 2.6 Evaluators

Each metric is implemented as an independent evaluator.

```python
class BaseEvaluator:
    name: str

    def evaluate(
        self,
        test_case,
        agent_run
    ):
        pass
```

**Built-in evaluators:**

| Evaluator                      | Description                           |
|--------------------------------|---------------------------------------|
| `TaskSuccessEvaluator`         | Did the agent complete the task?      |
| `ToolSelectionEvaluator`       | Did the agent pick the correct tools? |
| `ToolArgumentEvaluator`        | Were the tool arguments correct?      |
| `TrajectoryEfficiencyEvaluator`| Was the execution path efficient?     |
| `LatencyEvaluator`             | How fast was the execution?           |

> This architecture allows new evaluators to be added **without modifying the core evaluation pipeline**.

---

## 3. Evaluation Pipeline

```
                    Evaluation Request
                           │
                           ▼

                     Load Dataset

                           │
                           ▼

                    Select Test Case

                           │
                           ▼

                     Execute Agent

                           │
                           ▼

                     Capture Trace

                           │
                           ▼

                   Run Evaluators

                           │

              ┌────────────┼────────────┐

              ▼            ▼            ▼

          Task Eval    Tool Eval    Trajectory Eval

              │            │            │

              └────────────┼────────────┘

                           ▼

                   Aggregate Metrics

                           │
                           ▼

                    Store Results

                           │
                           ▼

                  Generate Report
```

---

## 4. Data Flow

```
Developer
   │ Run Evaluation
   ▼
Evaluation API
   ↓
Dataset Manager
   ↓
Agent Runner
   ↓
Target Agent
   ↓
Trace Collector
   ↓
Evaluation Engine
   ↓
Metric Results
   ↓
PostgreSQL
   ↓
Dashboard / CLI Report
```

---

## 5. Storage Model

The initial database contains:

```
Agents
│
├── Agent Versions
│
├── Evaluation Datasets
│
├── Test Cases
│
├── Evaluation Runs
│
├── Agent Traces
│
└── Evaluation Results
```

**Relationship:**

```
Agent
   │
   ├── Agent Version
   │
   └── Evaluation Run
             │
             ├── Test Case Results
             │
             ├── Trace
             │
             └── Metric Scores
```

---

## 6. Deployment Architecture

**Initial deployment (Docker Compose):**

```
Docker Compose
│
├── Backend
│     └── FastAPI
│
├── PostgreSQL
│
└── Frontend
      └── React
```

**Future architecture:**

```
                    Load Balancer
                         │
              ┌──────────┴──────────┐
              │                     │

          API Service         Worker Service

              │                     │

              └──────────┬──────────┘
                         │

                    PostgreSQL

                         │

                    Object Storage
```

> Workers will allow **asynchronous evaluation** of large datasets.

---

## 7. Design Principles

### Modular Evaluators
Metrics should be independent and pluggable.

### Framework-Agnostic Core
The evaluation engine should not depend directly on LangGraph. LangGraph support should exist through **adapters**.

### Trace-First Evaluation
The platform evaluates agent behavior using **execution traces**, not only final outputs.

### Reproducibility
Every evaluation should store:

- Agent version
- Model version
- Dataset version
- Evaluator configuration
- Timestamp

### Regression Detection
Agent versions should be directly comparable.

---

## Architecture Decision

The system will initially use:

| Layer     | Technology   |
|-----------|--------------|
| Language  | Python       |
| Backend   | FastAPI      |
| Database  | PostgreSQL   |
| Frontend  | React        |
| Deployment| Docker       |

Agent integrations will begin with **LangGraph**.

The evaluation core will remain **framework-agnostic** to support future adapters.