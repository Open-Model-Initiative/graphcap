// SPDX-License-Identifier: Apache-2.0
import { Button } from './form/index';
import { useProviderFormContext } from './context';

/**
 * Component for rendering form action buttons
 */
export function FormActions() {
  const { 
    isSubmitting, 
    isCreating, 
    onCancel 
  } = useProviderFormContext();
  
  // Determine the button text based on form state
  let buttonText = 'Save';
  if (isSubmitting) {
    buttonText = 'Saving...';
  } else if (isCreating) {
    buttonText = 'Create';
  }
  
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button
        type="button"
        variant="secondary"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        isLoading={isSubmitting}
      >
        {buttonText}
      </Button>
    </div>
  );
} 