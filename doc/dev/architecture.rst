=================================
graphcap Architecture Overview
=================================

This document outlines the architecture of the GraphCap system, focusing on the communication between client and backend services.

System Components
=================

graphcap consists of several specialized services that work together to provide image captioning capabilities:

- **React Client**: The web-based user interface
- **Data Service**: Manages database operations and job tracking
- **Message Broker**: Handles asynchronous communication and real-time events
- **Inference Bridge**: Performs AI-based image captioning
- **Media Server**: Manages image storage, retrieval, and processing

Architecture Diagram
===================

.. code-block:: text

                                 ┌──────────────────┐
                                 │                  │
                                 │   React Client   │
                                 │                  │
                                 └───────┬──────────┘
                                         │
                                         │ REST API + WebSockets
                                         │
                 ┌─────────────────────┬─┴──────┬─────────────────────┐
                 │                     │        │                     │
                 ▼                     ▼        ▼                     ▼
    ┌────────────────────┐   ┌──────────────┐   ┌──────────────────┐   ┌────────────────┐
    │                    │   │              │   │                  │   │                │
    │    Data Service    │◄──┤   Message    │◄──┤  Inference       │   │  Media Server  │
    │    (DB Storage)    │───►   Broker     │───►  Server          │   │                │
    │                    │   │              │   │                  │   │                │
    └─────────┬──────────┘   └──────────────┘   └─────────┬────────┘   └────────┬───────┘
              │                                           │                     │
              │                                           │                     │
              ▼                                           ▼                     ▼
    ┌──────────────────┐                       ┌───────────────────┐   ┌─────────────────┐
    │                  │                       │                   │   │                 │
    │  PostgreSQL DB   │                       │  Model Storage    │   │   Workspace     │
    │                  │                       │                   │   │                 │
    └──────────────────┘                       └───────────────────┘   └─────────────────┘

Communication Flows
==================

REST API Communication
---------------------

The system uses REST APIs for traditional request-response interactions:

1. **Client to Data Service**:
   - Create, list, and manage batch caption jobs
   - Query job status and results
   - Database operations

2. **Client to Media Server**:
   - Upload and manage images
   - Browse and select images for captioning
   - Request image transformations

3. **Data Service to Message Broker**:
   - Create and manage message queues
   - Publish caption job requests
   - Consume caption response messages
   - Manage job state transitions

4. **Inference Bridge to Message Broker**:
   - Consume caption job requests
   - Publish caption results
   - Report processing status
   - Handle error scenarios

5. **Client to Message Broker**:
   - Query queue status and statistics
   - Manage queue operations (reordering, purging)
   - Monitor broker health and performance

Message Queue Communication
--------------------------

Asynchronous communication between services is handled via message queues:

1. **Data Service to Inference Bridge**:
   - Caption job requests flow through `caption.request` queue
   - Batch analysis requests flow through `analyze.request` queue
   - Priority-based job scheduling
   - Job configuration parameters

2. **Inference Server to Data Service**:
   - Caption results flow through `caption.response` queue
   - Analysis results flow through `analyze.response` queue
   - Processing metrics and performance data
   - Error reports and diagnostic information

3. **System-wide Notifications**:
   - Status updates flow through `status.update` exchange (fanout pattern)
   - Multiple services subscribe to relevant events
   - Centralized error handling via `dead.letter` queue
   - Health and monitoring information

WebSocket Communication
----------------------

Real-time updates flow through the Message Broker's WebSocket server:

1. **Message Broker to Client**:
   - Job status updates
   - Progress notifications
   - Queue changes
   - Media events
   - Real-time system health metrics

2. **Client to Message Broker**:
   - Connection management (ping/pong)
   - Subscriptions to specific event types
   - Queue operation requests
   - Job prioritization changes

Component Details
================

Message Broker
-------------

The Message Broker serves as the central communications hub with the following responsibilities:

- **Message Queue Management**:
  - Implements AMQP protocol with RabbitMQ
  - Manages direct, topic, and fanout exchanges
  - Provides durable queues for persistence
  - Implements dead letter queues for error handling

- **Real-time Communication**:
  - Maintains WebSocket connections with clients
  - Broadcasts events to connected clients
  - Handles client subscription management
  - Provides connection status monitoring

- **API Integration**:
  - Exposes REST API for message and queue operations
  - Provides queue statistics and monitoring endpoints
  - Supports queue management operations
  - Handles message acknowledgments and delivery guarantees

- **System Resilience**:
  - Persists messages during service outages
  - Provides automatic reconnection for clients
  - Implements circuit breaking for degraded services
  - Supports horizontal scaling for high availability

Data Service
-----------

Focused solely on database operations:

- Manages job queue database (PostgreSQL)
- Tracks job status and progress
- Provides REST API for queue management
- Acts as a message producer for caption jobs
- Consumes caption results from message queues

Inference Bridge
--------------

Performs the actual captioning work:

- Consumes captioning requests from message queues
- Processes images with AI models
- Publishes caption results to response queues
- Reports processing status via the Message Broker
- Handles batching and concurrent processing

Media Server
-----------

Handles all image-related operations:

- Stores and retrieves images
- Processes images for optimal captioning
- Notifies when new images are available
- Manages image caching and transformations

Client Implementation
====================

The React client uses several mechanisms to interact with the backend:

1. **TanStack Query**:
   - Manages REST API requests
   - Handles caching and state management
   - Provides optimistic updates

2. **WebSocket Hook**:
   - Establishes connection with Message Broker
   - Processes real-time events
   - Updates TanStack Query cache based on events
   - Handles reconnection logic

3. **Queue Panel Component**:
   - Displays job queue with live updates
   - Shows job progress and status
   - Provides controls for job management

Event Protocol
=============

The Message Broker uses a standardized event format:

.. code-block:: json

   {
     "type": "EVENT_TYPE",
     "jobId": "optional-job-id",
     "itemId": "optional-item-id",
     "data": {
       // Event-specific data
     },
     "timestamp": 1647889012345
   }

Common event types include:

- ``JOB_CREATED``: New job added to queue
- ``JOB_STARTED``: Job begins processing
- ``JOB_PROGRESS``: Job progress updates (0-100%)
- ``JOB_COMPLETED``: Job finished successfully
- ``JOB_FAILED``: Job encountered errors
- ``JOB_CANCELLED``: Job stopped by user
- ``JOB_ITEM_UPDATED``: Individual item status changed
- ``QUEUE_REORDERED``: Queue priority changed
- ``IMAGES_UPLOADED``: New images available
- ``IMAGE_RESIZED``: Image transformation completed

Message Queue Protocol
=====================

The Message Broker supports several message exchange patterns:

1. **Direct Exchange Pattern**:
   - Point-to-point communication
   - Used for caption.request and caption.response queues
   - Guaranteed delivery to a single consumer
   - Message acknowledgment required

2. **Topic Exchange Pattern**:
   - Routing based on pattern matching
   - Allows targeted notifications to specific services
   - Supports flexible subscription patterns
   - Used for specialized event distribution

3. **Fanout Exchange Pattern**:
   - Broadcast communication to multiple queues
   - Used for status.update notifications
   - Delivers messages to all bound queues
   - Enables multiple services to receive the same events

Deployment Configuration
=======================

Services are containerized using Docker and orchestrated with Docker Compose:

.. code-block:: yaml

   # Example docker-compose.yml structure
   services:
     graphcap_client:
       # Frontend configuration
       ports:
         - "3000:3000"
       depends_on:
         - graphcap_data_service
         - graphcap_message_broker
       
     graphcap_message_broker:
       # Message broker configuration
       ports:
         - "32552:32552"  # HTTP API
         - "5672:5672"    # AMQP protocol
         - "15672:15672"  # Management interface
       environment:
         - NODE_ENV=development
         - PORT=32552
         - RABBITMQ_DEFAULT_USER=guest
         - RABBITMQ_DEFAULT_PASSWORD=guest
       volumes:
         - rabbitmq_data:/var/lib/rabbitmq
       
     graphcap_data_service:
       # Data service configuration
       ports:
         - "32550:32550"
       environment:
         - MESSAGE_BROKER_URL=http://graphcap_message_broker:32552
         - RABBITMQ_URL=amqp://guest:guest@graphcap_message_broker:5672
         - DATABASE_URL=postgresql://user:password@graphcap_postgres:5432/graphcap
       
     graphcap_inference_server:
       # Inference Bridge configuration
       environment:
         - MESSAGE_BROKER_URL=http://graphcap_message_broker:32552
         - RABBITMQ_URL=amqp://guest:guest@graphcap_message_broker:5672
         - MEDIA_SERVER_URL=http://graphcap_media_server:32553
       
     graphcap_media_server:
       # Media server configuration
       ports:
         - "32553:32553"
       volumes:
         - ./workspace:/workspace
       environment:
         - MESSAGE_BROKER_URL=http://graphcap_message_broker:32552



