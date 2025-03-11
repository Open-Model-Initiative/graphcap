// SPDX-License-Identifier: Apache-2.0
import { useMemo } from 'react';
import { FILE_EXTENSIONS, FILE_ICONS } from './constants';
import { getFileExtension } from './utils';

interface FileIconProps {
  fileName: string;
  isDirectory: boolean;
  isExpanded?: boolean;
  className?: string;
}

/**
 * FileIcon component that displays appropriate icons for different file types
 * 
 * @param fileName - The name of the file
 * @param isDirectory - Whether the file is a directory
 * @param isExpanded - Whether the directory is expanded (only applicable for directories)
 * @param className - Additional CSS classes
 */
export function FileIcon({ fileName, isDirectory, isExpanded = false, className = '' }: FileIconProps) {
  const fileExtension = useMemo(() => {
    if (isDirectory) return 'dir';
    return getFileExtension(fileName);
  }, [fileName, isDirectory]);

  const iconForFileType = useMemo(() => {
    if (isDirectory) {
      return isExpanded ? FILE_ICONS.DIRECTORY.OPEN : FILE_ICONS.DIRECTORY.CLOSED;
    }

    // Image files
    if (FILE_EXTENSIONS.IMAGE.includes(fileExtension)) {
      return FILE_ICONS.FILE.IMAGE;
    }

    // Document files
    if (FILE_EXTENSIONS.DOCUMENT.includes(fileExtension)) {
      return FILE_ICONS.FILE.DOCUMENT;
    }

    // Data files
    if (FILE_EXTENSIONS.DATA.includes(fileExtension)) {
      return FILE_ICONS.FILE.DATA;
    }

    // Code files
    if (FILE_EXTENSIONS.CODE.includes(fileExtension)) {
      return FILE_ICONS.FILE.CODE;
    }

    // Archive files
    if (FILE_EXTENSIONS.ARCHIVE.includes(fileExtension)) {
      return FILE_ICONS.FILE.ARCHIVE;
    }

    // Default file icon
    return FILE_ICONS.FILE.DEFAULT;
  }, [fileExtension, isDirectory, isExpanded]);

  return (
    <span className={`file-icon ${className}`}>
      {iconForFileType}
    </span>
  );
} 