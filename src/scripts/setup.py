import os
import tomllib
from typing import Mapping

import click
from dotenv import load_dotenv, set_key
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Confirm, Prompt
from termcolor import cprint

# New import
from .config_writer import write_toml_config

console: Console = Console()
dotenv_path = ".env"
provider_config_path = "./workspace/config/provider.config.toml"
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
    enable_openai: bool,
    enable_google: bool,
    enable_vllm: bool,
    enable_ollama: bool,
    enable_hugging_face: bool,
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
        vllm_url = os.environ.get("VLLM_BASE_URL", "http://localhost:11435")
        config["vllm"] = {
            "kind": "vllm",
            "environment": "local",
            "env_var": "VLLM_BASE_URL",
            "base_url": vllm_url,
            "models": ["vision-worker", "text-worker"],
            "default_model": "vision-worker",
        }

    if enable_ollama:
        console.print("[bold red]Ollama provider generation is not implemented yet.[/]")
    if enable_hugging_face:
        console.print("[bold red]Hugging Face provider generation is not implemented yet.[/]")
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


def check_existing_files() -> tuple[bool, bool]:
    """Check if configuration files exist and ask for overwrite permission."""
    overwrite_env = True
    overwrite_config = True

    if os.path.exists(dotenv_path):
        overwrite_env = Confirm.ask(
            "[bold blue].env file already exists. Do you want to overwrite it?[/]",
            default=False
        )

    if os.path.exists(provider_config_path):
        overwrite_config = Confirm.ask(
            "[bold blue]provider.config.toml file already exists. Do you want to overwrite it?[/]",
            default=False
        )

    return overwrite_env, overwrite_config


def get_provider_selections() -> tuple[bool, bool, bool, bool, bool]:
    """Collect user selections for which providers to enable."""
    console.print("\n[bold]Select the providers you want to enable:[/]")
    enable_hugging_face = Confirm.ask("[bold blue]Enable Hugging Face Hub provider?[/]", default=True)
    enable_openai = Confirm.ask("[bold blue]Enable OpenAI provider?[/]", default=True)
    enable_google = Confirm.ask("[bold blue]Enable Google provider?[/]", default=True)
    enable_vllm = Confirm.ask("[bold blue]Enable vLLM provider?[/]", default=False)
    enable_ollama = Confirm.ask("[bold blue]Enable Ollama provider?[/]", default=False)

    return enable_hugging_face, enable_openai, enable_google, enable_vllm, enable_ollama


def collect_env_variables(providers: tuple[bool, bool, bool, bool, bool]) -> Mapping[str, str | None]:
    """Collect environment variables based on enabled providers."""
    enable_hugging_face, enable_openai, enable_google, enable_vllm, enable_ollama = providers

    env_vars = {
        "HUGGING_FACE_HUB_TOKEN": check_env_var("HUGGING_FACE_HUB_TOKEN", enable_hugging_face),
        "OPENAI_API_KEY": check_env_var("OPENAI_API_KEY", enable_openai),
        "GOOGLE_API_KEY": check_env_var("GOOGLE_API_KEY", enable_google),
        "VLLM_BASE_URL": check_env_var("VLLM_BASE_URL", enable_vllm),
        "OLLAMA_BASE_URL": check_env_var("OLLAMA_BASE_URL", enable_ollama),
    }

    # Special handling for vLLM base URL
    if enable_vllm and not env_vars["VLLM_BASE_URL"]:
        cprint("VLLM_BASE_URL not set.", "yellow")
        env_vars["VLLM_BASE_URL"] = Prompt.ask(
            "[bold blue]Please enter the vLLM base URL[/]",
            default="http://localhost:12434"
        )
        os.environ["VLLM_BASE_URL"] = env_vars["VLLM_BASE_URL"]

    return env_vars


def save_env_configuration(env_vars: Mapping[str, str | None], providers: tuple[bool, bool, bool, bool, bool]) -> None:
    """Save provider choices and API keys to .env file."""
    enable_hugging_face, enable_openai, enable_google, enable_vllm, enable_ollama = providers

    provider_settings = {
        "ENABLE_HUGGING_FACE": enable_hugging_face,
        "ENABLE_OPENAI": enable_openai,
        "ENABLE_GOOGLE": enable_google,
        "ENABLE_VLLM": enable_vllm,
        "ENABLE_OLLAMA": enable_ollama,
    }

    # Save provider enable/disable settings
    for key, enabled in provider_settings.items():
        set_key(dotenv_path, key, "true" if enabled else "false")

    # Save API keys and URLs
    for key, value in env_vars.items():
        if value:
            set_key(dotenv_path, key, value)


@click.command()
def cli():
    """
    A CLI tool to bootstrap a new graphcap instance.
    Collects necessary environment variables and provider choices, and saves them to .env file and provider config.
    """
    console.print(Panel("[bold green]Welcome to Graphcap Bootstrapper![/]"))

    # Check existing files
    overwrite_env, overwrite_config = check_existing_files()

    # Get provider selections
    provider_selections = get_provider_selections()

    # Collect environment variables
    env_vars = collect_env_variables(provider_selections)

    # Save configurations if allowed
    if overwrite_env:
        save_env_configuration(env_vars, provider_selections)

    if overwrite_config:
        create_provider_config(*provider_selections)

    # Print success messages
    console.print("[bold green]All required environment variables are set![/]")
    console.print("[bold green]Provider choices and API keys have been saved to .env![/]")
    console.print("[bold green]Provider configuration has been saved to workspace/config/provider.config.toml![/]")
    console.print("[bold magenta]Graphcap instance is ready to be launched![/]")

def main():
    """Entry point for the script"""
    cli()

if __name__ == "__main__":
    main()
