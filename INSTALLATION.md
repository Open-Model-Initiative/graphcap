# Installation Guide

This guide summarises the steps required to run **graphcap** locally. It mirrors the instructions found in the Sphinx documentation under `doc/getting_started`.

## Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- [Task](https://taskfile.dev/) command runner
- [Python 3.11+](https://www.python.org/) with the [uv](https://docs.astral.sh/uv/) package manager (for running the inference bridge outside of containers)

## Setup

1. Clone the repository and enter the project directory:
   ```bash
   git clone https://github.com/Open-Model-Initiative/graphcap.git
   cd graphcap
   ```
2. Run the initial setup task which copies template configuration and builds base Docker images:
   ```bash
   task setup
   ```
3. Review the generated `workspace/config/.env` file and update sensitive values such as `POSTGRES_USER`, `POSTGRES_PASSWORD` and `ENCRYPTION_KEY` before starting the services.

## Starting the services

Start all containers defined in `docker-compose.yml`:

```bash
task start
```

This command launches the UI, data service, inference bridge, media server and supporting infrastructure. When the containers are healthy the web interface will be available at [http://localhost:32200](http://localhost:32200).

To stop all services run:

```bash
task stop
```

## Updating

If you pull new changes from the repository you may rebuild the images by running `task dev` which starts Docker Compose in watch mode and rebuilds when files change.

## Additional documentation

More detailed configuration and architecture information is available in the [documentation](doc/index.rst). For questions or issues please see the [GitHub issue tracker](https://github.com/Open-Model-Initiative/graphcap/issues).
