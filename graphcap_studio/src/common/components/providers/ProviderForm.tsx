// SPDX-License-Identifier: Apache-2.0
import { memo } from 'react';
import { ProviderCreate, ProviderUpdate } from '../../../services/types/providers';
import { ProviderFormData } from './form/index';
import { ProviderFormProvider, useProviderFormContext } from './context';
import { FormFields } from './FormFields';
import { ModelSelectionSection } from './ModelSelectionSection';
import { FormActions } from './FormActions';

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
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <h3 className="text-sm font-medium mb-4">
        {providerName ? `Edit Provider: ${providerName}` : 'Add Provider'}
      </h3>
      
      <div className="space-y-4">
        <FormFields />
        
        {/* Model Selection Section */}
        {providerName && (
          <div className="mt-4 border-t pt-4">
            <ModelSelectionSection />
          </div>
        )}
        
        <FormActions />
      </div>
    </form>
  );
}

export default memo(ProviderForm); 