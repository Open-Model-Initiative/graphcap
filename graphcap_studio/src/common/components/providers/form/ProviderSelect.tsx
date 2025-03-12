// SPDX-License-Identifier: Apache-2.0
import { forwardRef } from 'react';
import { Provider } from '../../../../services/types/providers';
import { Select } from './Select';

type ProviderSelectProps = {
  readonly providers: Provider[];
  readonly selectedProviderId?: number | null;
  readonly onChange: (providerId: number) => void;
  readonly error?: boolean;
  readonly className?: string;
};

/**
 * A dropdown component for selecting providers
 */
export const ProviderSelect = forwardRef<HTMLSelectElement, ProviderSelectProps>(
  ({ providers, selectedProviderId, onChange, error, className, ...props }, ref) => {
    // Convert providers to options format
    const options = providers.map(provider => ({
      value: provider.id.toString(),
      label: `${provider.name} (${provider.kind})`
    }));
    
    // Add an empty option at the beginning
    options.unshift({ value: '', label: 'Select a provider...' });
    
    return (
      <Select
        ref={ref}
        options={options}
        value={selectedProviderId?.toString() ?? ''}
        onChange={(e) => {
          const value = e.target.value;
          if (value) {
            onChange(parseInt(value));
          }
        }}
        error={error}
        className={className}
        {...props}
      />
    );
  }
);

ProviderSelect.displayName = 'ProviderSelect';

export default ProviderSelect; 