// SPDX-License-Identifier: Apache-2.0
import { ReactNode } from 'react';
import { DatasetInitializer } from '@/features/datasets';
import { FeatureFlagProvider } from '../features/app-settings/feature-flags/FeatureFlagProvider';
import { ServerConnectionsProvider } from '.';
import { PerspectivesProvider } from '@/features/perspectives/context';

interface AppContextProviderProps {
  readonly children: ReactNode;
}

/**
 * A composition of context providers that wraps the application
 * 
 * This component composes multiple context providers to provide
 * a unified context for the application. The order of providers
 * matters - providers that depend on other providers should be
 * nested inside them.
 * 
 * Each feature provides its own initializer component that handles
 * fetching and initializing its own context, which keeps the
 * AppContextProvider decoupled from feature-specific implementation details.
 * 
 * @param children - The child components to render
 */
export function AppContextProvider({ children }: AppContextProviderProps) {
  return (
    <FeatureFlagProvider>
      <ServerConnectionsProvider>
        <DatasetInitializer>
          <PerspectivesProvider>
            {children}
          </PerspectivesProvider>
        </DatasetInitializer>
      </ServerConnectionsProvider>
    </FeatureFlagProvider>
  );
} 