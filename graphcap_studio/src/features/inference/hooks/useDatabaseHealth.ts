import { useServerConnectionsContext } from "@/context/ServerConnectionsContext";
import { SERVER_IDS } from "@/features/server-connections";
// SPDX-License-Identifier: Apache-2.0
import { useQuery } from "@tanstack/react-query";

// Define query keys for database health checks
const dbHealthQueryKeys = {
	all: ["database", "health"] as const,
	connection: (url?: string) => [...dbHealthQueryKeys.all, url] as const
};

/**
 * Custom hook for checking database health with caching via TanStack Query
 */
export function useDatabaseHealth() {
	const { connections } = useServerConnectionsContext();
	const dataServiceConnection = connections.find(
		(conn) => conn.id === SERVER_IDS.DATA_SERVICE,
	);
	
	const url = dataServiceConnection?.url;
	const isConnected = dataServiceConnection?.status === "connected";

	// Use TanStack Query to handle caching
	const dbHealthQuery = useQuery({
		queryKey: dbHealthQueryKeys.connection(url),
		queryFn: async () => {
			if (!url) {
				return { error: "Data service not connected" };
			}

			try {
				const response = await fetch(`${url}/health/db`);
				if (response.ok) {
					return { success: true, message: "Database connection is healthy" };
				}
				const data = await response.json();
				return { error: data.error || "Unknown database error" };
			} catch (error) {
				return {
					error:
						error instanceof Error
							? error.message
							: "Failed to check database health",
				};
			}
		},
		// Only run the query if we have a URL and the service is connected
		enabled: !!url && isConnected,
		// Cache database health check results for 30 seconds
		staleTime: 30 * 1000,
		// Refetch on window focus to ensure up-to-date status
		refetchOnWindowFocus: true,
		// Retry failed checks up to 2 times
		retry: 2,
	});
	
	// Provide a simplified interface for checking connection
	const checkDatabaseConnection = async () => {
		// If we already have data, return it immediately
		if (dbHealthQuery.data) {
			return dbHealthQuery.data;
		}
		
		// Otherwise, trigger a refetch and return the result
		return dbHealthQuery.refetch().then(result => result.data);
	};

	return {
		checkDatabaseConnection,
		isConnected,
		// Expose the query object for advanced usage if needed
		dbHealthQuery,
	};
}
