// SPDX-License-Identifier: Apache-2.0
import { Box, Heading } from "@chakra-ui/react";
import { SetupSection } from "./SetupSection";

export function GoogleSetup() {
  return (
    <Box>
      <Heading size="md" mb={4}>
        Google AI Platform Setup
      </Heading>
      
      <SetupSection 
        title="External Configuration" 
        description="Configure your Google AI Platform account and obtain API credentials"
      >
        {/* Content for setting up Google AI Platform account and obtaining API key */}
      </SetupSection>
      
      <Box my={6} borderBottomWidth="1px" borderBottomColor="gray.200" />
      
      <SetupSection 
        title="GraphCap Configuration" 
        description="Configure GraphCap Studio to use your Google AI Platform credentials"
      >
        {/* Content for configuring GraphCap with Google credentials */}
      </SetupSection>
    </Box>
  );
} 