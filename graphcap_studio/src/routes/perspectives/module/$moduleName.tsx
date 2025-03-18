import { ErrorDisplay, LoadingDisplay, ModuleInfo, ModuleList, NotFound } from "@/features/perspectives/components/PerspectiveModules";
import { usePerspectiveModules } from "@/features/perspectives/hooks";
import type { PerspectiveModule } from "@/features/perspectives/types";
import {
	Box,
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
	const { modules, isLoading, error } = usePerspectiveModules();
	const [selectedModule, setSelectedModule] =
		useState<PerspectiveModule | null>(null);

	// Find the selected module when data is loaded
	useEffect(() => {
		if (modules && modules.length > 0) {
			const module = modules.find((m) => m.id === moduleName);
			setSelectedModule(module || null);
		}
	}, [modules, moduleName]);

	// Handle loading state
	if (isLoading) {
		return <LoadingDisplay message="Loading module information..." />;
	}

	// Handle error state
	if (error) {
		return <ErrorDisplay message={error.message} />;
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
