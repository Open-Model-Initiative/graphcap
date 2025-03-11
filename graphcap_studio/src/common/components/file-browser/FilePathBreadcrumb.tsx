// SPDX-License-Identifier: Apache-2.0
import { memo } from 'react';
import { CSS_CLASSES } from './constants';

interface FilePathBreadcrumbProps {
  path: string;
}

/**
 * FilePathBreadcrumb component for displaying the current path
 * 
 * @param path - The current directory path
 */
function FilePathBreadcrumbComponent({ path }: FilePathBreadcrumbProps) {
  return (
    <div className={CSS_CLASSES.PATH.CONTAINER}>
      <span className="font-medium">Path:</span> {path}
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const FilePathBreadcrumb = memo(FilePathBreadcrumbComponent); 