// SPDX-License-Identifier: Apache-2.0
import { memo } from 'react';
import { Provider } from './types';
import { ProviderFormProvider, useProviderFormContext } from './context';
import { FormFields } from './FormFields';
import { ModelSelectionSection } from './ModelSelectionSection';
import { FormActions } from './FormActions';
import { Box } from '@chakra-ui/react';

type ProviderFormProps = {
  readonly provider?: Provider;
  readonly isEditing: boolean;
  readonly onEdit: () => void;
  readonly onSubmit: (data: Provider) => void;
  readonly onCancel: () => void;
  readonly isSubmitting: boolean;
  readonly onModelSelect?: (providerName: string, modelId: string) => void;
};

/**
 * Component for provider creation/editing form with integrated model selection
 */
function ProviderForm(props: ProviderFormProps) {
  const { 
    provider,
    isEditing,
    onEdit,
    onSubmit,
    onCancel,
    isSubmitting,
    onModelSelect
  } = props;
  
  return (
    <ProviderFormProvider
      initialData={provider}
      isCreating={!provider}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      onModelSelect={onModelSelect}
    >
      <FormContent isEditing={isEditing} onEdit={onEdit} />
    </ProviderFormProvider>
  );
}

/**
 * Inner component that uses the context
 */
function FormContent({ isEditing, onEdit }: { isEditing: boolean; onEdit: () => void }) {
  const { handleSubmit, onSubmit } = useProviderFormContext();
  
  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)} p={4}>
      <FormFields isEditing={isEditing} />

      <FormActions />
    </Box>
  );
}

export default memo(ProviderForm); 