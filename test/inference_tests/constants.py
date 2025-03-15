from pydantic import BaseModel

PROVIDER_CONFIG_PATH = "../../workspace/config/provider.config.toml"
IMAGE_PATH = "../artifacts/provider/test_image.png"
OLLAMA_DEFAULT_MODEL = "gemma3:12b-it-q8_0"
ENV_VAR = "NONE"
BASE_URL = "http://localhost:11434"

EXAMPLE_CONFIG="""
[ollama]
kind = "ollama"
environment = "local"
env_var = "NONE"
base_url = "http://localhost:11434"
default_model = "gemma3:12b-it-q8_0"
"""

class StructuredCaption(BaseModel):
    scratchpad: str
    caption: str