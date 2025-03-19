import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValueText } from "@/components/ui/select";
import { LoadingDisplay, ModuleInfo, ModuleList, NotFound } from "@/features/perspectives/components/PerspectiveModules";
import { usePerspectiveModules } from "@/features/perspectives/hooks";
import type { PerspectiveModule } from "@/features/perspectives/types";
import {
	Box,
	Button,
	Code,
	Flex,
	Heading,
	Text,
    createListCollection
} from "@chakra-ui/react";
import { Outlet, createFileRoute, useMatches, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/perspectives/module/$moduleName")({
	component: ModulePage,
});

/**
 * Component to display detailed schema validation errors
 */
function SchemaValidationError({ error }: { error: Error }) {
	// Check if the error contains validation information
	const isSchemaError = error.message.includes("Invalid enum value") || 
		error.message.includes("schema_fields") ||
		error.message.includes("Expected 'str' | 'float'");

	return (
		<Box
			p={5}
			borderRadius="md"
			border="1px"
			borderColor="red.500"
			bg="red.50"
		>
			<Flex alignItems="center" mb={3}>
				<Heading size="md" color="red.700">Schema Validation Error</Heading>
			</Flex>
			<Box>
				{isSchemaError ? (
					<>
						<Text mb={3}>
							There was an error loading perspectives due to schema validation issues with complex fields.
							The system is expecting only simple field types ('str' or 'float') but found complex nested objects.
						</Text>
						<Text fontWeight="bold" mb={2}>Possible Solutions:</Text>
						<Box as="ul" pl={5} mb={3}>
							<Box as="li" mb={2}>Update the server to support complex field structures (recommended)</Box>
							<Box as="li" mb={2}>Simplify perspective schemas to avoid nested fields</Box>
						</Box>
						<Text fontWeight="bold" mb={2}>Technical Details:</Text>
						<Code p={3} borderRadius="md" display="block" whiteSpace="pre-wrap" fontSize="sm" mb={3}>
							{error.message}
						</Code>
					</>
				) : (
					<Text>{error.message}</Text>
				)}
			</Box>
		</Box>
	);
}

function ModulePage() {
	const { moduleName } = Route.useParams();
	const perspectiveModules = usePerspectiveModules();
	const { modules, isLoading, error, refetch, getModule } = perspectiveModules;
	const [selectedModule, setSelectedModule] =
		useState<PerspectiveModule | null>(null);
	const [errorDetails, setErrorDetails] = useState<string | null>(null);
	const navigate = useNavigate();
	const matches = useMatches();
	
	// Check if we're currently at the module root (no perspective selected)
	const isModuleRoot = useMemo(() => {
		return matches.some(match => 
			match.routeId === '/perspectives/module/$moduleName' && 
			match.pathname === `/perspectives/module/${moduleName}`
		);
	}, [matches, moduleName]);

	// Create collection for the select component
	const modulesCollection = useMemo(() => {
		if (!modules) return createListCollection({ items: [] });
		
		return createListCollection({
			items: modules.map(module => ({
				label: module.display_name || module.name,
				value: module.name,
				module: module,
			})),
		});
	}, [modules]);

	// Find the selected module when data is loaded
	useEffect(() => {
		if (modules && modules.length > 0) {
			// Use getModule to find the module directly
			const module = getModule(moduleName);
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
				
				// If we're at the module root and the module has perspectives, 
				// automatically navigate to the first perspective
				if (isModuleRoot && module && module.perspectives.length > 0) {
					const firstPerspective = module.perspectives[0];
					navigate({ 
						to: "/perspectives/module/$moduleName/perspective/$perspectiveName",
						params: { 
							moduleName: moduleName,
							perspectiveName: firstPerspective.name 
						}
					});
				}
			}
		}
	}, [modules, moduleName, navigate, isModuleRoot, getModule]);

	// Handle module change
	const handleModuleChange = (details: { value: string[] }) => {
		const newModuleName = details.value[0];
		if (newModuleName && newModuleName !== moduleName) {
			navigate({ to: "/perspectives/module/$moduleName", params: { moduleName: newModuleName } });
		}
	};

	// Handle loading state
	if (isLoading) {
		return <LoadingDisplay message="Loading module information..." />;
	}

	// Handle error state
	if (error) {
		return (
			<Box p={4}>
				<SchemaValidationError error={error} />
				<Box mt={4} textAlign="center">
					<Button 
						colorScheme="red" 
						size="sm" 
						onClick={() => refetch()}
					>
						Try Again
					</Button>
				</Box>
			</Box>
		);
	}

	// Handle case when module is not found
	if (!selectedModule) {
		return <NotFound type="module" name={moduleName} />;
	}

	return (
		<Flex direction="row" h="100%" overflow="hidden">
			{/* Left sidebar with module info and perspectives list (20% width) */}
			<Box w="25%" p={4} overflow="auto" borderRight="1px" borderColor="gray.200">
				{/* Module selector */}
				<Box mb={4}>
					<SelectRoot 
						collection={modulesCollection} 
						value={moduleName ? [moduleName] : []} 
						onValueChange={handleModuleChange}
						size="sm"
					>
						<SelectTrigger>
							<SelectValueText placeholder="Select module..." />
						</SelectTrigger>
						<SelectContent>
							{modulesCollection.items.map((item) => (
								<SelectItem key={item.value} item={item}>
									{item.label}
								</SelectItem>
							))}
						</SelectContent>
					</SelectRoot>
				</Box>
				
				{/* Module information */}
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
						flexDirection="column"
					>
						<Box mb={2}>{errorDetails}</Box>
						<Button 
							size="sm" 
							colorScheme="yellow" 
							onClick={() => refetch()}
						>
							Retry
						</Button>
					</Box>
				)}
				
				{/* Perspectives list */}
				<Heading size="md" mt={4} mb={4}>
					Perspectives
				</Heading>
				<ModuleList module={selectedModule} />
			</Box>
			
			{/* Right content area with outlet (80% width) */}
			<Box w="75%" h="100%" overflow="auto">
				<Outlet />
			</Box>
		</Flex>
	);
}
