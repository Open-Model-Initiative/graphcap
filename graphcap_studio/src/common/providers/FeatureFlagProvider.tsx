// SPDX-License-Identifier: Apache-2.0
import { ReactNode, createContext, useContext, useState } from 'react';

/**
 * Interface defining all available feature flags in the application
 */
interface FeatureFlags {
  enableReactQueryDevTools: boolean;
  enableRouterDevTools: boolean;
}

/**
 * Default feature flag values
 */
const defaultFeatureFlags: FeatureFlags = {
  enableReactQueryDevTools: false,
  enableRouterDevTools: false,
};

/**
 * Context interface for feature flags
 */
interface FeatureFlagContextType {
  readonly featureFlags: FeatureFlags;
  toggleFeatureFlag: (flagName: keyof FeatureFlags) => void;
}

/**
 * Create the feature flag context with default values
 */
const FeatureFlagContext = createContext<FeatureFlagContextType>({
  featureFlags: defaultFeatureFlags,
  toggleFeatureFlag: () => {},
});

/**
 * Props for the FeatureFlagProvider component
 */
interface FeatureFlagProviderProps {
  readonly children: ReactNode;
  readonly initialFlags?: Partial<FeatureFlags>;
}

/**
 * Provider component for feature flags
 * 
 * This component manages the state of feature flags and provides
 * methods to toggle them throughout the application.
 * 
 * @param children - The child components to render
 * @param initialFlags - Optional initial feature flag values to override defaults
 */
export function FeatureFlagProvider({ 
  children, 
  initialFlags = {} 
}: FeatureFlagProviderProps) {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({
    ...defaultFeatureFlags,
    ...initialFlags,
  });

  /**
   * Toggle a feature flag's value
   * 
   * @param flagName - The name of the flag to toggle
   */
  const toggleFeatureFlag = (flagName: keyof FeatureFlags) => {
    setFeatureFlags((prevFlags) => ({
      ...prevFlags,
      [flagName]: !prevFlags[flagName],
    }));
  };

  return (
    <FeatureFlagContext.Provider
      value={{
        featureFlags,
        toggleFeatureFlag,
      }}
    >
      {children}
    </FeatureFlagContext.Provider>
  );
}

/**
 * Custom hook to use feature flags in components
 * 
 * @returns The feature flag context
 * @throws Error if used outside of a FeatureFlagProvider
 */
export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext);
  
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  
  return context;
}

/**
 * Custom hook to check if a specific feature flag is enabled
 * 
 * @param flagName - The name of the flag to check
 * @returns Boolean indicating if the feature flag is enabled
 */
export function useFeatureFlag(flagName: keyof FeatureFlags) {
  const { featureFlags } = useFeatureFlags();
  return featureFlags[flagName];
} 