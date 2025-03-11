// SPDX-License-Identifier: Apache-2.0
import { useFeatureFlags } from '@/common/providers';

/**
 * Feature Flags Panel component
 * 
 * This component displays all available feature flags with toggle switches
 * and is designed to be used in the left action panel.
 */
export function FeatureFlagsPanel() {
  const { featureFlags, toggleFeatureFlag } = useFeatureFlags();
  
  // Convert feature flags object to array for easier rendering
  const flagEntries = Object.entries(featureFlags) as [keyof typeof featureFlags, boolean][];
  
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100">Feature Flags</h2>
      
      <div className="space-y-3">
        {flagEntries.map(([flagName, isEnabled]) => (
          <div key={flagName} className="flex items-center justify-between">
            <label 
              htmlFor={`flag-${flagName}`}
              className="text-sm font-medium cursor-pointer text-gray-800 dark:text-gray-200"
            >
              {formatFlagName(flagName)}
            </label>
            
            <div 
              className="relative inline-block w-10 align-middle select-none cursor-pointer" 
              onClick={() => toggleFeatureFlag(flagName)}
            >
              <input
                type="checkbox"
                id={`flag-${flagName}`}
                checked={isEnabled}
                onChange={() => toggleFeatureFlag(flagName)}
                className="sr-only"
              />
              <div 
                className={`block w-10 h-6 rounded-full transition-colors ${isEnabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
              />
              <div 
                className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isEnabled ? 'transform translate-x-4' : ''}`}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
        <p>These settings are saved in your browser and will persist across sessions.</p>
      </div>
    </div>
  );
}

/**
 * Format a flag name for display
 * 
 * Converts camelCase to Title Case with spaces
 * 
 * @param flagName - The flag name to format
 * @returns Formatted flag name
 */
function formatFlagName(flagName: string): string {
  // Convert camelCase to space-separated words
  const words = flagName.replace(/([A-Z])/g, ' $1');
  
  // Capitalize first letter and trim
  return words.charAt(0).toUpperCase() + words.slice(1).trim();
} 