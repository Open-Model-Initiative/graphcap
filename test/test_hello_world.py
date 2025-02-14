# SPDX-License-Identifier: Apache-2.0
# test_hello_world.py
"""
A simple hello world style test to verify that pytest is working properly.
"""


def test_hello_world():
    """
    Verifies that the hello world string is as expected.
    """
    expected = "Hello, world!"
    assert expected == "Hello, world!"
