import { useToast } from "@graphcap/ui/hooks";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiClient } from "../lib/api";

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
}

export const useHealth = () => {
  const toast = useToast();

  return useQuery<HealthResponse, Error>({
    queryKey: ["health"],
    queryFn: async () => {
      // Call the typed RPC client
      const res = await apiClient.api.health.$get();
      if (!res.ok) {
        throw new Error(`Health check failed with status ${res.status}`);
      }
      return await res.json();
    },
    staleTime: 60_000, // 1 minute
    onError: (error: Error) => {
      toast.error(`API health check failed: ${error.message}`);
    },
    // We already show success toast in the route component
  } as UseQueryOptions<HealthResponse, Error>);
};
