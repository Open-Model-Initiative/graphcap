// SPDX-License-Identifier: Apache-2.0
import {
  Box,
  Button,
  Dialog,
  Flex,
  Heading,
  Icon,
  Portal,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { FiSettings } from "react-icons/fi";
import { ProviderCard } from "./provider-cards/ProviderCard";
import { ProviderContent } from "./provider-cards/ProviderContent";
import { ProviderType } from "./types";

interface ProviderTutorialDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly activeProvider: ProviderType | null;
  readonly onSelectProvider: (provider: ProviderType | null) => void;
}

export function ProviderTutorialDialog({
  isOpen,
  onClose,
  activeProvider,
  onSelectProvider,
}: ProviderTutorialDialogProps) {
  const dialogContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleDialogClick(e: MouseEvent) {
      e.stopPropagation();
    }

    const dialogElement = dialogContentRef.current;
    if (dialogElement) {
      dialogElement.addEventListener("click", handleDialogClick);
      return () => {
        dialogElement.removeEventListener("click", handleDialogClick);
      };
    }
  }, []);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content 
            maxW={activeProvider ? "1000px" : "900px"} 
            ref={dialogContentRef}
            maxH="90vh"
          >
            <Dialog.Header>
              <Dialog.Title>
                {activeProvider ? `${activeProvider.toUpperCase()} Provider Setup` : "Provider Setup"}
              </Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <Button variant="ghost" size="sm" aria-label="Close" />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body 
              overflowY="auto" 
              maxH="calc(90vh - 160px)" 
              css={{
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: 'rgba(0,0,0,0.3)',
                },
              }}
            >
              {activeProvider ? (
                <ProviderContent provider={activeProvider} />
              ) : (
                <Box>
                  <Box display="flex" alignItems="flex-start" gap={3} mb={4}>
                    <Icon as={FiSettings} boxSize={6} color="blue.500" mt={1} />
                    <Text>
                      graphcap Studio supports multiple AI providers. Configure at least one provider to use inference capabilities.
                    </Text>
                  </Box>

                  <Heading as="h4" size="sm" mb={4}>
                    Select a provider to learn more:
                  </Heading>
                  
                  <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
                    <ProviderCard 
                      name="Google" 
                      description="Set up Google AI Studio for Gemini models. Recommended cloud option."
                      onClick={() => onSelectProvider("google")}
                    />
                    <ProviderCard 
                      name="vLLM" 
                      description="Configure vLLM for high-performance self hosted inference. Recommended self hosted option."
                      onClick={() => onSelectProvider("vllm")}
                    />
                    <ProviderCard 
                      name="Ollama" 
                      description="Set up Ollama for simple self hosted inference"
                      onClick={() => onSelectProvider("ollama")}
                    />
                    <ProviderCard 
                      name="OpenAI" 
                      description="Configure OpenAI API access for models like GPT-4"
                      onClick={() => onSelectProvider("openai")}
                    />
                  </SimpleGrid>
                </Box>
              )}
            </Dialog.Body>

            <Dialog.Footer>
              {activeProvider ? (
                <Flex gap={2}>
                  <Button variant="outline" onClick={() => onSelectProvider(null as any)}>
                    Back to Providers
                  </Button>
                  <Button colorScheme="blue" onClick={onClose}>
                    Close
                  </Button>
                </Flex>
              ) : (
                <Button colorScheme="blue" onClick={onClose}>
                  Close
                </Button>
              )}
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
} 