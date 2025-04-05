import { QueryClient, QueryClientProvider, QueryErrorResetBoundary } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";

// Create a client
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 minutes
			gcTime: 10 * 60 * 1000, // 10 minutes
			retry: 1,
			refetchOnWindowFocus: false,
			refetchOnReconnect: true,
			throwOnError: true, // Make errors propagate to error boundaries
			refetchInterval: (query) => {
				if (Array.isArray(query.queryKey)) {
					const queryKeyString = query.queryKey.join("-").toLowerCase();
					if (
						queryKeyString.includes("server") ||
						queryKeyString.includes("connection") ||
						queryKeyString.includes("perspectives")
					) {
						return 30000;
					}
				}
				return false;
			},
		},
		mutations: {
			throwOnError: true, 
		},
	},
});

interface QueryProviderProps {
	readonly children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
	return (
		<QueryErrorResetBoundary>
			{({ reset }) => (
				<ErrorBoundary
					onReset={reset}
					fallbackRender={({ error, resetErrorBoundary }) => (
						<div className="p-4 bg-red-50 text-red-700 rounded-md shadow">
							<h3 className="font-bold text-lg mb-2">Something went wrong!</h3>
							<p className="mb-2">{error.message}</p>
							<button 
								onClick={() => resetErrorBoundary()}
								className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
								type="button"
							>
								Try again
							</button>
						</div>
					)}
				>
					<QueryClientProvider client={queryClient}>
						{children}
						{process.env.NODE_ENV === "development" && (
							<ReactQueryDevtools initialIsOpen={false} />
						)}
					</QueryClientProvider>
				</ErrorBoundary>
			)}
		</QueryErrorResetBoundary>
	);
}
