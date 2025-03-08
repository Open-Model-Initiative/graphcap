// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import styles from './Resizer.module.css';

export interface ResizerProps {
  readonly onMouseDown: (e: React.MouseEvent) => void;
  readonly className?: string;
  readonly orientation?: 'vertical' | 'horizontal';
  readonly 'aria-label'?: string;
  readonly hoverColor?: string;
  readonly baseColor?: string;
  readonly width?: number; // Width in pixels
}

/**
 * A resizer component for adjusting panel dimensions
 * 
 * This component renders a sleek, minimal draggable handle that can be used to resize
 * adjacent panels. It supports both vertical and horizontal orientations with
 * subtle visual feedback on hover.
 */
export function Resizer({
  onMouseDown,
  className = '',
  orientation = 'vertical',
  'aria-label': ariaLabel = 'Resize panel',
  hoverColor = 'bg-blue-500/40',
  baseColor = 'bg-transparent', // Make base color transparent
  width = 2, // Default to 2px
}: ResizerProps) {
  // Use minimal dimensions for a sleeker look
  const baseClasses = orientation === 'vertical'
    ? 'h-full cursor-col-resize group'
    : 'w-full cursor-row-resize group';
    
  // Set the width or height based on orientation
  const style = orientation === 'vertical' 
    ? { width: `${width}px` } 
    : { height: `${width}px` };

  return (
    <button 
      className={`${baseClasses} flex items-center justify-center ${className} ${styles.resizerButton}`}
      style={style}
      onMouseDown={onMouseDown}
      aria-label={ariaLabel}
      type="button"
    >
      {/* Using hr element instead of div with role="separator" */}
      <hr 
        className={`
          ${orientation === 'vertical' ? 'h-full w-[1px] my-0 mx-auto' : 'w-full h-[1px] mx-0 my-auto'} 
          border-none
          ${baseColor} 
          group-hover:${hoverColor} 
          group-active:${hoverColor}
          transition-colors duration-150
        `}
        aria-orientation={orientation}
      />
    </button>
  );
} 