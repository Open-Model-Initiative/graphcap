// SPDX-License-Identifier: Apache-2.0
import { useState } from 'react';
import { Dataset, Image } from '@/services/images';

interface DatasetTreeProps {
  datasets: Dataset[];
  selectedDataset: string | null;
  selectedSubfolder: string | null;
  onSelectNode: (datasetName: string, subfolder?: string) => void;
}

interface TreeNode {
  name: string;
  path: string;
  children: TreeNode[];
  isExpanded: boolean;
}

/**
 * A component for displaying a hierarchical tree view of datasets and their subfolders
 */
export function DatasetTree({ 
  datasets, 
  selectedDataset, 
  selectedSubfolder,
  onSelectNode 
}: DatasetTreeProps) {
  // Build tree structure from datasets
  const buildTree = (dataset: Dataset): TreeNode => {
    const root: TreeNode = {
      name: dataset.name,
      path: dataset.name,
      children: [],
      isExpanded: dataset.name === selectedDataset
    };

    // Group images by directory
    const directoryMap = new Map<string, Image[]>();
    
    dataset.images.forEach(image => {
      const dirPath = image.directory;
      if (!directoryMap.has(dirPath)) {
        directoryMap.set(dirPath, []);
      }
      directoryMap.get(dirPath)?.push(image);
    });

    // Create tree structure from directories
    const directories = Array.from(directoryMap.keys())
      .filter(dir => dir.startsWith(`/datasets/${dataset.name}`))
      .sort();

    // Process each directory path to build the tree
    directories.forEach(dirPath => {
      // Skip the root directory
      if (dirPath === `/datasets/${dataset.name}`) return;

      // Get the relative path from the dataset root
      const relativePath = dirPath.replace(`/datasets/${dataset.name}`, '');
      if (!relativePath) return;

      // Split the path into segments
      const segments = relativePath.split('/').filter(Boolean);
      
      // Skip if no segments (should not happen)
      if (segments.length === 0) return;

      // Add each segment to the tree
      let currentNode = root;
      let currentPath = `/datasets/${dataset.name}`;

      segments.forEach(segment => {
        currentPath = `${currentPath}/${segment}`;
        
        // Check if this node already exists
        let childNode = currentNode.children.find(child => child.name === segment);
        
        if (!childNode) {
          // Create new node
          childNode = {
            name: segment,
            path: currentPath,
            children: [],
            isExpanded: currentPath.includes(selectedSubfolder || '')
          };
          currentNode.children.push(childNode);
        }
        
        currentNode = childNode;
      });
    });

    return root;
  };

  const trees = datasets.map(buildTree);

  // Toggle node expansion
  const toggleNode = (node: TreeNode) => {
    node.isExpanded = !node.isExpanded;
    // Force re-render
    setForceUpdate(prev => prev + 1);
  };

  const [forceUpdate, setForceUpdate] = useState(0);

  // Render a tree node
  const renderNode = (node: TreeNode, isDatasetRoot = false) => {
    const isSelected = isDatasetRoot 
      ? node.name === selectedDataset && !selectedSubfolder
      : node.path === selectedSubfolder;

    return (
      <div key={node.path} className="group">
        <div 
          className={`flex cursor-pointer items-center rounded-md py-1.5 px-2 ${
            isSelected 
              ? 'bg-blue-100 text-blue-700' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {node.children.length > 0 ? (
            <button 
              className="mr-1.5 flex h-5 w-5 items-center justify-center rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node);
              }}
            >
              <svg
                className={`h-4 w-4 transform text-gray-500 transition-transform ${
                  node.isExpanded ? 'rotate-90' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ) : (
            <span className="mr-1.5 h-5 w-5" />
          )}
          
          {/* Folder or file icon */}
          <svg
            className={`mr-2 h-5 w-5 ${
              isDatasetRoot
                ? 'text-yellow-500'
                : node.children.length > 0
                ? 'text-blue-500'
                : 'text-gray-400'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isDatasetRoot ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            ) : node.children.length > 0 ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            )}
          </svg>

          <span 
            className="flex-1 truncate"
            onClick={() => onSelectNode(
              isDatasetRoot ? node.name : selectedDataset || '', 
              isDatasetRoot ? undefined : node.path
            )}
          >
            {node.name}
          </span>
        </div>
        
        {node.isExpanded && node.children.length > 0 && (
          <div className="ml-4 border-l border-gray-200 pl-2">
            {node.children
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(child => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="text-sm">
      {trees.map(tree => renderNode(tree, true))}
    </div>
  );
} 