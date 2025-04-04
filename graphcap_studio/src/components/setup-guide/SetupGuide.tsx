// SPDX-License-Identifier: Apache-2.0
import { useServerConnectionsContext } from "@/context/ServerConnectionsContext";
import { ServerTutorialDialog, ServerTutorialInfo } from "@/features/server-connections/components";
import { useColorModeValue } from "@/components/ui/theme/color-mode";
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  GridItem,
  Heading,
  Icon,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiCheck, FiServer, FiSettings, FiImage } from "react-icons/fi";
import { ProviderTutorialDialog } from "./ProviderTutorialDialog";

interface StepProps {
  readonly number: number;
  readonly title: string;
  readonly icon: React.ReactNode;
  readonly isCompleted?: boolean;
  readonly onClick: () => void;
}

function SetupStep({ number, title, icon, isCompleted, onClick }: StepProps) {
  const bgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const accentColor = useColorModeValue("blue.500", "blue.300");
  const completedBg = useColorModeValue("green.50", "green.900");
  const completedBorder = useColorModeValue("green.200", "green.700");

  return (
    <Card.Root
      bg={isCompleted ? completedBg : bgColor}
      borderColor={isCompleted ? completedBorder : borderColor}
      borderWidth="1px"
      borderRadius="md"
      cursor="pointer"
      onClick={onClick}
      transition="all 0.2s"
      _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
      h="100%"
    >
      <Card.Body>
        <Flex alignItems="center" gap={4} mb={4}>
          <Flex
            alignItems="center"
            justifyContent="center"
            bg={isCompleted ? "green.500" : accentColor}
            color="white"
            borderRadius="full"
            w="40px"
            h="40px"
            flexShrink={0}
          >
            {isCompleted ? <FiCheck size={20} /> : <Text fontWeight="bold">{number}</Text>}
          </Flex>
          <Box>
            <Heading size="sm" mb={1}>
              {title}
            </Heading>
            <Flex alignItems="center" gap={2} color="gray.500">
              {icon}
              <Text fontSize="sm">
                {isCompleted ? "Completed" : "Click to learn more"}
              </Text>
            </Flex>
          </Box>
        </Flex>
      </Card.Body>
    </Card.Root>
  );
}

// Server connection tutorial info
const serverInfo: ServerTutorialInfo = {
  title: "Server Connections Setup",
  description: "graphcap Studio requires connections to several services to function properly. Each service handles different aspects of the application.",
  setupSteps: [
    "Open the Server Connections panel by clicking the server icon on the right side of the screen.",
    "For each service (Media Server, Inference Bridge, and Data Service), enter the URL where the service is running.",
    "Click the 'Connect' button for each service to establish a connection.",
    "You can use the 'Connect All' button to connect to all services at once.",
  ],
  additionalInfo: "The default URLs are configured to work with local development setups. If you're running the services on different machines or ports, you'll need to update the URLs accordingly."
};

// Gallery tutorial info
const galleryInfo: ServerTutorialInfo = {
  title: "Exploring the Gallery",
  description: "The Gallery contains various datasets and perspectives that showcase graphcap's capabilities.",
  setupSteps: [
    "Navigate to the Gallery page by clicking 'Gallery' in the main navigation.",
    "Browse available datasets and click on one to view details.",
    "Select a perspective to see how graphcap processes  the data.",
  ],
  additionalInfo: "Perspectives are different ways of viewing and analyzing data. Each perspective highlights different aspects of the data and uses different AI capabilities."
};

export function SetupGuide() {
  const { connections, hasWarnings } = useServerConnectionsContext();
  const [activeDialog, setActiveDialog] = useState<"server" | "provider" | "gallery" | null>(null);
  const [activeProvider, setActiveProvider] = useState<"google" | "openai" | "vllm" | "ollama" | null>(null);

  // Check if servers are connected
  const hasConnectedServers = connections.some(conn => conn.status === "connected");

  const handleProviderClick = () => {
    setActiveDialog("provider");
  };

  const handleProviderDialogClose = () => {
    setActiveDialog(null);
    setActiveProvider(null);
  };

  const openProviderDialog = (provider: "google" | "openai" | "vllm" | "ollama") => {
    setActiveProvider(provider);
  };

  return (
    <>
      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
        <GridItem>
          <SetupStep
            number={1}
            title="Setup Server Connections"
            icon={<FiServer />}
            isCompleted={hasConnectedServers && !hasWarnings}
            onClick={() => setActiveDialog("server")}
          />
        </GridItem>
        <GridItem>
          <SetupStep
            number={2}
            title="Configure Providers"
            icon={<FiSettings />}
            onClick={handleProviderClick}
          />
        </GridItem>
        <GridItem>
          <SetupStep
            number={3}
            title="Explore the Gallery"
            icon={<FiImage />}
            onClick={() => setActiveDialog("gallery")}
          />
        </GridItem>
      </Grid>

      <ServerTutorialDialog
        isOpen={activeDialog === "server"}
        onClose={() => setActiveDialog(null)}
        serverInfo={serverInfo}
      />

      <ProviderTutorialDialog
        isOpen={activeDialog === "provider"}
        onClose={handleProviderDialogClose}
        activeProvider={activeProvider}
        onSelectProvider={openProviderDialog}
      />

      <ServerTutorialDialog
        isOpen={activeDialog === "gallery"}
        onClose={() => setActiveDialog(null)}
        serverInfo={galleryInfo}
      />
    </>
  );
} 