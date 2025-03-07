// SPDX-License-Identifier: Apache-2.0
import { useState, useEffect } from 'react';
import { Dataset, Image } from '@/services/images';
import { Tree, TreeItemData } from '@/common/components/ui/tree';

interface DatasetTreeProps {
  datasets: Dataset[];
  selectedDataset: string | null;
  selectedSubfolder: string | null;
  onSelectNode: (datasetName: string, subfolder?: string) => void;
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
    children: []
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
 */
function updateItemExpanded(items: TreeItemData[], itemId: string): boolean {
  for (const treeItem of items) {
    if (treeItem.id === itemId) {
      treeItem.isExpanded = !treeItem.isExpanded;
      return true;
    }
    
    if (treeItem.children && treeItem.children.length > 0) {
      if (updateItemExpanded(treeItem.children, itemId)) {
        return true;
      }
    }
  }
  
  return false;
}

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
  
  // Convert datasets to tree items
  useEffect(() => {
    const items: TreeItemData[] = datasets.map(dataset => 
      createDatasetTreeItem(dataset, selectedDataset, selectedSubfolder)
    );
    
    setTreeItems(items);
  }, [datasets, selectedDataset, selectedSubfolder]);
  
  const handleSelectItem = (item: TreeItemData) => {
    const isDatasetRoot = item.path ? !item.path.includes('/') : true;
    onSelectNode(
      isDatasetRoot ? item.name : selectedDataset || '',
      isDatasetRoot ? undefined : item.path
    );
  };
  
  const handleToggleExpand = (item: TreeItemData) => {
    // Create a deep copy of the tree items to avoid mutating state directly
    const updatedItems = JSON.parse(JSON.stringify(treeItems)) as TreeItemData[];
    
    // Find and update the expanded state of the item
    updateItemExpanded(updatedItems, item.id);
    setTreeItems(updatedItems);
  };
  
  return (
    <Tree
      items={treeItems}
      selectedItemId={selectedSubfolder || selectedDataset || undefined}
      onSelectItem={handleSelectItem}
      onToggleExpand={handleToggleExpand}
      className="overflow-auto"
    />
  );
} 