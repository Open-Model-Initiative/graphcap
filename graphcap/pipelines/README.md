# Repo Structure

```bash
pipelinnes
    _scripts/
    pipelines/
    ├── common/
    │   ├── resources.py         # Shared resources (e.g. Postgres, file system IO managers)
    │   ├── workspace.py         # Workspace / mounted volume io management
    │   ├── utils.py             # Common helper functions (e.g. Pandas transforms)
    │   └── __init__.py
    ├── caption_generation/      # Feature: Caption Generation
    │   ├── perspectives.py  # Assets/ops for basic text captioning (image selection, provider choice, progress logging)
    │   └── __init__.py
    ├── huggingface/            # Feature: Huggingface
    │   ├── dataset_export.py    # Assets/ops for exporting datasets (JSONL export, metadata, verification)
    │   ├── dataset_import.py    # Assets/ops for importing datasets (JSONL import, metadata, verification)
    │   └── __init__.py
        ├── client/                  # Feature: Client
        │   ├── __init__.py
    ├── definitions.py           # Merges all assets, ops, jobs, sensors and resources from each feature
    ├── __init__.py
```