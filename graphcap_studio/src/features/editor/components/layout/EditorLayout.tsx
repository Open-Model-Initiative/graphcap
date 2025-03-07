// SPDX-License-Identifier: Apache-2.0
import React, { useState, useRef, useEffect } from 'react';

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
  const [navigationWidth, setNavigationWidth] = useState(defaultNavigationWidth);
  const [propertiesWidth, setPropertiesWidth] = useState(defaultPropertiesWidth);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isResizingNav, setIsResizingNav] = useState(false);
  const [isResizingProps, setIsResizingProps] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  // Update container width on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerWidth(rect.width);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Ensure navigation width doesn't exceed limits
  useEffect(() => {
    if (containerWidth > 0) {
      const maxNavigationWidth = containerWidth - minViewerWidth - minPropertiesWidth;
      if (navigationWidth > maxNavigationWidth) {
        setNavigationWidth(Math.max(minNavigationWidth, maxNavigationWidth));
      }
    }
  }, [containerWidth, navigationWidth, minNavigationWidth, minViewerWidth, minPropertiesWidth]);

  // Ensure properties width doesn't exceed limits
  useEffect(() => {
    if (containerWidth > 0) {
      const maxPropertiesWidth = containerWidth - minViewerWidth - navigationWidth;
      if (propertiesWidth > maxPropertiesWidth) {
        setPropertiesWidth(Math.max(minPropertiesWidth, maxPropertiesWidth));
      }
    }
  }, [containerWidth, propertiesWidth, navigationWidth, minViewerWidth, minPropertiesWidth]);

  // Handle mouse down for navigation resizer
  const handleNavResizerMouseDown = (e: React.MouseEvent) => {
    setIsResizingNav(true);
    setStartX(e.clientX);
    setStartWidth(navigationWidth);
    e.preventDefault();
  };

  // Handle mouse down for properties resizer
  const handlePropsResizerMouseDown = (e: React.MouseEvent) => {
    setIsResizingProps(true);
    setStartX(e.clientX);
    setStartWidth(propertiesWidth);
    e.preventDefault();
  };

  // Handle mouse move for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingNav) {
        const newWidth = Math.max(minNavigationWidth, startWidth + (e.clientX - startX));
        const maxWidth = containerWidth - minViewerWidth - minPropertiesWidth;
        setNavigationWidth(Math.min(newWidth, maxWidth));
      } else if (isResizingProps) {
        const newWidth = Math.max(minPropertiesWidth, startWidth - (e.clientX - startX));
        const maxWidth = containerWidth - minViewerWidth - navigationWidth;
        setPropertiesWidth(Math.min(newWidth, maxWidth));
      }
    };

    const handleMouseUp = () => {
      setIsResizingNav(false);
      setIsResizingProps(false);
    };

    if (isResizingNav || isResizingProps) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingNav, isResizingProps, startX, startWidth, containerWidth, navigationWidth, propertiesWidth, minNavigationWidth, minViewerWidth, minPropertiesWidth]);

  return (
    <div 
      ref={containerRef}
      className={`flex h-full w-full overflow-hidden ${className}`}
    >
      {/* Navigation panel */}
      <div 
        className="h-full overflow-auto bg-gray-800"
        style={{ width: `${navigationWidth}px`, flexShrink: 0 }}
      >
        {navigation}
      </div>

      {/* Navigation resizer */}
      <button
        className="h-full w-1 bg-gray-700 hover:bg-blue-500 cursor-col-resize transition-colors border-none m-0 p-0"
        onMouseDown={handleNavResizerMouseDown}
        aria-label="Resize navigation panel"
        type="button"
      />

      {/* Viewer panel */}
      <div 
        className="h-full flex-1 overflow-hidden bg-gray-900"
        style={{ minWidth: `${minViewerWidth}px` }}
      >
        {viewer}
      </div>

      {/* Properties panel and resizer (conditionally rendered) */}
      <button
        className="h-full w-1 bg-gray-700 hover:bg-blue-500 cursor-col-resize transition-colors border-none m-0 p-0"
        onMouseDown={handlePropsResizerMouseDown}
        aria-label="Resize properties panel"
        type="button"
      />

      {/* Properties panel */}
      <div 
        className="h-full overflow-auto bg-gray-800"
        style={{ width: `${propertiesWidth}px`, flexShrink: 0 }}
      >
        {properties}
      </div>
    </div>
  );
} 