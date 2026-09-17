"""
Dataset Manager — loads and saves evaluation benchmark datasets.

Supported formats: YAML (.yaml / .yml) and JSON (.json)
Default dataset root: <project_root>/datasets/
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import yaml
from pydantic import ValidationError

from backend.models.test_case import (
    Constraints,
    ExpectedBehavior,
    TestCase,
    TrajectoryExpectation,
)

# Default directory where .yaml / .json benchmarks live
_DEFAULT_DATASET_ROOT = Path(__file__).resolve().parents[2] / "datasets"


class DatasetLoadError(Exception):
    """Raised when a dataset file cannot be loaded or parsed."""


class DatasetManager:
    """
    Loads, saves, and lists structured evaluation benchmark datasets.

    Usage:
        dm = DatasetManager()
        cases = dm.load_dataset("order_management")
        dm.save_dataset("my_suite", cases)
    """

    def __init__(self, dataset_root: str | Path | None = None):
        self.dataset_root = Path(dataset_root) if dataset_root else _DEFAULT_DATASET_ROOT
        self.dataset_root.mkdir(parents=True, exist_ok=True)

    # ── Public API ────────────────────────────────────────────

    def list_datasets(self) -> list[str]:
        """Return names of all available datasets (without file extension)."""
        names: list[str] = []
        for path in self.dataset_root.iterdir():
            if path.suffix in (".yaml", ".yml", ".json"):
                names.append(path.stem)
        return sorted(names)

    def load_dataset(self, name: str) -> list[TestCase]:
        """
        Load a named dataset from the dataset root.
        Searches for <name>.yaml, <name>.yml, and <name>.json in order.
        """
        for ext in (".yaml", ".yml", ".json"):
            path = self.dataset_root / f"{name}{ext}"
            if path.exists():
                return self.load_file(path)
        raise DatasetLoadError(
            f"Dataset '{name}' not found in {self.dataset_root}. "
            f"Expected one of: {name}.yaml, {name}.yml, {name}.json"
        )

    def load_file(self, path: str | Path) -> list[TestCase]:
        """
        Load test cases from an explicit file path.
        Supports YAML and JSON.
        """
        path = Path(path)
        if not path.exists():
            raise DatasetLoadError(f"File not found: {path}")

        try:
            raw = path.read_text(encoding="utf-8")
            if path.suffix in (".yaml", ".yml"):
                data = yaml.safe_load(raw)
            elif path.suffix == ".json":
                data = json.loads(raw)
            else:
                raise DatasetLoadError(f"Unsupported file format: {path.suffix}")
        except (yaml.YAMLError, json.JSONDecodeError) as e:
            raise DatasetLoadError(f"Failed to parse {path}: {e}") from e

        if not isinstance(data, dict) or "test_cases" not in data:
            raise DatasetLoadError(
                f"{path} must be a mapping with a top-level 'test_cases' key."
            )

        return self._parse_test_cases(data["test_cases"], source=str(path))

    def save_dataset(
        self,
        name: str,
        test_cases: list[TestCase],
        fmt: str = "yaml",
    ) -> Path:
        """
        Persist a list of TestCase objects to a file in the dataset root.
        Returns the path of the created file.
        """
        ext = ".json" if fmt == "json" else ".yaml"
        path = self.dataset_root / f"{name}{ext}"

        payload = {
            "dataset": name,
            "test_cases": [tc.model_dump() for tc in test_cases],
        }

        with path.open("w", encoding="utf-8") as f:
            if fmt == "json":
                json.dump(payload, f, indent=2, default=str)
            else:
                yaml.dump(payload, f, default_flow_style=False, allow_unicode=True, sort_keys=False)

        return path

    # ── Internal helpers ───────────────────────────────────────

    def _parse_test_cases(
        self, raw_cases: Any, source: str = "<unknown>"
    ) -> list[TestCase]:
        if not isinstance(raw_cases, list):
            raise DatasetLoadError(
                f"'test_cases' in {source} must be a list, got {type(raw_cases).__name__}."
            )

        test_cases: list[TestCase] = []
        for i, raw in enumerate(raw_cases):
            if not isinstance(raw, dict):
                raise DatasetLoadError(
                    f"Test case #{i + 1} in {source} must be a mapping."
                )
            try:
                tc = self._build_test_case(raw)
                test_cases.append(tc)
            except (ValidationError, KeyError, TypeError) as e:
                raise DatasetLoadError(
                    f"Failed to parse test case #{i + 1} (id={raw.get('id', '?')}) "
                    f"in {source}: {e}"
                ) from e

        return test_cases

    def _build_test_case(self, raw: dict) -> TestCase:
        """Convert a raw dict (from YAML/JSON) into a validated TestCase."""

        expected_raw = raw.get("expected", {})
        expected = ExpectedBehavior(
            required_tools=expected_raw.get("required_tools", []),
            forbidden_tools=expected_raw.get("forbidden_tools", []),
            allowed_tools=expected_raw.get("allowed_tools", []),
            expected_arguments=expected_raw.get("expected_arguments", {}),
            expected_output=expected_raw.get("expected_output"),
        )

        trajectory_raw = raw.get("trajectory", {})
        trajectory = TrajectoryExpectation(
            required_sequence=trajectory_raw.get("required_sequence", []),
            optional_steps=trajectory_raw.get("optional_steps", []),
        )

        constraints_raw = raw.get("constraints", {})
        constraints = Constraints(
            max_tool_calls=constraints_raw.get("max_tool_calls"),
            max_latency_ms=constraints_raw.get("max_latency_ms"),
        )

        return TestCase(
            id=str(raw["id"]),
            name=str(raw["name"]),
            description=raw.get("description"),
            input=str(raw["input"]),
            expected=expected,
            trajectory=trajectory,
            constraints=constraints,
            evaluators=raw.get("evaluators", []),
        )
