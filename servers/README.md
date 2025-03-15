# Graphcap Servers

This directory contains the server components of the Graphcap application. These services are designed to run as containerized microservices within the Graphcap architecture.

## Services Overview

### Data Service

The Data Service is a modern API backend built with:

- [Bun](https://bun.sh/) - JavaScript runtime
- [Hono](https://hono.dev/) - Lightweight web framework
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Zod](https://zod.dev/) - TypeScript-first schema validation

This service is responsible for:

- Storing and retrieving application data
- User authentication and authorization
- Database migrations and schema management
- Exposing RESTful APIs for frontend interaction

#### Container Configuration

The Data Service runs in the `graphcap_data_service` container:

- Exposed on port 32550
- Drizzle Studio accessible on port 32501
- Connected to the PostgreSQL database
- Mounted with workspace volumes for persistent storage

### Media Server

The Media Server handles all media processing capabilities for the Graphcap application, including:

- **Image Processing**
  - Image viewing and serving
  - Image transformation (crop, rotate, resize, flip)
  - WebP optimization for improved performance
  - Background processing with worker threads

- **Future Media Support**
  - Video processing (planned)

The Media Server runs in the `graphcap_media_server` container:

- Exposed on port 32400
- Mounted with workspace volumes for media file access
- Health check endpoint at `/health`

## Architecture

Both services are designed as microservices within the Graphcap ecosystem:

- Containerized with Docker
- Connected to the same network
- Share workspace volumes for data exchange
- Integrated with the main application through API calls

## Deployment

The recommended way to run these services is through Docker Compose:

```bash
# from root directory
docker compose up --env-file ./workspace/config/.env
```

This will start all necessary services including the data service, media server, and supporting infrastructure like the PostgreSQL database.

## Environment Configuration

Each service reads configuration from environment variables defined in the docker-compose.yml file and potentially from .env files. The key environment variables include:

- `DATABASE_URL`: Connection string for PostgreSQL
- `WORKSPACE_PATH`: Path to the shared workspace volume
- `PORT`: Port on which each service listens

### Note

Currently the inference server is coupled with the old ./src directory. This will be fixed in the future and that service will also be moved to this directory.
