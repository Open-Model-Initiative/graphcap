// SPDX-License-Identifier: Apache-2.0
import { Box, Heading } from "@chakra-ui/react";
import { SetupSection } from "./SetupSection";

export function OpenAISetup() {
  return (
    <Box>
      <Heading size="md" mb={4}>
        OpenAI Setup
      </Heading>
      
      <SetupSection 
        title="External Configuration" 
        description="Set up an OpenAI account and obtain your API key"
      >
        {/* Content for setting up OpenAI account and obtaining API key */}
      </SetupSection>
      
      <Box my={6} borderBottomWidth="1px" borderBottomColor="gray.200" />
      
      <SetupSection 
        title="GraphCap Configuration" 
        description="Configure GraphCap Studio to use your OpenAI credentials"
      >
        {/* Content for configuring GraphCap with OpenAI */}
      </SetupSection>
    </Box>
  );
} 