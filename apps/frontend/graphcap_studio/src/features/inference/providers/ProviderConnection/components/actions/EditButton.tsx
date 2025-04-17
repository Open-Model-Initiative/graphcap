// SPDX-License-Identifier: Apache-2.0
import { Button } from "@chakra-ui/react";
import { useProviderFormContext } from "../../../context/ProviderFormContext";

/**
 * Button component for editing provider
 */
export function EditButton() {
  const { setMode } = useProviderFormContext();

  return (
    <Button 
      colorScheme="blue" 
      onClick={() => setMode("edit")}
    >
      Edit Provider
    </Button>
  );
} 