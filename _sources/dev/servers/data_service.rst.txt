.. _data_service:

=================================
graphcap Data Service Architecture
=================================

Overview
========

The Data Service is a core component of the graphcap system with a dual role: it serves as both a **data persistence layer**
 for all application content and a **database access service** for the React client. It provides a REST API for 
 data access and job tracking while persisting all application data in a PostgreSQL database.

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

2. **Job Tracking**
   - Stores the metadata and status for batch caption jobs
   - Maintains database tables for job queue prioritization
   - Records individual task status and results
   - Provides APIs for job status retrieval and management
   - Implements database-level job status tracking

These responsibilities allow the Data Service to act as the persistence layer while the React Client serves as the system orchestrator.

Architecture Components
======================

.. code-block:: text

   ┌──────────────────────────────────────────────────────┐
   │                    Data Service                      │
   │                                                      │
   │  ┌─────────────┐      ┌──────────────┐     ┌────────┐│
   │  │             │      │              │     │        ││
   │  │  Hono API   ├──────┤  Repository  ├─────┤ Drizzle││
   │  │   Layer     │      │    Layer     │     │   ORM  ││
   │  │             │      │              │     │        ││
   │  └─────────────┘      └──────────────┘     └────┬───┘│
   │                                                 │    │
   │                                            ┌────┴───┐│
   │                                            │Postgres││
   │                                            │Database││
   │                                            └────────┘│
   │                                                      │
   └──────────────────────────────────────────────────────┘
                            ▲
                            │
                            ▼
                    ┌───────────────┐
                    │  React Client │
                    │ (Orchestrator)│
                    └───────────────┘


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
     - Create a new batch caption job record
   * - /api/perspectives/batch/list
     - GET
     - List active jobs with pagination and filters
   * - /api/perspectives/batch/status/:jobId
     - GET
     - Get detailed job status including items
   * - /api/perspectives/batch/cancel/:jobId
     - POST
     - Mark a job as cancelled in the database
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
     - Mark failed items for retry
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
     - Update an individual job item status
   * - /api/perspectives/batch/items/:jobId/list
     - GET
     - List all items for a specific job
   * - /api/perspectives/batch/items/:jobId/failed
     - GET
     - List only failed items for a job

WebSocket Endpoints
------------------

The Data Service may also provide WebSocket endpoints for real-time updates:

.. list-table::
   :header-rows: 1
   :widths: 30 30

   * - Endpoint
     - Description
   * - /api/ws/job-updates
     - Provides real-time job status and progress updates

Implementation Stack
===================

The Data Service is built using the following technologies:

- **Bun**: Runtime environment
- **TypeScript**: Programming language
- **Hono.js**: Lightweight, high-performance API framework
- **Drizzle ORM**: Type-safe SQL query builder
- **PostgreSQL**: Relational database
- **zod**: Schema validation for API requests

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
