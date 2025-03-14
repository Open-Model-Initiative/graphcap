// SPDX-License-Identifier: Apache-2.0
import { memo } from 'react';
import { FormFields } from './FormFields';
import { Box, Button, Flex } from '@chakra-ui/react';
import { useProviderFormContext } from './context';

/**
 * Component for provider form that displays fields in either view or edit mode
 */
function ProviderForm() {
  const {
    selectedProvider,
    isSubmitting,
    onSubmit,
    onCancel,
    mode,
    setMode
  } = useProviderFormContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProvider) {
      onSubmit(selectedProvider);
    }
  };

  const isEditing = mode === 'edit';

  return (
    <Box as="form" onSubmit={handleSubmit} p={4}>
      <FormFields />
      
      {/* Actions */}
      <Flex justify="flex-end" mt={4} gap={2}>
        {isEditing ? (
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
              Save Changes
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