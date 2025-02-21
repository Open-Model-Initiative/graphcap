import asyncio
import json
import os
import shutil
from datetime import datetime
from pathlib import Path

import pytest
from dotenv import load_dotenv
from httpx import AsyncClient

# Load environment variables from .env
load_dotenv("./workspace/.env")


def log_test_response(test_name: str, response: dict, log_file: str = "test_logs.jsonl"):
    """Log test responses to a JSON Lines file"""
    log_entry = {"timestamp": datetime.now().isoformat(), "test_name": test_name, "response": response}

    # Ensure the directory exists
    log_path = Path(log_file)
    log_path.parent.mkdir(parents=True, exist_ok=True)

    with open(log_file, "a") as f:
        json.dump(log_entry, f)
        f.write("\n")


@pytest.fixture(scope="session")
def test_logger():
    """Fixture to provide the logging function to tests"""
    return log_test_response


# Clean up log file at the start of test session
@pytest.fixture(scope="session", autouse=True)
def clean_logs():
    """Clean up log file at the start of test session"""
    if os.path.exists("test_logs.jsonl"):
        os.remove("test_logs.jsonl")


# Event loop setup with proper cleanup
@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test session."""
    policy = asyncio.get_event_loop_policy()
    loop = policy.new_event_loop()
    asyncio.set_event_loop(loop)
    yield loop
    # Clean up the loop
    if loop.is_running():
        loop.stop()
    pending = asyncio.all_tasks(loop)
    if pending:
        loop.run_until_complete(asyncio.gather(*pending, return_exceptions=True))
    loop.close()


@pytest.fixture
async def async_client():
    """Create a new AsyncClient for each test with proper cleanup."""
    client = AsyncClient()
    yield client
    await client.aclose()


# Set default event loop policy for all tests
def pytest_configure(config):
    """Configure pytest with the correct event loop policy."""
    policy = asyncio.DefaultEventLoopPolicy()
    asyncio.set_event_loop_policy(policy)


@pytest.fixture(scope="session")
def test_data_dir() -> Path:
    """Fixture providing path to test data directory"""
    return Path(__file__).parent / "artifacts/test_dataset"


@pytest.fixture(scope="session")
def test_export_dir(tmp_path_factory) -> Path:
    """Fixture providing a temporary directory for test exports"""
    export_dir = tmp_path_factory.mktemp("exports")
    yield export_dir
    # Cleanup after tests
    shutil.rmtree(export_dir)


@pytest.fixture(scope="session")
def test_captions(test_data_dir) -> list:
    """Fixture providing test caption data"""
    captions_file = test_data_dir / "captions.jsonl"
    captions = []
    with captions_file.open() as f:
        for line in f:
            captions.append(json.loads(line))
    return captions


@pytest.fixture(scope="session")
def test_dataset_config():
    """Fixture providing test dataset configuration"""
    return {
        "name": "test-dataset",
        "description": "A test dataset for unit testing",
        "tags": ["test", "unit-testing"],
        "include_images": True,
    }


@pytest.mark.integration
@pytest.fixture(scope="session", autouse=True)
def load_env():
    """Load environment variables from root .env file."""
    env_file = Path(__file__).parents[2] / ".env"
    if not env_file.exists():
        print(f"Environment file not found: {env_file}")
    load_dotenv(env_file)


@pytest.fixture(scope="session")
def artifacts_dir() -> Path:
    """Fixture providing path to test artifacts directory"""
    return Path(__file__).parent / "artifacts"


@pytest.fixture(scope="session")
def provider_artifacts_dir(artifacts_dir) -> Path:
    """Fixture providing path to provider test artifacts directory"""
    return artifacts_dir / "provider"
