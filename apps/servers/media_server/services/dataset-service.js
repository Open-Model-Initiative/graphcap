// SPDX-License-Identifier: Apache-2.0
/**
 * Dataset service for the Graphcap Media Server
 * 
 * This module provides functions to manage datasets and their images.
 * 
 * @module services/dataset-service
 */

const path = require('node:path');
const fs = require('node:fs');
const { glob } = require('glob');
const { logInfo, logError } = require('../utils/logger');
const { 
  securePath, 
  validateFilename, 
  getBasename, 
  getDirname, 
} = require('../utils/path-utils');
const { WORKSPACE_PATH, DATASETS_BASE } = require('../config');

/**
 * Maps image files to structured image objects
 * 
 * @param {Array<string>} imageFiles - Array of image file paths
 * @returns {Array<Object>} Array of image objects
 */
function mapImagesToObjects(imageFiles) {
  return imageFiles.map(file => {
    const relativePath = file.replace(WORKSPACE_PATH, '');
    return {
      path: relativePath,
      name: getBasename(file),
      directory: getDirname(relativePath),
      url: `/api/images/view${relativePath}`
    };
  });
}

/**
 * Processes images found directly in the datasets folder
 * 
 * @param {string} datasetsPath - Path to the datasets folder
 * @returns {Promise<Array<Object>>} Array of dataset objects
 */
async function processRootImages(datasetsPath) {
  const imageFiles = await glob(`${datasetsPath}/*.{jpg,jpeg,png,gif,webp,svg}`, { nodir: true });
  
  if (imageFiles.length === 0) {
    logInfo('No images found directly in datasets folder');
    return [];
  }
  
  logInfo(`Found ${imageFiles.length} images directly in datasets folder`);
  const images = mapImagesToObjects(imageFiles);
  
  return [{ 
    name: 'default', 
    images 
  }];
}

/**
 * Processes a single local dataset subdirectory
 * 
 * @param {string} subdir - Subdirectory name
 * @param {Array<Object>} datasets - Array to add dataset objects to
 * @returns {Promise<void>}
 */
async function processLocalSubdirectory(subdir, datasets) {
  // Validate the subdirectory name
  const subdirNameResult = validateFilename(subdir);
  if (!subdirNameResult.isValid) {
    logError('Invalid subdirectory name', { subdir, error: subdirNameResult.error });
    return;
  }
  
  const subdirPathResult = securePath(`datasets/local/${subdirNameResult.sanitized}`, WORKSPACE_PATH, { mustExist: false });
  if (!subdirPathResult.isValid) {
    logError('Invalid subdirectory path', { subdir, error: subdirPathResult.error });
    return;
  }
  
  logInfo(`Scanning local dataset: ${subdirPathResult.path}`);
  
  // Find all image files in this directory and all subdirectories
  const imageFiles = await glob(`${subdirPathResult.path}/**/*.{jpg,jpeg,png,gif,webp,svg}`, { nodir: true });
  
  const datasetObj = {
    name: subdir,
    images: imageFiles.length > 0 ? mapImagesToObjects(imageFiles) : []
  };
  
  if (imageFiles.length > 0) {
    logInfo(`Found ${imageFiles.length} images in dataset: ${subdir}`);
  } else {
    logInfo(`No images found in dataset: ${subdir}`);
  }
  
  datasets.push(datasetObj);
}

/**
 * Processes the local directory and its subdirectories
 * 
 * @param {Array<Object>} datasets - Array to add dataset objects to
 * @returns {Promise<void>}
 */
async function processLocalDirectory(datasets) {
  const localDirResult = securePath('datasets/local', WORKSPACE_PATH, { mustExist: false });
  if (!localDirResult.isValid) {
    return;
  }
  
  const localDir = localDirResult.path;
  if (!fs.existsSync(localDir)) {
    return;
  }
  
  logInfo(`Scanning local directory: ${localDir}`);
  
  // Get all subdirectories in local
  const localSubdirs = fs.readdirSync(localDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  // Process each subdirectory as a dataset
  for (const subdir of localSubdirs) {
    await processLocalSubdirectory(subdir, datasets);
  }
}

/**
 * Processes a regular dataset directory
 * 
 * @param {string} dir - Directory name
 * @param {Array<Object>} datasets - Array to add dataset objects to
 * @returns {Promise<void>}
 */
async function processRegularDirectory(dir, datasets) {
  const dirPathResult = securePath(`datasets/${dir}`, WORKSPACE_PATH, { mustExist: false });
  if (!dirPathResult.isValid) {
    logError('Invalid directory path', { dir, error: dirPathResult.error });
    return;
  }
  
  logInfo(`Scanning dataset: ${dirPathResult.path}`);
  
  // Find all image files in this directory and all subdirectories
  const imageFiles = await glob(`${dirPathResult.path}/**/*.{jpg,jpeg,png,gif,webp,svg}`, { nodir: true });
  
  if (imageFiles.length > 0) {
    logInfo(`Found ${imageFiles.length} images in dataset: ${dir}`);
  } else {
    logInfo(`No images found in dataset: ${dir}`);
  }
  
  const images = imageFiles.length > 0 ? mapImagesToObjects(imageFiles) : [];
  
  datasets.push({
    name: dir,
    images
  });
}

/**
 * List all images in the datasets directory
 * 
 * @returns {Promise<Array>} Array of dataset objects with images
 */
async function listDatasetImages() {
  try {
    // Validate the datasets path
    const pathResult = securePath('datasets', WORKSPACE_PATH, { mustExist: false });
    if (!pathResult.isValid) {
      logError('Invalid datasets path', { error: pathResult.error });
      throw new Error(pathResult.error);
    }
    
    const datasetsPath = pathResult.path;
    logInfo(`Listing datasets from: ${datasetsPath}`);
    
    // Validate the datasets directory exists
    if (!fs.existsSync(datasetsPath)) {
      logError('Datasets directory not found', { datasetsPath });
      throw new Error('Datasets directory not found');
    }
    
    // List all directories in the datasets folder
    const directories = fs.readdirSync(datasetsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    logInfo(`Found ${directories.length} dataset directories`, { directories });
    
    // Initialize datasets array
    const datasets = [];
    
    // Check if there are images directly in the datasets folder
    const rootDatasets = await processRootImages(datasetsPath);
    if (rootDatasets.length > 0) {
      datasets.push(...rootDatasets);
    }
    
    // If no directories found, return just the root datasets
    if (directories.length === 0) {
      return datasets;
    }
    
    // Process each directory to find images
    for (const dir of directories) {
      // Skip hidden directories except local
      if (dir.startsWith('.') && dir !== 'local') {
        continue;
      }
      
      // Process directory based on type
      if (dir === 'local') {
        await processLocalDirectory(datasets);
      } else {
        await processRegularDirectory(dir, datasets);
      }
    }
    
    return datasets;
  } catch (error) {
    logError('Error listing dataset images', error);
    throw error;
  }
}

/**
 * Create a new dataset
 * 
 * @param {string} name - Name of the dataset
 * @returns {Promise<Object>} Created dataset information
 */
async function createDataset(name) {
  try {
    // Validate dataset name
    if (!name || typeof name !== 'string') {
      throw new Error('Dataset name is required');
    }
    
    // Sanitize dataset name
    const nameResult = validateFilename(name);
    if (!nameResult.isValid) {
      throw new Error(`Invalid dataset name: ${nameResult.error}`);
    }
    
    const sanitizedName = nameResult.sanitized;
    
    // Create the dataset path
    const datasetPathResult = securePath(`datasets/local/${sanitizedName}`, WORKSPACE_PATH, { createIfNotExist: true });
    
    if (!datasetPathResult.isValid) {
      throw new Error(`Failed to create dataset path: ${datasetPathResult.error}`);
    }
    
    logInfo(`Dataset created: ${sanitizedName} at ${datasetPathResult.path}`);
    
    return {
      success: true,
      name: sanitizedName,
      path: datasetPathResult.relativePath,
      images: []
    };
  } catch (error) {
    logError('Error creating dataset', error);
    throw error;
  }
}

/**
 * Add an image to a dataset
 * 
 * @param {string} imagePath - Path to the image
 * @param {string} datasetName - Name of the dataset
 * @returns {Promise<Object>} Added image information
 */
async function addImageToDataset(imagePath, datasetName) {
  try {
    // Validate image path
    const imagePathResult = securePath(imagePath, WORKSPACE_PATH, { mustExist: true });
    if (!imagePathResult.isValid) {
      throw new Error(`Invalid image path: ${imagePathResult.error}`);
    }
    
    // Validate dataset name
    const datasetNameResult = validateFilename(datasetName);
    if (!datasetNameResult.isValid) {
      throw new Error(`Invalid dataset name: ${datasetNameResult.error}`);
    }
    
    const sanitizedDatasetName = datasetNameResult.sanitized;
    
    // Check if the dataset exists
    const datasetPathResult = securePath(`datasets/local/${sanitizedDatasetName}`, WORKSPACE_PATH, { mustExist: false });
    if (!datasetPathResult.isValid) {
      throw new Error(`Invalid dataset path: ${datasetPathResult.error}`);
    }
    
    if (!fs.existsSync(datasetPathResult.path)) {
      throw new Error(`Dataset not found: ${sanitizedDatasetName}`);
    }
    
    // Get the image name
    const imageName = getBasename(imagePathResult.path);
    
    // Create the new image path
    const newImagePathResult = securePath(`datasets/local/${sanitizedDatasetName}/${imageName}`, WORKSPACE_PATH, { mustExist: false });
    if (!newImagePathResult.isValid) {
      throw new Error(`Invalid new image path: ${newImagePathResult.error}`);
    }
    
    // Check if the image already exists in the dataset
    if (fs.existsSync(newImagePathResult.path)) {
      throw new Error(`Image already exists in dataset: ${imageName}`);
    }
    
    // Copy the image to the dataset
    fs.copyFileSync(imagePathResult.path, newImagePathResult.path);
    
    logInfo(`Image added to dataset: ${imageName} to ${sanitizedDatasetName}`);
    
    return {
      success: true,
      name: imageName,
      path: newImagePathResult.relativePath,
      url: `/api/images/view${newImagePathResult.relativePath}`
    };
  } catch (error) {
    logError('Error adding image to dataset', error);
    throw error;
  }
}

/**
 * Delete a dataset
 * 
 * @param {string} name - Name of the dataset to delete
 * @returns {Promise<Object>} Success status and message
 */
async function deleteDataset(name) {
  try {
    // Validate dataset name
    if (!name || typeof name !== 'string') {
      throw new Error('Dataset name is required');
    }
    
    // Sanitize dataset name
    const nameResult = validateFilename(name);
    if (!nameResult.isValid) {
      throw new Error(`Invalid dataset name: ${nameResult.error}`);
    }
    
    const sanitizedName = nameResult.sanitized;
    
    // Get the dataset path
    const datasetPathResult = securePath(`datasets/local/${sanitizedName}`, WORKSPACE_PATH, { mustExist: true });
    
    if (!datasetPathResult.isValid) {
      throw new Error(`Invalid dataset path: ${datasetPathResult.error}`);
    }
    
    // Check if the dataset exists
    if (!fs.existsSync(datasetPathResult.path)) {
      throw new Error(`Dataset not found: ${sanitizedName}`);
    }
    
    // Delete the dataset directory and all its contents
    fs.rmSync(datasetPathResult.path, { recursive: true, force: true });
    
    logInfo(`Dataset deleted: ${sanitizedName} at ${datasetPathResult.path}`);
    
    return {
      success: true,
      message: `Dataset "${sanitizedName}" deleted successfully`
    };
  } catch (error) {
    logError('Error deleting dataset', error);
    throw error;
  }
}

/**
 * Deletes a specific image file from a dataset directory.
 *
 * @param {string} datasetName - The name of the dataset.
 * @param {string} imageName - The name of the image file to delete.
 * @returns {Promise<Object>} A promise resolving to an object indicating success or failure.
 * @throws {Error} If the dataset or image doesn't exist, or if deletion fails.
 */
async function deleteDatasetImage(datasetName, imageName) {
  logInfo('Attempting to delete image from dataset', { datasetName, imageName });

  // 1. Construct and validate the dataset directory path
  const datasetDirPathString = `datasets/local/${datasetName}`;
  const datasetDirResult = securePath(datasetDirPathString, WORKSPACE_PATH);

  if (!datasetDirResult.isValid || typeof datasetDirResult.path !== 'string' || datasetDirResult.path.length === 0) {
    logError('Invalid dataset directory path for deletion', { datasetName, error: datasetDirResult.error });
    throw new Error(`Dataset directory path could not be resolved for: ${datasetName}`);
  }
  const datasetDirPath = datasetDirResult.path;

  // Verify the dataset directory exists
  try {
    await fs.promises.access(datasetDirPath, fs.constants.F_OK);
  } catch (dirError) {
    logError('Dataset directory access error during image deletion', { datasetDirPath, error: dirError.message });
    throw new Error(`Dataset not found or inaccessible: ${datasetName}`);
  }

  // 2. Construct and validate the image file path
  const imagePathResult = securePath(imageName, datasetDirPath);

  if (!imagePathResult.isValid || typeof imagePathResult.path !== 'string' || imagePathResult.path.length === 0) {
    logError('Invalid image path for deletion', { datasetName, imageName, error: imagePathResult.error });
    throw new Error(`Image path could not be resolved for: ${imageName}`);
  }
  const imagePath = imagePathResult.path;

  // 3. Check file existence and delete
  try {
    await fs.promises.access(imagePath, fs.constants.F_OK); // Check if file exists first
    logInfo('Found image file, proceeding with deletion', { imagePath });
    await fs.promises.unlink(imagePath);
    logInfo('Successfully deleted image file', { imagePath });
    return { success: true, message: `Image "${imageName}" deleted successfully from dataset "${datasetName}".` };
  } catch (deleteError) {
    // Handle specific errors
    if (deleteError.code === 'ENOENT') {
      logError('Image file not found during deletion attempt', { imagePath, error: deleteError.message });
      throw new Error(`Image not found: ${imageName}`);
    }
    if (deleteError.code === 'EPERM' || deleteError.code === 'EACCES') {
      logError('Permission error during image deletion', { imagePath, error: deleteError.message });
      throw new Error(`Permission denied to delete image: ${imageName}`);
    }
    logError('Failed to delete image file due to unexpected error', { imagePath, error: deleteError.message });
    throw new Error(`Failed to delete image "${imageName}": ${deleteError.message}`);
  }
}

module.exports = {
  listDatasetImages,
  createDataset,
  addImageToDataset,
  deleteDataset,
  deleteDatasetImage
}; 