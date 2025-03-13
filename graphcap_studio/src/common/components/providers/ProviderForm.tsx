// SPDX-License-Identifier: Apache-2.0
import { memo } from 'react';
import { ProviderCreate, ProviderUpdate } from '../../../services/types/providers';
import { ProviderFormData } from './form/index';
import { ProviderFormProvider, useProviderFormContext } from './context';
import { FormFields } from './FormFields';
import { ModelSelectionSection } from './ModelSelectionSection';
import { FormActions } from './FormActions';
import { Box, Heading, Stack, VStack } from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/color-mode';

type ProviderFormProps = {
  readonly initialData?: Partial<ProviderCreate | ProviderUpdate>;
  readonly isCreating: boolean;
  readonly onSubmit: (data: ProviderFormData) => void;
  readonly onCancel: () => void;
  readonly isSubmitting: boolean;
  readonly onModelSelect?: (providerName: string, modelId: string) => void;
};

/**
 * Component for provider creation/editing form with integrated model selection
 */
function ProviderForm(props: ProviderFormProps) {
  const { initialData, isCreating, onSubmit, onCancel, isSubmitting, onModelSelect } = props;
  
  return (
    <ProviderFormProvider
      initialData={initialData}
      isCreating={isCreating}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      onModelSelect={onModelSelect}
    >
      <FormContent />
    </ProviderFormProvider>
  );
}

/**
 * Inner component that uses the context
 */
function FormContent() {
  const { handleSubmit, onSubmit, providerName } = useProviderFormContext();
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)} p={4}>
      <Heading size="sm" mb={4} color={textColor}>
        {providerName ? `Edit Provider: ${providerName}` : 'Add Provider'}
      </Heading>
      
      <VStack gap={4} align="stretch">
        <FormFields />
        
        {/* Model Selection Section */}
        {providerName && (
          <Box borderTop="1px" borderColor={borderColor} pt={4}>
            <ModelSelectionSection />
          </Box>
        )}
        
        <FormActions />
      </VStack>
    </Box>
  );
}

export default memo(ProviderForm); 