import {
	SelectContent,
	SelectItem,
	SelectRoot,
	SelectTrigger,
	SelectValueText,
} from "@/components/ui/select";
import { usePerspectiveModules } from "@/features/perspectives/hooks";
import { Box, Flex, Heading, Spinner, Text } from "@chakra-ui/react";
import {
	type SelectValueChangeDetails,
	createListCollection,
} from "@chakra-ui/react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/perspectives/")({
	component: PerspectivesPage,
});

// Define the module item interface
interface ModuleItem {
	label: string;
	value: string;
}

function PerspectivesPage() {
	const { modules, isLoading, error } = usePerspectiveModules();
	const navigate = useNavigate();

	// Create items collection for the select
	const moduleItems: ModuleItem[] =
		modules?.map((module) => ({
			label: `${module.name} (${module.perspectives.length} perspectives)`,
			value: module.id,
		})) || [];

	const collection = createListCollection({
		items: moduleItems,
	});

	// Handle module selection
	const handleModuleChange = (
		details: SelectValueChangeDetails<ModuleItem>,
	) => {
		if (details.value.length > 0) {
			navigate({
				to: "/perspectives/module/$moduleName",
				params: { moduleName: details.value[0] },
			});
		}
	};

	if (isLoading) {
		return (
			<Box p={6} textAlign="center">
				<Spinner size="xl" />
				<Text mt={4}>Loading perspective modules...</Text>
			</Box>
		);
	}

	if (error) {
		return (
			<Box p={6}>
				<Box p={4} bg="red.100" color="red.800" borderRadius="md">
					<Heading size="md">Error</Heading>
					<Text>{error.message}</Text>
				</Box>
			</Box>
		);
	}

	return (
		<Box p={6}>
			<Heading size="lg" mb={4}>
				Perspectives Management
			</Heading>

			<Box borderBottom="1px solid" borderColor="gray.200" mb={6} />

			<Box mb={6}>
				<Heading size="md" mb={3}>
					Select a Module
				</Heading>
				<Text mb={4}>
					Choose a module to browse its perspectives or manage configurations.
				</Text>

				<Flex maxW="md" mb={6}>
					<SelectRoot
						collection={collection}
						onValueChange={handleModuleChange}
						positioning={{ sameWidth: true }}
						width="full"
					>
						<SelectTrigger>
							<SelectValueText placeholder="Select module..." />
						</SelectTrigger>
						<SelectContent>
							{moduleItems.map((item) => (
								<SelectItem key={item.value} item={item}>
									{item.label}
								</SelectItem>
							))}
						</SelectContent>
					</SelectRoot>
				</Flex>

				<Text fontSize="sm" color="gray.500">
					Total modules: {modules?.length || 0}
				</Text>
			</Box>
		</Box>
	);
}
