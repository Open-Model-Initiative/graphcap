// SPDX-License-Identifier: Apache-2.0
import { useMemo } from 'react';

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
    const parts = fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }, [fileName, isDirectory]);

  const iconForFileType = useMemo(() => {
    if (isDirectory) {
      return isExpanded ? '📂' : '📁';
    }

    // Image files
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(fileExtension)) {
      return '🖼️';
    }

    // Document files
    if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'md', 'markdown'].includes(fileExtension)) {
      return '📄';
    }

    // Data files
    if (['json', 'csv', 'xml', 'yaml', 'yml'].includes(fileExtension)) {
      return '📊';
    }

    // Code files
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'html', 'css', 'scss'].includes(fileExtension)) {
      return '📝';
    }

    // Archive files
    if (['zip', 'rar', 'tar', 'gz', '7z'].includes(fileExtension)) {
      return '🗄️';
    }

    // Default file icon
    return '📄';
  }, [fileExtension, isDirectory, isExpanded]);

  return (
    <span className={`file-icon ${className}`}>
      {iconForFileType}
    </span>
  );
} 