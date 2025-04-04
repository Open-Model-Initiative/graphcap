// SPDX-License-Identifier: Apache-2.0
import { Box, Heading, Text, Code, Button, Flex, Link as ChakraLink, Image, Grid, GridItem } from "@chakra-ui/react";
import { SetupSection } from "./SetupSection";
import { FiExternalLink } from "react-icons/fi";

export function OpenAISetup() {
  return (
    <Box>
      <Heading size="md" mb={4} display="flex" alignItems="center">
        <Text mr={2}>OpenAI Setup</Text>
        {/* We would normally add the OpenAI logo here */}
      </Heading>
      
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
        <GridItem>
          <SetupSection 
            title="External Configuration" 
            description="Set up an OpenAI account and obtain your API key"
          >
            <Box mb={3}>
              <Text mb={2}>
                1. Sign up for an OpenAI account at <ChakraLink href="https://platform.openai.com/signup" color="blue.500" target="_blank" rel="noopener noreferrer">
                  platform.openai.com <FiExternalLink style={{ display: 'inline' }} />
                </ChakraLink>
              </Text>
              <Text mb={2}>
                2. Navigate to <ChakraLink href="https://platform.openai.com/api-keys" color="blue.500" target="_blank" rel="noopener noreferrer">
                  API Keys <FiExternalLink style={{ display: 'inline' }} />
                </ChakraLink> section and create a new secret key
              </Text>
              <Text mb={2}>
                3. Store your API key securely - you'll need it for graphcap configuration
              </Text>
            </Box>
          </SetupSection>
        </GridItem>
        
        <GridItem>
          <SetupSection 
            title="graphcap Configuration" 
            description="Configure graphcap Studio to use your OpenAI credentials"
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
                2. Configure OpenAI Provider
              </Text>
              <Text mb={3}>
                graphcap comes with a pre-configured OpenAI provider. You'll need to add your API key:
              </Text>
              <Text mb={3}>
                a. Select "openai" from the provider dropdown
              </Text>
              <Text mb={3}>
                b. Navigate to the "Connection" tab
              </Text>
              <Text mb={3}>
                c. Check that the Base URL is set to: <Code>https://api.openai.com/v1</Code>
              </Text>
              <Text mb={3}>
                d. Enter your OpenAI API Key and click "Save"
              </Text>


              <Text mb={3} fontWeight="medium">
                3. Add Models
              </Text>
              <Text mb={3}>
                Navigate to the "Model" tab and add models you want to use. We recommend:
              </Text>
              <Flex direction="column" mb={3} pl={4}>
                <Text>• gpt-4o-mini</Text>
              </Flex>

              <Text mb={3} fontWeight="medium">
                4. Use in Generation Options
              </Text>
              <Text mb={3}>
                Open the Generation Options panel and use the Provider & Model selector to:
              </Text>
              <Text mb={3}>
                a. Select "openai" as your provider
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