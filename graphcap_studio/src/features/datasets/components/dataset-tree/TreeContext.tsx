"use client"

// SPDX-License-Identifier: Apache-2.0
import React, { createContext, useContext, useReducer, useMemo } from 'react';
import { 
  TreeState, 
  TreeActionType, 
  TreeContextType, 
  TreeItemData, 
  TreeContextMenuAction 
} from './types';


// Create the context with a default value
const TreeContext = createContext<TreeContextType | undefined>(undefined);

/**
 * Tree reducer function to handle state updates
 */
function treeReducer(state: TreeState, action: TreeActionType): TreeState {
  switch (action.type) {
    case 'TOGGLE_EXPAND': {
      // Create a deep copy of the items array to avoid mutating the original state
      const updateItemsExpansion = (items: TreeItemData[]): TreeItemData[] => {
        return items.map(item => {
          if (item.id === action.payload.itemId) {
            return {
              ...item,
              isExpanded: !item.isExpanded,
            };
          }
          
          if (item.children && item.children.length > 0) {
            return {
              ...item,
              children: updateItemsExpansion(item.children),
            };
          }
          
          return item;
        });
      };
      
      const updatedItems = updateItemsExpansion(state.items);
      
      return {
        ...state,
        items: updatedItems,
      };
    }
    
    case 'SET_ITEMS': {
      return {
        ...state,
        items: action.payload.items,
      };
    }
    
    case 'EXPAND_ALL': {
      const expandAllItems = (items: TreeItemData[]): TreeItemData[] => {
        return items.map(item => {
          if (item.children && item.children.length > 0) {
            return {
              ...item,
              isExpanded: true,
              children: expandAllItems(item.children),
            };
          }
          return { ...item };
        });
      };
      
      return {
        ...state,
        items: expandAllItems(state.items),
      };
    }
    
    case 'COLLAPSE_ALL': {
      const collapseAllItems = (items: TreeItemData[]): TreeItemData[] => {
        return items.map(item => {
          if (item.children && item.children.length > 0) {
            return {
              ...item,
              isExpanded: false,
              children: collapseAllItems(item.children),
            };
          }
          return { ...item };
        });
      };
      
      return {
        ...state,
        items: collapseAllItems(state.items),
      };
    }
    
    default:
      return state;
  }
}

/**
 * Helper function to find an item by ID in the tree
 */
function findItemInTree(items: TreeItemData[], itemId?: string): TreeItemData | undefined {
  if (!itemId) return undefined;
  
  for (const item of items) {
    if (item.id === itemId) {
      return item;
    }
    
    if (item.children && item.children.length > 0) {
      const found = findItemInTree(item.children, itemId);
      if (found) {
        return found;
      }
    }
  }
  
  return undefined;
}

/**
 * Props for the TreeProvider component
 */
interface TreeProviderProps {
  /** The initial items to be displayed in the tree */
  items: TreeItemData[];
  /** The ID of the initially selected item */
  selectedItemId?: string;
  /** Optional callback function when an item is selected */
  onSelectItem?: (item: TreeItemData) => void;
  /** Optional callback function when an item is expanded or collapsed */
  onToggleExpand?: (item: TreeItemData) => void;
  /** Optional function to get a custom wrapper component for each item */
  getWrapperComponent?: (
    item: TreeItemData,
  ) => React.ComponentType<{ children: React.ReactNode; className: string }> | undefined;
  /** Optional array of context menu actions for each item */
  contextMenuActions?: TreeContextMenuAction[];
  /** Children components */
  children: React.ReactNode;
}

/**
 * Provider component for the Tree context
 */
export function TreeProvider({
  items,
  selectedItemId,
  onSelectItem,
  onToggleExpand,
  getWrapperComponent,
  contextMenuActions = [],
  children,
}: Readonly<TreeProviderProps>) {
  // Initialize the reducer with the provided items
  const [state, dispatch] = useReducer(treeReducer, {
    items,
    selectedItemId: undefined,
    selectedItem: undefined,
  });
  
  // Update items state when props change
  React.useEffect(() => {
    dispatch({ type: 'SET_ITEMS', payload: { items } });
  }, [items]);
  
  // Find the selected item based on the selectedItemId prop
  const selectedItem = useMemo(() => 
    findItemInTree(state.items, selectedItemId), 
    [state.items, selectedItemId]
  );
  
  // Memoized context value
  const contextValue = useMemo(() => ({
    state: {
      ...state,
      selectedItemId, // Use the prop directly
      selectedItem,   // Use the derived value
    },
    dispatch,
    selectItem: (item: TreeItemData) => {
      // Don't update internal selection state, just call the callback
      // Let the route/parent component handle selection state
      onSelectItem?.(item);
    },
    toggleExpand: (item: TreeItemData) => {
      dispatch({ type: 'TOGGLE_EXPAND', payload: { itemId: item.id } });
      onToggleExpand?.(item);
    },
    getWrapperComponent,
    contextMenuActions,
  }), [state, dispatch, selectedItemId, selectedItem, onSelectItem, onToggleExpand, getWrapperComponent, contextMenuActions]);
  
  return (
    <TreeContext.Provider value={contextValue}>
      {children}
    </TreeContext.Provider>
  );
}

/**
 * Custom hook to use the Tree context
 */
export function useTreeContext(): TreeContextType {
  const context = useContext(TreeContext);
  
  if (!context) {
    throw new Error('useTreeContext must be used within a TreeProvider');
  }
  
  return context;
} 