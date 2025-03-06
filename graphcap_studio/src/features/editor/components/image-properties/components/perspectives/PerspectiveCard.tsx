// SPDX-License-Identifier: Apache-2.0
import { ReactNode, useState } from 'react';

export interface PerspectiveCardProps {
  title: string;
  description: string;
  type: string;
  isActive?: boolean;
  isGenerated?: boolean;
  onGenerate?: () => void;
  onSetActive?: () => void;
  children?: ReactNode;
}

/**
 * A card component for displaying a single perspective with its details and content
 */
export function PerspectiveCard({
  title,
  description,
  type,
  isActive = false,
  isGenerated = false,
  onGenerate,
  onSetActive,
  children
}: PerspectiveCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-lg bg-gray-700 overflow-hidden shadow-md border border-gray-600 transition-all duration-200">
      {/* Header */}
      <div 
        className={`p-3 ${isActive ? 'bg-blue-900/30' : ''} cursor-pointer`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-medium text-gray-200 flex items-center">
            {title}
            {isActive && (
              <span className="ml-2 inline-flex items-center rounded-full bg-green-900/50 px-2 py-0.5 text-xs font-medium text-green-200">
                Active
              </span>
            )}
          </h4>
          <button 
            className="text-gray-400 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-400">{description}</p>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">{type}</span>
          <div className="flex space-x-2">
            {!isActive && isGenerated && (
              <button 
                className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-900/30"
                onClick={(e) => {
                  e.stopPropagation();
                  onSetActive?.();
                }}
              >
                Set as active
              </button>
            )}
            {!isGenerated && (
              <button 
                className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-900/30"
                onClick={(e) => {
                  e.stopPropagation();
                  onGenerate?.();
                }}
              >
                Generate
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Content area - only shown when expanded */}
      {isExpanded && isGenerated && (
        <div className="p-3 border-t border-gray-600 bg-gray-800">
          {children || (
            <div className="flex items-center justify-center py-6">
              <span className="text-sm text-gray-400">No content available</span>
            </div>
          )}
        </div>
      )}
      
      {/* Placeholder for non-generated content */}
      {isExpanded && !isGenerated && (
        <div className="p-3 border-t border-gray-600 bg-gray-800">
          <div className="flex flex-col items-center justify-center py-6 space-y-3">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-10 w-10 text-gray-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-gray-400">This perspective hasn't been generated yet</span>
            <button 
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md"
              onClick={(e) => {
                e.stopPropagation();
                onGenerate?.();
              }}
            >
              Generate Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 