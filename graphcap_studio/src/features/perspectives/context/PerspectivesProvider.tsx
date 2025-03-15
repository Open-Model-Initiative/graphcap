// SPDX-License-Identifier: Apache-2.0
/**
 * Combined Perspectives Provider
 * 
 * This component combines the data and UI contexts for perspectives
 * to simplify usage in component trees.
 */

import React, { ReactNode } from 'react';
import { PerspectiveUIProvider } from './PerspectiveUIContext';
import { PerspectivesDataProvider } from './PerspectivesDataContext';
import { Provider } from '../types';
import { Image } from '@/services/images';

interface PerspectivesProviderProps {
  children: ReactNode;
  initialProviderId?: number;
  initialProviders?: Provider[];
  image: Image | null;
}

/**
 * Combined provider for all perspective-related contexts
 * Uses a consolidated architecture with just two providers:
 * 1. PerspectivesDataProvider - all data concerns
 * 2. PerspectiveUIProvider - all UI concerns
 */
export function PerspectivesProvider({
  children,
  initialProviderId,
  initialProviders = [],
  image
}: PerspectivesProviderProps) {
  return (
    <PerspectivesDataProvider
      image={image}
      initialProviderId={initialProviderId}
      initialProviders={initialProviders}
    >
      <PerspectiveUIProvider>
        {children}
      </PerspectiveUIProvider>
    </PerspectivesDataProvider>
  );
} 