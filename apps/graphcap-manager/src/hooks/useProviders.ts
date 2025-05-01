import { useToast } from "@graphcap/ui/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api";

/**
 * Provider type – mirrors the server-side `Provider` schema but with
 * camelCase keys (the backend already returns camelCase).
 */
export interface Provider {
  id: number;
  name: string;
  kind: string;
  environment: "cloud" | "local";
  baseUrl: string;
  apiKey?: string | null;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderInput {
  name: string;
  kind: string;
  environment: "cloud" | "local";
  baseUrl: string;
  apiKey?: string | null;
  isEnabled?: boolean;
}

const queryKeys = {
  all: ["providers"] as const,
  detail: (id: number) => ["providers", id] as const,
};

// ---------------------------------------------------------------------------
// LIST
// ---------------------------------------------------------------------------
export function useProviders() {
  const toast = useToast();

  return useQuery<Provider[], Error>({
    queryKey: queryKeys.all,
    queryFn: async () => {
      const res = await apiClient.api.providers.$get();
      if (!res.ok) {
        throw new Error(`Failed to fetch providers – ${res.status}`);
      }
      return res.json();
    },
    onError: (err) => {
      toast.error(`Failed to load providers: ${err.message}`);
    },
    staleTime: 30_000,
  });
}

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------
export function useCreateProvider() {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProviderInput) => {
      const res = await apiClient.api.providers.$post({ json: data });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Create failed (${res.status}) – ${text}`);
      }
      return res.json() as Promise<Provider>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      toast.success("Provider created");
    },
    onError: (err: Error) => {
      toast.error(`Create provider failed: ${err.message}`);
    },
  });
}

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------
export function useUpdateProvider() {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ProviderInput> }) => {
      const res = await apiClient.api.providers[":id"].$patch({ param: { id }, json: data });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Update failed (${res.status}) – ${text}`);
      }
      return res.json() as Promise<Provider>;
    },
    onSuccess: (prov) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(prov.id) });
      toast.success("Provider updated");
    },
    onError: (err: Error) => {
      toast.error(`Update provider failed: ${err.message}`);
    },
  });
}

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------
export function useDeleteProvider() {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.api.providers[":id"].$delete({ param: { id } });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Delete failed (${res.status}) – ${text}`);
      }
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      queryClient.removeQueries({ queryKey: queryKeys.detail(id) });
      toast.success("Provider deleted");
    },
    onError: (err: Error) => {
      toast.error(`Delete provider failed: ${err.message}`);
    },
  });
} 