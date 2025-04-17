"""
# SPDX-License-Identifier: Apache-2.0
Tests for perspective module loading functionality.
"""

import json
import tempfile
from pathlib import Path

import pytest
from graphcap.perspectives.perspective_loader import (
    ModuleConfig,
    PerspectiveSettings,
    get_all_modules,
    load_all_perspectives,
)


@pytest.fixture
def temp_perspective_dir():
    """Create a temporary directory for test perspectives."""
    with tempfile.TemporaryDirectory() as temp_dir:
        # Create module directories
        core_dir = Path(temp_dir) / "core"
        core_dir.mkdir()

        experimental_dir = Path(temp_dir) / "experimental"
        experimental_dir.mkdir()

        # Create a few test perspectives
        core_perspective = {
            "name": "test_core",
            "display_name": "Test Core",
            "version": "1",
            "prompt": "Test prompt",
            "schema_fields": [{"name": "caption", "type": "str", "description": "A test caption", "is_list": False}],
            "table_columns": [{"name": "Caption", "style": "green"}],
            "context_template": "<TestCaption>\n{caption}\n</TestCaption>\n",
            "module": "core",
            "tags": ["test", "core"],
            "description": "A test perspective",
            "deprecated": False,
            "priority": 10,
        }

        with open(core_dir / "test_core.json", "w") as f:
            json.dump(core_perspective, f, indent=2)

        # Create a perspective without explicit module (should use directory name)
        auto_module_perspective = {
            "name": "test_experimental",
            "display_name": "Test Experimental",
            "version": "0.1",
            "prompt": "Test experimental prompt",
            "schema_fields": [{"name": "caption", "type": "str", "description": "A test caption", "is_list": False}],
            "table_columns": [{"name": "Caption", "style": "yellow"}],
            "context_template": "<TestExperimentalCaption>\n{caption}\n</TestExperimentalCaption>\n",
            "tags": ["test", "experimental"],
            "description": "An experimental test perspective",
            "deprecated": False,
            "priority": 20,
        }

        with open(experimental_dir / "test_experimental.json", "w") as f:
            json.dump(auto_module_perspective, f, indent=2)

        # Also add a perspective in the root directory
        root_perspective = {
            "name": "test_root",
            "display_name": "Test Root",
            "version": "1",
            "prompt": "Test root prompt",
            "schema_fields": [{"name": "caption", "type": "str", "description": "A test caption", "is_list": False}],
            "table_columns": [{"name": "Caption", "style": "blue"}],
            "context_template": "<TestRootCaption>\n{caption}\n</TestRootCaption>\n",
            "module": "default",
            "tags": ["test", "default"],
            "description": "A default module test perspective",
            "deprecated": False,
            "priority": 30,
        }

        with open(Path(temp_dir) / "test_root.json", "w") as f:
            json.dump(root_perspective, f, indent=2)

        yield temp_dir


@pytest.fixture
def settings():
    """Create test settings."""
    return PerspectiveSettings(
        modules={
            "core": ModuleConfig(enabled=True, display_name="Core Test"),
            "experimental": ModuleConfig(enabled=False, display_name="Experimental Test"),
            "default": ModuleConfig(enabled=True, display_name="Default Test"),
        },
        local_override=True,
    )


def test_load_perspectives_from_modules(temp_perspective_dir, settings):
    """Test loading perspectives from module directories."""
    # Test loading with all modules
    all_modules = get_all_modules([Path(temp_perspective_dir)], settings)

    # Check that we have the expected modules
    assert set(all_modules.keys()) == {"core", "experimental", "default"}

    # Check module display names from settings
    assert all_modules["core"].display_name == "Core Test"
    assert all_modules["experimental"].display_name == "Experimental Test"
    assert all_modules["default"].display_name == "Default Test"

    # Check module enabled status
    assert all_modules["core"].enabled is True
    assert all_modules["experimental"].enabled is False
    assert all_modules["default"].enabled is True

    # Check that each module has the correct perspectives
    assert "test_core" in all_modules["core"].perspectives
    assert "test_experimental" in all_modules["experimental"].perspectives
    assert "test_root" in all_modules["default"].perspectives

    # Test loading perspectives respecting module enabled status
    perspectives = load_all_perspectives([Path(temp_perspective_dir)], settings)

    # Experimental module is disabled, so its perspective shouldn't be included
    assert "test_core" in perspectives
    assert "test_experimental" not in perspectives
    assert "test_root" in perspectives


def test_perspective_module_toggle(temp_perspective_dir, settings):
    """Test toggling modules on and off."""
    all_modules = get_all_modules([Path(temp_perspective_dir)], settings)

    # Initially, experimental is disabled
    assert all_modules["experimental"].enabled is False

    # Toggle experimental on
    all_modules["experimental"].toggle(True)
    assert all_modules["experimental"].enabled is True

    # Create a new settings object with experimental enabled
    updated_settings = PerspectiveSettings(
        modules={
            "core": ModuleConfig(enabled=True, display_name="Core Test"),
            "experimental": ModuleConfig(enabled=True, display_name="Experimental Test"),
            "default": ModuleConfig(enabled=True, display_name="Default Test"),
        },
        local_override=True,
    )

    # Now load perspectives again, should include experimental
    perspectives = load_all_perspectives([Path(temp_perspective_dir)], updated_settings)

    assert "test_experimental" in perspectives


def test_auto_module_detection(temp_perspective_dir):
    """Test that perspectives without explicit module are assigned based on directory."""
    # Load without providing settings
    all_modules = get_all_modules([Path(temp_perspective_dir)])

    # The experimental perspective should be in the experimental module
    assert "test_experimental" in all_modules["experimental"].perspectives

    # The perspective itself should have the right module
    assert all_modules["experimental"].perspectives["test_experimental"].module_name == "experimental"


def test_perspective_metadata(temp_perspective_dir, settings):
    """Test that perspective metadata is correctly accessible."""
    perspectives = load_all_perspectives([Path(temp_perspective_dir)], settings)

    # Check that core perspective has the right metadata
    assert perspectives["test_core"].module_name == "core"
    assert perspectives["test_core"].tags == ["test", "core"]
    assert perspectives["test_core"].description == "A test perspective"
    assert perspectives["test_core"].is_deprecated is False
    assert perspectives["test_core"].priority == 10

    # Check root perspective
    assert perspectives["test_root"].module_name == "default"
    assert "default" in perspectives["test_root"].tags
    assert perspectives["test_root"].priority == 30
