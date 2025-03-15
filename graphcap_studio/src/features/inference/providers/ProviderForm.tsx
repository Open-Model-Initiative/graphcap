// SPDX-License-Identifier: Apache-2.0
import { memo } from 'react';
import { FormFields } from './FormFields';
import { Box, Button, Flex } from '@chakra-ui/react';
import { useInferenceProviderContext } from './context';

/**
 * Component for provider form that displays fields in either view or edit mode
 */
function ProviderForm() {
  const {
    handleSubmit,
    isSubmitting,
    onSubmit,
    onCancel,
    mode,
    setMode
  } = useInferenceProviderContext();

  const isEditing = mode === 'edit';
  const isCreating = mode === 'create';

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)} p={4}>
      <FormFields />
      
      {/* Actions */}
      <Flex justify="flex-end" mt={4} gap={2}>
        {isEditing || isCreating ? (
          <>
            <Button
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              loadingText="Saving..."
              loading={isSubmitting}
            >
              {isCreating ? 'Create Provider' : 'Save Changes'}
            </Button>
          </>
        ) : (
          <Button
            colorScheme="blue"
            onClick={() => setMode('edit')}
          >
            Edit Provider
          </Button>
        )}
      </Flex>
    </Box>
  );
}

export default memo(ProviderForm); 