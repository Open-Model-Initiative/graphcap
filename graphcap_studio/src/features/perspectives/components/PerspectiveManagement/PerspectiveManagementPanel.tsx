// SPDX-License-Identifier: Apache-2.0
/**
 * Perspective Management Panel
 * 
 * This component displays a panel for managing perspectives and modules
 * using an accordion-based UI for better organization and toggleable options.
 */

import { LoadingSpinner } from "@/components/ui/status/LoadingSpinner";
import { useColorModeValue } from "@/components/ui/theme";
import { 
  Box, 
  Flex,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { usePerspectivesData } from "../../context/PerspectivesDataContext";
import { usePerspectiveModules } from "../../hooks";
import { PerspectiveModuleFilter } from "./PerspectiveModuleFilter";

// Local storage key for accordion state
const ACCORDION_STATE_KEY = "graphcap-perspective-accordion-state";

/**
 * Panel component for perspective management
 */
export function PerspectiveManagementPanel() {
  // Use the perspective modules hook to get real data
  const { modules, isLoading, error, hasModules } = usePerspectiveModules();
  
  // Get perspective visibility control from context
  const { 
    isPerspectiveVisible, 
    togglePerspectiveVisibility, 
    hiddenPerspectives,
    perspectives,
    setAllPerspectivesVisible
  } = usePerspectivesData();

  // State to track which accordion panels are open
  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({});

  // Load accordion state on component mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(ACCORDION_STATE_KEY);
      if (savedState) {
        setOpenPanels(JSON.parse(savedState));
      } else if (modules.length > 0) {
        // Default: open all panels
        const initialState: Record<string, boolean> = {};
        for (const module of modules) {
          initialState[module.name] = true;
        }
        setOpenPanels(initialState);
      }
    } catch (error) {
      console.error("Error loading accordion state:", error);
    }
  }, [modules]);

  // Save accordion state when it changes
  useEffect(() => {
    if (Object.keys(openPanels).length > 0) {
      try {
        localStorage.setItem(ACCORDION_STATE_KEY, JSON.stringify(openPanels));
      } catch (error) {
        console.error("Error saving accordion state:", error);
      }
    }
  }, [openPanels]);

  // Toggle accordion panel
  const togglePanel = (moduleName: string) => {
    setOpenPanels(prev => ({
      ...prev,
      [moduleName]: !prev[moduleName]
    }));
  };

  // Theme colors
  const bgColor = useColorModeValue("white", "#1A202C");
  const textColor = useColorModeValue("gray.800", "white");
  const mutedTextColor = useColorModeValue("gray.500", "gray.400");
  const buttonBorderColor = useColorModeValue("blue.500", "blue.400");
  const buttonColor = useColorModeValue("blue.500", "blue.400");
  const buttonHoverBg = useColorModeValue("blue.50", "blue.900");

  // Handle loading state
  if (isLoading) {
    return (
      <Box display="flex" flexDirection="column" height="full" alignItems="center" justifyContent="center" bg={bgColor}>
        <LoadingSpinner size="md" />
        <Box mt={2} fontSize="sm" color={textColor}>Loading perspectives...</Box>
      </Box>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Box display="flex" flexDirection="column" height="full" p={4} bg={bgColor}>
        <Box fontSize="sm" color="red.500">Error loading perspectives:</Box>
        <Box fontSize="xs" mt={1} color={textColor}>{error.message}</Box>
      </Box>
    );
  }

  // Count visible perspectives
  const totalPerspectives = perspectives.length;
  const visibleCount = totalPerspectives - hiddenPerspectives.length;

  return (
    <Box display="flex" flexDirection="column" height="full" overflow="hidden" p={3} maxH="90%" overflowY="auto" bg={bgColor}>
      <Flex justifyContent="space-between" alignItems="center" mb={3}>
        <Text fontWeight="semibold" fontSize="sm" color={textColor}>Perspective Modules</Text>
        <Text fontSize="xs" color={mutedTextColor}>
          {visibleCount} of {totalPerspectives} visible
        </Text>
      </Flex>
      
      {!hasModules ? (
        <Box fontSize="sm" color={mutedTextColor}>No perspectives found.</Box>
      ) : (
        <Box>
          <Box
            as="fieldset"
            display="flex"
            flexDirection="column"
            gap={3}
            flex="1"
            overflow="auto"
          >
            {modules.map((module) => (
              <PerspectiveModuleFilter
                key={module.name}
                moduleName={module.name}
                displayName={module.display_name}
                perspectives={module.perspectives || []}
                isOpen={!!openPanels[module.name]}
                onTogglePanel={togglePanel}
                isPerspectiveVisible={isPerspectiveVisible}
                togglePerspectiveVisibility={togglePerspectiveVisibility}
              />
            ))}
          </Box>
          
          {/* Show All button at the bottom */}
          <Flex justifyContent="flex-end" mt={3}>
            <Box
              as="button"
              fontSize="xs"
              px={3}
              py={1}
              bg="transparent"
              border="1px solid"
              borderColor={buttonBorderColor}
              color={buttonColor}
              borderRadius="md"
              _hover={{ bg: buttonHoverBg }}
              onClick={setAllPerspectivesVisible}
              opacity={hiddenPerspectives.length === 0 ? 0.5 : 1}
              pointerEvents={hiddenPerspectives.length === 0 ? "none" : "auto"}
            >
              Show All
            </Box>
          </Flex>
        </Box>
      )}
    </Box>
  );
} 