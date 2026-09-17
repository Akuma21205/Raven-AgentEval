# AgentEval — Agent Integration Specification

## 1. Purpose

AgentEval evaluates AI agents through a standardized execution and tracing interface.

The evaluation platform should **not** require developers to rewrite their agents.

Instead, an agent integration must provide:

- Agent Input
- Agent Output
- Execution Trace
- Tool Calls
- Execution Metadata

---

## 2. Agent Contract

Every supported agent must conceptually follow:

```
Input
  ↓
Agent Execution
  ↓
Actions / Tool Calls
  ↓
Observations
  ↓
Final Output
```

AgentEval represents this execution as an `AgentRun`.

---

## 3. AgentRun Schema

```python
class AgentRun:
    run_id: str
    agent_name: str
    agent_version: str
    input: str
    output: str
    trace: list
    status: str
    latency_ms: float
    metadata: dict
```

**Example:**

```json
{
  "run_id": "run_001",
  "agent_name": "customer-support-agent",
  "agent_version": "1.0",
  "input": "Where is my order 123?",
  "output": "Your order has been shipped and will arrive tomorrow.",
  "status": "completed",
  "latency_ms": 1834
}
```

---

## 4. Execution Trace

The execution trace records the agent's trajectory.

**Example:**

```
Step 1
  Type: tool_call
  Tool: get_order
  Arguments: order_id = 123
  ↓

Step 2
  Type: observation
  Result: Order shipped
  ↓

Step 3
  Type: final_answer
  Output: Your order has been shipped.
```

---

## 5. Trace Event Types

The initial version supports:

| Event Type    | Description                    |
|---------------|--------------------------------|
| `agent_start` | Agent begins execution         |
| `plan`        | Agent creates a plan           |
| `tool_call`   | Agent calls a tool             |
| `tool_result` | Result returned from tool      |
| `observation` | Agent observes the environment |
| `agent_error` | An error occurred              |
| `final_answer`| Agent produces final output    |
| `agent_end`   | Agent finishes execution       |

**Future versions may support:**

- `handoff`
- `sub_agent_call`
- `memory_read`
- `memory_write`
- `retry`
- `reflection`

---

## 6. Trace Event Schema

Each event follows:

```python
class TraceEvent:
    event_id: str
    timestamp: datetime
    event_type: str
    step_number: int
    data: dict
    metadata: dict
```

**Example — tool call:**

```json
{
  "event_type": "tool_call",
  "step_number": 2,
  "data": {
    "tool_name": "get_order",
    "arguments": {
      "order_id": "123"
    }
  }
}
```

**Example — tool result:**

```json
{
  "event_type": "tool_result",
  "step_number": 3,
  "data": {
    "tool_name": "get_order",
    "result": {
      "status": "shipped"
    }
  }
}
```

---

## 7. Agent Adapter Interface

Agent frameworks will be integrated through adapters.

```python
class BaseAgentAdapter:

    def run(
        self,
        input,
        config=None
    ) -> AgentRun:
        pass
```

**Framework implementations:**

- `LangGraphAdapter`
- `CustomPythonAgentAdapter`
- `CrewAIAdapter`
- `AutoGenAdapter`

> The MVP will implement: **`LangGraphAdapter`**

---

## 8. Tool Call Representation

Tool calls are critical for agent evaluation.

Each tool call contains:

```python
class ToolCall:
    tool_name: str
    arguments: dict
    timestamp: datetime
    duration_ms: float
    status: str
    result: dict | str | None
```

**Example:**

```json
{
  "tool_name": "get_order",
  "arguments": {
    "order_id": "123"
  },
  "duration_ms": 245,
  "status": "success"
}
```

---

## 9. Agent Metadata

Each agent run may include:

| Field            | Description                        |
|------------------|------------------------------------|
| `model`          | Model name (e.g., `gemini`)        |
| `provider`       | Model provider                     |
| `prompt_version` | Version of the system prompt       |
| `agent_version`  | Agent version string               |
| `framework`      | Framework used (e.g., `langgraph`) |
| `environment`    | Deployment environment             |
| `temperature`    | Sampling temperature               |
| `max_tokens`     | Maximum token limit                |

**Example:**

```json
{
  "model": "gemini",
  "framework": "langgraph",
  "temperature": 0.2,
  "agent_version": "1.0.0"
}
```

> This metadata is essential for **reproducible evaluations**.

---

## 10. Error Handling

Agent failures must also be captured.

**Example:**

```json
{
  "event_type": "agent_error",
  "step_number": 4,
  "data": {
    "error_type": "ToolTimeout",
    "tool_name": "knowledge_base_search"
  }
}
```

An evaluation should distinguish between:

- **Task Failure** — the agent failed to complete the task
- **Tool Failure** — a specific tool failed
- **Agent Failure** — the agent itself crashed
- **System Failure** — infrastructure-level failure

---

## 11. Design Principle

The core evaluation system must **not** depend on:

- LangGraph
- CrewAI
- AutoGen
- Any specific LLM

Instead, the architecture must remain framework-agnostic:

```
Framework
    ↓
Agent Adapter
    ↓
Standard AgentRun
    ↓
Evaluation Engine
```

This allows AgentEval to remain **framework-agnostic**.

---

## 12. MVP Integration

The first supported integration will be:

```
LangGraph Agent
    ↓
LangGraph Adapter
    ↓
AgentRun
    ↓
Trace Events
    ↓
Evaluation Engine
```

The adapter converts framework-specific execution data into the AgentEval standard format.

---

> **Key Principle:** AgentEval does not evaluate frameworks. It evaluates **agent behavior**.
>
> Framework integrations are simply adapters that convert execution traces into a common evaluation format.