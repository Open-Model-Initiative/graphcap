// SPDX-License-Identifier: Apache-2.0
import { memo } from 'react';
import { CSS_CLASSES } from './constants';

interface FileTreeHeaderProps {
  currentPath: string;
  isLoading: boolean;
  onNavigateUp: () => void;
  onRefresh: () => void;
}

/**
 * FileTreeHeader component for the header section of the file browser
 * 
 * @param currentPath - The current directory path
 * @param isLoading - Whether the file browser is loading
 * @param onNavigateUp - Callback for navigating to the parent directory
 * @param onRefresh - Callback for refreshing the current directory
 */
function FileTreeHeaderComponent({
  currentPath,
  isLoading,
  onNavigateUp,
  onRefresh
}: FileTreeHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center">
        <h3 className="font-medium">Workspace Files</h3>
        {currentPath !== '/' && (
          <button 
            className={CSS_CLASSES.BUTTON.BASE}
            onClick={onNavigateUp}
            disabled={isLoading}
            aria-label="Navigate to parent directory"
          >
            ⬆️ Up
          </button>
        )}
      </div>
      <button 
        className={CSS_CLASSES.BUTTON.BASE}
        onClick={onRefresh}
        disabled={isLoading}
        aria-label="Refresh directory"
      >
        {isLoading ? 'Loading...' : '🔄 Refresh'}
      </button>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const FileTreeHeader = memo(FileTreeHeaderComponent); 