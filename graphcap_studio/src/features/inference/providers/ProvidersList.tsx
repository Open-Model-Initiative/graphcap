// SPDX-License-Identifier: Apache-2.0
import { Provider } from './types';
import { ProviderSelect } from './form';

type ProvidersListProps = {
  readonly providers: Provider[];
  readonly selectedProviderId: number | null;
  readonly onSelectProvider: (id: number) => void;
};

/**
 * Component for displaying a list of providers as a dropdown
 */
export default function ProvidersList({ 
  providers, 
  selectedProviderId, 
  onSelectProvider 
}: ProvidersListProps) {
  if (providers.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-gray-500">No providers available</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <ProviderSelect
        providers={providers}
        selectedProviderId={selectedProviderId}
        onChange={onSelectProvider}
        className="w-full"
      />
    </div>
  );
} 