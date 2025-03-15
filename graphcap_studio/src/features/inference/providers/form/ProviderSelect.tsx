// SPDX-License-Identifier: Apache-2.0
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValueText,
} from '@/components/ui/select';
import { createListCollection } from '@chakra-ui/react';
import { useInferenceProviderContext } from '../context';

type ProviderSelectProps = {
  readonly className?: string;
  readonly 'aria-label'?: string;
};

/**
 * Component for selecting a provider from a dropdown
 */
export function ProviderSelect({
  className,
  'aria-label': ariaLabel = 'Select Provider'
}: ProviderSelectProps) {
  const { 
    providers, 
    selectedProvider, 
    setSelectedProvider,
    setMode
  } = useInferenceProviderContext();
  
  const selectedProviderId = selectedProvider?.id ?? null;
  
  // Convert providers to the format expected by SelectRoot
  const providerItems = providers.map(provider => ({
    label: provider.name,
    value: String(provider.id)
  }));
  
  const providerCollection = createListCollection({
    items: providerItems
  });
  
  // Convert selectedProviderId to string array format
  const value = selectedProviderId ? [String(selectedProviderId)] : [];

  const handleProviderChange = (details: any) => {
    const id = Number(details.value[0]);
    const provider = providers.find(p => p.id === id);
    if (provider) {
      setSelectedProvider(provider);
      setMode('view');
    }
  };
  
  return (
    <SelectRoot
      collection={providerCollection}
      value={value}
      onValueChange={handleProviderChange}
      aria-label={ariaLabel}
      className={className}
    >
      <SelectTrigger>
        <SelectValueText placeholder="Select a provider" />
      </SelectTrigger>
      <SelectContent>
        {providerItems.map((item) => (
          <SelectItem key={item.value} item={item}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
} 