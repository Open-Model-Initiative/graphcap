import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValueText } from "@/components/ui/select";
import { LoadingDisplay, ModuleInfo, ModuleList, NotFound, SchemaValidationError } from "@/features/perspectives/components/PerspectiveManagement";
import { usePerspectiveModules } from "@/features/perspectives/hooks";
import type { PerspectiveModule } from "@/features/perspectives/types";
import {
	Badge,
	Box,
	Button,
	Flex,
	Heading,
	Text,
    createListCollection
} from "@chakra-ui/react";
import { Outlet, useMatches, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

interface ModulePageProps {
	readonly moduleName: string;
}

/**
 * Page component that displays a module and its perspectives
 */
export function ModulePage({ moduleName }: ModulePageProps) {
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
			{/* Left sidebar with module info and perspectives list */}
			<Box 
				w="25%" 
				h="100%" 
				overflow="auto" 
				borderRight="1px" 
				borderColor="gray.700" 
				bg="gray.900" 
				color="white"
			>
				{/* Module selector */}
				<Box p={4} mb={2}>
					<SelectRoot 
						collection={modulesCollection} 
						value={moduleName ? [moduleName] : []} 
						onValueChange={handleModuleChange}
						size="sm"
					>
						<SelectTrigger 
							className="w-full bg-gray-800 border-gray-700"
							aria-label="Select module"
						>
							<SelectValueText placeholder="Select module..." />
						</SelectTrigger>
						<SelectContent className="bg-gray-800 border-gray-700 text-white">
							{modulesCollection.items.map((item) => (
								<SelectItem 
									key={item.value} 
									item={item}
									className="hover:bg-gray-700 focus:bg-gray-700"
								>
									{item.label}
								</SelectItem>
							))}
						</SelectContent>
					</SelectRoot>
				</Box>
				
				{/* Module header section */}
				<Box px={4} pt={2} pb={3}>
					<Flex justifyContent="space-between" alignItems="center">
						<Heading size="md" fontWeight="bold" mb={1}>{selectedModule.display_name || selectedModule.name}</Heading>
						<Badge colorScheme="blue" variant="solid" fontSize="xs" px={2} py={0.5} borderRadius="full">
							Enabled
						</Badge>
					</Flex>
					<Text color="gray.400" fontSize="sm">Module: {selectedModule.name}</Text>
				</Box>
				
				{/* Module information */}
				<Box px={4} pb={3}>
					<Heading size="xs" textTransform="uppercase" color="gray.400" letterSpacing="wider" mb={2}>
						Module Information
					</Heading>
					<Text color="gray.300" fontSize="sm" mb={1}>
						This module contains {selectedModule.perspectives.length} {selectedModule.perspectives.length === 1 ? 'perspective' : 'perspectives'}.
					</Text>
					<Text color="gray.300" fontSize="sm">
						Contains {selectedModule.perspectives.length} {selectedModule.perspectives.length === 1 ? 'perspective' : 'perspectives'}
					</Text>
				</Box>
				
				{/* Show warning if we have a module with no perspectives */}
				{errorDetails && (
					<Box
						mx={4}
						mt={2}
						p={3}
						borderRadius="md"
						border="1px"
						borderColor="yellow.500"
						bg="yellow.900"
						color="yellow.100"
					>
						<Box mb={2} fontSize="sm">{errorDetails}</Box>
						<Button 
							size="xs" 
							colorScheme="yellow" 
							onClick={() => refetch()}
						>
							Retry
						</Button>
					</Box>
				)}
				
				{/* Perspectives list */}
				<Box mt={4}>
					<Box borderBottom="1px" borderColor="gray.700" mb={4} />
					<Heading size="xs" textTransform="uppercase" color="gray.400" letterSpacing="wider" px={4} mb={3}>
						Perspectives
					</Heading>
					<Box className="perspective-list">
						<ModuleList module={selectedModule} />
					</Box>
				</Box>
			</Box>
			
			{/* Right content area with outlet */}
			<Box w="75%" h="100%" overflow="auto" bg="gray.800">
				<Outlet />
			</Box>
		</Flex>
	);
} 