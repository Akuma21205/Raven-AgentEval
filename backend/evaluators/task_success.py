import os
import re
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()  # loads .env from the project root into os.environ

from backend.evaluators.evaluator import BaseEvaluator, EvaluationResult
from backend.models.agent_run import AgentRun
from backend.models.test_case import TestCase

# NVIDIA's API is OpenAI-compatible — just swap the base_url and model
_NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"
_MODEL = "nvidia/nemotron-3-ultra-550b-a55b"

_JUDGE_PROMPT = """\
You are an expert evaluator assessing whether an AI agent successfully completed a task.

Task given to the agent:
{input}

Agent's final answer:
{output}

Expected outcome:
{expected_output}

Your job: decide if the agent's answer satisfies the expected outcome.
Be strict but fair — partial answers that miss key parts should fail.

Respond with valid JSON only, no extra text:
{{"passed": true or false, "reason": "one sentence explanation"}}
"""


class TaskSuccessEvaluator(BaseEvaluator):
    """
    Uses an LLM judge (NVIDIA Nemotron via OpenAI-compatible API) to assess
    whether the agent's final output satisfies the expected outcome.

    Scoring: binary — 1.0 if passed, 0.0 if failed.

    Skips (passes by default) if:
    - agent_run.output is None (agent produced no answer)
    - test_case.expected.expected_output is None (no expectation defined)
    """
    name = "task_success"

    def __init__(self):
        api_key = os.environ.get("NVIDIA_API_KEY")
        if not api_key:
            raise EnvironmentError("NVIDIA_API_KEY environment variable is not set.")
        self._client = OpenAI(
            base_url=_NVIDIA_BASE_URL,
            api_key=api_key,
        )

    def evaluate(self, test_case: TestCase, agent_run: AgentRun) -> EvaluationResult:
        expected_output = test_case.expected.expected_output

        # No expected output defined -> nothing to judge, pass by default
        if expected_output is None:
            return EvaluationResult(
                evaluator_name=self.name,
                score=1.0,
                passed=True,
                reason="No expected output defined — pass by default.",
            )

        # Agent produced no output -> automatic fail
        if not agent_run.output:
            return EvaluationResult(
                evaluator_name=self.name,
                score=0.0,
                passed=False,
                reason="Agent produced no output.",
            )

        # Call the LLM judge
        prompt = _JUDGE_PROMPT.format(
            input=test_case.input,
            output=agent_run.output,
            expected_output=expected_output,
        )

        try:
            response = self._client.chat.completions.create(
                model=_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.0,   # deterministic — we want consistent judgements
                max_tokens=400,
            )
            raw = response.choices[0].message.content.strip()
            # Extract JSON even if model wraps it in ```json ... ``` blocks
            json_match = re.search(r'\{.*\}', raw, re.DOTALL)
            if not json_match:
                raise json.JSONDecodeError('No JSON found', raw, 0)
            result = json.loads(json_match.group())
            passed = bool(result["passed"])
            reason = result.get("reason", "No reason provided.")
        except json.JSONDecodeError:
            # Judge returned malformed JSON — fail safe
            return EvaluationResult(
                evaluator_name=self.name,
                score=0.0,
                passed=False,
                reason=f"Judge returned malformed response: {raw!r}",
            )
        except Exception as e:
            return EvaluationResult(
                evaluator_name=self.name,
                score=0.0,
                passed=False,
                reason=f"Judge call failed: {e}",
            )

        return EvaluationResult(
            evaluator_name=self.name,
            score=1.0 if passed else 0.0,
            passed=passed,
            reason=reason,
        )
