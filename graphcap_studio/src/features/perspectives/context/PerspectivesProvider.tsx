// SPDX-License-Identifier: Apache-2.0
/**
 * Perspectives Combined Provider
 * 
 * This component combines the data and UI providers for perspectives.
 * It serves as a convenience wrapper to avoid nesting providers in client code.
 */

import React, { ReactNode } from 'react';
import { PerspectivesDataProvider } from './PerspectivesDataContext';
import { PerspectiveUIProvider } from './PerspectiveUIContext';

interface PerspectivesProviderProps {
  children: ReactNode;
  initialProviderId?: number;
}

/**
 * Combined provider for perspectives feature that wraps both data and UI providers
 */
export function PerspectivesProvider({
  children,
  initialProviderId
}: PerspectivesProviderProps) {
  return (
    <PerspectivesDataProvider>
      <PerspectiveUIProvider initialProviderId={initialProviderId}>
        {children}
      </PerspectiveUIProvider>
    </PerspectivesDataProvider>
  );
} 