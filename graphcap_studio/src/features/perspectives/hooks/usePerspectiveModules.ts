// SPDX-License-Identifier: Apache-2.0
/**
 * usePerspectiveModules Hook
 *
 * This hook fetches available perspective modules and their perspectives from the server.
 */

import { useServerConnectionsContext } from "@/context";
import { SERVER_IDS } from "@/features/server-connections/constants";
import { useQuery } from "@tanstack/react-query";
import { perspectivesQueryKeys } from "../services/constants";
import type { PerspectiveModule } from "../types";
import { useModules } from "./useModules";

/**
 * Hook to fetch modules and their perspectives
 * 
 * This hook now uses the dedicated module API endpoints instead of
 * client-side grouping of perspectives.
 * 
 * @returns Query result with a list of modules and their perspectives
 */
export function usePerspectiveModules() {
  const { connections } = useServerConnectionsContext();
  const graphcapServerConnection = connections.find(
    (conn) => conn.id === SERVER_IDS.GRAPHCAP_SERVER
  );
  const isConnected = graphcapServerConnection?.status === "connected";
  
  // First, fetch all available modules
  const modulesQuery = useModules();
  
  // Then fetch all module details in a single query
  const modulesWithPerspectivesQuery = useQuery<PerspectiveModule[]>({
    // Use a different query key to avoid conflicts with useModules
    queryKey: [...perspectivesQueryKeys.modules, 'with-perspectives'],
    queryFn: async () => {
      // If we don't have modules data yet, return empty array
      if (!modulesQuery.data || modulesQuery.data.length === 0) {
        return [];
      }
      
      try {
        // We need to fetch perspectives for each module
        const modulePromises = modulesQuery.data.map(async (moduleInfo) => {
          // Import the API here to avoid circular dependencies
          const { perspectivesApi } = await import("../services/api");
          
          try {
            // Fetch perspectives for this module
            const moduleData = await perspectivesApi.getModulePerspectives(moduleInfo.name);
            
            // Convert to our internal PerspectiveModule format
            return {
              name: moduleData.module.name,
              display_name: moduleData.module.display_name,
              description: moduleData.module.description,
              enabled: moduleData.module.enabled,
              perspectives: moduleData.perspectives
            };
          } catch (error) {
            console.error(`Error fetching perspectives for module ${moduleInfo.name}:`, error);
            // Return a module with empty perspectives array on error
            return {
              name: moduleInfo.name,
              display_name: moduleInfo.display_name,
              description: moduleInfo.description || "",
              enabled: moduleInfo.enabled,
              perspectives: []
            };
          }
        });
        
        // Wait for all module promises to resolve
        const modules = await Promise.all(modulePromises);
        return modules;
      } catch (error) {
        console.error("Error fetching module perspectives:", error);
        
        // Return basic module data without perspectives instead of throwing
        if (modulesQuery.data) {
          return modulesQuery.data.map((moduleInfo) => ({
            name: moduleInfo.name,
            display_name: moduleInfo.display_name,
            description: moduleInfo.description || "",
            enabled: moduleInfo.enabled,
            perspectives: []
          }));
        }
        
        throw error;
      }
    },
    // Only run this query when we have modules data and we're connected
    enabled: isConnected && !modulesQuery.isLoading && !!modulesQuery.data,
    // Use the previous data as placeholder while fetching new data
    placeholderData: (prev) => prev || []
  });
  
  // Always return a valid array of modules, even during loading
  const modules = modulesWithPerspectivesQuery.data || [];
  
  return {
    isLoading: modulesQuery.isLoading || modulesWithPerspectivesQuery.isLoading,
    isError: modulesQuery.isError || modulesWithPerspectivesQuery.isError,
    error: modulesQuery.error || modulesWithPerspectivesQuery.error,
    data: modules,
    modules: modules,
    // Add a hasModules flag to easily check if we have modules
    hasModules: modules.length > 0,
    refetch: () => {
      modulesQuery.refetch();
      modulesWithPerspectivesQuery.refetch();
    }
  };
} 