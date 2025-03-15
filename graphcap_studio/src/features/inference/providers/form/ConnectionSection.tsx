// SPDX-License-Identifier: Apache-2.0
import { Controller } from 'react-hook-form';
import { Field, Input, VStack, Box, Text } from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/theme/color-mode';
import { Switch } from '@/components/ui/buttons/Switch';
import { useInferenceProviderContext } from '../context';

/**
 * Component for displaying and editing provider connection settings
 */
export function ConnectionSection() {
  const { control, errors, watch, isEditing } = useInferenceProviderContext();
  const labelColor = useColorModeValue('gray.600', 'gray.300');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  // Watch form values for read-only display
  const baseUrl = watch('baseUrl');
  const envVar = watch('envVar');
  const isEnabled = watch('isEnabled');

  if (!isEditing) {
    return (
      <VStack gap={4} align="stretch" mt={4}>
        <Box>
          <Text fontSize="sm" color={labelColor}>Base URL</Text>
          <Text color={textColor}>{baseUrl}</Text>
        </Box>
        
        <Box>
          <Text fontSize="sm" color={labelColor}>Environment Variable</Text>
          <Text color={textColor}>{envVar}</Text>
        </Box>
        
        <Box>
          <Text fontSize="sm" color={labelColor}>Status</Text>
          <Text color={textColor}>{isEnabled ? 'Enabled' : 'Disabled'}</Text>
        </Box>
      </VStack>
    );
  }

  return (
    <VStack gap={4} align="stretch" mt={4}>
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
    </VStack>
  );
} 