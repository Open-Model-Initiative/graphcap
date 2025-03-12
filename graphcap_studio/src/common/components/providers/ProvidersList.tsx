// SPDX-License-Identifier: Apache-2.0
import { memo } from 'react';
import { Provider } from '../../../services/types/providers';

type ProvidersListProps = {
  readonly providers: Provider[];
  readonly selectedProviderId: number | null;
  readonly onSelectProvider: (id: number) => void;
};

/**
 * Component for displaying a list of providers
 */
function ProvidersList({ providers, selectedProviderId, onSelectProvider }: ProvidersListProps) {
  if (providers.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        No providers configured
      </div>
    );
  }

  return (
    <div className="divide-y">
      {providers.map(provider => (
        <button 
          key={provider.id}
          className={`w-full text-left p-3 transition-colors duration-150 hover:bg-gray-800 ${
            selectedProviderId === provider.id ? 'bg-gray-800' : ''
          }`}
          onClick={() => onSelectProvider(provider.id)}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">{provider.name}</h4>
              <p className="text-xs text-gray-500">{provider.kind}</p>
            </div>
            <div className={`w-2 h-2 rounded-full ${provider.isEnabled ? 'bg-green-500' : 'bg-gray-300'}`} />
          </div>
        </button>
      ))}
    </div>
  );
}

export default memo(ProvidersList); 