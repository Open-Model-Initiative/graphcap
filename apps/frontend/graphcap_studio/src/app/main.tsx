import { Provider } from "@/components/ui/theme/ThemeProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

// Import styles
import "./index.css";

import { AppContextProvider } from "@/context";
import { useFeatureFlag } from "@/features/app-settings/feature-flags";
import { getQueryClient } from "@/utils/queryClient";
// Import the generated route tree
import { routeTree } from "../routeTree.gen";
import App from "./App";

// Create a new router instance
const router = createRouter({ routeTree });

// Create Query Client
const queryClient = getQueryClient();

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

/**
 * DevTools wrapper component that conditionally renders dev tools based on feature flags
 */
function DevTools() {
	const showReactQueryDevTools = useFeatureFlag("enableReactQueryDevTools");

	return showReactQueryDevTools ? <ReactQueryDevtools /> : null;
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<Provider>
				<QueryClientProvider client={queryClient}>
					<App>
						<AppContextProvider>
							<RouterProvider router={router} />
							<DevTools />
						</AppContextProvider>
					</App>
				</QueryClientProvider>
			</Provider>
		</StrictMode>,
	);
}
