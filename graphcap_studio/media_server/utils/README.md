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

## Backward Compatibility

The `path-validator.js` module is maintained for backward compatibility but uses the new `securePath` function internally. It is recommended to use the new `path-utils.js` module for new code.

## Best Practices

1. **Always validate user input**: Use `securePath` for all user-provided paths.
2. **Validate filenames**: Use `validateFilename` for all user-provided filenames.
3. **Use relative paths**: Always use paths relative to the workspace root.
4. **Check return values**: Always check the `isValid` property of the result objects.
5. **Handle errors gracefully**: Provide meaningful error messages to users. 