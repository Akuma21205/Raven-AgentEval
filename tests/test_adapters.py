import pytest
from backend.adapters.custom import CustomAgentAdapter
from backend.models.agent_run import AgentRunStatus
from backend.models.trace import TraceEventType
from backend.runner.collector import MemoryTraceCollector


def test_custom_adapter_sync_simple():
    adapter = CustomAgentAdapter(
        agent_name="echo_bot",
        agent_version="1.0",
        fn=lambda x: f"Response: {x}",
    )
    run = adapter.run("hello world")
    assert run.status == AgentRunStatus.COMPLETED
    assert run.output == "Response: hello world"
    assert run.latency_ms >= 0.0
    # Checks that automatic lifecycle events were recorded
    events = [e.event_type for e in run.trace]
    assert TraceEventType.AGENT_START in events
    assert TraceEventType.FINAL_ANSWER in events
    assert TraceEventType.AGENT_END in events


def test_custom_adapter_with_collector():
    def my_agent(input_text: str, collector: MemoryTraceCollector):
        collector.record_plan("Plan 1: lookup customer")
        collector.record_tool_call("get_user", {"id": "usr_1"})
        collector.record_tool_result("get_user", {"name": "Alice"})
        collector.record_observation("Found user Alice")
        return "Hello Alice"

    adapter = CustomAgentAdapter(
        agent_name="customer_agent",
        agent_version="2.0",
        fn=my_agent,
    )
    run = adapter.run("Lookup Alice")
    assert run.status == AgentRunStatus.COMPLETED
    assert run.output == "Hello Alice"

    types = [e.event_type for e in run.trace]
    assert TraceEventType.AGENT_START in types
    assert TraceEventType.PLAN in types
    assert TraceEventType.TOOL_CALL in types
    assert TraceEventType.TOOL_RESULT in types
    assert TraceEventType.OBSERVATION in types
    assert TraceEventType.FINAL_ANSWER in types
    assert TraceEventType.AGENT_END in types


def test_custom_adapter_async():
    async def async_bot(input_text: str, collector: MemoryTraceCollector):
        collector.record_tool_call("async_fetch", {"q": input_text})
        return f"Async result for {input_text}"

    adapter = CustomAgentAdapter(
        agent_name="async_bot",
        agent_version="1.0",
        fn=async_bot,
    )
    run = adapter.run("query")
    assert run.status == AgentRunStatus.COMPLETED
    assert "Async result for query" in run.output


def test_custom_adapter_exception_handling():
    def failing_agent(input_text: str):
        raise ValueError("Agent internal crash!")

    adapter = CustomAgentAdapter(
        agent_name="failing_bot",
        agent_version="1.0",
        fn=failing_agent,
    )
    run = adapter.run("explode")
    assert run.status == AgentRunStatus.ERROR
    assert run.output is None
    error_events = [e for e in run.trace if e.event_type == TraceEventType.AGENT_ERROR]
    assert len(error_events) == 1
    assert "Agent internal crash!" in error_events[0].data["error"]
