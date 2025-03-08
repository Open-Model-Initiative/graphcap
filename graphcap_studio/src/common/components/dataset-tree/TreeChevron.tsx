"use client"

import type React from "react"

/**
 * Props for the TreeChevron component.
 *
 * @interface TreeChevronProps
 * @property {readonly boolean} isExpanded - Whether the node is expanded.
 * @property {readonly (e: React.MouseEvent | React.KeyboardEvent) => void} [onClick] - Called when the chevron is clicked.
 */
interface TreeChevronProps {
  readonly isExpanded: boolean
  readonly onClick?: (e: React.MouseEvent | React.KeyboardEvent) => void
}

/**
 * A component that renders a chevron icon for tree nodes.
 *
 * @param {TreeChevronProps} props - The props for the TreeChevron component.
 * @returns {JSX.Element} The rendered chevron component.
 */
export function TreeChevron({ isExpanded, onClick }: TreeChevronProps) {
  
  // Handle the click event and make sure to stop propagation
  const handleClick = (e: React.MouseEvent) => {
    // Prevent the event from bubbling up to parent elements
    e.stopPropagation()
    e.preventDefault()

    // Call the provided onClick handler
    onClick?.(e)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.stopPropagation()
      e.preventDefault()
      onClick?.(e)
    }
  }

  return (
    <button
      type="button" // Explicitly set button type to prevent form submission
      className="tree-chevron mr-1.5 w-5 h-5 flex items-center justify-center bg-transparent border-0 p-0 opacity-70 hover:opacity-100 transition-opacity duration-150 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-sm"
      onClick={handleClick}
      onMouseDown={(e) => {
        // Also prevent mousedown from triggering parent events
        e.stopPropagation()
      }}
      aria-label={isExpanded ? "Collapse" : "Expand"}
      aria-expanded={isExpanded}
      onKeyDown={handleKeyDown}
    >
      {/* Using a simple HTML/CSS triangle instead of SVG for better compatibility */}
      <div
        className={`w-0 h-0 transition-transform duration-200 ease-in-out ${
          isExpanded
            ? "transform rotate-90 border-l-4 border-l-gray-300 border-y-4 border-y-transparent"
            : "border-l-4 border-l-gray-300 border-y-4 border-y-transparent"
        }`}
        style={{ marginLeft: isExpanded ? "1px" : "2px" }}
      />
    </button>
  )
}

