// SPDX-License-Identifier: Apache-2.0
import { Button } from "@chakra-ui/react";
import { useProviderFormContext } from "../../../context/ProviderFormContext";

/**
 * Button to add a new provider
 */
export function AddProviderButton() {
  const { setMode, setProvider } = useProviderFormContext();

  const handleAddProvider = () => {
    // Clear the form and current provider when entering create mode
    setProvider(null);
    setMode("create");
  };

  return (
    <Button
      colorScheme="blue"
      size="sm"
      onClick={handleAddProvider}
    >
      Add Provider
    </Button>
  );
} 