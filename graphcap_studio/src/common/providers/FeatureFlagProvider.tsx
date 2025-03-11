// SPDX-License-Identifier: Apache-2.0
import { ReactNode, createContext, useContext, useState, useMemo } from 'react';

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
 * Storage key for feature flags in localStorage
 */
const FEATURE_FLAGS_STORAGE_KEY = 'graphcap-feature-flags';

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
 * Load feature flags from localStorage
 * 
 * @returns Saved feature flags or empty object if none exist
 */
function loadFeatureFlagsFromStorage(): Partial<FeatureFlags> {
  try {
    const savedFlags = localStorage.getItem(FEATURE_FLAGS_STORAGE_KEY);
    return savedFlags ? JSON.parse(savedFlags) : {};
  } catch (error) {
    console.error('Failed to load feature flags from localStorage:', error);
    return {};
  }
}

/**
 * Save feature flags to localStorage
 * 
 * @param flags - The feature flags to save
 */
function saveFeatureFlagsToStorage(flags: FeatureFlags): void {
  try {
    localStorage.setItem(FEATURE_FLAGS_STORAGE_KEY, JSON.stringify(flags));
  } catch (error) {
    console.error('Failed to save feature flags to localStorage:', error);
  }
}

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
  // Initialize state from localStorage, then apply defaults and any initialFlags
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(() => {
    const storedFlags = loadFeatureFlagsFromStorage();
    return {
      ...defaultFeatureFlags,
      ...storedFlags,
      ...initialFlags,
    };
  });

  /**
   * Toggle a feature flag's value
   * 
   * @param flagName - The name of the flag to toggle
   */
  const toggleFeatureFlag = (flagName: keyof FeatureFlags) => {
    setFeatureFlags((prevFlags) => {
      const newFlags = {
        ...prevFlags,
        [flagName]: !prevFlags[flagName],
      };
      
      // Save to localStorage
      saveFeatureFlagsToStorage(newFlags);
      
      return newFlags;
    });
  };

  // Wrap the value in useMemo
  const value = useMemo(() => ({
    featureFlags,
    toggleFeatureFlag,
  }), [featureFlags]);

  return (
    <FeatureFlagContext.Provider value={value}>
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