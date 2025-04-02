import { ClipboardDebugSandbox } from "@/features/clipboard";
import { createFileRoute } from "@tanstack/react-router";
// Import Chakra UI Tabs components using the new API
import { Box, Tabs } from "@chakra-ui/react";

export const Route = createFileRoute("/debug")({
	component: Debug,
});

function Debug() {
	return (
		<Box p={4}>
			<Tabs.Root variant="enclosed">
				<Tabs.List>
					<Tabs.Trigger value="clipboard">Clipboard</Tabs.Trigger>
					<Tabs.Indicator />
				</Tabs.List>
				<Tabs.Content value="clipboard">
					<Box pt={4}>
						<ClipboardDebugSandbox />
					</Box>
				</Tabs.Content>
			</Tabs.Root>
		</Box>
	);
}
