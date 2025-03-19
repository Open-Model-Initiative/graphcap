// SPDX-License-Identifier: Apache-2.0
/**
 * Perspective Management Panel
 * 
 * This component displays a panel for managing perspectives and modules
 */

import { LoadingSpinner } from "@/components/ui/status/LoadingSpinner";
import { Box, Tabs } from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { usePerspectiveModules } from "../../hooks";
import { PerspectiveFilterPanel } from "./PerspectiveFilterPanel";

/**
 * Panel component for perspective management
 */
export function PerspectiveManagementPanel() {
  // Use the perspective modules hook to get real data
  const { modules, isLoading, error, hasModules } = usePerspectiveModules();

  // Handle loading state
  if (isLoading) {
    return (
      <Box display="flex" flexDirection="column" height="full" alignItems="center" justifyContent="center">
        <LoadingSpinner size="md" />
        <Box mt={2} fontSize="sm">Loading perspectives...</Box>
      </Box>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Box display="flex" flexDirection="column" height="full" p={4}>
        <Box fontSize="sm" color="red.500">Error loading perspectives:</Box>
        <Box fontSize="xs" mt={1}>{error.message}</Box>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" height="full" overflow="hidden">
      <Tabs.Root 
        defaultValue="modules" 
        variant="enclosed" 
        colorPalette="blue"
        height="100%"
      >
        <Tabs.List borderBottomColor="gray.700">
          <Tabs.Trigger value="modules">Modules</Tabs.Trigger>
          <Tabs.Trigger value="visibility">Visibility</Tabs.Trigger>
          <Tabs.Indicator />
        </Tabs.List>

        <Box flex="1" overflow="auto">
          <Tabs.Content value="modules">
            <Box p={2}>
              <Box fontWeight="semibold" fontSize="sm" mb={2}>Perspective Modules</Box>
              
              {!hasModules ? (
                <Box fontSize="sm" color="gray.500">No perspectives found.</Box>
              ) : (
                <Box display="flex" flexDirection="column" gap={4}>
                  {modules.map((module) => (
                    <Box key={module.name} display="flex" flexDirection="column" gap={2}>
                      <Link
                        to="/perspectives/module/$moduleName"
                        params={{ moduleName: module.name }}
                        className="text-sm font-medium hover:underline"
                      >
                        {module.display_name}
                      </Link>
                      
                      <Box as="ul" pl={4} display="flex" flexDirection="column" gap={1}>
                        {module.perspectives?.map((perspective) => {
                          // Extract perspective ID from the full name
                          const perspectiveId = perspective.name.includes("/") 
                            ? perspective.name.split("/").pop() ?? perspective.name
                            : perspective.name;
                            
                          return (
                            <Box as="li" key={perspective.name}>
                              <Link
                                to="/perspectives/module/$moduleName/perspective/$perspectiveName"
                                params={{ 
                                  moduleName: module.name,
                                  perspectiveName: perspectiveId
                                }}
                                className="text-xs hover:underline text-gray-700"
                              >
                                {perspective.display_name}
                              </Link>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Tabs.Content>

          <Tabs.Content value="visibility">
            <PerspectiveFilterPanel />
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </Box>
  );
} 