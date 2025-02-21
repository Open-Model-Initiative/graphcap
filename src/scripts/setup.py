import os
import tomllib

import click

# New import
from src.scripts.config_writer import write_toml_config
from dotenv import load_dotenv, set_key
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Confirm, Prompt
from termcolor import cprint

console: Console = Console()
dotenv_path = ".env"
provider_config_path = "./config/provider.config.toml"
load_dotenv(dotenv_path)


def check_env_var(var_name: str, enabled: bool = True) -> str | None:
    """
    Checks if an environment variable is set. If not, prompts the user to set it,
    but only if the provider is enabled.
    """
    if not enabled:
        return None

    value = os.environ.get(var_name)
    if not value:
        cprint(f"Environment variable '{var_name}' not set.", "yellow")
        value = Prompt.ask(f"[bold blue]Please enter the value for {var_name}[/]")
        os.environ[var_name] = value  # Set the environment variable
    return value


def create_provider_config(
    enable_hugging_face: bool,
    enable_openai: bool,
    enable_google: bool,
    enable_vllm: bool,
    enable_ollama: bool,
) -> None:
    """
    Creates the provider.config.toml file based on the selected providers.
    """
    config = {}

    if enable_openai:
        config["openai"] = {
            "kind": "openai",
            "environment": "cloud",
            "env_var": "OPENAI_API_KEY",
            "base_url": "https://api.openai.com/v1",
            "models": ["gpt-4o-mini", "gpt-4o"],
            "default_model": "gpt-4o-mini",
        }

    if enable_google:
        config["gemini"] = {
            "kind": "gemini",
            "environment": "cloud",
            "env_var": "GOOGLE_API_KEY",
            "base_url": "https://generativelanguage.googleapis.com/v1beta",
            "models": ["gemini-2.0-flash-exp"],
            "default_model": "gemini-2.0-flash-exp",
            "rate_limits": {"requests_per_minute": 10, "tokens_per_minute": 4000000},
        }

    if enable_vllm:
        config["vllm"] = {
            "kind": "vllm",
            "environment": "local",
            "env_var": "NONE",
            "base_url": "http://192.168.1.75:11435",
            "models": ["vision-worker", "text-worker"],
            "default_model": "vision-worker",
        }

    # Read existing config if it exists
    existing_config = {}
    if os.path.exists(provider_config_path):
        try:
            with open(provider_config_path, "rb") as f:
                existing_config = tomllib.load(f)
        except Exception as e:
            console.print(f"[bold red]Error reading existing provider config: {e}[/]")

    # Merge existing config with new config
    merged_config = existing_config.copy()
    merged_config.update(config)

    # Write the config to the file
    write_toml_config(merged_config, provider_config_path)


@click.command()
def cli():
    """
    A CLI tool to bootstrap a new graphcap instance.
    Collects necessary environment variables and provider choices, and saves them to a .env file and provider config.
    """
    console.print(Panel("[bold green]Welcome to Graphcap Bootstrapper![/]"))

    # Check if .env or provider.config.toml exist
    if os.path.exists(dotenv_path):
        overwrite_env = Confirm.ask(
            "[bold blue].env file already exists. Do you want to overwrite it?[/]", default=False
        )
    else:
        overwrite_env = True

    if os.path.exists(provider_config_path):
        overwrite_config = Confirm.ask(
            "[bold blue]provider.config.toml file already exists. Do you want to overwrite it?[/]", default=False
        )
    else:
        overwrite_config = True

    # Provider selection
    console.print("\n[bold]Select the providers you want to enable:[/]")
    enable_hugging_face = Confirm.ask("[bold blue]Enable Hugging Face Hub provider?[/]", default=True)
    enable_openai = Confirm.ask("[bold blue]Enable OpenAI provider?[/]", default=True)
    enable_google = Confirm.ask("[bold blue]Enable Google provider?[/]", default=True)
    enable_vllm = Confirm.ask("[bold blue]Enable vLLM provider?[/]", default=False)
    enable_ollama = Confirm.ask("[bold blue]Enable Ollama provider?[/]", default=False)

    # Check and collect environment variables based on provider selection
    hugging_face_token = check_env_var("HUGGING_FACE_HUB_TOKEN", enable_hugging_face)
    openai_api_key = check_env_var("OPENAI_API_KEY", enable_openai)
    google_api_key = check_env_var("GOOGLE_API_KEY", enable_google)
    vllm_base_url = check_env_var("VLLM_BASE_URL", enable_vllm)
    ollama_base_url = check_env_var("OLLAMA_BASE_URL", enable_ollama)

    # Store provider choices and API keys in .env file
    if overwrite_env:
        set_key(dotenv_path, "ENABLE_HUGGING_FACE", "true" if enable_hugging_face else "false")
        set_key(dotenv_path, "ENABLE_OPENAI", "true" if enable_openai else "false")
        set_key(dotenv_path, "ENABLE_GOOGLE", "true" if enable_google else "false")
        set_key(dotenv_path, "ENABLE_VLLM", "true" if enable_vllm else "false")
        set_key(dotenv_path, "ENABLE_OLLAMA", "true" if enable_ollama else "false")

        if hugging_face_token:
            set_key(dotenv_path, "HUGGING_FACE_HUB_TOKEN", hugging_face_token)
        if openai_api_key:
            set_key(dotenv_path, "OPENAI_API_KEY", openai_api_key)
        if google_api_key:
            set_key(dotenv_path, "GOOGLE_API_KEY", google_api_key)
        if vllm_base_url:
            set_key(dotenv_path, "VLLM_BASE_URL", vllm_base_url)
        if ollama_base_url:
            set_key(dotenv_path, "OLLAMA_BASE_URL", ollama_base_url)

    # Create provider config file
    if overwrite_config:
        create_provider_config(enable_hugging_face, enable_openai, enable_google, enable_vllm, enable_ollama)

    console.print("[bold green]All required environment variables are set![/]")
    console.print("[bold green]Provider choices and API keys have been saved to .env![/]")
    console.print("[bold green]Provider configuration has been saved to config/provider.config.toml![/]")
    console.print("[bold magenta]Graphcap instance is ready to be launched![/]")


if __name__ == "__main__":
    cli()
