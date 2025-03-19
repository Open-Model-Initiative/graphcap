import { ErrorDisplay, LoadingDisplay, ModuleInfo, ModuleList, NotFound } from "@/features/perspectives/components/PerspectiveModules";
import { usePerspectiveModules } from "@/features/perspectives/hooks";
import type { PerspectiveModule } from "@/features/perspectives/types";
import {
	Box,
	Button,
	Flex,
	Heading,
} from "@chakra-ui/react";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/perspectives/module/$moduleName")({
	component: ModulePage,
});

function ModulePage() {
	const { moduleName } = Route.useParams();
	const { modules, isLoading, error, refetch } = usePerspectiveModules();
	const [selectedModule, setSelectedModule] =
		useState<PerspectiveModule | null>(null);
	const [errorDetails, setErrorDetails] = useState<string | null>(null);

	// Find the selected module when data is loaded
	useEffect(() => {
		if (modules && modules.length > 0) {
			const module = modules.find((m) => m.name === moduleName);
			setSelectedModule(module || null);
			
			// If module exists but has no perspectives, check if it might be an API error
			if (module && module.perspectives.length === 0) {
				// Look for HTML response errors in the console logs
				console.debug(`Module ${moduleName} has 0 perspectives. This might indicate an API error.`);
				setErrorDetails(
					"No perspectives found for this module. This could be due to a server configuration issue."
				);
			} else {
				setErrorDetails(null);
			}
		}
	}, [modules, moduleName]);

	// Handle loading state
	if (isLoading) {
		return <LoadingDisplay message="Loading module information..." />;
	}

	// Handle error state
	if (error) {
		return (
			<Box
				p={4}
				borderRadius="md"
				border="1px"
				borderColor="red.500"
				bg="red.50"
				color="red.900"
				m={4}
			>
				<Heading size="md" mb={2}>
					Error Loading Module
				</Heading>
				<Box mb={4}>{error.message}</Box>
				<Button 
					colorScheme="red" 
					size="sm" 
					onClick={() => refetch()}
				>
					Try Again
				</Button>
			</Box>
		);
	}

	// Handle case when module is not found
	if (!selectedModule) {
		return <NotFound type="module" name={moduleName} />;
	}

	return (
		<Flex direction="column" h="100%" overflow="hidden">
			{/* Module information at the top */}
			<Box p={4}>
				<ModuleInfo module={selectedModule} />
				
				{/* Show warning if we have a module with no perspectives */}
				{errorDetails && (
					<Box
						mt={4}
						p={4}
						borderRadius="md"
						border="1px"
						borderColor="yellow.500"
						bg="yellow.50"
						color="yellow.900"
						display="flex"
						alignItems="center"
					>
						<Box flex="1">{errorDetails}</Box>
						<Button 
							size="sm" 
							colorScheme="yellow" 
							onClick={() => refetch()}
						>
							Retry
						</Button>
					</Box>
				)}
			</Box>
			
			{/* Main content area with list and outlet */}
			<Flex flex="1" overflow="hidden">
				{/* Left sidebar with perspectives list (20% width) */}
				<Box w="20%" p={4} overflow="auto" borderRight="1px" borderColor="gray.200">
					<Heading size="md" mb={4}>
						Perspectives
					</Heading>
					<ModuleList module={selectedModule} />
				</Box>
				
				{/* Right content area with outlet (80% width) */}
				<Box w="80%" p={4} overflow="auto">
					<Outlet />
				</Box>
			</Flex>
		</Flex>
	);
}
