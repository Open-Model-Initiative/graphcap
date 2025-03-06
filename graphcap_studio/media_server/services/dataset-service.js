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
const { validatePath } = require('../utils/path-validator');
const { WORKSPACE_PATH } = require('../config');

/**
 * List all images in the datasets directory
 * 
 * @returns {Promise<Array>} Array of dataset objects with images
 */
async function listDatasetImages() {
  try {
    // Validate the datasets path
    const pathValidation = validatePath('datasets');
    if (!pathValidation.isValid) {
      logError('Invalid datasets path', { error: pathValidation.error });
      throw new Error(pathValidation.error);
    }
    
    const datasetsPath = pathValidation.path;
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
            name: path.basename(file),
            directory: path.dirname(relativePath),
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
        const localDirValidation = validatePath('datasets/.local');
        if (localDirValidation.isValid) {
          const localDir = localDirValidation.path;
          if (fs.existsSync(localDir)) {
            logInfo(`Scanning .local directory: ${localDir}`);
            
            // Get all subdirectories in .local
            const localSubdirs = fs.readdirSync(localDir, { withFileTypes: true })
              .filter(dirent => dirent.isDirectory())
              .map(dirent => dirent.name);
            
            // Process each subdirectory as a dataset
            for (const subdir of localSubdirs) {
              const subdirPath = path.join(localDir, subdir);
              logInfo(`Scanning local dataset: ${subdirPath}`);
              
              // Find all image files in this directory
              const imageFiles = await glob(`${subdirPath}/**/*.{jpg,jpeg,png,gif,webp,svg}`, { 
                nodir: true,
                ignore: ['**/node_modules/**', '**/.git/**'] 
              });
              
              logInfo(`Found ${imageFiles.length} images in local dataset ${subdir}`);
              
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
                  name: subdir,
                  images
                });
              }
            }
          }
        }
        continue; // Skip the rest of the loop for .local
      }
      
      // Process regular dataset directory
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
    
    logInfo(`Returning ${datasets.length} datasets`);
    return datasets;
  } catch (error) {
    logError('Error listing dataset images', error);
    throw error;
  }
}

/**
 * Create a new dataset
 * 
 * @param {string} name - Name of the dataset to create
 * @returns {Promise<Object>} Success status and dataset path
 */
async function createDataset(name) {
  try {
    if (!name) {
      throw new Error('Dataset name is required');
    }
    
    // Validate dataset name (alphanumeric, underscores, and hyphens only)
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      throw new Error('Dataset name can only contain letters, numbers, underscores, and hyphens');
    }
    
    // Create dataset directory in the .local subdirectory
    const datasetPath = path.join(WORKSPACE_PATH, 'datasets', '.local', name);
    
    // Check if dataset already exists
    if (fs.existsSync(datasetPath)) {
      throw new Error('Dataset already exists');
    }
    
    // Create the directory
    fs.mkdirSync(datasetPath, { recursive: true });
    
    logInfo(`Created dataset: ${name}`, { path: datasetPath });
    
    return {
      success: true,
      path: `/datasets/.local/${name}`
    };
  } catch (error) {
    logError('Error creating dataset', error);
    throw error;
  }
}

/**
 * Add an existing image to a dataset
 * 
 * @param {string} imagePath - Path of the image to add
 * @param {string} datasetName - Name of the dataset to add the image to
 * @returns {Promise<Object>} Success status and new image path
 */
async function addImageToDataset(imagePath, datasetName) {
  try {
    if (!imagePath || !datasetName) {
      throw new Error('Image path and dataset name are required');
    }
    
    // Validate dataset name (alphanumeric, underscores, and hyphens only)
    if (!/^[a-zA-Z0-9_-]+$/.test(datasetName)) {
      throw new Error('Dataset name can only contain letters, numbers, underscores, and hyphens');
    }
    
    // Validate the image path
    const fullImagePath = path.join(WORKSPACE_PATH, imagePath.replace(/^\//, ''));
    const pathValidation = validatePath(fullImagePath);
    if (!pathValidation.isValid) {
      throw new Error('Invalid image path');
    }
    
    // Check if the image exists
    if (!fs.existsSync(fullImagePath)) {
      throw new Error('Image not found');
    }
    
    // Check if the dataset exists
    const datasetPath = path.join(WORKSPACE_PATH, 'datasets', '.local', datasetName);
    if (!fs.existsSync(datasetPath)) {
      throw new Error('Dataset not found');
    }
    
    // Get the image filename
    const imageName = path.basename(fullImagePath);
    
    // Create the new path for the image in the dataset
    const newImagePath = path.join(datasetPath, imageName);
    
    // Check if the image already exists in the dataset
    if (fs.existsSync(newImagePath)) {
      throw new Error('Image already exists in the dataset');
    }
    
    // Copy the image to the dataset
    fs.copyFileSync(fullImagePath, newImagePath);
    
    // Get the relative path for the response
    const relativePath = `/datasets/.local/${datasetName}/${imageName}`;
    
    logInfo(`Image added to dataset: ${datasetName}`, {
      originalPath: fullImagePath,
      newPath: newImagePath
    });
    
    return {
      success: true,
      path: relativePath,
      url: `/api/images/view${relativePath}`
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