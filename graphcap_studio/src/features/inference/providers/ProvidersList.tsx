// SPDX-License-Identifier: Apache-2.0
import { ProviderSelect } from './form';
import { useProviderFormContext } from './context';

type ProvidersListProps = {
  readonly onSelectProvider: (id: number) => void;
};

/**
 * Component for displaying a list of providers as a dropdown
 */
export default function ProvidersList({ 
  onSelectProvider 
}: ProvidersListProps) {
  const { providers } = useProviderFormContext();
  
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
        onChange={onSelectProvider}
        className="w-full"
      />
    </div>
  );
} 