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
const { 
  securePath, 
  getBasename, 
  getDirname, 
  joinPath 
} = require('../utils/path-utils');
const { WORKSPACE_PATH } = require('../config');

/**
 * Finds and loads captions for an image from analysis folders
 * 
 * @param {string} imagePath - Path to the image (relative to workspace)
 * @returns {Promise<Object>} Object containing captions from different perspectives
 */
async function loadImageCaptions(imagePath) {
  try {
    // Normalize and validate the image path
    const imagePathResult = securePath(imagePath, WORKSPACE_PATH, { mustExist: false });
    
    if (!imagePathResult.isValid) {
      logError('Invalid image path', { imagePath, error: imagePathResult.error });
      throw new Error(`Invalid image path: ${imagePathResult.error}`);
    }
    
    // Extract the filename from the path
    const filename = getBasename(imagePathResult.path);
    logInfo(`Loading captions for image: ${filename} (from path: ${imagePathResult.path})`);
    
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
    const imageDir = getDirname(imagePathResult.path);
    const analysisPathResult = securePath(joinPath(imageDir, 'analysis'), WORKSPACE_PATH, { mustExist: false });
    
    logInfo(`Looking for analysis folder at: ${analysisPathResult.path}`);
    
    // Check if analysis folder exists
    if (!fs.existsSync(analysisPathResult.path)) {
      logInfo(`No analysis folder found at ${analysisPathResult.path}`);
      
      // Try with the alternative path
      const altAnalysisPathResult = securePath('datasets/os_img/analysis', WORKSPACE_PATH, { mustExist: false });
      logInfo(`Trying alternative analysis path: ${altAnalysisPathResult.path}`);
      
      if (!fs.existsSync(altAnalysisPathResult.path)) {
        logInfo(`No analysis folder found at alternative path either`);
        return results;
      }
      
      // Use the alternative path
      logInfo(`Using alternative analysis path: ${altAnalysisPathResult.path}`);
      
      // Find all batch folders
      const batchFolders = fs.readdirSync(altAnalysisPathResult.path, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('batch_'))
        .map(dirent => dirent.name);
      
      logInfo(`Found ${batchFolders.length} batch folders in ${altAnalysisPathResult.path}: ${batchFolders.join(', ')}`);
      
      // Process each batch folder
      for (const batchFolder of batchFolders) {
        await processBatchFolder(altAnalysisPathResult.path, batchFolder, filename, results);
      }
      
      logInfo(`Finished loading captions for ${filename}`, { 
        perspectiveCount: Object.keys(results.perspectives).length,
        perspectives: Object.keys(results.perspectives)
      });
      
      return results;
    }
    
    // Continue with the original code for the case where the analysis folder exists at the expected path
    const fullAnalysisPath = analysisPathResult.path;
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
        name: getBasename(imagePath),
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
 * Updates metadata from job info if not already set
 * 
 * @param {Object} results - Results object to update
 * @param {Object} jobInfo - Job info object
 */
function updateMetadataFromJobInfo(results, jobInfo) {
  if (jobInfo.completed_at && !results.metadata.captioned_at) {
    results.metadata.captioned_at = jobInfo.completed_at;
  }
  
  if (jobInfo.provider && !results.metadata.provider) {
    results.metadata.provider = jobInfo.provider;
  }
  
  if (jobInfo.model && !results.metadata.model) {
    results.metadata.model = jobInfo.model;
  }
}

/**
 * Reads and processes job info file
 * 
 * @param {string} jobInfoPath - Path to the job info file
 * @param {string} batchFolder - Name of the batch folder
 * @param {Object} results - Results object to update
 */
function processJobInfo(jobInfoPath, batchFolder, results) {
  if (!fs.existsSync(jobInfoPath)) {
    return;
  }
  
  try {
    const jobInfo = JSON.parse(fs.readFileSync(jobInfoPath, 'utf8'));
    logInfo(`Read job info for ${batchFolder}`, { 
      completed_at: jobInfo.completed_at,
      provider: jobInfo.provider,
      model: jobInfo.model
    });
    
    updateMetadataFromJobInfo(results, jobInfo);
  } catch (error) {
    logError(`Error parsing job info for ${batchFolder}`, error);
  }
}

/**
 * Processes a caption line to check if it matches the target image
 * 
 * @param {Object} captionData - Parsed caption data
 * @param {string} filename - Target image filename
 * @param {string} perspectiveType - Perspective type
 * @param {Object} results - Results object to update
 * @returns {boolean} Whether a caption was found
 */
function processCaptionLine(captionData, filename, perspectiveType, results) {
  // The filename in the caption might be relative to a different base path
  // So we check if the basename matches
  const captionFilename = path.basename(captionData.filename);
  logInfo(`Comparing caption filename: ${captionFilename} with image filename: ${filename}`);
  
  if (captionFilename !== filename) {
    return false;
  }
  
  // Found a caption for this image
  logInfo(`Found caption for ${filename} in ${perspectiveType}`);
  results.perspectives[perspectiveType] = {
    config_name: captionData.config_name,
    version: captionData.version,
    model: captionData.model,
    provider: captionData.provider,
    content: captionData.parsed
  };
  
  return true;
}

/**
 * Reads and processes captions file
 * 
 * @param {string} captionsPath - Path to the captions file
 * @param {string} filename - Target image filename
 * @param {string} perspectiveType - Perspective type
 * @param {string} batchFolder - Name of the batch folder
 * @param {Object} results - Results object to update
 * @returns {Promise<boolean>} Whether a caption was found
 */
async function processCaptionsFile(captionsPath, filename, perspectiveType, batchFolder, results) {
  const fileStream = fs.createReadStream(captionsPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  // Process each line
  for await (const line of rl) {
    try {
      const captionData = JSON.parse(line);
      if (processCaptionLine(captionData, filename, perspectiveType, results)) {
        return true;
      }
    } catch (error) {
      logError(`Error parsing caption line in ${batchFolder}`, error);
    }
  }
  
  return false;
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
  try {
    // Validate batch folder name
    if (!batchFolder || !batchFolder.startsWith('batch_')) {
      logError('Invalid batch folder name', { batchFolder });
      return;
    }
    
    // Extract perspective type from folder name (remove 'batch_' prefix)
    const perspectiveType = batchFolder.replace('batch_', '');
    logInfo(`Processing perspective: ${perspectiveType}`);
    
    // Path to the captions.jsonl file
    const captionsPathResult = securePath(joinPath(analysisPath, batchFolder, 'captions.jsonl'), WORKSPACE_PATH, { mustExist: false });
    
    // Check if captions file exists
    if (!fs.existsSync(captionsPathResult.path)) {
      logInfo(`No captions file found in ${batchFolder}`);
      return;
    }
    
    logInfo(`Found captions file: ${captionsPathResult.path}`);
    
    // Read job_info.json for metadata
    const jobInfoPathResult = securePath(joinPath(analysisPath, batchFolder, 'job_info.json'), WORKSPACE_PATH, { mustExist: false });
    processJobInfo(jobInfoPathResult.path, batchFolder, results);
    
    // Process captions file
    const captionFound = await processCaptionsFile(
      captionsPathResult.path, 
      filename, 
      perspectiveType, 
      batchFolder, 
      results
    );
    
    if (!captionFound) {
      logInfo(`No caption found for ${filename} in ${perspectiveType}`);
    }
  } catch (error) {
    logError(`Error processing batch folder: ${batchFolder}`, error);
  }
}

module.exports = {
  loadImageCaptions
}; 