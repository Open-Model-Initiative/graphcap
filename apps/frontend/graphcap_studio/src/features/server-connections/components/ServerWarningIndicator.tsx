// SPDX-License-Identifier: Apache-2.0
import { Box } from "@chakra-ui/react";
import { memo } from "react";

/**
 * Props for the ServerWarningIndicator component
 */
interface ServerWarningIndicatorProps {
  show: boolean;
}

/**
 * Server Warning Indicator component
 *
 * This component displays a warning indicator when server connections have issues
 */
export const ServerWarningIndicator = memo(function ServerWarningIndicator({
  show,
}: ServerWarningIndicatorProps) {
  if (!show) return null;

  return (
    <Box
      position="absolute"
      top="0"
      right="0"
      width="8px"
      height="8px"
      borderRadius="full"
      bg="yellow.400"
      border="1px solid"
      borderColor="yellow.500"
      transform="translate(25%, -25%)"
    />
  );
}); 