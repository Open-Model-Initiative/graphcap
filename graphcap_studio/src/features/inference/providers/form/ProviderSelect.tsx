// SPDX-License-Identifier: Apache-2.0
import { Provider } from '../types';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValueText,
} from '@/components/ui/select';
import { createListCollection } from '@chakra-ui/react';

type ProviderSelectProps = {
  readonly providers: Provider[];
  readonly selectedProviderId: number | null;
  readonly onChange: (id: number) => void;
  readonly className?: string;
  readonly 'aria-label'?: string;
};

/**
 * Component for selecting a provider from a dropdown
 */
export function ProviderSelect({
  providers,
  selectedProviderId,
  onChange,
  className,
  'aria-label': ariaLabel = 'Select Provider'
}: ProviderSelectProps) {
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
  
  return (
    <SelectRoot
      collection={providerCollection}
      value={value}
      onValueChange={(details) => onChange(Number(details.value[0]))}
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