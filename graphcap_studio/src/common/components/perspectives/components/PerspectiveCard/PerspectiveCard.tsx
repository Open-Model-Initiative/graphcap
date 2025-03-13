// SPDX-License-Identifier: Apache-2.0
/**
 * PerspectiveCard Component
 * 
 * A card component for displaying a perspective with controls.
 * This is a presentational component that receives all data and callbacks as props.
 */

import { ReactNode } from 'react';
import { PERSPECTIVE_CLASSES } from '../../constants';

export interface PerspectiveCardProps {
  readonly title: string;
  readonly description: string;
  readonly type: string;
  readonly isActive: boolean;
  readonly isGenerated: boolean;
  readonly onGenerate: () => void;
  readonly onSetActive: () => void;
  readonly children?: ReactNode;
  readonly providers?: Array<{ id: number; name: string }>;
  readonly isGenerating?: boolean;
  readonly selectedProviderId?: number | undefined;
  readonly onProviderChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  readonly className?: string;
}

/**
 * Card component for displaying a perspective with controls
 */
export function PerspectiveCard({
  title,
  description,
  type,
  isActive,
  isGenerated,
  onGenerate,
  onSetActive,
  children,
  providers = [],
  isGenerating = false,
  selectedProviderId,
  onProviderChange,
  className = ''
}: PerspectiveCardProps) {
  const cardClasses = `${PERSPECTIVE_CLASSES.CARD.BASE} ${
    isActive ? PERSPECTIVE_CLASSES.CARD.ACTIVE : PERSPECTIVE_CLASSES.CARD.INACTIVE
  } ${className}`;
  
  return (
    <div className={cardClasses}>
      {/* Card Header */}
      <div className={PERSPECTIVE_CLASSES.HEADER.BASE}>
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium text-gray-200">{title}</h4>
            <p className="text-xs text-gray-400 mt-1">{description}</p>
            <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-300">
              {type}
            </span>
          </div>
          
          {/* Status indicator */}
          {isGenerating && (
            <div className={PERSPECTIVE_CLASSES.LOADING.BASE}>
              <svg className="animate-spin h-3 w-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Processing</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Content Area */}
      {isActive && isGenerated && children && (
        <div className={PERSPECTIVE_CLASSES.CONTENT.BASE}>
          {children}
        </div>
      )}
      
      {/* Action Bar - Always present */}
      <div className={PERSPECTIVE_CLASSES.ACTION_BAR.BASE}>
        <div className="flex items-center space-x-2">
          {isGenerated ? (
            <button
              className={`px-2 py-1 text-xs ${PERSPECTIVE_CLASSES.BUTTON.BASE} ${
                isActive
                  ? PERSPECTIVE_CLASSES.BUTTON.PRIMARY
                  : PERSPECTIVE_CLASSES.BUTTON.SECONDARY
              }`}
              onClick={onSetActive}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {isActive ? 'Active' : 'View'}
            </button>
          ) : (
            <div className="text-xs text-gray-400 italic">Not generated yet</div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {providers.length > 0 && (
            <select
              className={PERSPECTIVE_CLASSES.SELECT.BASE}
              value={selectedProviderId || ''}
              onChange={onProviderChange}
              disabled={isGenerating}
            >
              <option value="">Default Provider</option>
              {providers.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          )}
          
          <button
            className={`px-2 py-1 text-xs ${PERSPECTIVE_CLASSES.BUTTON.BASE} ${
              isGenerated 
                ? PERSPECTIVE_CLASSES.BUTTON.SUCCESS 
                : PERSPECTIVE_CLASSES.BUTTON.PRIMARY
            } ${isGenerating ? PERSPECTIVE_CLASSES.BUTTON.DISABLED : ''}`}
            onClick={onGenerate}
            disabled={isGenerating}
          >
            {isGenerated ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isGenerating ? 'Regenerating...' : 'Regenerate'}
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {isGenerating ? 'Generating...' : 'Generate'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 