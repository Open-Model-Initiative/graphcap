=================================
graphcap Architecture Overview
=================================

Audience and Architectural Principles
=====================================

This document targets system architects and software engineers maintaining or extending the graphcap system.

graphcap is designed explicitly for small to medium-sized on-premises or single-user deployments, adopting a local-first architecture. The system prioritizes:

- **Offline-first Operation**: Capable of functioning with intermittent or no internet connectivity.
- **Local Data Sovereignty**: Data persists locally and synchronizes opportunistically.
- **Modular and Extensible Components**: Clear service boundaries and stateless design patterns for maintainability.


System Components
=================

graphcap consists of specialized services working together to provide image captioning capabilities:

- **React Client**: Web-based user interface and system orchestrator.
- **Data Service**: Manages database operations and data persistence.
- **Inference Bridge**: Performs AI-based image captioning.
- **Media Server**: Manages image storage, retrieval, and processing.

.. figure::

   .. code-block:: text

       ┌─────────────────────────────────────┐
       │           React Client              │
       │           (Orchestrator)            │
       └───────┬─────────┬─────────┬─────────┘
               │         │         │
               │         │         │
               ▼         ▼         ▼
       ┌───────────┐ ┌───────────┐ ┌─────────────┐
       │  Data     │ │ Inference │ │ Media Server│
       │  Service  │ │ Bridge    │ │             │
       └─────┬─────┘ └─────┬─────┘ └──────┬──────┘
             │             │              │
             ▼             │              │
       ┌──────────┐        │              │
       │PostgreSQL│        │              │
       └──────────┘        │              │
                           │              │
                           ▼              ▼
                    ┌─────────────────────────┐
                    │  Workspace Volume       │
                    │  (Shared Storage)       │
                    └─────────────────────────┘


Communication Flows
===================

REST API Communication
----------------------

The React Client orchestrates all services through direct REST API calls:

- **Client ↔ Data Service**: Database operations, caption storage, retrieval.
- **Client ↔ Inference Bridge**: Caption generation requests and responses.
- **Client ↔ Media Server**: Image upload, retrieval, processing, file system operations.

Independent Service Operation
----------------------------

Each service operates independently without direct communication with other services:

- **Data Service**: Persists caption data, handles database operations.
- **Inference Bridge**: Processes image captioning requests when invoked.
- **Media Server**: Manages file operations and image processing.

All services directly access the shared workspace volume for file operations.

WebSocket Communication
-----------------------

Real-time updates may be implemented through direct WebSocket connections:

- **Data Service → Client**: Database updates and events.
- **Inference Bridge → Client**: Caption processing status.


Component Deep Dives
====================

Data Service
------------

Manages data persistence and database operations:

- Single source of truth via PostgreSQL.
- Stores caption data, metadata, and relationships.
- Provides REST APIs for data retrieval and modification.
- Only service with direct PostgreSQL access.

Inference Bridge
----------------

Stateless AI caption processing:

- Receives caption requests directly from the client.
- Communicates with AI providers (Gemini, Ollama, OpenAI).
- Returns results directly to the client.
- Remains completely stateless.
- Reads images from the shared workspace volume.

Media Server
------------

Responsible for media asset management:

- Provides file upload, retrieval, and processing APIs.
- Manages workspace directory structure.
- Generates thumbnails, extracts metadata.
- Handles all file system operations on the workspace.

React Client
------------

Interactive front-end interface and system orchestrator:

- Orchestrates workflow between services.
- Directly communicates with all services.
- Manages UI state and user experience.
- Coordinates business logic and process flow.
- Utilizes TanStack Query for efficient state management.



