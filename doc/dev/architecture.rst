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

- **React Client**: Web-based user interface.
- **Data Service**: Manages database operations, job orchestration, and tracking.
- **Message Broker**: Handles asynchronous communication and real-time events.
- **Inference Bridge**: Performs AI-based image captioning.
- **Media Server**: Manages image storage, retrieval, and processing.

.. figure::

   .. code-block:: text

       ┌─────────────────┐
       │ React Client    │
       └───────┬─────────┘
               │ REST/WebSocket
       ┌───────v─────────┐
       │ Message Broker  │
       └─┬─────┬─────┬───┘
         │     │     │
         ▼     ▼     ▼
   ┌───────┐ ┌───────────┐ ┌─────────────┐
   │ Data  │ │ Inference │ │ Media Server│
   │Service│ │  Bridge   │ │             │
   └───┬───┘ └───┬───────┘ └──────┬──────┘
       │         │                │
       ▼         ▼                ▼
 ┌──────────┐ ┌─────────────┐ ┌───────────┐
 │PostgreSQL│ │AI Providers │ │ Workspace │
 └──────────┘ └─────────────┘ └───────────┘


Communication Flows
===================

REST API Communication
----------------------

System REST APIs manage request-response interactions:

- **Client ↔ Data Service**: Create/manage jobs, query status, handle DB operations.
- **Client ↔ Media Server**: Upload, browse images, request transformations.
- **Data Service ↔ Message Broker**: Job queuing and state management.
- **Inference Bridge ↔ Message Broker**: Job processing, status updates, error handling.

Message Queue Communication
---------------------------

Asynchronous communication using message queues:

- **Data Service → Inference Bridge**: Caption job requests (`caption.request`).
- **Inference Bridge → Data Service**: Caption results (`caption.response`).
- **System-wide Notifications**: Broadcast via `status.update` (fanout pattern).

WebSocket Communication
-----------------------

Real-time updates through Message Broker:

- **Broker → Client**: Job statuses, progress, queue events.
- **Client → Broker**: Connection management, event subscriptions, queue updates.


Component Deep Dives
====================

Message Broker
--------------

RabbitMQ-based central communication hub:

- Implements AMQP for reliability and durability.
- Manages direct, topic, fanout exchanges.
- WebSocket support for real-time client communication.
- Provides resilience through durable queues and automatic reconnections.

Data Service
------------

Manages persistence and job orchestration:

- Single source of truth via PostgreSQL.
- Handles batch job creation, status tracking, retries.
- Provides REST APIs for data and job management.

Inference Bridge
----------------

Stateless AI caption processing:

- Consumes caption jobs from the message broker.
- Communicates with AI providers (Gemini, Ollama, OpenAI).
- Publishes results back to broker without maintaining internal state.

Media Server
------------

Responsible for media asset management:

- Provides file upload, retrieval, and processing.
- Manages media workspace storage.
- Generates thumbnails, extracts metadata.

React Client
------------

Interactive front-end interface:

- Utilizes TanStack Query for efficient state management.
- WebSocket integration for real-time updates.
- Job queue and progress UI component.



