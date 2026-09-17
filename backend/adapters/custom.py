import asyncio
import inspect
from collections.abc import Callable
from typing import Any

from backend.adapters.base import BaseAgentAdapter
from backend.models.agent_run import AgentRun, AgentRunStatus
from backend.models.trace import TraceEventType
from backend.runner.collector import MemoryTraceCollector


class CustomAgentAdapter(BaseAgentAdapter):
    """
    Adapter for running arbitrary Python agent functions against AgentEval.

    Supports:
      - Synchronous and asynchronous functions
      - Flexible signatures:
          fn(input: str, collector: TraceCollector) -> str | None
          fn(input: str, collector: TraceCollector, config: dict) -> str | None
          fn(input: str) -> str | None
      - Automatic lifecycle events (agent_start, final_answer, agent_end)
        if not explicitly recorded by the agent function
    """

    def __init__(
        self,
        agent_name: str,
        agent_version: str,
        fn: Callable,
        default_config: dict[str, Any] | None = None,
    ):
        self.agent_name = agent_name
        self.agent_version = agent_version
        self.fn = fn
        self.default_config = default_config or {}

    def run(self, input: str, config: dict[str, Any] | None = None) -> AgentRun:
        collector = MemoryTraceCollector(
            agent_name=self.agent_name,
            agent_version=self.agent_version,
        )

        merged_config = {**self.default_config, **(config or {})}

        try:
            # 1. Record start if not already started
            collector.record_start(input)

            # 2. Inspect signature to call fn appropriately
            sig = inspect.signature(self.fn)
            params = list(sig.parameters.values())

            # Determine whether fn accepts collector and/or config
            num_params = len(params)
            accepts_varargs = any(p.kind == inspect.Parameter.VAR_POSITIONAL for p in params)
            accepts_varkw = any(p.kind == inspect.Parameter.VAR_KEYWORD for p in params)

            if accepts_varargs or accepts_varkw or num_params >= 3:
                res = self.fn(input, collector, merged_config)
            elif num_params == 2:
                res = self.fn(input, collector)
            else:
                res = self.fn(input)

            # 3. Handle coroutine if fn is async
            if inspect.iscoroutine(res):
                try:
                    loop = asyncio.get_running_loop()
                except RuntimeError:
                    loop = None

                if loop and loop.is_running():
                    # Running inside an existing event loop (e.g. FastAPI / asyncio)
                    import concurrent.futures
                    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                        output = pool.submit(asyncio.run, res).result()
                else:
                    output = asyncio.run(res)
            else:
                output = res

            # Ensure output is str or None
            final_str = str(output) if output is not None else None

            # 4. Record final answer if output produced and not already recorded
            has_final = any(e.event_type == TraceEventType.FINAL_ANSWER for e in collector.events)
            if final_str is not None and not has_final:
                collector.record_final_answer(final_str)

            # 5. Record agent_end
            has_end = any(e.event_type == TraceEventType.AGENT_END for e in collector.events)
            if not has_end:
                collector.record_end(status="completed")

            return collector.to_agent_run(
                input=input,
                output=final_str,
                status=AgentRunStatus.COMPLETED,
                metadata={"config": merged_config} if merged_config else None,
            )

        except Exception as e:
            # Capture any runtime exceptions as agent errors
            collector.record_error(str(e))
            has_end = any(e.event_type == TraceEventType.AGENT_END for e in collector.events)
            if not has_end:
                collector.record_end(status="error")

            return collector.to_agent_run(
                input=input,
                output=None,
                status=AgentRunStatus.ERROR,
                metadata={"config": merged_config, "error": str(e)} if merged_config else {"error": str(e)},
            )
