// SPDX-License-Identifier: Apache-2.0
import { Flex, HStack } from "@chakra-ui/react";
import { useProviderFormContext } from "../../context/ProviderFormContext";
import { CancelButton, EditButton, SaveButton, TestConnectionButton } from "./actions";

/**
 * Component for rendering provider form actions based on current mode
 */
export function ProviderActions() {
  const { mode } = useProviderFormContext();
  const isEditing = mode === "edit";
  const isCreating = mode === "create";

  if (isEditing || isCreating) {
    return (
      <Flex justify="flex-end" mt={6}>
        <HStack gap={3}>
          <CancelButton />
          <SaveButton />
        </HStack>
      </Flex>
    );
  }

  return (
    <Flex justify="flex-end" mt={4} gap={2}>
      <TestConnectionButton />
      <EditButton />
    </Flex>
  );
} 