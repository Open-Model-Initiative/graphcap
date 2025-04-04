// SPDX-License-Identifier: Apache-2.0
import { Box, Heading, Text, Code, Flex, Link as ChakraLink, Image, Grid, GridItem } from "@chakra-ui/react";
import { SetupSection } from "./SetupSection";
import { FiExternalLink, FiServer } from "react-icons/fi";

export function VllmSetup() {
  return (
    <Box>
      <Heading size="md" mb={4} display="flex" alignItems="center">
        <Text mr={2}>vLLM Setup</Text>
        {/* We would normally add the vLLM logo here */}
      </Heading>
      
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
        <GridItem>
          <SetupSection 
            title="External Configuration" 
            description="Setup and configure vLLM for high-performance self-hosted inference"
          >
            <Box mb={3}>
              <Text mb={3}>
                vLLM is a high-performance inference engine for running LLMs locally. 
                graphcap provides a streamlined setup using Docker containers managed by Taskfile.
              </Text>
              
              <Text fontWeight="medium" mb={2}>Prerequisites:</Text>
              <Flex direction="column" mb={3} pl={4}>
                <Text>• Docker installed and running</Text>
                <Text>• NVIDIA drivers supporting CUDA</Text>
                <Text>• NVIDIA Container Toolkit</Text>
                <Text>• Task (Go Task runner) - <ChakraLink href="https://taskfile.dev/installation/" color="blue.500" target="_blank" rel="noopener noreferrer">
                  Installation guide <FiExternalLink style={{ display: 'inline' }} />
                </ChakraLink></Text>
                <Text>• A Hugging Face Hub token set in environment variable <Code>HUGGING_FACE_HUB_TOKEN</Code></Text>
              </Flex>
              
              <Text fontWeight="medium" mb={2}>Running a vLLM Model:</Text>
              <Text mb={2}>
                graphcap uses tasks to run vLLM models with different hardware configurations. Choose a command based on your available GPU memory:
              </Text>
              
              <Box mb={3} borderWidth="1px" borderRadius="md" p={2}>
                <Flex fontWeight="bold" mb={2} px={2}>
                  <Box flex="1">Command</Box>
                  <Box flex="1">Model</Box>
                  <Box flex="1">GPU Memory</Box>
                  <Box flex="1">TP Size</Box>
                </Flex>
                
                <Flex mb={1} px={2} py={1} bg="gray.50" _dark={{ bg: "gray.700" }}>
                  <Box flex="1"><Code>task models:r32:48</Code></Box>
                  <Box flex="1">Qwen2.5-VL-32B-AWQ</Box>
                  <Box flex="1">48GB GPU</Box>
                  <Box flex="1">1</Box>
                </Flex>
                
                <Flex mb={1} px={2} py={1}>
                  <Box flex="1"><Code>task models:r32:2x24</Code></Box>
                  <Box flex="1">Qwen2.5-VL-32B-AWQ</Box>
                  <Box flex="1">2x 24GB GPUs</Box>
                  <Box flex="1">2</Box>
                </Flex>
                <Flex mb={1} px={2} py={1}>
                    <Box flex="1"><Code>task models:r7:24</Code></Box>
                    <Box flex="1">Qwen2.5-VL-7B-AWQ</Box>
                    <Box flex="1">1x 24GB GPU</Box>
                    <Box flex="1">2</Box>
                </Flex>
                <Flex px={2} py={1} bg="gray.50" _dark={{ bg: "gray.700" }}>
                  <Box flex="1"><Code>task models:r7:16</Code></Box>
                  <Box flex="1">Qwen2.5-VL-7B-AWQ</Box>
                  <Box flex="1">16GB GPU</Box>
                  <Box flex="1">1</Box>
                </Flex>
              </Box>
              
              <Box p={3} bg="blue.50" color="blue.800" borderRadius="md" mb={4} _dark={{ bg: "blue.900", color: "blue.100" }}>
                <Flex>
                  <Box mr={2}>ℹ️</Box>
                  <Text>The default port for our vLLM servers are 12434. Make sure this port is available on your host machine if using our scripts.</Text>
                </Flex>
              </Box>
            </Box>
          </SetupSection>
        </GridItem>
        
        <GridItem>
          <SetupSection 
            title="graphcap Configuration" 
            description="Configure graphcap Studio to connect to your vLLM deployment"
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
                2. Configure vLLM Provider
              </Text>
              <Text mb={3}>
                graphcap comes with a pre-configured vLLM provider. You'll need to update the URL to match your deployment:
              </Text>
              <Text mb={3}>
                a. Select "vllm" from the provider dropdown
              </Text>
              <Text mb={3}>
                b. Navigate to the "Connection" tab
              </Text>
              <Text mb={3}>
                c. Update the Base URL to match your vLLM server: <Code>http://localhost:12434</Code> (or your server's address)
              </Text>


              <Text mb={3} fontWeight="medium">
                3. Add Models
              </Text>
              <Text mb={3}>
                Navigate to the "Model" tab and add the models you're running with vLLM. These should match the model name your server is configured with.
              </Text>
              <Text mb={3}>
                If using our vllm configuration script the name of the model will default to "vision-worker"
              </Text>

              
              <Text mb={3} fontSize="sm" color="gray.600">
                Note: The default served model name is "vision-worker" but can be customized in your vLLM configuration.
              </Text>

              <Text mb={3} fontWeight="medium">
                4. Use in Generation Options
              </Text>
              <Text mb={3}>
                Open the Generation Options panel and use the Provider & Model selector to:
              </Text>
              <Text mb={3}>
                a. Select "vllm" as your provider
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