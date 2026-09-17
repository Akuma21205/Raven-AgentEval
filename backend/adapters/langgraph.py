"""
LangGraph Adapter — integrates LangGraph compiled graphs with AgentEval.

Automatically captures:
  - Tool calls from AIMessage.tool_calls
  - Tool results from ToolMessage
  - Final answer from the last AIMessage content
  - Agent errors from exceptions

Based on docs/AGENT.md §12 MVP integration spec.
"""
from __future__ import annotations

import time
from typing import Any

from backend.adapters.base import BaseAgentAdapter
from backend.models.agent_run import AgentRun, AgentRunStatus
from backend.models.trace import TraceEventType
from backend.runner.collector import MemoryTraceCollector


class LangGraphAdapter(BaseAgentAdapter):
    """
    Adapter for evaluating LangGraph-compiled state graph agents.

    The graph must accept {"messages": [HumanMessage(content=input)]}
    as its invocation input — the standard LangGraph messages format.

    Usage:
        from langgraph.prebuilt import create_react_agent
        from langchain_openai import ChatOpenAI

        llm = ChatOpenAI(model="gpt-4o")
        tools = [get_order, process_refund]
        graph = create_react_agent(llm, tools)

        adapter = LangGraphAdapter(
            agent_name="support_agent",
            agent_version="1.0.0",
            graph=graph,
        )
    """

    def __init__(
        self,
        agent_name: str,
        agent_version: str,
        graph: Any,
        config: dict[str, Any] | None = None,
    ):
        """
        Args:
            agent_name:    Human-readable name of the agent.
            agent_version: Version string (e.g. "1.0.0").
            graph:         Compiled LangGraph graph (CompiledStateGraph).
            config:        Optional LangGraph run config (thread_id, etc.).
        """
        self.agent_name = agent_name
        self.agent_version = agent_version
        self.graph = graph
        self._default_config = config or {}

    def run(
        self,
        input: str,
        config: dict[str, Any] | None = None,
    ) -> AgentRun:
        """
        Invoke the LangGraph graph and translate its execution into an AgentRun.
        """
        # Import here to avoid hard dependency if LangGraph is not installed
        try:
            from langchain_core.messages import AIMessage, HumanMessage, ToolMessage
        except ImportError as e:
            raise ImportError(
                "langchain-core is required for LangGraphAdapter. "
                "Install it with: uv add langchain-core langgraph"
            ) from e

        collector = MemoryTraceCollector(
            agent_name=self.agent_name,
            agent_version=self.agent_version,
        )

        run_config = {**self._default_config, **(config or {})}

        try:
            collector.add_event(TraceEventType.AGENT_START, data={"input": input})

            # Stream the graph so we can capture every step/message
            messages_input = {"messages": [HumanMessage(content=input)]}
            final_output: str | None = None

            for chunk in self.graph.stream(messages_input, config=run_config or None, stream_mode="values"):
                messages = chunk.get("messages", [])
                for msg in messages:
                    if isinstance(msg, AIMessage):
                        # Capture tool calls
                        for tc in getattr(msg, "tool_calls", []) or []:
                            collector.record_tool_call(
                                tool_name=tc["name"],
                                arguments=tc.get("args", {}),
                            )
                        # Track any intermediate text
                        if msg.content and not msg.tool_calls:
                            final_output = str(msg.content)

                    elif isinstance(msg, ToolMessage):
                        # Capture tool result
                        collector.record_tool_result(
                            tool_name=msg.name or "unknown_tool",
                            result=msg.content,
                        )

            # Record final answer
            if final_output:
                collector.add_event(
                    TraceEventType.FINAL_ANSWER,
                    data={"output": final_output},
                )

            collector.add_event(TraceEventType.AGENT_END)

            return collector.to_agent_run(
                input=input,
                output=final_output,
                status=AgentRunStatus.COMPLETED,
            )

        except Exception as e:
            collector.record_error(str(e))
            return collector.to_agent_run(
                input=input,
                output=None,
                status=AgentRunStatus.ERROR,
                metadata={"error": str(e)},
            )
