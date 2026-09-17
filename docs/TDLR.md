# AgentEval — TL;DR

## What is AgentEval?

AgentEval is an evaluation and regression testing platform for tool-using AI agents.

Unlike traditional LLM evaluation systems that primarily evaluate:

```
Input → Final Output
```

AgentEval evaluates the **complete execution** of an AI agent:

```
User Task
    ↓
Planning
    ↓
Tool Selection
    ↓
Tool Execution
    ↓
Observations
    ↓
Additional Actions
    ↓
Final Answer
```

The goal is to answer a critical engineering question:

> **Did the agent actually solve the task correctly, efficiently, and reliably?**

---

## The Problem

AI agents are non-deterministic systems. A small change to an agent can cause unexpected regressions:

- Changing the LLM model
- Modifying the system prompt
- Adding or removing tools
- Changing agent logic
- Updating a framework
- Modifying tool descriptions
- Changing retrieval strategies

An agent may still produce seemingly good answers while becoming:

- Less efficient
- More expensive
- Slower
- Worse at selecting tools
- Worse at handling failures

Traditional unit testing is **not sufficient** for evaluating these behaviors.

---

## The Solution

AgentEval executes an AI agent against a collection of structured test scenarios and evaluates:

1. **Task Success** — Did the agent successfully complete the requested task?
2. **Tool Selection** — Did the agent choose the correct tool?
3. **Tool Argument Accuracy** — Did the agent provide correct arguments to the selected tool?
4. **Trajectory Quality** — Did the agent follow an appropriate sequence of actions?
5. **Efficiency** — Did the agent use unnecessary steps or excessive tool calls?
6. **Latency** — How long did the agent take to complete the task?
7. **Cost** — How expensive was the execution?
8. **Recovery** — Can the agent recover when tools fail?

---

## Core Concept

Every evaluation follows this pipeline:

```
Test Dataset
      ↓
Agent Runner
      ↓
Trace Collection
      ↓
Evaluation Engine
      ↓
Metric Calculation
      ↓
Evaluation Report
      ↓
Regression Detection
```

---

## Example

A developer has two versions of an agent: `Agent v1` and `Agent v2`.

AgentEval executes both against the same benchmark.

| Metric        | v1    | v2    | Status |
|---------------|-------|-------|--------|
| Task Success  | 92%   | 88%   | ❌     |
| Tool Accuracy | 95%   | 96%   | ✅     |
| Efficiency    | 81%   | 62%   | ❌     |
| Latency       | 2.1s  | 3.9s  | ❌     |

🚨 **REGRESSION DETECTED**

The system identifies whether changes improved or degraded the agent.

---

## Target Users

AgentEval is designed for:

- AI Engineers
- LLM Engineers
- Agent Engineers
- Applied AI Teams
- Researchers
- Developers building production AI agents

---

## Initial MVP

The first version will support:

- Python-based agents
- LangGraph agents
- Tool-using agents

The MVP evaluates:

- Task success
- Tool selection accuracy
- Tool argument accuracy
- Trajectory efficiency
- Latency

---

## Long-Term Vision

AgentEval aims to become a **testing and evaluation layer for production AI agents**.

Similar to how software engineers use:

```
pytest → test software
```

AI engineers should be able to use:

```
agent-eval → test AI agents
```

---

## Project Thesis

> AI agents should not only be evaluated by **what they say**, but by **what they do**.

That is the core philosophy behind AgentEval.