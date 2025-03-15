// SPDX-License-Identifier: Apache-2.0
import { IconType } from "./types";

/**
 * Props for the TreeIcon component.
 * 
 * @interface TreeIconProps
 * @property {IconType} type - The type of icon to display.
 * @property {string} [colorClass] - Optional custom color class to apply to the icon.
 */
export interface TreeIconProps {
  readonly type: IconType;
  readonly colorClass?: string;
}

/**
 * A component that renders different types of icons for tree nodes.
 * 
 * @param {TreeIconProps} props - The props for the TreeIcon component.
 * @returns {JSX.Element} The rendered icon component.
 */
export function TreeIcon({ type, colorClass }: TreeIconProps) {
  // Update the getDefaultColorClass function to use more vibrant colors
  const getDefaultColorClass = () => {
    switch (type) {
      case 'dataset':
        return 'text-amber-400';
      case 'folder':
        return 'text-blue-400';
      case 'file':
        return 'text-slate-300';
      default:
        return 'text-gray-300';
    }
  };

  const finalColorClass = colorClass ?? getDefaultColorClass();

  // Determine which path to render based on icon type
  const renderIconPath = () => {
    if (type === 'dataset') {
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
        />
      );
    } else if (type === 'folder') {
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
        />
      );
    } else {
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      );
    }
  };

  return (
    // Update the SVG element to add a subtle transition effect
    <svg
      className={`h-5 w-5 ${finalColorClass} transition-colors duration-200`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      {renderIconPath()}
    </svg>
  );
}
