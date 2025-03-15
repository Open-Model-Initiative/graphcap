// SPDX-License-Identifier: Apache-2.0
import { Controller } from 'react-hook-form';
import { Field, createListCollection } from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/theme/color-mode';
import { SelectRoot, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { useProviderFormContext } from '../context';
import { PROVIDER_ENVIRONMENTS } from '../../constants';

export function EnvironmentSelect() {
  const { control, errors } = useProviderFormContext();
  const labelColor = useColorModeValue('gray.600', 'gray.300');

  const environmentItems = PROVIDER_ENVIRONMENTS.map(env => ({
    label: env,
    value: env,
  }));
  
  const collection = createListCollection({
    items: environmentItems,
  });

  return (
    <Controller
      name="environment"
      control={control}
      render={({ field }) => (
        <Field.Root invalid={!!errors.environment}>
          <Field.Label color={labelColor}>Environment</Field.Label>
          <SelectRoot
            {...field}
            value={field.value ? [field.value] : []}
            onValueChange={(value) => field.onChange(value)}
            collection={collection}
          >
            <SelectTrigger>
              {field.value || 'Select environment'}
            </SelectTrigger>
            <SelectContent>
              {environmentItems.map(item => (
                <SelectItem key={item.value} item={item}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
          <Field.ErrorText>{errors.environment?.message}</Field.ErrorText>
        </Field.Root>
      )}
    />
  );
} 