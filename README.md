# graphcap

[![Python version](https://img.shields.io/badge/python-3.11-blue)](https://www.python.org)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/Open-Model-Initiative/graphcap )](https://github.com/Open-Model-Initiative/graphcap/commits/main)
[![GitHub issues](https://img.shields.io/github/issues/Open-Model-Initiative/graphcap )](https://github.com/Open-Model-Initiative/graphcap/issues)
[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/10020/badge)](https://www.bestpractices.dev/en/projects/10020)

**Keywords:** image captioning, scene graph, DAG, FastAPI, multimodal, machine learning, open source, artificial intelligence, datasets, open model initiative, OMI

![Image](./doc/static/logo.png)

`graphcap` is an open source system for generating image captions and scene graphs using multiple analytical perspectives. The project combines a React based user interface, a TypeScript data service and a Python inference bridge to produce structured captions that conform to declarative JSON schemas.

## Features

- **Multi-perspective captioning** – captions are produced using declarative "perspectives" that describe prompts and output schemas.
- **Modular architecture** – separate microservices for the UI, data service, inference bridge and media processing, all coordinated through a local workspace volume.
- **Provider abstraction** – easily integrate OpenAI, Ollama, Gemini or other vision-language providers through the provider factory API.
- **Extensible dataset management** – upload, edit and organise images directly from the web interface.
- **Sphinx documentation** – full developer and user documentation is located in the [`doc/`](doc/index.rst) directory.

## Quick start

The easiest way to run graphcap is with Docker Compose and the provided Taskfile commands. Ensure that Docker and the [Task](https://taskfile.dev/) runner are installed, then execute:

```bash
# prepare configuration and build base images
task setup

# start all services in the background
task start
```

Once the services are running visit [http://localhost:32200](http://localhost:32200) in your browser. The default workspace is stored inside the `workspace/` directory of this repository. For more details on configuration and available services see the [installation guide](INSTALLATION.md).

## Repository layout

```
apps/       # frontend and service applications
packages/   # shared libraries (TypeScript and Python)
doc/        # Sphinx documentation
workspace/  # local configuration and persistent volumes
```

Each package or application contains its own README with development instructions.

## License

This project is licensed under the Apache 2.0 License. See the [LICENSE](LICENSE) file for details.
