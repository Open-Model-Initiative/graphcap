// SPDX-License-Identifier: Apache-2.0
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const multer = require('multer');
const { glob } = require('glob');
const morgan = require('morgan');

/**
 * Graphcap Media Server
 * 
 * This server provides media processing capabilities for the Graphcap Studio application.
 * It currently supports image processing (viewing, cropping, rotating, etc.) and will be
 * extended to support video and other media types in the future.
 * 
 * @module MediaServer
 */

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 32400;
const WORKSPACE_PATH = process.env.WORKSPACE_PATH || '/workspace';

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Create upload directory if it doesn't exist
const uploadDir = path.join(WORKSPACE_PATH, 'processed');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Create thumbnails directory if it doesn't exist
const thumbnailsDir = path.join(WORKSPACE_PATH, 'thumbnails');
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Enhanced logging function
function logInfo(message, data = null) {
  const logMessage = data 
    ? `${message}: ${JSON.stringify(data, null, 2)}`
    : message;
  console.log(`[INFO] ${new Date().toISOString()} - ${logMessage}`);
}

// Enhanced error logging function
function logError(message, error) {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}:`, error);
}

/**
 * Validates and sanitizes a file path to prevent path traversal attacks
 * 
 * @param {string} userPath - The user-provided path
 * @param {string} basePath - The base path that the final path must be within
 * @returns {Object} Object containing the validated path and success status
 */
function validatePath(userPath, basePath = WORKSPACE_PATH) {
  try {
    // Normalize the path to resolve any '..' or '.' segments
    const normalizedPath = path.normalize(userPath).replace(/^(\.\.(\/|\\|$))+/, '');
    
    // Construct the full path
    const fullPath = path.join(basePath, normalizedPath);
    
    // Ensure the path is within the allowed base path
    if (!fullPath.startsWith(path.resolve(basePath))) {
      return { 
        isValid: false, 
        path: null, 
        error: 'Access denied: Path outside of allowed directory' 
      };
    }
    
    return { isValid: true, path: fullPath, error: null };
  } catch (error) {
    logError('Path validation error', error);
    return { isValid: false, path: null, error: 'Invalid path' };
  }
}

/**
 * Generates a thumbnail for an image
 * 
 * @param {string} imagePath - Path to the original image
 * @param {number} width - Desired width of the thumbnail
 * @param {number} height - Desired height of the thumbnail
 * @returns {Promise<string>} Path to the generated thumbnail
 */
async function generateThumbnail(imagePath, width, height) {
  try {
    // Create a hash of the path and dimensions for the thumbnail filename
    const imagePathHash = Buffer.from(imagePath).toString('base64').replace(/[/+=]/g, '_');
    const thumbnailFilename = `${imagePathHash}_${width}x${height}.webp`;
    const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename);
    
    // Check if thumbnail already exists
    if (fs.existsSync(thumbnailPath)) {
      logInfo(`Using existing thumbnail: ${thumbnailPath}`);
      return thumbnailPath;
    }
    
    // Generate the thumbnail
    logInfo(`Generating thumbnail for ${imagePath} at ${width}x${height}`);
    await sharp(imagePath)
      .resize({
        width: parseInt(width),
        height: parseInt(height),
        fit: 'cover',
        position: 'centre'
      })
      .webp({ quality: 80 })
      .toFile(thumbnailPath);
    
    return thumbnailPath;
  } catch (error) {
    logError(`Failed to generate thumbnail for ${imagePath}`, error);
    throw error;
  }
}

/**
 * Health check endpoint
 * 
 * @returns {Object} Status object
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

/**
 * List all images in the workspace
 * 
 * @param {string} directory - Optional directory path
 * @returns {Object} List of images
 */
app.get('/api/images', async (req, res) => {
  try {
    const directory = req.query.directory || '';
    
    // Validate the path
    const pathValidation = validatePath(directory);
    if (!pathValidation.isValid) {
      logError('Invalid directory path', { directory, error: pathValidation.error });
      return res.status(403).json({ error: pathValidation.error });
    }
    
    const fullPath = pathValidation.path;
    logInfo(`Listing images in directory: ${directory}`, { fullPath });
    
    // Find all image files
    const imageFiles = await glob(`${fullPath}/**/*.{jpg,jpeg,png,gif,webp,svg}`, { nodir: true });
    
    logInfo(`Found ${imageFiles.length} images`);
    
    // Format the response
    const images = imageFiles.map(file => {
      const relativePath = file.replace(WORKSPACE_PATH, '');
      return {
        path: relativePath,
        name: path.basename(file),
        directory: path.dirname(relativePath),
        url: `/api/images/view${relativePath}`
      };
    });
    
    res.json({ images });
  } catch (error) {
    logError('Error listing images', error);
    res.status(500).json({ error: 'Failed to list images' });
  }
});

/**
 * List all images in the datasets directory recursively
 * 
 * @returns {Object} List of images grouped by dataset
 */
app.get('/api/datasets/images', async (req, res) => {
  try {
    // Validate the datasets path
    const pathValidation = validatePath('datasets');
    if (!pathValidation.isValid) {
      logError('Invalid datasets path', { error: pathValidation.error });
      return res.status(403).json({ error: pathValidation.error });
    }
    
    const datasetsPath = pathValidation.path;
    logInfo(`Listing datasets from: ${datasetsPath}`);
    
    // Validate the datasets directory exists
    if (!fs.existsSync(datasetsPath)) {
      logError('Datasets directory not found', { datasetsPath });
      return res.status(404).json({ error: 'Datasets directory not found' });
    }
    
    // List all directories in the datasets folder
    const directories = fs.readdirSync(datasetsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    logInfo(`Found ${directories.length} dataset directories`, { directories });
    
    // If no directories found, check if there are images directly in the datasets folder
    if (directories.length === 0) {
      const imageFiles = await glob(`${datasetsPath}/*.{jpg,jpeg,png,gif,webp,svg}`, { nodir: true });
      
      if (imageFiles.length > 0) {
        logInfo(`Found ${imageFiles.length} images directly in datasets folder`);
        
        const images = imageFiles.map(file => {
          const relativePath = file.replace(WORKSPACE_PATH, '');
          return {
            path: relativePath,
            name: path.basename(file),
            directory: path.dirname(relativePath),
            url: `/api/images/view${relativePath}`
          };
        });
        
        res.json({ 
          datasets: [{ 
            name: 'default', 
            images 
          }] 
        });
        return;
      }
    }
    
    // Process each directory to find images
    const datasets = [];
    
    for (const dir of directories) {
      // Skip .local and other hidden directories
      if (dir.startsWith('.')) {
        continue;
      }
      
      // Validate the dataset directory path
      const datasetPathValidation = validatePath(`datasets/${dir}`);
      if (!datasetPathValidation.isValid) {
        logError(`Invalid dataset directory: ${dir}`, { error: datasetPathValidation.error });
        continue;
      }
      
      const dirPath = datasetPathValidation.path;
      logInfo(`Scanning directory: ${dirPath}`);
      
      // Find all image files in this directory
      const imageFiles = await glob(`${dirPath}/**/*.{jpg,jpeg,png,gif,webp,svg}`, { 
        nodir: true,
        ignore: ['**/node_modules/**', '**/.git/**'] 
      });
      
      logInfo(`Found ${imageFiles.length} images in ${dir}`);
      
      if (imageFiles.length > 0) {
        const images = imageFiles.map(file => {
          const relativePath = file.replace(WORKSPACE_PATH, '');
          return {
            path: relativePath,
            name: path.basename(file),
            directory: path.dirname(relativePath),
            url: `/api/images/view${relativePath}`
          };
        });
        
        datasets.push({
          name: dir,
          images
        });
      }
    }
    
    // Also check the .local directory if it exists
    const localDirValidation = validatePath('datasets/.local');
    if (localDirValidation.isValid) {
      const localDir = localDirValidation.path;
      if (fs.existsSync(localDir)) {
        logInfo(`Scanning .local directory: ${localDir}`);
        
        const imageFiles = await glob(`${localDir}/**/*.{jpg,jpeg,png,gif,webp,svg}`, { 
          nodir: true,
          ignore: ['**/node_modules/**', '**/.git/**'] 
        });
        
        logInfo(`Found ${imageFiles.length} images in .local`);
        
        if (imageFiles.length > 0) {
          const images = imageFiles.map(file => {
            const relativePath = file.replace(WORKSPACE_PATH, '');
            return {
              path: relativePath,
              name: path.basename(file),
              directory: path.dirname(relativePath),
              url: `/api/images/view${relativePath}`
            };
          });
          
          datasets.push({
            name: '.local',
            images
          });
        }
      }
    }
    
    logInfo(`Returning ${datasets.length} datasets`);
    res.json({ datasets });
  } catch (error) {
    logError('Error listing dataset images', error);
    res.status(500).json({ error: 'Failed to list dataset images' });
  }
});

/**
 * Serve an image
 * 
 * @param {string} imagePath - Path to the image
 * @returns {File} The image file
 */
app.get('/api/images/view/*', async (req, res) => {
  try {
    const imagePath = req.params[0];
    
    // Validate the path
    const pathValidation = validatePath(imagePath);
    if (!pathValidation.isValid) {
      logError('Invalid image path', { imagePath, error: pathValidation.error });
      return res.status(403).json({ error: pathValidation.error });
    }
    
    const fullPath = pathValidation.path;
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      logError('Image not found', { fullPath });
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // Check if thumbnail is requested
    const width = req.query.width;
    const height = req.query.height;
    
    if (width && height) {
      try {
        // Generate thumbnail
        const thumbnailPath = await generateThumbnail(fullPath, width, height);
        logInfo(`Serving thumbnail: ${thumbnailPath}`);
        return res.sendFile(thumbnailPath);
      } catch (error) {
        logError('Error generating thumbnail', error);
        // Fall back to original image if thumbnail generation fails
        logInfo(`Falling back to original image: ${fullPath}`);
        return res.sendFile(fullPath);
      }
    }
    
    // Serve the original file
    logInfo(`Serving image: ${imagePath}`, { fullPath });
    res.sendFile(fullPath);
  } catch (error) {
    logError('Error serving image', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
});

/**
 * Process an image (crop, rotate, etc.)
 * 
 * @param {Object} req.body - Request body
 * @param {string} req.body.imagePath - Path to the image
 * @param {Object} req.body.operations - Operations to perform
 * @param {string} req.body.outputName - Output filename
 * @param {boolean} req.body.overwrite - Whether to overwrite the original file
 * @returns {Object} Processed image information
 */
app.post('/api/images/process', async (req, res) => {
  try {
    const { imagePath, operations, outputName, overwrite } = req.body;
    
    logInfo(`Processing image: ${imagePath}`, { operations, outputName, overwrite });
    
    if (!imagePath) {
      logError('Image path is required', { body: req.body });
      return res.status(400).json({ error: 'Image path is required' });
    }
    
    // Validate the path
    const pathValidation = validatePath(imagePath);
    if (!pathValidation.isValid) {
      logError('Invalid image path', { imagePath, error: pathValidation.error });
      return res.status(403).json({ error: pathValidation.error });
    }
    
    const fullPath = pathValidation.path;
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      logError('Image not found', { fullPath });
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // Initialize Sharp with the input image
    let image = sharp(fullPath);
    
    // Apply operations
    if (operations) {
      // Apply crop if specified
      if (operations.crop) {
        const { left, top, width, height } = operations.crop;
        image = image.extract({ left, top, width, height });
      }
      
      // Apply rotation if specified
      if (operations.rotate) {
        image = image.rotate(operations.rotate);
      }
      
      // Apply resize if specified
      if (operations.resize) {
        const { width, height } = operations.resize;
        image = image.resize(width, height);
      }
      
      // Apply flip if specified
      if (operations.flip) {
        image = image.flip();
      }
      
      // Apply flop if specified
      if (operations.flop) {
        image = image.flop();
      }
    }
    
    // Determine output path
    let outputPath;
    if (overwrite) {
      outputPath = fullPath;
    } else {
      const originalExt = path.extname(fullPath);
      const originalName = path.basename(fullPath, originalExt);
      
      // Sanitize the output filename
      const sanitizedOutputName = outputName 
        ? outputName.replace(/[^a-zA-Z0-9_\-\.]/g, '_') 
        : `${originalName}_edited${originalExt}`;
      
      outputPath = path.join(uploadDir, sanitizedOutputName);
    }
    
    // Save the processed image
    await image.toFile(outputPath);
    
    // Clear thumbnails for this image
    const imagePathHash = Buffer.from(imagePath).toString('base64').replace(/[/+=]/g, '_');
    const thumbnailPattern = path.join(thumbnailsDir, `${imagePathHash}_*`);
    const thumbnailFiles = await glob(thumbnailPattern);
    
    // Delete existing thumbnails
    for (const thumbnailFile of thumbnailFiles) {
      fs.unlinkSync(thumbnailFile);
      logInfo(`Deleted thumbnail: ${thumbnailFile}`);
    }
    
    logInfo(`Image processed successfully: ${outputPath}`);
    
    // Return the path to the processed image
    const relativePath = outputPath.replace(WORKSPACE_PATH, '');
    res.json({
      success: true,
      path: relativePath,
      url: `/api/images/view${relativePath}`
    });
  } catch (error) {
    logError('Error processing image', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

/**
 * Upload an image
 * 
 * @param {File} req.file - The image file to upload
 * @returns {Object} Uploaded image information
 */
app.post('/api/images/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      logError('No image file provided', { body: req.body });
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    logInfo(`Image uploaded: ${req.file.path}`);
    
    const relativePath = req.file.path.replace(WORKSPACE_PATH, '');
    res.json({
      success: true,
      path: relativePath,
      url: `/api/images/view${relativePath}`
    });
  } catch (error) {
    logError('Error uploading image', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Start the server
app.listen(PORT, () => {
  logInfo(`Graphcap Media Server running on port ${PORT}`);
}); 