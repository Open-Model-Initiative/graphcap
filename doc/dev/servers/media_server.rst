.. _media_server:

=================================
graphcap Media Server Architecture
=================================

Overview
========

The Media Server is a specialized component of the graphcap system responsible for managing, serving, and processing media assets (primarily images). It provides a REST API for media operations, handles file storage, and manages access to workspace images for other services in the graphcap ecosystem.

This document details the architecture, components, and interactions of the Media Server within the graphcap ecosystem.

Purpose
-------

The Media Server fulfills several essential responsibilities:

1. **Media Asset Management**
   - Provides access to images stored in the workspace directory
   - Manages file uploads and downloads
   - Implements file system operations (listing, copying, moving)
   - Serves images to frontend clients and other services

2. **Media Processing**
   - Handles image format conversions
   - Provides image metadata extraction
   - Generates thumbnails and previews
   - Supports image validation and sanitization

3. **Workspace Navigation**
   - Provides directory listing and traversal
   - Manages datasets and collections of images
   - Supports searching and filtering media assets
   - Enforces access permissions to files and directories

Architecture Components
======================

.. code-block:: text

   ┌─────────────────────────────────────────────────────┐
   │                   Media Server                      │
   │                                                     │
   │   ┌─────────────┐    ┌───────────────┐              │
   │   │             │    │               │              │
   │   │  Express    ├────┤   Services    │              │
   │   │  API Layer  │    │   Layer       │              │
   │   │             │    │               │              │
   │   └─────┬───────┘    └───────┬───────┘              │
   │         │                    │                      │
   │   ┌─────┴───────┐     ┌─────┴───────┐  ┌─────────┐  │
   │   │ Middleware  │     │ Filesystem  │  │Workspace│  │
   │   │ Layer       │     │ Utilities   ├──┤Directory│  │
   │   └─────────────┘     └─────────────┘  └─────────┘  │
   │                                                     │
   └─────────────────────────────────────────────────────┘
                             │
                             ▼
                   ┌───────────────────┐
                   │  Other graphcap   │
                   │    Services       │
                   └───────────────────┘

Core Components
--------------

1. **Express API Layer**
   - Implements RESTful API endpoints
   - Handles request routing and parameter validation
   - Manages HTTP response formatting and error handling
   - Implements CORS and security headers

2. **Services Layer**
   - Implements business logic for media operations
   - Provides abstractions for filesystem operations
   - Handles media metadata extraction and processing
   - Manages caching and performance optimizations

3. **Middleware Layer**
   - Handles authentication and authorization
   - Implements request logging and monitoring
   - Provides error handling and request validation
   - Manages CORS and security policies

4. **Filesystem Utilities**
   - Abstracts file system operations
   - Handles file paths and directory traversal safely
   - Manages file operations (read, write, delete, copy)
   - Provides stream processing for large files

5. **Workspace Directory**
   - Central storage location for all media assets
   - Organized structure for datasets and user content
   - Shared volume mounted into docker containers
   - Accessible to all graphcap services via the Media Server

API Endpoints
============

The Media Server exposes the following REST API endpoints:

Media Operations
--------------

.. list-table::
   :header-rows: 1
   :widths: 15 10 30

   * - Endpoint
     - Method
     - Description
   * - /api/media/image/:path
     - GET
     - Retrieve an image by path
   * - /api/media/upload
     - POST
     - Upload a new image
   * - /api/media/thumbnail/:path
     - GET
     - Get thumbnail of an image
   * - /api/media/metadata/:path
     - GET
     - Get metadata for an image

Workspace Management
------------------

.. list-table::
   :header-rows: 1
   :widths: 15 10 30

   * - Endpoint
     - Method
     - Description
   * - /api/workspace/list/:path
     - GET
     - List directory contents
   * - /api/workspace/create
     - POST
     - Create a new directory
   * - /api/workspace/move
     - POST
     - Move a file or directory
   * - /api/workspace/delete/:path
     - DELETE
     - Delete a file or directory
   * - /api/workspace/search
     - GET
     - Search files by criteria

Dataset Operations
----------------

.. list-table::
   :header-rows: 1
   :widths: 15 10 30

   * - Endpoint
     - Method
     - Description
   * - /api/datasets/list
     - GET
     - List all datasets
   * - /api/datasets/:id/images
     - GET
     - Get images in a dataset
   * - /api/datasets/create
     - POST
     - Create a new dataset
   * - /api/datasets/:id/add
     - POST
     - Add images to a dataset

Image Processing
--------------

.. list-table::
   :header-rows: 1
   :widths: 15 10 30

   * - Endpoint
     - Method
     - Description
   * - /api/process/resize
     - POST
     - Resize an image
   * - /api/process/convert
     - POST
     - Convert image format
   * - /api/process/optimize
     - POST
     - Optimize image size

Key Features
===========

1. **Media Serving**
   - Streams large files to minimize memory usage
   - Implements conditional GET with ETag support
   - Supports range requests for partial content
   - Configurable caching headers

2. **Secure Access Control**
   - Validates file paths to prevent directory traversal
   - Enforces permissions on workspace directories
   - Sanitizes filenames and content
   - Restricts operations to allowed file types

3. **Metadata Management**
   - Extracts EXIF and other embedded metadata
   - Provides image dimensions and format information
   - Supports custom metadata for graphcap features
   - Enables searching by metadata attributes

4. **Integration with graphcap Services**
   - Provides media assets to the Inference Bridge for processing
   - Stores and serves caption results from the Data Service
   - Supports the Studio UI with optimized media delivery
   - Enables sharing workspace content between services

Implementation Stack
===================

The Media Server is built using the following technologies:

- **Node.js**: Runtime environment
- **Express**: Web framework for API implementation
- **Sharp**: High-performance image processing library
- **Multer**: Middleware for handling multipart/form-data
- **Morgan**: HTTP request logger middleware
- **Helmet**: Security middleware for HTTP headers

Configuration
============

The Media Server is configured using environment variables:

.. list-table::
   :header-rows: 1
   :widths: 20 30 15

   * - Variable
     - Description
     - Default
   * - PORT
     - Port to run the service on
     - 32553
   * - NODE_ENV
     - Environment (development/production)
     - development
   * - WORKSPACE_PATH
     - Path to workspace directory
     - /workspace
   * - MAX_FILE_SIZE
     - Maximum upload file size in MB
     - 100
   * - ALLOWED_EXTENSIONS
     - Comma-separated list of allowed file extensions
     - jpg,jpeg,png,gif
   * - THUMBNAIL_CACHE_SIZE
     - Number of thumbnails to cache in memory
     - 1000

Deployment
=========

The Media Server is containerized using Docker:

.. code-block:: yaml

   graphcap_media_server:
     container_name: graphcap_media_server
     build:
       context: ./servers/media_server
       dockerfile: Dockerfile.media_server.dev
     ports:
       - "32553:32553"
     environment:
       - NODE_ENV=development
       - PORT=32553
       - WORKSPACE_PATH=/workspace
       - MAX_FILE_SIZE=100
       - ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,tiff
     volumes:
       - ./workspace:/workspace
       - ./servers/media_server:/app
     networks:
       - graphcap
     healthcheck:
       test: ["CMD", "wget", "--spider", "http://localhost:32553/health"]
       interval: 5m
       timeout: 10s
       retries: 3
       start_period: 30s

Error Handling
=============

The Media Server implements comprehensive error handling:

1. **File Operation Errors**
   - Graceful handling of missing files
   - Safe error messages that don't expose system details
   - Appropriate HTTP status codes (404, 403, etc.)
   - Consistent error response format

2. **Request Validation**
   - Validates file paths and query parameters
   - Checks file types and sizes before processing
   - Enforces access permissions
   - Prevents dangerous operations

3. **Resource Limitations**
   - Implements request timeouts
   - Manages memory usage for large files
   - Limits concurrent uploads and processing operations
   - Provides clear error messages for limit violations

Performance Considerations
=========================

1. **Streaming**
   - Uses streams for file operations to minimize memory usage
   - Implements chunked transfer encoding
   - Processes large files in chunks

2. **Caching**
   - Caches frequently accessed thumbnails
   - Uses ETags and conditional requests
   - Implements appropriate Cache-Control headers
   - Memory-efficient LRU caching strategy

3. **Optimization**
   - Asynchronous processing for non-blocking operations
   - Connection pooling for concurrent requests
   - Efficient image processing with Sharp
   - Resource cleanup after operations

Monitoring and Logging
=====================

1. **Health Check**
   - ``/health`` endpoint for container orchestration
   - Resource usage monitoring
   - Storage space validation

2. **Request Logging**
   - Detailed HTTP request logs
   - Performance metrics for media operations
   - Error tracking and categorization

3. **Metrics**
   - File operation counts and timings
   - Storage usage statistics
   - Request latency measurements
   - Cache hit/miss ratios

Integration with graphcap Ecosystem
==================================

The Media Server interacts with other graphcap components:

1. **Inference Bridge**
   - Provides images for caption generation
   - Receives processed media assets

2. **Data Service**
   - Supplies file paths and metadata
   - Receives updated media information

3. **Studio Frontend**
   - Serves optimized images for display
   - Handles media uploads from users
   - Provides browsing and search capabilities

