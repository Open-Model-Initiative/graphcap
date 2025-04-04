// SPDX-License-Identifier: Apache-2.0
import { Box, Heading, Text, Code, Flex, Link as ChakraLink, Image, Grid, GridItem } from "@chakra-ui/react";
import { SetupSection } from "./SetupSection";
import { FiExternalLink } from "react-icons/fi";

export function GoogleSetup() {
  return (
    <Box>
      <Heading size="md" mb={4} display="flex" alignItems="center">
        <Text mr={2}>Google AI Platform Setup</Text>
        {/* We would normally add the Google logo here */}
      </Heading>
      
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
        <GridItem>
          <SetupSection 
            title="External Configuration" 
            description="Configure your Google AI Platform account and obtain API credentials"
          >
            <Box mb={3}>
              <Text mb={2}>
                1. Go to <ChakraLink href="https://aistudio.google.com/" color="blue.500" target="_blank" rel="noopener noreferrer">
                  Google AI Studio <FiExternalLink style={{ display: 'inline' }} />
                </ChakraLink> and sign in with your Google account
              </Text>
              <Text mb={2}>
                2. Navigate to <ChakraLink href="https://aistudio.google.com/app/apikey" color="blue.500" target="_blank" rel="noopener noreferrer">
                  API Keys <FiExternalLink style={{ display: 'inline' }} />
                </ChakraLink> section
              </Text>
              <Text mb={2}>
                3. Click "Create API Key" and provide a name for your key
              </Text>
              <Text mb={2}>
                4. Copy your new API key and store it securely
              </Text>
            </Box>
          </SetupSection>
        </GridItem>
        
        <GridItem>
          <SetupSection 
            title="graphcap Configuration" 
            description="Configure graphcap Studio to use your Google AI Platform credentials"
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
                2. Configure Google Provider
              </Text>
              <Text mb={3}>
                graphcap comes with a pre-configured Google provider. You'll need to add your API key:
              </Text>
              <Text mb={3}>
                a. Select "google" from the provider dropdown
              </Text>
              <Text mb={3}>
                b. Navigate to the "Connection" tab
              </Text>
              <Text mb={3}>
                c. Check that the Base URL is set to: <Code>https://generativelanguage.googleapis.com/v1beta

</Code>
              </Text>
              <Text mb={3}>
                d. Enter your Google AI API Key and click "Save"
              </Text>


              <Text mb={3} fontWeight="medium">
                3. Add Models
              </Text>
              <Text mb={3}>
                Navigate to the "Model" tab and add models you want to use. We recommend:
              </Text>
              <Flex direction="column" mb={3} pl={4}>
                <Text>• gemini-2.0-flash-exp (1500 free calls a day)</Text>
                <Text>• gemini-2.0-flash</Text>
                <Text>• gemini-2.5-pro</Text>
              </Flex>

              <Text mb={3} fontWeight="medium">
                4. Use in Generation Options
              </Text>
              <Text mb={3}>
                Open the Generation Options panel and use the Provider & Model selector to:
              </Text>
              <Text mb={3}>
                a. Select "google" as your provider
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