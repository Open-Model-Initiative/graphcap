// SPDX-License-Identifier: Apache-2.0
import { Box, Heading } from "@chakra-ui/react";
import { SetupSection } from "./SetupSection";

export function VllmSetup() {
  return (
    <Box>
      <Heading size="md" mb={4}>
        vLLM Setup
      </Heading>
      
      <SetupSection 
        title="External Configuration" 
        description="Setup and configure vLLM for high-performance self-hosted inference"
      >
        {/* Content for setting up vLLM */}
      </SetupSection>
      
      <Box my={6} borderBottomWidth="1px" borderBottomColor="gray.200" />
      
      <SetupSection 
        title="GraphCap Configuration" 
        description="Configure GraphCap Studio to connect to your vLLM deployment"
      >
        {/* Content for configuring GraphCap with vLLM */}
      </SetupSection>
    </Box>
  );
} 