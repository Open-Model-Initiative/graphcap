// SPDX-License-Identifier: Apache-2.0
/**
 * Dataset service for the Graphcap Media Server
 * 
 * This module provides functions to manage datasets and their images.
 * 
 * @module services/dataset-service
 */

const path = require('path');
const fs = require('fs');
const { glob } = require('glob');
const { logInfo, logError } = require('../utils/logger');
const { 
  securePath, 
  validateFilename, 
  getBasename, 
  getDirname, 
  joinPath,
  ensureDir
} = require('../utils/path-utils');
const { WORKSPACE_PATH } = require('../config');

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
    
    // If no directories found, check if there are images directly in the datasets folder
    if (directories.length === 0) {
      const imageFiles = await glob(`${datasetsPath}/*.{jpg,jpeg,png,gif,webp,svg}`, { nodir: true });
      
      if (imageFiles.length > 0) {
        logInfo(`Found ${imageFiles.length} images directly in datasets folder`);
        
        const images = imageFiles.map(file => {
          const relativePath = file.replace(WORKSPACE_PATH, '');
          return {
            path: relativePath,
            name: getBasename(file),
            directory: getDirname(relativePath),
            url: `/api/images/view${relativePath}`
          };
        });
        
        return [{ 
          name: 'default', 
          images 
        }];
      }
      
      return [];
    }
    
    // Process each directory to find images
    const datasets = [];
    
    for (const dir of directories) {
      // Skip hidden directories except .local
      if (dir.startsWith('.') && dir !== '.local') {
        continue;
      }
      
      // If this is the .local directory, process its subdirectories as individual datasets
      if (dir === '.local') {
        const localDirResult = securePath('datasets/.local', WORKSPACE_PATH, { mustExist: false });
        if (localDirResult.isValid) {
          const localDir = localDirResult.path;
          if (fs.existsSync(localDir)) {
            logInfo(`Scanning .local directory: ${localDir}`);
            
            // Get all subdirectories in .local
            const localSubdirs = fs.readdirSync(localDir, { withFileTypes: true })
              .filter(dirent => dirent.isDirectory())
              .map(dirent => dirent.name);
            
            // Process each subdirectory as a dataset
            for (const subdir of localSubdirs) {
              // Validate the subdirectory name
              const subdirNameResult = validateFilename(subdir);
              if (!subdirNameResult.isValid) {
                logError('Invalid subdirectory name', { subdir, error: subdirNameResult.error });
                continue;
              }
              
              const subdirPathResult = securePath(`datasets/.local/${subdirNameResult.sanitized}`, WORKSPACE_PATH, { mustExist: false });
              if (!subdirPathResult.isValid) {
                logError('Invalid subdirectory path', { subdir, error: subdirPathResult.error });
                continue;
              }
              
              logInfo(`Scanning local dataset: ${subdirPathResult.path}`);
              
              // Find all image files in this directory
              const imageFiles = await glob(`${subdirPathResult.path}/*.{jpg,jpeg,png,gif,webp,svg}`, { nodir: true });
              
              if (imageFiles.length > 0) {
                logInfo(`Found ${imageFiles.length} images in dataset: ${subdir}`);
                
                const images = imageFiles.map(file => {
                  const relativePath = file.replace(WORKSPACE_PATH, '');
                  return {
                    path: relativePath,
                    name: getBasename(file),
                    directory: getDirname(relativePath),
                    url: `/api/images/view${relativePath}`
                  };
                });
                
                datasets.push({
                  name: subdir,
                  images
                });
              } else {
                logInfo(`No images found in dataset: ${subdir}`);
                datasets.push({
                  name: subdir,
                  images: []
                });
              }
            }
          }
        }
      } else {
        // Process regular dataset directory
        const dirPathResult = securePath(`datasets/${dir}`, WORKSPACE_PATH, { mustExist: false });
        if (!dirPathResult.isValid) {
          logError('Invalid directory path', { dir, error: dirPathResult.error });
          continue;
        }
        
        logInfo(`Scanning dataset: ${dirPathResult.path}`);
        
        // Find all image files in this directory
        const imageFiles = await glob(`${dirPathResult.path}/*.{jpg,jpeg,png,gif,webp,svg}`, { nodir: true });
        
        if (imageFiles.length > 0) {
          logInfo(`Found ${imageFiles.length} images in dataset: ${dir}`);
          
          const images = imageFiles.map(file => {
            const relativePath = file.replace(WORKSPACE_PATH, '');
            return {
              path: relativePath,
              name: getBasename(file),
              directory: getDirname(relativePath),
              url: `/api/images/view${relativePath}`
            };
          });
          
          datasets.push({
            name: dir,
            images
          });
        }
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
    const datasetPathResult = securePath(`datasets/.local/${sanitizedName}`, WORKSPACE_PATH, { createIfNotExist: true });
    
    if (!datasetPathResult.isValid) {
      throw new Error(`Failed to create dataset path: ${datasetPathResult.error}`);
    }
    
    logInfo(`Dataset created: ${sanitizedName} at ${datasetPathResult.path}`);
    
    return {
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
    const datasetPathResult = securePath(`datasets/.local/${sanitizedDatasetName}`, WORKSPACE_PATH, { mustExist: false });
    if (!datasetPathResult.isValid) {
      throw new Error(`Invalid dataset path: ${datasetPathResult.error}`);
    }
    
    if (!fs.existsSync(datasetPathResult.path)) {
      throw new Error(`Dataset not found: ${sanitizedDatasetName}`);
    }
    
    // Get the image name
    const imageName = getBasename(imagePathResult.path);
    
    // Create the new image path
    const newImagePathResult = securePath(`datasets/.local/${sanitizedDatasetName}/${imageName}`, WORKSPACE_PATH, { mustExist: false });
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
      name: imageName,
      path: newImagePathResult.relativePath,
      url: `/api/images/view${newImagePathResult.relativePath}`
    };
  } catch (error) {
    logError('Error adding image to dataset', error);
    throw error;
  }
}

module.exports = {
  listDatasetImages,
  createDataset,
  addImageToDataset
}; 