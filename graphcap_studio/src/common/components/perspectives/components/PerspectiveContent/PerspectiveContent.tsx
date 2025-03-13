// SPDX-License-Identifier: Apache-2.0
/**
 * PerspectiveContent Component
 * 
 * A component for displaying the content of a generated perspective.
 * This is a presentational component that receives all data as props.
 */

import { ReactNode } from 'react';

export interface PerspectiveContentProps {
  readonly content: Record<string, any>;
  readonly type: string;
  readonly children?: ReactNode;
  readonly className?: string;
}

/**
 * Component for displaying the content of a generated perspective
 * Uses a generic approach to display any perspective content
 */
export function PerspectiveContent({ 
  content, 
  type, 
  children,
  className = ''
}: PerspectiveContentProps) {
  // If there's custom content provided, render that instead
  if (children) {
    return <div className={className}>{children}</div>;
  }

  // Use the DefaultContent component for all perspectives
  return <DefaultContent content={content} className={className} />;
}

interface DefaultContentProps {
  readonly content: Record<string, any>;
  readonly className?: string;
}

/**
 * Default content display for any perspective
 */
function DefaultContent({ content, className = '' }: DefaultContentProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Object.entries(content).map(([key, value]) => (
        <div key={key}>
          <h5 className="text-xs font-medium text-gray-300 mb-1 capitalize">{key.replace(/_/g, ' ')}</h5>
          <p className="text-sm text-gray-400 whitespace-pre-wrap">
            {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
          </p>
        </div>
      ))}
    </div>
  );
} 