// SPDX-License-Identifier: Apache-2.0
/**
 * Caption service for the Graphcap Media Server
 * 
 * This module provides functions to load and process image captions.
 * 
 * @module services/caption-service
 */

const path = require('path');
const fs = require('fs');
const readline = require('readline');
const { logInfo, logError } = require('../utils/logger');
const { validatePath } = require('../utils/path-validator');
const { WORKSPACE_PATH } = require('../config');

/**
 * Finds and loads captions for an image from analysis folders
 * 
 * @param {string} imagePath - Path to the image (relative to workspace)
 * @returns {Promise<Object>} Object containing captions from different perspectives
 */
async function loadImageCaptions(imagePath) {
  try {
    // Normalize the image path to ensure it works with or without the /workspace prefix
    // If the path doesn't start with /workspace, add it for internal processing
    const normalizedImagePath = imagePath.startsWith('/workspace') 
      ? imagePath 
      : path.join('/workspace', imagePath.startsWith('/') ? imagePath.substring(1) : imagePath);
    
    logInfo(`Original image path: ${imagePath}`);
    logInfo(`Normalized image path: ${normalizedImagePath}`);
    
    // Extract the filename from the path
    const filename = path.basename(normalizedImagePath);
    logInfo(`Loading captions for image: ${filename} (from path: ${normalizedImagePath})`);
    
    // Initialize results object
    const results = {
      image: {
        path: imagePath, // Keep the original path for the response
        name: filename,
        url: `/api/images/view${imagePath}`
      },
      perspectives: {},
      metadata: {
        captioned_at: null,
        provider: null,
        model: null
      }
    };
    
    // Find all analysis folders in the same directory as the image
    const imageDir = path.dirname(normalizedImagePath);
    const analysisPath = path.join(imageDir, 'analysis');
    logInfo(`Looking for analysis folder at: ${analysisPath}`);
    
    // Check if analysis folder exists directly (without validation)
    if (!fs.existsSync(analysisPath)) {
      logInfo(`No analysis folder found at ${analysisPath}`);
      
      // Try with the WORKSPACE_PATH prefix
      const workspaceAnalysisPath = path.join(WORKSPACE_PATH, 'datasets', 'os_img', 'analysis');
      logInfo(`Trying alternative analysis path: ${workspaceAnalysisPath}`);
      
      if (!fs.existsSync(workspaceAnalysisPath)) {
        logInfo(`No analysis folder found at alternative path either`);
        return results;
      }
      
      // Use the alternative path
      logInfo(`Using alternative analysis path: ${workspaceAnalysisPath}`);
      
      // Find all batch folders
      const batchFolders = fs.readdirSync(workspaceAnalysisPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('batch_'))
        .map(dirent => dirent.name);
      
      logInfo(`Found ${batchFolders.length} batch folders in ${workspaceAnalysisPath}: ${batchFolders.join(', ')}`);
      
      // Process each batch folder
      for (const batchFolder of batchFolders) {
        await processBatchFolder(workspaceAnalysisPath, batchFolder, filename, results);
      }
      
      logInfo(`Finished loading captions for ${filename}`, { 
        perspectiveCount: Object.keys(results.perspectives).length,
        perspectives: Object.keys(results.perspectives)
      });
      
      return results;
    }
    
    // Continue with the original code for the case where the analysis folder exists at the expected path
    // Validate the analysis path
    const pathValidation = validatePath(analysisPath, WORKSPACE_PATH);
    if (!pathValidation.isValid) {
      logError('Invalid analysis path', { analysisPath, error: pathValidation.error });
      return results;
    }
    
    const fullAnalysisPath = pathValidation.path;
    logInfo(`Full analysis path: ${fullAnalysisPath}`);
    
    // Find all batch folders
    const batchFolders = fs.readdirSync(fullAnalysisPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('batch_'))
      .map(dirent => dirent.name);
    
    logInfo(`Found ${batchFolders.length} batch folders in ${fullAnalysisPath}: ${batchFolders.join(', ')}`);
    
    // Process each batch folder
    for (const batchFolder of batchFolders) {
      await processBatchFolder(fullAnalysisPath, batchFolder, filename, results);
    }
    
    logInfo(`Finished loading captions for ${filename}`, { 
      perspectiveCount: Object.keys(results.perspectives).length,
      perspectives: Object.keys(results.perspectives)
    });
    
    return results;
  } catch (error) {
    logError('Error loading image captions', error);
    return {
      image: {
        path: imagePath,
        name: path.basename(imagePath),
        url: `/api/images/view${imagePath}`
      },
      perspectives: {},
      metadata: {
        captioned_at: null,
        provider: null,
        model: null
      }
    };
  }
}

/**
 * Process a batch folder to find captions for an image
 * 
 * @param {string} analysisPath - Path to the analysis folder
 * @param {string} batchFolder - Name of the batch folder
 * @param {string} filename - Name of the image file
 * @param {Object} results - Results object to update
 */
async function processBatchFolder(analysisPath, batchFolder, filename, results) {
  // Extract perspective type from folder name (remove 'batch_' prefix)
  const perspectiveType = batchFolder.replace('batch_', '');
  logInfo(`Processing perspective: ${perspectiveType}`);
  
  // Path to the captions.jsonl file
  const captionsPath = path.join(analysisPath, batchFolder, 'captions.jsonl');
  
  // Check if captions file exists
  if (!fs.existsSync(captionsPath)) {
    logInfo(`No captions file found in ${batchFolder}`);
    return;
  }
  
  logInfo(`Found captions file: ${captionsPath}`);
  
  // Read job_info.json for metadata
  const jobInfoPath = path.join(analysisPath, batchFolder, 'job_info.json');
  if (fs.existsSync(jobInfoPath)) {
    try {
      const jobInfo = JSON.parse(fs.readFileSync(jobInfoPath, 'utf8'));
      logInfo(`Read job info for ${batchFolder}`, { 
        completed_at: jobInfo.completed_at,
        provider: jobInfo.provider,
        model: jobInfo.model
      });
      
      // Update metadata if not already set
      if (!results.metadata.captioned_at && jobInfo.completed_at) {
        results.metadata.captioned_at = jobInfo.completed_at;
      }
      
      if (!results.metadata.provider && jobInfo.provider) {
        results.metadata.provider = jobInfo.provider;
      }
      
      if (!results.metadata.model && jobInfo.model) {
        results.metadata.model = jobInfo.model;
      }
    } catch (error) {
      logError(`Error parsing job info for ${batchFolder}`, error);
    }
  }
  
  // Read the captions file line by line to find the caption for this image
  const fileStream = fs.createReadStream(captionsPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  let captionFound = false;
  
  // Process each line
  for await (const line of rl) {
    try {
      const captionData = JSON.parse(line);
      
      // Check if this caption is for our image
      // The filename in the caption might be relative to a different base path
      // So we check if the basename matches
      const captionFilename = path.basename(captionData.filename);
      logInfo(`Comparing caption filename: ${captionFilename} with image filename: ${filename}`);
      
      if (captionFilename === filename) {
        // Found a caption for this image
        logInfo(`Found caption for ${filename} in ${perspectiveType}`);
        results.perspectives[perspectiveType] = {
          config_name: captionData.config_name,
          version: captionData.version,
          model: captionData.model,
          provider: captionData.provider,
          content: captionData.parsed
        };
        
        captionFound = true;
        // Break the loop since we found the caption for this image
        break;
      }
    } catch (error) {
      logError(`Error parsing caption line in ${batchFolder}`, error);
    }
  }
  
  if (!captionFound) {
    logInfo(`No caption found for ${filename} in ${perspectiveType}`);
  }
}

module.exports = {
  loadImageCaptions
}; 