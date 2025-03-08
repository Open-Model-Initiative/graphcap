// SPDX-License-Identifier: Apache-2.0
import { Link } from '@tanstack/react-router';
import React from 'react';

/**
 * Props for the DatasetLink component
 */
interface DatasetLinkProps {
  readonly datasetId: string;
  readonly children: React.ReactNode;
  readonly className?: string;
}

/**
 * Component for linking to a specific dataset using the route parameter
 * 
 * This component creates a link to the gallery page with the dataset ID as a route parameter.
 * 
 * @param datasetId - The ID of the dataset to link to
 * @param children - The content of the link
 * @param className - Optional CSS class name
 */
export function DatasetLink({ datasetId, children, className }: DatasetLinkProps) {
  // Create the path manually since we can't use the route directly
  const path = `/gallery/${datasetId}`;
  
  // Handle click to prevent default behavior if needed
  const handleClick = (e: React.MouseEvent) => {
    // If the click is on a button or other interactive element inside the link,
    // we want to prevent the link navigation
    if ((e.target as HTMLElement).tagName === 'BUTTON' || 
        (e.target as HTMLElement).closest('button')) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
  
  return (
    <Link
      to={path}
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
} 