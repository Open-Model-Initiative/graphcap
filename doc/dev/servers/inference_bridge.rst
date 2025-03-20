=====================================
graphcap Inference Bridge Architecture
=====================================

Overview
========

The graphcap Inference Bridge is a sophisticated system designed to generate captions for images using different "perspectives."
 A perspective represents a specific way of analyzing and describing an image, tailored for particular use cases. 
 The bridge is built on FastAPI and designed to be extensible, supporting various AI model providers and caption perspectives.

**The Inference Bridge is completely stateless** - it does not maintain information about jobs, capture configurations, 
or persist data to databases. It receives requests, processes them, and returns results without preserving state between requests. It serves as a bridge between the message broker and AI providers, transforming requests into AI model calls and returning structured results.

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

1. The bridge receives a message with an image and specified perspective
2. It prepares the image (download/convert as needed)
3. The selected perspective's prompt is sent with the image to the configured AI provider
4. Response is parsed according to the perspective's schema
5. Structured data is returned via the message broker

Architecture Diagram
===================

::

    ┌────────────────┐     ┌─────────────────┐     ┌─────────────────────────────┐
    │                │     │                 │     │                             │
    │  Client        │────▶│  Message Broker │────▶│  Inference Bridge (Stateless)│
    │  Applications  │     │  (RabbitMQ)     │◀────│                             │
    │                │     │                 │     │                             │
    └───────┬────────┘     └────────┬────────┘     └─────────────────────────────┘
            │                       ▲                            │
            │                       │                            │
            │                       │                            ▼
            │                       │                  ┌─────────────────────┐
            │                       │                  │                     │
            │                       └──────────────────│   AI Providers      │
            │                                          │                     │
            │                                          └─────────────────────┘
            │
            │
    ┌───────▼────────┐
    │                │
    │  Data Service  │
    │  (Job Manager) │
    │                │
    └────────────────┘

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

Stateless Design and Broker Integration
======================================

Message Broker Integration
-------------------------

The Inference Bridge integrates with a message broker (RabbitMQ) to maintain its stateless nature:

1. **Message-Based Communication**: All caption requests come through the message broker, which handles message routing.

2. **Complete Request Packages**: Each message contains all necessary information to process a request:
   * Image data or references
   * Perspective configuration
   * Provider selection
   * Processing parameters

3. **Response Routing**: After processing, results are published back to the broker, which routes them to the appropriate service.

4. **No Persistent Connections**: The bridge doesn't maintain persistent connections to clients, enhancing scalability.

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

Batch Processing and Division of Responsibilities
------------------------------------------------

The Inference Bridge does **not** handle batch processing directly. The responsibility for batch job management is divided as follows:

1. **Data Service**:
   * **Job Management Role**:
     * Maintains job queues and state
     * Stores job configurations and progress
     * Breaks batch jobs into individual caption requests
     * Publishes individual requests to the message broker
     * Tracks completion status across multiple images
     * Handles retries and failures
   
   * **Data Storage Role**:
     * Persists all caption results to PostgreSQL database
     * Maintains relationships between images, captions, and perspectives
     * Provides data access APIs to clients
     * Manages data retention policies
     * Serves as the system's single source of truth for caption data

2. **Message Broker**:
   * Routes individual caption requests to available Inference Bridge instances
   * Handles message distribution and delivery guarantees
   * Returns results to the Data Service

3. **Inference Bridge**:
   * Processes individual caption requests without knowledge of batch context
   * Handles only single-image caption generation
   * Returns results for each individual request
   * Maintains no state between requests

This separation of concerns ensures that the Inference Bridge remains completely stateless while the Data Service handles both orchestration of jobs and persistence of the resulting data.

Client-Broker-Bridge Flow
------------------------

The typical flow for image processing is:

1. **Client Request**: Client applications submit caption requests to the Data Service, which may manage batches.

2. **Request Decomposition**: For batch requests, the Data Service breaks them into individual caption requests.

3. **Message Publishing**: The Data Service publishes individual requests to the message broker.

4. **Message Consumption**: The Inference Bridge consumes messages from the broker when ready to process new requests.

5. **Complete Processing**: The bridge processes each request with all required information contained in the message.

6. **Result Publication**: The structured caption data is published back to the broker.

7. **Result Aggregation**: For batch requests, the Data Service aggregates individual results and updates the job status.

8. **Client Notification**: The Data Service notifies the client when results are available.

Scaling and Load Balancing
-------------------------

This architecture facilitates horizontal scaling:

1. **Multiple Inference Bridge Instances**: Multiple stateless bridges can consume from the same queues.

2. **Natural Load Balancing**: The broker distributes messages among available bridge instances.

3. **Independent Scaling**: Inference bridges can be scaled independently of other system components.

4. **Zero Downtime Deployment**: Bridge instances can be added or removed without system disruption.

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

Direct REST API
--------------

While the broker pattern is the primary method of interaction, the bridge also exposes several key API endpoints for direct communication:

* ``/perspectives/list``: Get available perspectives
* ``/perspectives/{name}/caption``: Generate a caption using a specific perspective
* ``/perspectives/analyze``: Analyze an image with multiple perspectives
* ``/providers/list``: Get available AI providers
* ``/providers/{name}/models``: Get models available for a specific provider

These endpoints form an API for image captioning and analysis, useful for testing and direct integration.

WebSocket Support
----------------

The bridge also supports WebSocket connections for:

* Real-time updates during processing
* Streaming responses from AI models that support it

Message Queue Endpoints
---------------------

In addition to the REST API, the bridge listens on configured message queues:

* ``caption.request``: For single image caption generation requests
* ``analyze.request``: For single image multi-perspective analysis requests

The bridge deliberately does not expose or process batch-specific endpoints. All batch management is handled by the Data Service, with the bridge processing only individual image requests.

Data Flow
=========

1. **Message Reception**: The bridge consumes a message from the broker containing a complete request payload for a single image.

2. **Image Acquisition**: The image is retrieved based on the information in the message (URL, base64 data, or file path).

3. **Perspective Loading**: The specified perspective is loaded from the configuration files or the request payload.

4. **Provider Selection**: The appropriate AI provider is selected based on the request.

5. **Caption Generation**: The perspective prompt and image are sent to the AI provider.

6. **Response Processing**: The response is parsed according to the perspective schema.

7. **Result Publication**: The structured caption data is published back to the broker.

8. **Resource Cleanup**: All temporary resources are released after processing.

Deployment
=========

The Inference Bridge is containerized using Docker, with the following key components:

* Base image: ``python:3.12-slim``
* Package management: ``uv`` tool
* Core dependencies: ``fastapi``, ``uvicorn``, ``pydantic``, ``aio-pika`` (for RabbitMQ)
* Model-specific dependencies configured per provider

Multiple instances can be deployed behind a load balancer or connected to the same message broker for horizontal scaling.

Security Considerations
======================

* **Message Authentication**: Messages from the broker are verified for authenticity
* **Input Validation**: All input payloads are validated before processing
* **No Persistent Secrets**: API keys and credentials are provided at runtime and not stored
* **Isolated Processing**: Each request is processed in isolation

Conclusion
=========

The graphcap Inference Bridge provides a powerful, flexible, and completely stateless system for generating structured captions from images using various AI providers. By integrating with a message broker, it maintains high scalability and resilience while eliminating the need for state management or database interactions. The clear separation of responsibilities between the Inference Bridge (stateless caption generation) and the Data Service (stateful job management) creates a robust architecture that allows for easy horizontal scaling and seamless deployment in various environments.

