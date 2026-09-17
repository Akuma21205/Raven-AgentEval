"""
Semantic Similarity Evaluator — based on docs/EVALUATION.md §3 (Semantic Evaluation).

Used when exact string matching is too strict. Compares agent output against
expected output using vector embeddings and cosine similarity.

Strategy:
  1. Primary: NVIDIA NIM embedding API (nv-embedqa-e5-v5)
     — same API key as TaskSuccessEvaluator, zero extra cost to set up.
  2. Fallback: SequenceMatcher (no API needed, less accurate)
     — activated automatically if NVIDIA_API_KEY is missing or the API call fails.

Scoring:
  cosine_similarity → [0, 1]  (we normalise from [-1, 1] range)
  passed = similarity >= threshold  (default 0.75)
"""
from __future__ import annotations

import os
from difflib import SequenceMatcher

from dotenv import load_dotenv

from backend.evaluators.evaluator import BaseEvaluator, EvaluationResult
from backend.models.agent_run import AgentRun
from backend.models.test_case import TestCase

load_dotenv()

# NVIDIA NIM embedding model (OpenAI-compatible API)
_NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"
_EMBED_MODEL = "nvidia/nv-embedqa-e5-v5"

# Default similarity threshold to count as "passed"
_DEFAULT_THRESHOLD = 0.75


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    """Compute cosine similarity between two vectors."""
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = sum(x ** 2 for x in a) ** 0.5
    norm_b = sum(x ** 2 for x in b) ** 0.5
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    raw = dot / (norm_a * norm_b)
    # Normalise from [-1, 1] to [0, 1]
    return round((raw + 1.0) / 2.0, 4)


def _sequence_similarity(a: str, b: str) -> float:
    """Lightweight fallback: SequenceMatcher ratio already in [0, 1]."""
    return round(SequenceMatcher(None, a.strip().lower(), b.strip().lower()).ratio(), 4)


class SemanticSimilarityEvaluator(BaseEvaluator):
    """
    Evaluates how semantically similar the agent's output is to the expected output.

    Uses NVIDIA NIM embeddings (nv-embedqa-e5-v5) for primary evaluation.
    Falls back to SequenceMatcher if the API is unavailable.

    Usage in TestCase:
        evaluators: ["semantic_similarity"]
        expected:
          expected_output: "Your order has been delivered."

    Threshold configuration:
        evaluator = SemanticSimilarityEvaluator(threshold=0.80)
    """
    name = "semantic_similarity"

    def __init__(self, threshold: float = _DEFAULT_THRESHOLD):
        """
        Args:
            threshold: Minimum cosine similarity to count as passed (0.0–1.0).
                       Default is 0.75 (matches at a paragraph level).
        """
        self.threshold = threshold
        self._api_key = os.getenv("NVIDIA_API_KEY")
        self._client = None

        if self._api_key:
            try:
                from openai import OpenAI
                self._client = OpenAI(
                    base_url=_NVIDIA_BASE_URL,
                    api_key=self._api_key,
                )
            except ImportError:
                pass  # will fall back to SequenceMatcher

    def evaluate(self, test_case: TestCase, agent_run: AgentRun) -> EvaluationResult:
        expected_output = test_case.expected.expected_output

        # No expected output → nothing to compare, pass by default
        if expected_output is None:
            return EvaluationResult(
                evaluator_name=self.name,
                score=1.0,
                passed=True,
                reason="No expected output defined — pass by default.",
            )

        # No agent output → automatic fail
        if not agent_run.output or not agent_run.output.strip():
            return EvaluationResult(
                evaluator_name=self.name,
                score=0.0,
                passed=False,
                reason="Agent produced no output.",
            )

        # Quick short-circuit: exact match
        if agent_run.output.strip() == expected_output.strip():
            return EvaluationResult(
                evaluator_name=self.name,
                score=1.0,
                passed=True,
                reason="Exact match.",
            )

        # Try embedding-based similarity first
        if self._client is not None:
            try:
                similarity, method = self._embed_similarity(
                    agent_run.output, expected_output
                )
            except Exception as e:
                # API failure → fall back gracefully
                similarity, method = (
                    _sequence_similarity(agent_run.output, expected_output),
                    f"sequence_matcher (API error: {e})",
                )
        else:
            similarity, method = (
                _sequence_similarity(agent_run.output, expected_output),
                "sequence_matcher (no NVIDIA_API_KEY)",
            )

        passed = similarity >= self.threshold
        return EvaluationResult(
            evaluator_name=self.name,
            score=similarity,
            passed=passed,
            reason=(
                f"Similarity={similarity:.3f} (threshold={self.threshold}) "
                f"via {method}. "
                + ("PASSED." if passed else "FAILED — below threshold.")
            ),
        )

    # ── Internal ─────────────────────────────────────────────────────────────

    def _embed_similarity(
        self, text_a: str, text_b: str
    ) -> tuple[float, str]:
        """
        Get embeddings from NVIDIA NIM and compute cosine similarity.
        Returns (similarity_score, method_label).
        """
        response = self._client.embeddings.create(
            input=[text_a, text_b],
            model=_EMBED_MODEL,
            encoding_format="float",
            extra_body={"input_type": "query", "truncate": "NONE"},
        )
        vec_a = response.data[0].embedding
        vec_b = response.data[1].embedding
        return _cosine_similarity(vec_a, vec_b), f"nvidia/{_EMBED_MODEL}"
