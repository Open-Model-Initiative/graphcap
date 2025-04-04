// SPDX-License-Identifier: Apache-2.0
import { Box, Heading, Text, Code, Flex, Link as ChakraLink, Image, Grid, GridItem } from "@chakra-ui/react";
import { SetupSection } from "./SetupSection";
import { FiExternalLink, FiDownload } from "react-icons/fi";

export function OllamaSetup() {
  return (
    <Box>
      <Heading size="md" mb={4} display="flex" alignItems="center">
        <Text mr={2}>Ollama Setup</Text>
        {/* We would normally add the Ollama logo here */}
      </Heading>
      
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
        <GridItem>
          <SetupSection 
            title="External Configuration" 
            description="Install and configure Ollama for simple self-hosted inference"
          >
            <Box mb={3}>
              <Text mb={3}>
                Ollama is a lightweight tool for running LLMs locally. It's easy to install and provides a simplified interface for running various models.
              </Text>
              
              <Text fontWeight="medium" mb={2}>Installation:</Text>
              <Flex direction="column" mb={3} pl={4}>
                <Text>1. Download and install Ollama from <ChakraLink href="https://ollama.com/download" color="blue.500" target="_blank" rel="noopener noreferrer">
                  ollama.com <FiExternalLink style={{ display: 'inline' }} />
                </ChakraLink></Text>
                <Text>2. Follow the installation instructions for your operating system</Text>
              </Flex>
              
              <Text fontWeight="medium" mb={2}>Run a Model:</Text>
              <Text mb={2}>
                Once Ollama is installed, pull and run a model with these commands:
              </Text>
              
              <Code p={3} display="block" borderRadius="md" mb={3} whiteSpace="pre">
{`# Pull a model (example: gemma3:27b-it-q8_0, a multimodal model)
ollama pull gemma3:27b-it-q8_0

# Run the Ollama server (should run automatically after installation)
ollama serve`}
              </Code>
              
              <Text mb={3}>
                By default, Ollama serves models on <Code>http://localhost:11434</Code>
              </Text>
              
              <Text fontWeight="medium" mb={2}>Recommended Models:</Text>
              <Flex direction="column" mb={3} pl={4}>
                <Text>• gemma3:27b-it-q8_0</Text>
                <Text>• gemma3:27b-it</Text>
                <Text>• gemma3:12b-it-q8_0</Text>
              </Flex>
              
              <Box p={3} bg="blue.50" color="blue.800" borderRadius="md" mb={4} _dark={{ bg: "blue.900", color: "blue.100" }}>
                <Flex>
                  <Box mr={2}>ℹ️</Box>
                  <Text>See <ChakraLink href="https://ollama.com/library" color="blue.500" target="_blank" rel="noopener noreferrer">
                    Ollama Library <FiExternalLink style={{ display: 'inline' }} />
                  </ChakraLink> for more available models.</Text>
                </Flex>
              </Box>
            </Box>
          </SetupSection>
        </GridItem>
        
        <GridItem>
          <SetupSection 
            title="graphcap Configuration" 
            description="Configure graphcap Studio to connect to your Ollama instance"
          >
            <Box>
              <Text mb={3} fontWeight="medium">
                1. Open Provider Configuration
              </Text>
              <Text mb={3}>
                Navigate to the right action panel in graphcap Studio and select the server connection icon.
                Ensure you're connected to the server before proceeding.
              </Text>

              <Text mb={3} fontWeight="medium">
                2. Configure Ollama Provider
              </Text>
              <Text mb={3}>
                graphcap comes with a pre-configured Ollama provider. You'll need to verify the URL matches your Ollama deployment:
              </Text>
              <Text mb={3}>
                a. Select "ollama" from the provider dropdown
              </Text>
              <Text mb={3}>
                b. Navigate to the "Connection" tab
              </Text>
              <Text mb={3}>
                c. Check that the Base URL is set to: <Code>http://localhost:11434</Code> (or your Ollama server's address)
              </Text>
              <Text mb={3}>
                d. Click "Save" 
              </Text>

              <Text mb={3} fontWeight="medium">
                3. Add Models
              </Text>
              <Text mb={3}>
                Navigate to the "Model" tab and add the models you've pulled using Ollama. Model names should match exactly what you used in the Ollama CLI.
              </Text>
              <Text mb={3}>
                For example, if you pulled models using:
              </Text>
              <Code p={2} display="block" borderRadius="md" mb={3}>
{`ollama pull ollama run gemma3:27b-it-q8_0`}
              </Code>
              <Text mb={3}>
                Then add these model names to graphcap:
              </Text>
              <Flex direction="column" mb={3} pl={4}>
                <Text>• gemma3:27b-it-q8_0</Text>
              </Flex>

              <Text mb={3} fontWeight="medium">
                4. Use in Generation Options
              </Text>
              <Text mb={3}>
                Open the Generation Options panel and use the Provider & Model selector to:
              </Text>
              <Text mb={3}>
                a. Select "ollama" as your provider
              </Text>
              <Text mb={3}>
                b. Select your desired model from the dropdown
              </Text>
            </Box>
          </SetupSection>
        </GridItem>
      </Grid>
    </Box>
  );
} 