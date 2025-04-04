// SPDX-License-Identifier: Apache-2.0
import { Box, Heading } from "@chakra-ui/react";
import { SetupSection } from "./SetupSection";

export function OllamaSetup() {
  return (
    <Box>
      <Heading size="md" mb={4}>
        Ollama Setup
      </Heading>
      
      <SetupSection 
        title="External Configuration" 
        description="Install and configure Ollama for simple self-hosted inference"
      >
        {/* Content for setting up Ollama */}
      </SetupSection>
      
      <Box my={6} borderBottomWidth="1px" borderBottomColor="gray.200" />
      
      <SetupSection 
        title="GraphCap Configuration" 
        description="Configure GraphCap Studio to connect to your Ollama instance"
      >
        {/* Content for configuring GraphCap with Ollama */}
      </SetupSection>
    </Box>
  );
} 