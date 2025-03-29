// SPDX-License-Identifier: Apache-2.0
/**
 * usePerspectiveModules Hook
 *
 * This hook fetches available perspective modules and their perspectives from the server.
 * It combines functionality from both useModules and useModulePerspectives.
 */

import { useServerConnectionsContext } from "@/context";
import { SERVER_IDS } from "@/features/server-connections/constants";
import { createInferenceBridgeClient } from "@/features/server-connections/services/apiClients";
import type { ModuleInfo, ModuleListResponse, Perspective, PerspectiveModule } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { handleApiError } from "../services/utils";
import { PerspectiveError } from "./usePerspectives";

type ModuleQueryResult = {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  data: PerspectiveModule[];
  modules: PerspectiveModule[];
  hasModules: boolean;
  refetch: () => void;
  
  // Methods for accessing specific module data
  getModule: (moduleName: string) => PerspectiveModule | undefined;
  getModulePerspectives: (moduleName: string) => {
    module: PerspectiveModule | undefined;
    perspectives: Perspective[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
  };
};

/**
 * Utility function to convert PerspectiveModule to ModuleInfo
 * This maintains compatibility with the older data structure
 */
function perspectiveModuleToModuleInfo(module: PerspectiveModule): ModuleInfo {
  return {
    name: module.name,
    display_name: module.display_name,
    description: module.description,
    enabled: module.enabled,
    perspective_count: module.perspectives.length
  };
}

/**
 * Hook to get just the module info without perspectives
 * This is useful for components that only need the basic module data
 * 
 * @returns Query result with basic module information
 */
export function useModuleInfo() {
  const { modules, isLoading, isError, error, refetch } = usePerspectiveModules();
  
  const moduleInfos = useMemo(() => {
    return modules.map(perspectiveModuleToModuleInfo);
  }, [modules]);
  
  return {
    data: moduleInfos,
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * This hook provides listing all modules and 
 * accessing a specific module's data.
 * 
 * @returns Query result with a list of modules and their perspectives, plus methods to access specific module data
 */
export function usePerspectiveModules(): ModuleQueryResult {
  const { connections } = useServerConnectionsContext();
  const graphcapServerConnection = connections.find(
    (conn) => conn.id === SERVER_IDS.INFERENCE_BRIDGE
  );
  const isConnected = graphcapServerConnection?.status === "connected";
  
  // Fetch all available modules (previously provided by useModules)
  const modulesQuery = useQuery<ModuleInfo[], Error>({
    queryKey: perspectivesQueryKeys.modules,
    queryFn: async () => {
      try {
        // Handle case when server connection is not established
        if (!isConnected) {
          console.warn("Server connection not established");
          throw new PerspectiveError("Server connection not established", {
            code: "SERVER_CONNECTION_ERROR",
            context: { connections },
          });
        }

        // Use the inference bridge client instead of direct fetch
        const client = createInferenceBridgeClient(connections);

        console.debug("Fetching modules from server using API client");

        try {
          const response = await client.perspectives.modules.$get();

          if (!response.ok) {
            return handleApiError(response, "Failed to fetch modules");
          }

          const data = (await response.json()) as ModuleListResponse;

          console.debug(
            `Successfully fetched ${data.modules.length} modules`,
          );

          return data.modules;
        } catch (error) {
          console.error("API client error:", error);
          throw error;
        }
      } catch (error) {
        // Improve error handling - log the error and rethrow
        console.error("Error fetching modules:", error);

        // If it's already a PerspectiveError, just rethrow it
        if (error instanceof PerspectiveError) {
          throw error;
        }

        // Otherwise, wrap it in a PerspectiveError
        throw new PerspectiveError(
          error instanceof Error
            ? error.message
            : "Unknown error fetching modules",
          {
            code: "MODULE_FETCH_ERROR",
            context: { error },
          },
        );
      }
    },
    // Only enable the query when the server is connected
    enabled: isConnected,
    staleTime: CACHE_TIMES.MODULES,
    retry: (failureCount, error) => {
      // Don't retry for connection errors or missing URLs
      if (error instanceof PerspectiveError) {
        if (
          ["SERVER_CONNECTION_ERROR", "MISSING_SERVER_URL"].includes(error.code)
        ) {
          return false;
        }
      }

      // Retry other errors up to 3 times
      return failureCount < 3;
    },
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });

  // Watch for changes in connection status and refetch when connected
  useEffect(() => {
    if (isConnected && modulesQuery.isError) {
      modulesQuery.refetch();
    }
  }, [isConnected, modulesQuery]);
  
  // Then fetch all module details in a single query
  const modulesWithPerspectivesQuery = useQuery<PerspectiveModule[]>({
    // Use a different query key to avoid conflicts with the modules query
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
  
  /**
   * Function to get a specific module by name
   * 
   * @param moduleName - Name of the module to retrieve
   * @returns The module if found, undefined otherwise
   */
  const getModule = useMemo(() => {
    return (moduleName: string): PerspectiveModule | undefined => {
      if (!modulesWithPerspectivesQuery.data) return undefined;
      return modulesWithPerspectivesQuery.data.find(m => m.name === moduleName);
    };
  }, [modulesWithPerspectivesQuery.data]);
  
  /**
   * Function to get perspectives for a specific module
   * 
   * This functionality replaces the previous useModulePerspectives hook
   * 
   * @param moduleName - Name of the module to get perspectives for
   * @returns Object with module data, perspectives, and query state
   */
  const getModulePerspectives = useMemo(() => {
    return (moduleName: string) => {
      // Try to get the module from our already-loaded data first
      const cachedModule = getModule(moduleName);
      
      // If modules are still loading, return loading state with the data we have
      if (modulesWithPerspectivesQuery.isLoading) {
        return {
          module: cachedModule,
          perspectives: cachedModule?.perspectives || [],
          isLoading: true,
          isError: false,
          error: null,
          refetch: () => modulesWithPerspectivesQuery.refetch()
        };
      }
      
      // If we have an error fetching modules, return that error
      if (modulesWithPerspectivesQuery.isError) {
        return {
          module: cachedModule,
          perspectives: cachedModule?.perspectives || [],
          isLoading: false,
          isError: true,
          error: modulesWithPerspectivesQuery.error,
          refetch: () => modulesWithPerspectivesQuery.refetch()
        };
      }
      
      // If we have the module data, return it
      if (cachedModule) {
        return {
          module: cachedModule,
          perspectives: cachedModule.perspectives,
          isLoading: false,
          isError: false,
          error: null,
          refetch: () => modulesWithPerspectivesQuery.refetch()
        };
      }
      
      // If we don't have the module data, it might not exist
      return {
        module: undefined,
        perspectives: [],
        isLoading: false,
        isError: false,
        error: null,
        refetch: () => modulesWithPerspectivesQuery.refetch()
      };
    };
  }, [getModule, modulesWithPerspectivesQuery]);
  
  // Always return a valid array of modules, even during loading
  const modules = modulesWithPerspectivesQuery.data || [];
  
  return {
    isLoading: modulesQuery.isLoading || modulesWithPerspectivesQuery.isLoading,
    isError: modulesQuery.isError || modulesWithPerspectivesQuery.isError,
    error: modulesQuery.error || modulesWithPerspectivesQuery.error || null,
    data: modules,
    modules,
    // Add a hasModules flag to easily check if we have modules
    hasModules: modules.length > 0,
    refetch: () => {
      modulesQuery.refetch();
      modulesWithPerspectivesQuery.refetch();
    },
    // Add methods for accessing specific module data
    getModule,
    getModulePerspectives
  };
} 