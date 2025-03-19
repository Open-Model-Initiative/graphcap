// SPDX-License-Identifier: Apache-2.0
/**
 * usePerspectiveModules Hook
 *
 * This hook fetches available perspective modules and their perspectives from the server.
 * It combines functionality from both useModules and useModulePerspectives.
 */

import { useServerConnectionsContext } from "@/context";
import { SERVER_IDS } from "@/features/server-connections/constants";
import type { ServerConnection } from "@/features/server-connections/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import {
  API_ENDPOINTS,
  CACHE_TIMES,
  perspectivesQueryKeys,
} from "../services/constants";
import { getGraphCapServerUrl, handleApiError } from "../services/utils";
import type { ModulePerspectivesResponse, Perspective, PerspectiveModule } from "../types";
import { useModules } from "./useModules";
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
 * Enhanced hook to fetch modules and their perspectives
 * 
 * This combined hook provides the functionality of both usePerspectiveModules
 * and useModulePerspectives, allowing for both listing all modules and 
 * accessing a specific module's data.
 * 
 * @returns Query result with a list of modules and their perspectives, plus methods to access specific module data
 */
export function usePerspectiveModules(): ModuleQueryResult {
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