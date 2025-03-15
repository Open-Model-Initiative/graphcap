// SPDX-License-Identifier: Apache-2.0
import React, { useRef } from 'react';
import { Resizer, useResizer } from './resizer';

interface EditorLayoutProps {
  readonly viewer: React.ReactNode;
  readonly properties: React.ReactNode;
  readonly defaultPropertiesWidth?: number;
  readonly minViewerWidth?: number;
  readonly minPropertiesWidth?: number;
  readonly className?: string;
}

/**
 * A two-column responsive layout component for the editor with resizable panels
 * 
 * This component provides a two-panel layout with resizable viewer and properties panels.
 * The panels can be resized by dragging the divider between them.
 */
export function EditorLayout({
  viewer,
  properties,
  defaultPropertiesWidth = 500,
  minViewerWidth = 500,
  minPropertiesWidth = 500,
  className = '',
}: EditorLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Use the resizer hook for properties panel
  const propsResizer = useResizer({
    defaultWidth: defaultPropertiesWidth,
    minWidth: minPropertiesWidth,
    containerRef,
    direction: 'left',
    maxWidthFn: (containerWidth) => containerWidth - minViewerWidth
  });

  return (
    <div 
      ref={containerRef}
      className={`flex h-full w-full overflow-hidden ${className}`}
    >
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