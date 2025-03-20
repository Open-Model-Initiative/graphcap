=================================
graphcap Data Service Architecture
=================================

Overview
========

The Data Service is a core component of the graphcap system with a dual role: it serves as both a **data persistence layer**
 for all application content and a **job orchestration system** for batch processing workflows. It provides a REST API for 
 data access and job queue management while persisting all application data in a PostgreSQL database.

This document details the architecture, components, and interactions of the Data Service within the graphcap ecosystem.

Purpose
-------

The Data Service fulfills two critical responsibilities:

1. **Data Management**
   - Acts as the system's single source of truth for all persistent data
   - Stores and retrieves images, captions, and their relationships
   - Maintains metadata for datasets and perspectives
   - Provides APIs for data querying and manipulation
   - Ensures data integrity and manages retention policies

2. **Job Orchestration**
   - Manages the complete lifecycle of batch caption jobs
   - Handles job queue prioritization and scheduling
   - Breaks down batch jobs into individual tasks for the Inference Bridge
   - Tracks job progress and aggregates results
   - Provides real-time status updates to clients
   - Implements retry strategies and failure handling

These dual responsibilities create a clear separation of concerns where the Data Service handles all stateful operations, 
allowing the Inference Bridge to remain completely stateless.

Architecture Components
======================

.. code-block:: text

   ┌────────────────────────────────────────────────────────┐
   │                    Data Service                         │
   │                                                         │
   │  ┌─────────────┐      ┌──────────────┐     ┌────────┐  │
   │  │             │      │              │     │        │  │
   │  │  Hono API   ├──────┤  Repository  ├─────┤ Drizzle│  │
   │  │   Layer     │      │    Layer     │     │   ORM  │  │
   │  │             │      │              │     │        │  │
   │  └──────┬──────┘      └──────────────┘     └────┬───┘  │
   │         │                                      │        │
   │  ┌──────┴──────┐                          ┌───┴────┐   │
   │  │ Notification│                          │PostgreSQL│  │
   │  │  Service    │                          │Database  │  │
   │  └──────┬──────┘                          └─────────┘  │
   │         │                                               │
   └─────────┼───────────────────────────────────────────────┘
             │
             ▼
    ┌──────────────────┐
    │  Message Broker  │
    └──────────────────┘


Core Components
--------------

1. **Hono API Layer**
   - Implements RESTful API endpoints
   - Handles request validation and error responses
   - Routes requests to the appropriate repository methods
   - Implements pagination, filtering and sorting

2. **Repository Layer**
   - Provides abstractions for database operations
   - Implements business logic for data access
   - Manages transactions and data integrity

3. **Drizzle ORM**
   - Type-safe ORM for PostgreSQL
   - Handles SQL query generation
   - Manages schema migrations

4. **Notification Service**
   - Publishes data change events to the Message Broker
   - Ensures services stay in sync when data changes

Database Schema
==============

The Data Service manages several schemas within PostgreSQL:

Main Schemas
-----------

.. code-block:: text

   ┌────────────────┐      ┌────────────────┐
   │  core_schema   │      │  job_queue     │
   │                │      │                │
   │ - images       │      │ - caption_jobs │
   │ - perspectives │      │ - job_items    │
   │ - datasets     │      │ - job_archives │
   │ - captions     │      │                │
   └────────────────┘      └────────────────┘

Job Queue Schema
---------------

.. code-block:: text

   ┌─────────────────────────┐
   │      caption_jobs       │
   ├─────────────────────────┤
   │ id: serial (PK)         │
   │ job_id: text (unique)   │
   │ status: text (enum)     │
   │ created_at: timestamp   │
   │ started_at: timestamp   │
   │ completed_at: timestamp │
   │ type: text              │
   │ priority: integer       │
   │ total_images: integer   │
   │ processed_images: int   │
   │ failed_images: integer  │
   │ progress: integer       │
   │ config: json            │
   │ user_id: text           │
   │ archived: boolean       │
   │ archive_date: timestamp │
   └─────────────────────────┘
            │
            │ 1:many
            ▼
   ┌─────────────────────────┐
   │       job_items         │
   ├─────────────────────────┤
   │ id: serial (PK)         │
   │ job_id: text (FK)       │
   │ image_path: text        │
   │ perspective: text       │
   │ status: text (enum)     │
   │ result: json            │
   │ error: text             │
   │ processing_time: int    │
   │ started_at: timestamp   │
   │ completed_at: timestamp │
   └─────────────────────────┘

REST API Endpoints
=================

The Data Service exposes the following REST API endpoints:

Batch Captioning Queue
---------------------

.. list-table::
   :header-rows: 1
   :widths: 10 8 30

   * - Endpoint
     - Method
     - Description
   * - /api/perspectives/batch/create
     - POST
     - Create a new batch caption job
   * - /api/perspectives/batch/list
     - GET
     - List active jobs with pagination and filters
   * - /api/perspectives/batch/status/:jobId
     - GET
     - Get detailed job status including items
   * - /api/perspectives/batch/cancel/:jobId
     - POST
     - Cancel a pending or running job
   * - /api/perspectives/batch/reorder
     - POST
     - Change job queue order or priorities
   * - /api/perspectives/batch/analyze-images
     - POST
     - Analyze images to determine missing perspectives
   * - /api/perspectives/batch/archive/:jobId
     - POST
     - Archive a completed job
   * - /api/perspectives/batch/restore/:jobId
     - POST
     - Restore an archived job
   * - /api/perspectives/batch/retry-failed/:jobId
     - POST
     - Retry failed items within a job
   * - /api/perspectives/batch/statistics
     - GET
     - Get queue statistics

Job Item Operations
-----------------

.. list-table::
   :header-rows: 1
   :widths: 10 8 30

   * - Endpoint
     - Method
     - Description
   * - /api/perspectives/batch/items/:itemId
     - POST
     - Update an individual job item (internal API)
   * - /api/perspectives/batch/items/:jobId/list
     - GET
     - List all items for a specific job
   * - /api/perspectives/batch/items/:jobId/failed
     - GET
     - List only failed items for a job

Communication with Message Broker
================================

The Data Service notifies the Message Broker about data changes through HTTP requests:

.. code-block:: text

   ┌──────────────┐          ┌──────────────┐
   │              │   HTTP   │              │
   │ Data Service ├─────────►│Message Broker│
   │              │ POST     │              │
   └──────────────┘          └──────────────┘

Event Publishing
--------------

1. **Job Creation Events**
   - When a new job is created, the Data Service sends a ``JOB_CREATED`` event

2. **Job Status Change Events**
   - When job status changes (completed, failed, cancelled)
   - Includes relevant job metadata

3. **Job Progress Events**
   - When job progress is updated by the Inference Server

Implementation Stack
===================

The Data Service is built using the following technologies:

- **Node.js**: Runtime environment
- **TypeScript**: Programming language
- **Hono.js**: Lightweight, high-performance API framework
- **Drizzle ORM**: Type-safe SQL query builder
- **PostgreSQL**: Relational database
- **zod**: Schema validation for API requests
- **axios**: HTTP client for service-to-service communication

Configuration
============

The Data Service is configured using environment variables:

.. list-table::
   :header-rows: 1
   :widths: 15 35 10

   * - Variable
     - Description
     - Default
   * - PORT
     - Port to run the service on
     - 32550
   * - DATABASE_URL
     - PostgreSQL connection string
     - None
   * - MESSAGE_BROKER_URL
     - URL of the Message Broker service
     - None
   * - NODE_ENV
     - Environment (development/production)
     - development
   * - WORKSPACE_PATH
     - Path to workspace directory
     - /workspace
   * - MAX_CONCURRENT_JOBS
     - Maximum concurrent running jobs
     - 2
   * - MAX_CONCURRENT_ITEMS
     - Maximum concurrent items per job
     - 4

Deployment
=========

The Data Service is containerized using Docker:

.. code-block:: yaml

   graphcap_data_service:
     container_name: graphcap_data_service
     build:
       context: ./servers/data_service
       dockerfile: Dockerfile.data_service.dev
     ports:
       - "32550:32550"
     environment:
       - NODE_ENV=development
       - PORT=32550
       - DATABASE_URL=postgresql://user:password@graphcap_postgres:5432/graphcap
       - MESSAGE_BROKER_URL=http://graphcap_message_broker:32552
       - WORKSPACE_PATH=/workspace
       - MAX_CONCURRENT_JOBS=2
       - MAX_CONCURRENT_ITEMS=4
     volumes:
       - ./workspace:/workspace
       - ./servers/data_service/src:/app/src
     networks:
       - graphcap
     depends_on:
       graphcap_postgres:
         condition: service_healthy
     healthcheck:
       test: ["CMD", "wget", "--spider", "http://localhost:32550/health"]
       interval: 5m
       timeout: 10s
       retries: 3
       start_period: 30s

Error Handling
=============

The Data Service implements robust error handling:

1. **Request Validation Errors**
   - Schema validation using zod
   - Detailed error messages for invalid requests

2. **Database Errors**
   - Transaction rollback on failure
   - Error logging with context
   - Appropriate HTTP status codes

3. **Service Communication Errors**
   - Retry logic for message broker communication
   - Fallback mechanisms for temporary failures

Performance Considerations
=========================

1. **Connection Pooling**
   - Optimized PostgreSQL connection pool
   - Configurable pool size based on load

2. **Query Optimization**
   - Indexes on frequently accessed columns
   - Pagination for large result sets
   - Efficient joins and filters

3. **Caching Strategies**
   - In-memory caching for frequently accessed data
   - Conditional HTTP caching headers


Monitoring and Logging
=====================

1. **Health Check Endpoint**
   - ``/health`` endpoint for container orchestration
   - Database connectivity check

2. **Structured Logging**
   - JSON format logs with correlation IDs
   - Log levels configurable via environment

3. **Metrics**
   - Request count and latency metrics
   - Queue size and processing metrics
   - Error rate tracking
