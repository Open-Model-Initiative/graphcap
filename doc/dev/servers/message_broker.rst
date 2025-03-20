=================================
graphcap Message Broker Architecture
=================================

Overview
========

The Message Broker is a central communication component of the graphcap system responsible for facilitating reliable message exchange between services. It provides a decoupled communication mechanism that enables asynchronous processing, load balancing, and improved system resilience. The broker acts as an intermediary for all inter-service communication, particularly between the stateful Data Service and stateless Inference Bridge.

This document details the architecture, components, and interactions of the Message Broker within the graphcap ecosystem.

Purpose
-------

The Message Broker fulfills several critical responsibilities:

1. **Inter-Service Communication**
   - Enables asynchronous message passing between services
   - Decouples message producers from consumers
   - Supports multiple message patterns (request-reply, publish-subscribe)
   - Ensures reliable message delivery with acknowledgments

2. **Job Distribution**
   - Queues batch caption jobs from the Data Service
   - Distributes individual caption tasks to Inference Bridge instances
   - Implements fair load balancing across available workers
   - Supports priority-based message routing

3. **System Resilience**
   - Persists messages during service outages
   - Handles retries and dead-letter queues for failed messages
   - Supports circuit breaking for degraded services
   - Enables horizontal scaling of services

Architecture Components
======================

.. code-block:: text

   ┌─────────────────────────────────────────────────────────┐
   │                    Message Broker                        │
   │                                                          │
   │ ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
   │ │             │  │              │  │                  │  │
   │ │  HTTP API   │  │ AMQP Server  │  │ Message Storage  │  │
   │ │   Layer     │  │              │  │                  │  │
   │ │             │  │              │  │                  │  │
   │ └─────┬───────┘  └───────┬──────┘  └──────────────────┘  │
   │       │                  │                               │
   │ ┌─────┴──────────────────┴──────┐  ┌──────────────────┐  │
   │ │                               │  │                  │  │
   │ │     Exchange & Queue          │  │ Management &     │  │
   │ │     Management                │  │ Monitoring       │  │
   │ │                               │  │                  │  │
   │ └───────────────────────────────┘  └──────────────────┘  │
   │                                                           │
   └───────────────────┬───────────────────────────┬───────────┘
                       │                           │
                       ▼                           ▼
         ┌─────────────────────────┐    ┌────────────────────────┐
         │                         │    │                        │
         │     Data Service        │    │    Inference Bridge    │
         │  (Message Producer)     │    │   (Message Consumer)   │
         │                         │    │                        │
         └─────────────────────────┘    └────────────────────────┘

Core Components
--------------

1. **HTTP API Layer**
   - Implements RESTful API for message publishing and management
   - Handles message creation and status queries
   - Provides queue management operations
   - Supports WebHook registrations for event notifications

2. **AMQP Server**
   - Core message broker functionality (RabbitMQ)
   - Implements AMQP protocol for message exchange
   - Manages connections, channels and consumers
   - Handles message acknowledgments and delivery guarantees

3. **Exchange & Queue Management**
   - Defines and manages exchanges for message routing
   - Creates and maintains message queues
   - Implements routing keys and binding patterns
   - Manages queue properties (durable, exclusive, auto-delete)

4. **Message Storage**
   - Persists messages to disk when configured
   - Implements message retention policies
   - Manages queue length limits
   - Handles overflow and disk space management

5. **Management & Monitoring**
   - Provides monitoring dashboard for broker state
   - Tracks message rates, queue depths, and consumer counts
   - Implements alerting for abnormal conditions
   - Supports runtime configuration changes

Message Exchange Patterns
========================

The Message Broker supports multiple message exchange patterns:

.. code-block:: text

   1. Direct Exchange Pattern (Point-to-Point)
   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
   │             │     │             │     │             │
   │  Producer   ├────►│  Queue      ├────►│  Consumer   │
   │             │     │             │     │             │
   └─────────────┘     └─────────────┘     └─────────────┘
   
   2. Topic Exchange Pattern (Publish-Subscribe)
   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
   │             │     │  Queue A    ├────►│ Consumer A  │
   │  Producer   ├────►│             │     │             │
   │             │     │  Queue B    ├────►│ Consumer B  │
   └─────────────┘     │             │     │             │
                       │  Queue C    ├────►│ Consumer C  │
                       └─────────────┘     └─────────────┘

   3. Fan-Out Exchange Pattern (Broadcast)
   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
   │             │     │  Queue A    ├────►│ Consumer A  │
   │  Producer   ├────►│             │     │             │
   │             │     │  Queue B    ├────►│ Consumer B  │
   └─────────────┘     │             │     │             │
                       └─────────────┘     └─────────────┘

Queue Structure
==============

The Message Broker defines the following primary queues:

.. list-table::
   :header-rows: 1
   :widths: 15 25 20 20

   * - Queue Name
     - Purpose
     - Exchange Type
     - Consumer
   * - caption.request
     - Individual caption requests
     - Direct
     - Inference Bridge
   * - caption.response
     - Caption results
     - Direct
     - Data Service
   * - analyze.request
     - Multi-perspective analysis
     - Direct
     - Inference Bridge
   * - analyze.response
     - Analysis results
     - Direct
     - Data Service
   * - status.update
     - Job status notifications
     - Fanout
     - Multiple Services
   * - dead.letter
     - Failed message handling
     - Direct
     - Error Handlers

API Endpoints
============

The Message Broker exposes the following REST API endpoints:

Message Operations
----------------

.. list-table::
   :header-rows: 1
   :widths: 15 10 30

   * - Endpoint
     - Method
     - Description
   * - /api/messages/publish
     - POST
     - Publish a message to a queue or exchange
   * - /api/messages/get/:queue
     - GET
     - Get messages from a queue (non-destructive)
   * - /api/messages/ack/:id
     - POST
     - Acknowledge a message has been processed
   * - /api/messages/nack/:id
     - POST
     - Reject a message (with requeue option)

Queue Management
--------------

.. list-table::
   :header-rows: 1
   :widths: 15 10 30

   * - Endpoint
     - Method
     - Description
   * - /api/queues/list
     - GET
     - List all queues
   * - /api/queues/create
     - POST
     - Create a new queue
   * - /api/queues/:name/info
     - GET
     - Get queue information and statistics
   * - /api/queues/:name/purge
     - POST
     - Purge all messages from a queue

Exchange Management
-----------------

.. list-table::
   :header-rows: 1
   :widths: 15 10 30

   * - Endpoint
     - Method
     - Description
   * - /api/exchanges/list
     - GET
     - List all exchanges
   * - /api/exchanges/create
     - POST
     - Create a new exchange
   * - /api/exchanges/:name/bind
     - POST
     - Bind an exchange to a queue
   * - /api/exchanges/:name/delete
     - DELETE
     - Delete an exchange

Key Features
===========

1. **Guaranteed Delivery**
   - Durable queues that survive broker restarts
   - Persistent messages stored to disk
   - Message acknowledgment tracking
   - Delivery retry mechanisms

2. **Flexible Routing**
   - Direct, topic, and fanout exchange types
   - Header and custom routing patterns
   - Content-based routing capabilities
   - Dynamic routing configuration

3. **Performance Optimizations**
   - Queue mirroring for high availability
   - Lazy queues for handling large backlogs
   - Memory management with paging to disk
   - Queue federation for scalability

4. **Flow Control**
   - Consumer prefetch limits
   - Producer throttling
   - Queue length monitoring
   - Backpressure mechanisms

Implementation Stack
===================

The Message Broker is built using the following technologies:

- **RabbitMQ**: Core AMQP message broker
- **Node.js**: For HTTP API layer and management interface
- **Express**: Web framework for the REST API
- **amqplib**: Node.js client for RabbitMQ
- **Prometheus**: For metrics collection and monitoring
- **Docker**: For containerization and deployment

Configuration
============

The Message Broker is configured using environment variables:

.. list-table::
   :header-rows: 1
   :widths: 20 30 15

   * - Variable
     - Description
     - Default
   * - PORT
     - HTTP API port
     - 32552
   * - RABBITMQ_PORT
     - AMQP protocol port
     - 5672
   * - RABBITMQ_MANAGEMENT_PORT
     - Management interface port
     - 15672
   * - RABBITMQ_USER
     - RabbitMQ username
     - guest
   * - RABBITMQ_PASSWORD
     - RabbitMQ password
     - guest
   * - MESSAGE_TTL
     - Default message time-to-live in ms
     - 86400000
   * - QUEUE_MODE
     - Queue mode (default/lazy)
     - default
   * - NODE_ENV
     - Environment (development/production)
     - development

Deployment
=========

The Message Broker is containerized using Docker:

.. code-block:: yaml

   graphcap_message_broker:
     container_name: graphcap_message_broker
     build:
       context: ./servers/message_broker
       dockerfile: Dockerfile.message_broker.dev
     ports:
       - "32552:32552"  # HTTP API
       - "5672:5672"    # AMQP protocol
       - "15672:15672"  # Management interface
     environment:
       - NODE_ENV=development
       - PORT=32552
       - RABBITMQ_DEFAULT_USER=guest
       - RABBITMQ_DEFAULT_PASSWORD=guest
       - RABBITMQ_USER=guest
       - RABBITMQ_PASSWORD=guest
       - MESSAGE_TTL=86400000
       - QUEUE_MODE=default
     volumes:
       - rabbitmq_data:/var/lib/rabbitmq
       - ./servers/message_broker:/app
     networks:
       - graphcap
     healthcheck:
       test: ["CMD", "wget", "--spider", "http://localhost:32552/health"]
       interval: 5m
       timeout: 10s
       retries: 3
       start_period: 30s

Error Handling
=============

The Message Broker implements robust error handling:

1. **Message Processing Errors**
   - Dead letter exchanges for failed messages
   - Automatic retries with exponential backoff
   - Poison message detection and isolation
   - Error logging with context for troubleshooting

2. **Connection Handling**
   - Automatic reconnection for dropped connections
   - Connection pooling for high availability
   - Circuit breaking for failing endpoints
   - Graceful degradation under load

3. **Resource Limitations**
   - Memory alarm triggers for high usage
   - Disk space monitoring
   - Connection limits and monitoring
   - CPU and network utilization tracking

Performance Considerations
=========================

1. **Message Throughput**
   - Optimized for high message rates
   - Batched publishing and consumption
   - Smart acknowledgment patterns
   - Transient messages for non-critical data

2. **Scalability**
   - Clustering for horizontal scaling
   - Queue sharding for performance
   - Load balancing across instances
   - Federation for geographic distribution

3. **Resource Efficiency**
   - Lazy queues for large message backlogs
   - Message paging to disk
   - Memory management optimizations
   - Efficient routing algorithms

Monitoring and Logging
=====================

1. **Health Check**
   - ``/health`` endpoint for container orchestration
   - Connection verification
   - Disk space and memory checks
   - Queue status validation

2. **Operational Metrics**
   - Message rates (published/delivered/acknowledged)
   - Queue depths and growth rates
   - Connection and channel counts
   - Error rates and types

3. **Performance Metrics**
   - Latency measurements
   - Memory and disk usage
   - CPU utilization
   - Network throughput

Integration with graphcap Ecosystem
==================================

The Message Broker integrates with other graphcap components:

1. **Data Service**
   - Primarily acts as a message producer
   - Publishes caption jobs for processing
   - Consumes completed caption results
   - Receives status updates

2. **Inference Bridge**
   - Primarily acts as a message consumer
   - Processes caption requests from queues
   - Publishes results back to response queues
   - Reports status and health information

3. **Studio Frontend**
   - Receives real-time updates via WebSockets
   - Subscribes to job status notifications
   - Monitors queue status and health
