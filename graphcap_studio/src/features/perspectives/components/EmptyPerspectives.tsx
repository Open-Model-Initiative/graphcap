// SPDX-License-Identifier: Apache-2.0
/**
 * Empty Perspectives Component
 * 
 * This component displays a message when no perspectives are available.
 */

import { EmptyState } from '@/components/ui/status/EmptyState';

/**
 * Component for displaying when no perspectives are available
 */
export function EmptyPerspectives() {
  return (
    <EmptyState
      title="No perspectives available"
      description="Perspectives will appear here when they are loaded"
      className="py-8"
    />
  );
} 