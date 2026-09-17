# AgentEval — Evaluation Methodology

## 1. Philosophy

Traditional LLM evaluation primarily measures:

```
Prompt
   ↓
Model
   ↓
Response
```

AI agents require a **different** evaluation approach. Agents perform **actions**.

Therefore, AgentEval evaluates:

```
Input
  +
Behavior
  +
Tool Usage
  +
Execution Trajectory
  +
Final Outcome
```

The central principle is:

> **A successful answer does not necessarily mean a successful agent.**

An agent may produce a correct answer while:

- Using incorrect tools
- Making unnecessary tool calls
- Taking excessive steps
- Wasting resources
- Failing to recover from errors

AgentEval evaluates both the **outcome** and the **process**.

---

## 2. Evaluation Dimensions

### 2.1 Task Success

**Question:** Did the agent successfully complete the requested task?

Possible evaluation methods:

- Exact Match
- Rule-Based Assertions
- Semantic Similarity
- LLM-as-a-Judge

**Scoring:**

| Score | Meaning               |
|-------|-----------------------|
| `0.0` | Failed                |
| `0.5` | Partially Completed   |
| `1.0` | Successfully Completed|

---

### 2.2 Tool Selection Accuracy

**Question:** Did the agent select the appropriate tools?

**Example:**

| Field         | Value                  |
|---------------|------------------------|
| Task          | Find order status      |
| Expected Tool | `get_order`            |
| Actual Tool   | `search_knowledge_base`|
| Score         | `0.0`                  |

**Tool evaluation modes:**

- **Exact Tool Match** — must use exactly specified tools
- **Allowed Tool Set** — must only use tools from allowed list
- **Required Tool Set** — must include all required tools
- **Forbidden Tool Detection** — must not use banned tools

---

### 2.3 Tool Argument Accuracy

**Question:** Did the agent provide correct arguments?

**Example:**

| Field    | Value         |
|----------|---------------|
| Expected | `order_id = 123` |
| Actual   | `order_id = 456` |
| Score    | `0.0`         |

Arguments may be evaluated using:

- Exact Matching
- Schema Validation
- Partial Matching
- Custom Validators

---

### 2.4 Trajectory Evaluation

**Question:** Did the agent follow an appropriate execution path?

**Example:**

```
Expected:
  get_order → process_refund

Actual:
  search_kb → search_kb → get_order → process_refund
```

The task may succeed, however:

- Trajectory Quality ↓
- Efficiency ↓

Trajectory evaluation measures:

- Action Order
- Required Steps
- Forbidden Steps
- Unnecessary Steps

---

### 2.5 Efficiency

**Question:** How efficiently did the agent complete the task?

**Formula:**

```
Efficiency Score = Optimal Steps / Actual Steps
```

**Example:**

| Metric        | Value |
|---------------|-------|
| Optimal Steps | 3     |
| Actual Steps  | 6     |
| Score         | 0.50  |

The score will later incorporate:

- Tool Calls
- Retries
- Latency
- Token Usage

---

### 2.6 Latency

Latency measures:

```
Agent End Time − Agent Start Time
```

**Metrics tracked:**

- Average Latency
- Median Latency
- P95 Latency
- Maximum Latency

---

### 2.7 Cost

Future versions will calculate:

- Input Token Cost
- Output Token Cost
- Tool Cost
- Total Execution Cost

---

### 2.8 Recovery

Recovery evaluates: **Can the agent recover from failures?**

**Example:**

```
Tool Call
    ↓
Timeout ❌
    ↓
Agent Retry
    ↓
Alternative Tool
    ↓
Task Success ✅
```

Recovery score considers:

- Failure Detected
- Recovery Attempted
- Recovery Successful

---

## 3. Evaluation Types

AgentEval supports three categories of evaluation.

### Deterministic Evaluation

Examples:

- Exact Tool Match
- Schema Validation
- Required Tool Usage
- Latency Threshold

**Advantages:** Fast, Cheap, Reproducible

---

### Semantic Evaluation

Used when exact matching is insufficient.

Examples:

- Semantic Similarity
- Embedding-Based Comparison

---

### LLM-as-a-Judge

Used for complex evaluations.

**Example question:** Did the agent successfully solve the user's problem?

The evaluator provides:

- Task
- Expected Behavior
- Agent Trace
- Final Output

The judge produces:

- Score
- Reasoning
- Failure Category

> LLM judges must return **structured output**.

---

## 4. Composite Score

AgentEval should avoid relying only on a single score. However, an optional composite score may be calculated.

**Example formula:**

```
Overall Score =
  0.40 × Task Success
+ 0.20 × Tool Accuracy
+ 0.15 × Argument Accuracy
+ 0.15 × Efficiency
+ 0.10 × Reliability
```

> Weights must be **configurable**.

---

## 5. Regression Detection

Agent versions are compared using the **same**:

- Dataset
- Evaluator Configuration
- Environment

**Example comparison:**

| Metric       | Agent v1 | Agent v2 | Status |
|--------------|----------|----------|--------|
| Task Success | 92%      | 86%      | ❌ Regression |
| Tool Accuracy| 94%      | 91%      | ❌ Regression |
| Latency      | 2.1s     | 3.8s     | ❌ Regression |

🚨 **REGRESSION DETECTED**

---

## 6. Evaluation Principle

AgentEval follows:

> **Outcome + Behavior > Outcome Alone**

The final answer is only one component of agent quality.

The **complete trajectory** provides a more accurate representation of agent reliability.