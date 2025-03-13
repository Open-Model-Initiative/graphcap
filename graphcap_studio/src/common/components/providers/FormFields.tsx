// SPDX-License-Identifier: Apache-2.0
import { ChangeEvent } from 'react';
import { Controller } from 'react-hook-form';
import { PROVIDER_ENVIRONMENTS } from '../../../features/inference/constants';
import { useProviderFormContext } from './context';
import {
  Field,
  Input,
  VStack,
  Box,
  Text,
  createListCollection,
} from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/color-mode';
import { Switch } from '@/components/ui/switch';
import { SelectRoot, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';

/**
 * Component for rendering provider form fields
 */
export function FormFields() {
  const { control, errors } = useProviderFormContext();
  const labelColor = useColorModeValue('gray.600', 'gray.300');
  
  const environmentItems = PROVIDER_ENVIRONMENTS.map(env => ({
    label: env,
    value: env,
  }));
  
  const collection = createListCollection({
    items: environmentItems,
    id: 'environment-select',
  });
  
  return (
    <VStack gap={4} align="stretch">
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <Field.Root invalid={!!errors.name}>
            <Field.Label color={labelColor}>Name</Field.Label>
            <Input {...field} id="name" />
            <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
          </Field.Root>
        )}
      />
      
      <Controller
        name="kind"
        control={control}
        render={({ field }) => (
          <Field.Root invalid={!!errors.kind}>
            <Field.Label color={labelColor}>Kind</Field.Label>
            <Input {...field} id="kind" />
            <Field.ErrorText>{errors.kind?.message}</Field.ErrorText>
          </Field.Root>
        )}
      />
      
      <Controller
        name="environment"
        control={control}
        render={({ field }) => (
          <Field.Root invalid={!!errors.environment}>
            <Field.Label color={labelColor}>Environment</Field.Label>
            <SelectRoot
              {...field}
              value={[field.value ?? '']}
              onValueChange={(value) => field.onChange(value[0])}
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
      
      <Controller
        name="baseUrl"
        control={control}
        render={({ field }) => (
          <Field.Root invalid={!!errors.baseUrl}>
            <Field.Label color={labelColor}>Base URL</Field.Label>
            <Input {...field} id="baseUrl" type="url" />
            <Field.ErrorText>{errors.baseUrl?.message}</Field.ErrorText>
          </Field.Root>
        )}
      />
      
      <Controller
        name="envVar"
        control={control}
        render={({ field }) => (
          <Field.Root invalid={!!errors.envVar}>
            <Field.Label color={labelColor}>Environment Variable</Field.Label>
            <Input {...field} id="envVar" />
            <Field.ErrorText>{errors.envVar?.message}</Field.ErrorText>
          </Field.Root>
        )}
      />
      
      <Controller
        name="isEnabled"
        control={control}
        render={({ field: { value, onChange, ...field } }) => (
          <Field.Root>
            <Field.Label color={labelColor}>
              <Switch
                {...field}
                id="isEnabled"
                checked={value}
                onCheckedChange={onChange}
              >
                Enabled
              </Switch>
            </Field.Label>
          </Field.Root>
        )}
      />
      
      <Box>
        <Text fontSize="xs" color={labelColor} mb={1}>Rate Limits</Text>
        <VStack gap={2} align="stretch">
          <Controller
            name="rateLimits.requestsPerMinute"
            control={control}
            render={({ field: { value, onChange, ...field } }) => (
              <Field.Root invalid={!!errors.rateLimits?.requestsPerMinute}>
                <Field.Label color={labelColor}>Requests per minute</Field.Label>
                <Input
                  {...field}
                  id="requestsPerMinute"
                  type="number"
                  value={value ?? 0}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(parseInt(e.target.value) || 0)}
                  min={0}
                />
                <Field.ErrorText>{errors.rateLimits?.requestsPerMinute?.message}</Field.ErrorText>
              </Field.Root>
            )}
          />
          
          <Controller
            name="rateLimits.tokensPerMinute"
            control={control}
            render={({ field: { value, onChange, ...field } }) => (
              <Field.Root invalid={!!errors.rateLimits?.tokensPerMinute}>
                <Field.Label color={labelColor}>Tokens per minute</Field.Label>
                <Input
                  {...field}
                  id="tokensPerMinute"
                  type="number"
                  value={value ?? 0}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(parseInt(e.target.value) || 0)}
                  min={0}
                />
                <Field.ErrorText>{errors.rateLimits?.tokensPerMinute?.message}</Field.ErrorText>
              </Field.Root>
            )}
          />
        </VStack>
      </Box>
    </VStack>
  );
} 