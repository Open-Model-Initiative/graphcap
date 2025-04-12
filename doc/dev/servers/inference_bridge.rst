.. _inference_bridge:

=====================================
graphcap Inference Bridge Architecture
=====================================

Overview
========

The graphcap Inference Bridge is a sophisticated system designed to generate captions for images using different "perspectives."
 A perspective represents a specific way of analyzing and describing an image, tailored for particular use cases. 
 The bridge is built on FastAPI and designed to be extensible, supporting various AI model providers and caption perspectives.

**The Inference Bridge is completely stateless** - it does not maintain information about jobs, caption configurations, 
or persist data to databases. It receives requests, processes them, and returns results without preserving state between requests. It serves as a bridge between the client and AI providers, transforming image caption requests into AI model calls and returning structured results.

Key Components
=============

Perspective System
-----------------

Perspectives are the core feature of graphcap. Each perspective:

* Has a specific schema defining the structure of captions it generates
* Contains a prompt template used to instruct the AI model
* Can be grouped into modules for organization
* Is configured via JSON files or programmatically

The perspective system allows users to generate various descriptions of the same image,
 each focusing on different aspects.

Provider Management
------------------

The provider system abstracts away different AI model providers through:

* A unified interface for vision capabilities
* Support for structured output generation
* Automatic API key management and rate limiting
* Provider-specific formatting and processing

Currently, the system supports providers like Vllm, Ollama, Gemini, and OpenAI with an extensible design to add more.

Processing Pipeline
------------------

The processing flow works as follows:

1. The bridge receives a REST request with an image and specified perspective
2. It prepares the image (download/convert as needed)
3. The selected perspective's prompt is sent with the image to the configured AI provider
4. Response is parsed according to the perspective's schema
5. Structured data is returned directly to the client via the REST API response

Architecture Diagram
===================

::

    ┌────────────────┐                     ┌─────────────────────────────┐
    │                │      REST API       │                             │
    │  React Client  │────────────────────▶│  Inference Bridge           │
    │ (Orchestrator) │◀────────────────────│  (Stateless)                │
    │                │                     │                             │
    └───────┬────────┘                     └─────────────┬───────────────┘
            │                                            │
            │                                            │
            │                                            ▼
            │                                  ┌─────────────────────┐
            │                                  │                     │
            │                                  │   AI Providers      │
            ▼                                  │                     │
    ┌───────────────┐                          └─────────────────────┘
    │  Data Service │
    │               │
    └───────┬───────┘
            │
            ▼
    ┌──────────────┐
    │  PostgreSQL  │
    │  Database    │
    └──────────────┘

    ┌────────────────────────────────────────────┐
    │             Workspace Volume               │
    │ (Accessed by all services independently)   │
    └────────────────────────────────────────────┘

Internal Bridge Components::

    ┌─────────────────────────────────────┐
    │         HTTP API (FastAPI)          │
    └───────────────┬─────────────────────┘
                    │
                    ▼
    ┌─────────────────────────────────────┐
    │          Perspective Router         │
    └───────────────┬─────────────────────┘
                    │
                    ▼
    ┌─────────────────────────────────────┐
    │       Perspective Service           │
    ├─────────────────┬───────────────────┤
    │  ┌─────────────┐│ ┌───────────────┐ │
    │  │ Perspective ││ │ Image         │ │
    │  │ Management  ││ │ Processing    │ │
    │  └─────────────┘│ └───────────────┘ │
    └─────────────────┬───────────────────┘
                      │
                      ▼
    ┌─────────────────────────────────────┐
    │       Provider Management           │
    ├─────────────────────────────────────┤
    │  ┌─────────────┐  ┌───────────────┐ │
    │  │  Provider   │  │   Provider    │ │
    │  │  Factory    │  │   Clients     │ │
    │  └─────────────┘  └───────────────┘ │
    └─────────────────┬───────────────────┘
                      │
                      ▼
    ┌─────────────────────────────────────┐
    │          AI Model Providers         │
    ├─────────────────────────────────────┤
    │  ┌─────────────┐  ┌───────────────┐ │
    │  │   Gemini    │  │     Other     │ │
    │  │             │  │   Providers   │ │
    │  └─────────────┘  └───────────────┘ │
    └─────────────────────────────────────┘

Stateless Design
======================================

REST API Design
-------------------------

The Inference Bridge maintains its stateless nature through a well-defined REST API:

1. **Request-Response Pattern**: Each caption request is a self-contained HTTP transaction.

2. **Complete Request Packages**: Each request contains all necessary information to process the caption:
   * Image data or references (file paths, URLs, or base64-encoded data)
   * Perspective specification
   * Provider selection
   * Processing parameters

3. **Independent Processing**: Each request is processed independently without knowledge of previous requests.

4. **No Session State**: The service doesn't maintain session state between requests.

Maintaining Statelessness
------------------------

The Inference Bridge achieves complete statelessness through:

1. **No Job History**: The bridge doesn't track previous requests or maintain any job state.

2. **No Configuration Storage**: All perspective and provider configurations are either:
   * Loaded at startup from read-only configuration files
   * Provided in the request payload

3. **No User Sessions**: Each request is treated independently, with all authentication and context provided per request.

4. **Ephemeral Storage**: Any temporary files created during processing are deleted once the response is sent.

5. **No Cross-Request Dependencies**: Each request is processed independently without relying on data from previous requests.

Division of Responsibilities
---------------------------

The Inference Bridge maintains a clear separation of responsibilities:

1. **React Client**:
   * Acts as the system orchestrator
   * Sends caption requests to the Inference Bridge
   * Receives and processes caption results
   * Coordinates the overall workflow
   * Manages user interface and interactions

2. **Data Service**:
   * Stores caption results in PostgreSQL
   * Maintains relationships between images, captions, and perspectives
   * Provides data access APIs to the React Client
   * Manages job tracking and status in database tables
   * Serves as the system's single source of truth for caption data

3. **Inference Bridge**:
   * Processes individual caption requests
   * Handles only single-image caption generation
   * Returns results directly to the client
   * Maintains no state between requests
   * Accesses the workspace volume for image files when needed

This separation of concerns ensures that the Inference Bridge remains completely stateless while the Data Service handles persistence and the React Client handles orchestration.

Client-Bridge Interaction Flow
-----------------------------

The typical flow for image processing is:

1. **Client Request**: The React Client sends a caption request directly to the Inference Bridge.

2. **Image Processing**: The bridge processes the image with the specified perspective and AI provider.

3. **Result Generation**: Structured caption data is generated by the AI provider.

4. **Direct Response**: Results are returned directly to the React Client in the API response.

5. **Data Persistence**: The React Client may optionally send the results to the Data Service for storage.

6. **Job Tracking**: For batch operations, the React Client coordinates with the Data Service to track progress.

Scaling and Load Balancing
-------------------------

This architecture facilitates horizontal scaling:

1. **Multiple Inference Bridge Instances**: Multiple stateless bridges can be deployed behind a load balancer.

2. **Independent Scaling**: Inference bridges can be scaled independently of other system components.

3. **Zero Downtime Deployment**: Bridge instances can be added or removed without system disruption.

4. **Load Balancer Distribution**: A standard HTTP load balancer can distribute requests among instances.

Implementation Details
=====================

Perspective Definition
---------------------

Perspectives are defined with:

1. A schema specifying the structure of the output (fields and types)
2. A prompt template that guides the AI model
3. Configuration for display and output formatting

Example perspective fields could include:

* General description
* Key elements
* Aesthetic qualities
* Technical details
* Contextual information

Perspectives are organized into modules for better management, and each module can be enabled or disabled as needed.

Provider Integration
-------------------

The system uses an abstraction layer through the ``BaseClient`` class that:

1. Provides a consistent interface over different AI providers
2. Handles authentication and API communication
3. Formats prompts and images according to provider requirements
4. Processes and validates responses

The provider management system supports dynamic loading of provider configurations and handles rate limiting and error recovery.

Image Processing
---------------

The bridge includes utilities for:

* Accessing images from the workspace volume
* Downloading images from URLs
* Processing base64-encoded images
* Creating temporary files for processing
* Converting between image formats as needed

These utilities ensure that images can be processed regardless of how they're provided in the request.

Structured Output
----------------

A key feature of the system is the ability to generate structured output via:

1. Dynamic creation of structured outputs based on perspective schemas
2. Parsing and validation of AI model responses
3. Conversion to standardized JSON format
4. Error handling for malformed responses

API Structure
============

REST API
-------

The Inference Bridge exposes several key API endpoints:

* ``/perspectives/list``: Get available perspectives
* ``/perspectives/{name}/caption``: Generate a caption using a specific perspective
* ``/perspectives/analyze``: Analyze an image with multiple perspectives
* ``/providers/list``: Get available AI providers
* ``/providers/{name}/models``: Get models available for a specific provider

These endpoints form an API for image captioning and analysis that the React Client uses directly.

WebSocket Support
----------------

The bridge also supports WebSocket connections for:

* Real-time updates during processing
* Streaming responses from AI models that support it

Data Flow
=========

1. **Request Reception**: The bridge receives an HTTP request containing a complete caption payload.

2. **Image Acquisition**: The image is retrieved based on the information in the request (workspace path, URL, or base64 data).

3. **Perspective Loading**: The specified perspective is loaded from the configuration files or the request payload.

4. **Provider Selection**: The appropriate AI provider is selected based on the request.

5. **Caption Generation**: The perspective prompt and image are sent to the AI provider.

6. **Response Processing**: The response is parsed according to the perspective schema.

7. **Result Delivery**: The structured caption data is returned in the HTTP response.

8. **Resource Cleanup**: All temporary resources are released after processing.

Deployment
=========

The Inference Bridge is containerized using Docker, with the following key components:

* Base image: ``python:3.12-slim``
* Package management: ``uv`` tool
* Core dependencies: ``fastapi``, ``uvicorn``, ``pydantic``
* Model-specific dependencies configured per provider

Multiple instances can be deployed behind a load balancer for horizontal scaling.

Security Considerations
======================

* **Input Validation**: All input payloads are validated before processing
* **No Persistent Secrets**: API keys and credentials are provided at runtime and not stored
* **Isolated Processing**: Each request is processed in isolation
* **Path Validation**: Workspace file paths are validated to prevent directory traversal

Conclusion
=========

The graphcap Inference Bridge provides a powerful, flexible, and completely stateless system for generating structured captions from images using various AI providers. By maintaining a stateless REST API design, it achieves high scalability and resilience while eliminating the need for state management or database interactions. The clear separation of responsibilities between the client (orchestration), the Inference Bridge (stateless caption generation), and the Data Service (persistence) creates a robust architecture that allows for easy horizontal scaling and seamless deployment in various environments.

