// SPDX-License-Identifier: Apache-2.0
import { useState, useEffect } from 'react';
import { Dataset, Image } from '@/services/images';
import { Tree, TreeItemData } from '@/common/components/dataset-tree';
import { DatasetLink } from './DatasetLink';


interface DatasetTreeProps {
  readonly datasets: Dataset[];
  readonly selectedDataset: string | null;
  readonly selectedSubfolder: string | null;
  readonly onSelectNode: (datasetName: string, subfolder?: string) => void;
}

/**
 * Creates a child node for the tree structure
 */
function createChildNode(
  segment: string, 
  currentPath: string, 
  selectedSubfolder: string | null
): TreeItemData {
  return {
    id: currentPath,
    name: segment,
    path: currentPath,
    iconType: 'folder',
    isExpanded: selectedSubfolder ? 
                (currentPath === selectedSubfolder || 
                selectedSubfolder.startsWith(currentPath + '/')) : false,
    children: []
  };
}

/**
 * Processes a directory path and adds it to the tree structure
 */
function processDirectoryPath(
  dirPath: string, 
  rootItem: TreeItemData, 
  datasetName: string, 
  selectedSubfolder: string | null
): void {
  // Skip the root directory
  if (dirPath === `/datasets/${datasetName}`) return;
  
  // Get the relative path from the dataset root
  const relativePath = dirPath.replace(`/datasets/${datasetName}`, '');
  if (!relativePath) return;
  
  // Split the path into segments
  const segments = relativePath.split('/').filter(Boolean);
  
  // Skip if no segments (should not happen)
  if (segments.length === 0) return;
  
  // Add each segment to the tree
  let currentNode = rootItem;
  let currentPath = `/datasets/${datasetName}`;
  
  for (const segment of segments) {
    currentPath = `${currentPath}/${segment}`;
    
    // Check if this node already exists
    let childNode = currentNode.children?.find(child => child.name === segment);
    
    if (!childNode) {
      // Create new node
      childNode = createChildNode(segment, currentPath, selectedSubfolder);
      
      if (!currentNode.children) {
        currentNode.children = [];
      }
      
      currentNode.children.push(childNode);
    }
    
    currentNode = childNode;
  }
}

/**
 * Creates a tree item from a dataset
 */
function createDatasetTreeItem(
  dataset: Dataset, 
  selectedDataset: string | null, 
  selectedSubfolder: string | null
): TreeItemData {
  // Create the root dataset node
  const rootItem: TreeItemData = {
    id: dataset.name,
    name: dataset.name,
    path: dataset.name,
    iconType: 'dataset',
    isExpanded: dataset.name === selectedDataset,
    children: [],
    // Add a flag to identify this as a dataset root node
    data: { isDatasetRoot: true }
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
    .sort((a, b) => a.localeCompare(b)); // Using localeCompare for reliable alphabetical sorting
  
  // Process each directory path to build the tree
  directories.forEach(dirPath => {
    processDirectoryPath(dirPath, rootItem, dataset.name, selectedSubfolder);
  });
  
  return rootItem;
}

/**
 * Updates the expanded state of an item in the tree
 * 
 * @returns true if the item was found and updated, false otherwise
 */
function updateItemExpanded(items: TreeItemData[], itemId: string): boolean {
  for (const item of items) {
    if (item.id === itemId) {
      // Toggle the expanded state
      item.isExpanded = !item.isExpanded;
      return true;
    }
    
    // Recursively check children
    if (item.children && item.children.length > 0) {
      const found = updateItemExpanded(item.children, itemId);
      if (found) return true;
    }
  }
  
  return false;
}

// Move this function outside of the DatasetTree component
const getWrapperComponent = (item: TreeItemData) => {
  if (item.data?.isDatasetRoot) {
    return ({ children, className }: { children: React.ReactNode; className: string }) => (
      <DatasetLink datasetId={item.id} className={className}>
        {children}
      </DatasetLink>
    );
  }
  return undefined;
};

/**
 * A component for displaying a hierarchical tree view of datasets and their subfolders
 * using the reusable Tree UI components
 */
export function DatasetTree({ 
  datasets, 
  selectedDataset, 
  selectedSubfolder,
  onSelectNode 
}: DatasetTreeProps) {
  const [treeItems, setTreeItems] = useState<TreeItemData[]>([]);
  
  // Calculate the selected item ID based on the selected dataset and subfolder
  const selectedItemId = selectedSubfolder ?? (selectedDataset ?? undefined);
  
  // Update tree items when datasets or selection changes
  useEffect(() => {
    if (datasets.length === 0) {
      setTreeItems([]);
      return;
    }
    
    // Create tree items from datasets
    const items = datasets.map(dataset => 
      createDatasetTreeItem(dataset, selectedDataset, selectedSubfolder)
    );
    
    setTreeItems(items);
  }, [datasets, selectedDataset, selectedSubfolder]);
  
  const handleSelectItem = (item: TreeItemData) => {
    if (item.path) {
      // If this is a dataset root node, we'll let the DatasetLink handle navigation
      if (item.data?.isDatasetRoot) {
        onSelectNode(item.id, undefined);
      } else {
        // For subfolders, use the existing behavior
        const datasetName = item.path.split('/')[2]; // Extract dataset name from path
        onSelectNode(datasetName, item.path);
      }
    }
  };
  
  const handleToggleExpand = (item: TreeItemData) => {
    // Create a new array with the updated item
    const newItems = [...treeItems];
    
    // Find and update the item
    const updated = updateItemExpanded(newItems, item.id);
    
    if (updated) {
      setTreeItems(newItems);
    }
  };
  
  return (
    <Tree
      items={treeItems}
      selectedItemId={selectedItemId}
      onSelectItem={handleSelectItem}
      onToggleExpand={handleToggleExpand}
      className="text-sm"
      getWrapperComponent={getWrapperComponent}
    />
  );
} 