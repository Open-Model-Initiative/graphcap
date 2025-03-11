import { useState, useCallback } from 'react';

/**
 * Options for the useActionPanel hook
 */
interface UseActionPanelOptions {
  /**
   * The panel side ('left' or 'right')
   */
  side: 'left' | 'right';
  
  /**
   * Default expanded state
   */
  defaultExpanded?: boolean;
  
  /**
   * Width of the panel when expanded (in pixels)
   */
  expandedWidth?: number;
  
  /**
   * Width of the panel when collapsed (in pixels)
   */
  collapsedWidth?: number;
}

/**
 * Result of the useActionPanel hook
 */
interface UseActionPanelResult {
  /**
   * Whether the panel is expanded
   */
  isExpanded: boolean;
  
  /**
   * Current width of the panel (in pixels)
   */
  width: number;
  
  /**
   * Toggle the panel expanded state
   */
  togglePanel: () => void;
  
  /**
   * Expand the panel
   */
  expandPanel: () => void;
  
  /**
   * Collapse the panel
   */
  collapsePanel: () => void;
}

/**
 * Custom hook for managing action panel state
 * 
 * This hook handles:
 * - Toggling panel expanded/collapsed state
 * - Calculating panel width based on state
 * 
 * @param options - Configuration options
 * @returns Panel state and actions
 */
export function useActionPanel({
  defaultExpanded = false,
  expandedWidth = 256,
  collapsedWidth = 40
}: UseActionPanelOptions): UseActionPanelResult {
  // Initialize state with default value (always collapsed)
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  // Calculate width based on expanded state
  const width = isExpanded ? expandedWidth : collapsedWidth;
  
  // Toggle panel expanded state - using useCallback to prevent unnecessary re-renders
  const togglePanel = useCallback(() => {
    setIsExpanded((prev: boolean) => !prev);
  }, []);
  
  // Expand panel - using useCallback to prevent unnecessary re-renders
  const expandPanel = useCallback(() => {
    setIsExpanded(true);
  }, []);
  
  // Collapse panel - using useCallback to prevent unnecessary re-renders
  const collapsePanel = useCallback(() => {
    setIsExpanded(false);
  }, []);
  
  return {
    isExpanded,
    width,
    togglePanel,
    expandPanel,
    collapsePanel
  };
} 