# AgentEval — Test Case Specification

## 1. Purpose

Test cases define **expected agent behavior**.

Each test case describes:

- User Input
- Expected Outcome
- Expected Agent Behavior
- Evaluation Rules

---

## 2. Basic Schema

```yaml
id: refund_001

name: Process Refund

input: >
  I want a refund for order 123.

expected:
  required_tools:
    - get_order
    - process_refund

  forbidden_tools:
    - delete_order

evaluation:
  task_success: true
  tool_selection: true
  tool_arguments: true
  trajectory: true
```

---

## 3. Required Tools

A test case may specify tools that **must** be used.

```yaml
required_tools:
  - get_order
  - process_refund
```

---

## 4. Allowed Tools

A task may support multiple valid approaches.

```yaml
allowed_tools:
  - search_knowledge_base
  - get_policy
```

---

## 5. Forbidden Tools

Some actions should **never** occur.

```yaml
forbidden_tools:
  - delete_user
  - process_refund
```

This is especially important for:

- Security
- Safety
- Authorization

---

## 6. Tool Argument Expectations

```yaml
expected_arguments:
  get_order:
    order_id: "123"
```

---

## 7. Trajectory Expectations

```yaml
trajectory:
  required_sequence:
    - get_order
    - process_refund
```

Optional steps may be defined:

```yaml
optional_steps:
  - search_knowledge_base
```

---

## 8. Performance Constraints

```yaml
constraints:
  max_latency_ms: 5000
  max_tool_calls: 5
```

---

## 9. Complete Example

```yaml
id: refund_001

name: Process Order Refund

description: >
  Verify the order and process a refund.

input: >
  I want a refund for order 123.

expected:
  required_tools:
    - get_order
    - process_refund

  forbidden_tools:
    - delete_order

  expected_arguments:
    get_order:
      order_id: "123"

evaluation:
  evaluators:
    - task_success
    - tool_selection
    - tool_arguments
    - trajectory_efficiency

constraints:
  max_tool_calls: 4
  max_latency_ms: 5000
```

---

## Design Principle

> Test cases should describe **expected behavior** rather than implementation details whenever possible.
>
> The goal is to evaluate whether the agent **behaves correctly**, not force every agent into one exact internal implementation.