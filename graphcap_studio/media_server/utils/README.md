# Path Utilities for Graphcap Media Server

This directory contains utility functions for secure path handling in the Graphcap Media Server.

## Security Considerations

Path injection vulnerabilities occur when user-controlled input is used to construct file paths without proper validation and sanitization. These vulnerabilities can lead to:

1. **Path Traversal Attacks**: Attackers can use `../` sequences to access files outside the intended directory.
2. **Arbitrary File Access**: Attackers can access sensitive files on the server.
3. **Symbolic Link Attacks**: Attackers can follow symbolic links to access files outside the intended directory.

## Secure Path Utilities

The `path-utils.js` module provides a set of functions to securely handle file paths:

### `securePath(userPath, basePath, options)`

Securely resolves a user-provided path relative to a base path.

**Parameters:**
- `userPath`: The user-provided path (can be relative or absolute)
- `basePath`: The base path that the final path must be within (defaults to WORKSPACE_PATH)
- `options`: Additional options
  - `mustExist`: Whether the path must exist (default: false)
  - `followSymlinks`: Whether to follow symbolic links (default: false)
  - `createIfNotExist`: Whether to create the directory if it doesn't exist (default: false)

**Returns:**
- An object containing:
  - `isValid`: Whether the path is valid
  - `path`: The resolved path (or null if invalid)
  - `relativePath`: The path relative to the base path (or null if invalid)
  - `error`: Error message (or null if valid)

### `validateFilename(filename)`

Validates a filename to ensure it only contains safe characters.

**Parameters:**
- `filename`: The filename to validate

**Returns:**
- An object containing:
  - `isValid`: Whether the filename is valid
  - `sanitized`: The sanitized filename (or null if invalid)
  - `error`: Error message (or null if valid)

### Helper Functions

- `joinPath(...segments)`: Joins path segments securely
- `getDirname(filePath)`: Gets the directory name of a path
- `getBasename(filePath, ext)`: Gets the base name of a file path
- `getExtension(filePath)`: Gets the extension of a file path
- `ensureDir(dirPath, recursive)`: Creates a directory if it doesn't exist

## Usage Examples

```javascript
const { 
  securePath, 
  validateFilename, 
  joinPath 
} = require('./path-utils');

// Validate a user-provided path
const pathResult = securePath('user/uploads/image.jpg');
if (pathResult.isValid) {
  console.log(`Valid path: ${pathResult.path}`);
} else {
  console.error(`Invalid path: ${pathResult.error}`);
}

// Validate a filename
const filenameResult = validateFilename('user-file.jpg');
if (filenameResult.isValid) {
  console.log(`Valid filename: ${filenameResult.sanitized}`);
} else {
  console.error(`Invalid filename: ${filenameResult.error}`);
}

// Create a directory securely
const dirResult = securePath('uploads/user123', null, { createIfNotExist: true });
if (dirResult.isValid) {
  console.log(`Directory created: ${dirResult.path}`);
} else {
  console.error(`Failed to create directory: ${dirResult.error}`);
}
```


## Best Practices

1. **Always validate user input**: Use `securePath` for all user-provided paths.
2. **Validate filenames**: Use `validateFilename` for all user-provided filenames.
3. **Use relative paths**: Always use paths relative to the workspace root.
4. **Check return values**: Always check the `isValid` property of the result objects.
5. **Handle errors gracefully**: Provide meaningful error messages to users.

# Media Server Utilities

This directory contains utility modules for the Graphcap Media Server.

## Background WebP Generator

The `background-webp-generator.js` module provides functionality to scan the workspace for images and generate WebP versions in the background to improve performance.

### Features

- Scans the workspace for images (jpg/jpeg/png) on server startup
- Generates WebP versions of images that don't already have them
- Stores WebP versions in a dedicated cache directory (`webp_cache`)
- Maintains the same folder structure as the original images
- Processes images in batches to avoid overwhelming the system
- Logs progress and errors

### How It Works

1. When the server starts, it initiates a background process to scan the workspace for images
2. For each image found, it checks if a WebP version already exists in the cache
3. If no WebP version exists, it generates one using Sharp with a quality setting of 80%
4. The WebP version is placed in the `webp_cache` directory with the same relative path as the original
5. If the original image is modified, the WebP version will be regenerated on the next server start

### Benefits

- Improves performance by pre-generating optimized WebP artifacts
- Reduces bandwidth usage by serving smaller WebP files to compatible browsers
- Non-blocking implementation ensures server startup is not delayed
- Keeps original dataset folders clean and uncluttered

## Image Utilities

The `image-utils.js` module provides utility functions for image processing and serving.

### Features

- `getOptimalImagePath`: Checks if a WebP version of an image exists in the cache and returns the appropriate path based on browser support

### How It Works

1. When a request for an image is received, the server checks if the browser supports WebP (via the Accept header)
2. If WebP is supported and a WebP version of the requested image exists in the cache, the server returns the WebP version
3. Otherwise, it returns the original image

This approach ensures that browsers that support WebP receive the optimized version, while other browsers receive the original format. 