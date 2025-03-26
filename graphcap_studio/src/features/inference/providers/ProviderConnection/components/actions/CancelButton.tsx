// SPDX-License-Identifier: Apache-2.0
import { useColorMode } from "@/components/ui/theme/color-mode";
import { Button } from "@chakra-ui/react";
import { useProviderFormContext } from "../../../context/ProviderFormContext";

/**
 * Button component for canceling provider form changes
 */
export function CancelButton() {
  const { onCancel } = useProviderFormContext();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // Theme-based colors
  const cancelBg = isDark ? "gray.700" : "gray.100";
  const cancelHoverBg = isDark ? "gray.600" : "gray.200";
  const cancelColor = isDark ? "gray.200" : "gray.800";

  return (
    <Button
      type="button"
      onClick={onCancel}
      size="md"
      bg={cancelBg}
      color={cancelColor}
      px={5}
      fontWeight="medium"
      _hover={{
        bg: cancelHoverBg,
        transform: "translateY(-1px)",
      }}
      _active={{
        transform: "translateY(0)",
      }}
      transition="all 0.2s ease-in-out"
    >
      Cancel
    </Button>
  );
} 