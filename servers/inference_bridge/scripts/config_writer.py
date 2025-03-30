# SPDX-License-Identifier: Apache-2.0
from typing import Dict

import toml


def write_toml_config(config: Dict, file_path: str) -> None:
    """
    Writes a TOML configuration to the specified file path.

    Args:
        config (Dict): The configuration data to write.
        file_path (str): The path to the TOML file.
    """
    try:
        with open(file_path, "w") as toml_file:
            toml.dump(config, toml_file)
    except Exception as e:
        print(f"Error writing TOML file: {e}")
