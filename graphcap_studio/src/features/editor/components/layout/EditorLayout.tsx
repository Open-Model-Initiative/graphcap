// SPDX-License-Identifier: Apache-2.0
import React, { useRef } from 'react';
import { Resizer, useResizer } from '../resizer';

interface EditorLayoutProps {
  readonly navigation: React.ReactNode;
  readonly viewer: React.ReactNode;
  readonly properties: React.ReactNode;
  readonly defaultNavigationWidth?: number;
  readonly defaultPropertiesWidth?: number;
  readonly minNavigationWidth?: number;
  readonly minViewerWidth?: number;
  readonly minPropertiesWidth?: number;
  readonly className?: string;
}

/**
 * A responsive layout component for the editor with resizable panels
 * 
 * This component provides a three-panel layout with resizable navigation,
 * viewer, and properties panels. The panels can be resized by dragging
 * the dividers between them.
 */
export function EditorLayout({
  navigation,
  viewer,
  properties,
  defaultNavigationWidth = 250,
  defaultPropertiesWidth = 300,
  minNavigationWidth = 180,
  minViewerWidth = 400,
  minPropertiesWidth = 220,
  className = '',
}: EditorLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use the resizer hook for navigation panel
  const navResizer = useResizer({
    defaultWidth: defaultNavigationWidth,
    minWidth: minNavigationWidth,
    containerRef,
    direction: 'right',
    maxWidthFn: (containerWidth) => containerWidth - minViewerWidth - minPropertiesWidth
  });

  // Use the resizer hook for properties panel
  const propsResizer = useResizer({
    defaultWidth: defaultPropertiesWidth,
    minWidth: minPropertiesWidth,
    containerRef,
    direction: 'left',
    maxWidthFn: (containerWidth) => containerWidth - minViewerWidth - navResizer.width
  });

  return (
    <div 
      ref={containerRef}
      className={`flex h-full w-full overflow-hidden ${className}`}
    >
      {/* Navigation panel */}
      <div 
        className="h-full overflow-auto bg-gray-800"
        style={{ width: `${navResizer.width}px`, flexShrink: 0 }}
      >
        {navigation}
      </div>

      {/* Navigation resizer */}
      <Resizer 
        onMouseDown={navResizer.handleResizerMouseDown}
        aria-label="Resize navigation panel"
        className="z-10"
        hoverColor="bg-blue-500/30"
        baseColor="bg-transparent"
        width={2}
      />

      {/* Viewer panel */}
      <div 
        className="h-full flex-1 overflow-hidden bg-gray-900"
        style={{ minWidth: `${minViewerWidth}px` }}
      >
        {viewer}
      </div>

      {/* Properties resizer */}
      <Resizer
        onMouseDown={propsResizer.handleResizerMouseDown}
        aria-label="Resize properties panel"
        className="z-10"
        hoverColor="bg-blue-500/30"
        baseColor="bg-transparent"
        width={2}
      />

      {/* Properties panel */}
      <div 
        className="h-full overflow-auto bg-gray-800"
        style={{ width: `${propsResizer.width}px`, flexShrink: 0 }}
      >
        {properties}
      </div>
    </div>
  );
} 