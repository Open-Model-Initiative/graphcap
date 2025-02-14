import pytest


@pytest.fixture(scope="session", autouse=True)
def hello_world():
    pass
