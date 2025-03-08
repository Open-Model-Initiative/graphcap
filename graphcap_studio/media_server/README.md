# SPDX-License-Identifier: Apache-2.0
# Graphcap Media Server

This service provides media processing capabilities for the Graphcap Studio application. It currently supports image processing (viewing, cropping, rotating, etc.) and will be extended to support video and other media types in the future.

## Features

- **Image Processing**
  - **Image Listing**: List all images in the workspace
  - **Image Serving**: Serve images directly from the workspace
  - **Image Editing**: Process images (crop, rotate, resize, flip, flop)
  - **Image Upload**: Upload new images to the workspace
  - **WebP Optimization**: Automatically generate WebP versions of images for improved performance

- **Future Extensions**
  - **Video Processing**: Support for video editing and processing
  - **Audio Processing**: Support for audio editing and processing
  - **Document Processing**: Support for document viewing and editing

## API Endpoints

### Health Check

```
GET /health
```

Returns the health status of the service.

### Image API

#### List Images

```
GET /api/images?directory=path/to/directory
```

Lists all images in the specified directory (or root if not specified).

#### View Image

```
GET /api/images/view/path/to/image.jpg
```

Serves the specified image. If the browser supports WebP and a WebP version of the image exists, the WebP version will be served automatically for improved performance.

#### Process Image

```
POST /api/images/process
```

Processes an image with the specified operations.

Request body:
```json
{
  "imagePath": "path/to/image.jpg",
  "operations": {
    "crop": {
      "left": 100,
      "top": 100,
      "width": 500,
      "height": 500
    },
    "rotate": 90,
    "resize": {
      "width": 800,
      "height": 600
    },
    "flip": true,
    "flop": false
  },
  "outputName": "processed_image.jpg",
  "overwrite": false
}
```

#### Upload Image

```
POST /api/images/upload
```

Uploads a new image to the workspace.

Form data:
- `image`: The image file to upload

## WebP Optimization

The server includes a background WebP generator that automatically scans the workspace for images (jpg/jpeg/png) on startup and generates WebP versions in a dedicated cache directory (`webp_cache`). This process runs in the background and does not block server startup.

Benefits of WebP optimization:
- Smaller file sizes (typically 25-35% smaller than JPEG)
- Faster loading times for users
- Reduced bandwidth usage
- Original dataset folders remain clean and uncluttered

The server intelligently serves WebP images to browsers that support them while falling back to the original format for browsers that don't support WebP.

### How It Works

1. When the server starts, it scans the workspace for images
2. For each image, it creates a WebP version in the `webp_cache` directory, maintaining the same folder structure as the original
3. When a browser requests an image, the server checks if:
   - The browser supports WebP (via the Accept header)
   - A WebP version exists in the cache
4. If both conditions are met, the server serves the WebP version; otherwise, it serves the original

## Performance Optimizations

### WebP Conversion with Worker Threads

The media server uses Node.js worker threads via the [Piscina](https://github.com/piscinajs/piscina) library to offload CPU-intensive WebP conversion tasks from the main Express thread. This implementation:

- Parallelizes image conversion across multiple CPU cores
- Prevents blocking of the main event loop during image processing
- Automatically scales based on available CPU resources
- Implements a queue system to prevent memory overload

The implementation consists of:

1. A worker file (`utils/webp-worker.js`) that handles individual image conversions
2. A thread pool manager in `utils/background-webp-generator.js` that distributes conversion tasks
3. Batch processing with controlled concurrency to manage system resources

This approach significantly improves server responsiveness during heavy image processing workloads.

## Development

1. Install dependencies:
```
npm install
```

2. Start the server:
```
npm start
```

3. For development with auto-restart:
```
npm run dev
```

## Docker

This service is designed to run in a Docker container as part of the Graphcap application. The Dockerfile is provided in this directory.

## Environment Variables

- `PORT`: The port to run the server on (default: 32400)
- `WORKSPACE_PATH`: The path to the workspace volume (default: /workspace) 