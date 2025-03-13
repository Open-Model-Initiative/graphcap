// SPDX-License-Identifier: Apache-2.0
import { ReactNode } from 'react';

export interface PerspectiveContentProps {
  readonly content: Record<string, any>;
  readonly type: string;
  readonly children?: ReactNode;
}

/**
 * Component for displaying the content of a generated perspective
 * Uses a generic approach to display any perspective content
 */
export function PerspectiveContent({ content, type, children }: PerspectiveContentProps) {
  // If there's custom content provided, render that instead
  if (children) {
    return <>{children}</>;
  }

  // Use the DefaultContent component for all perspectives
  // In the future, we can build custom components for specific perspectives
  return <DefaultContent content={content} />;
}

// Default content display for any perspective
function DefaultContent({ content }: { readonly content: Record<string, any> }) {
  return (
    <div className="space-y-2">
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