import type { Perspective } from "@/features/perspectives/types";
import { Box, Tabs } from "@chakra-ui/react";
import { 
	FieldsTab,
	ManagementTab,
	PerspectiveHeader, 
	PromptTab,
	SchemaInfoTab
} from "./components";
import { PerspectiveEditorProvider, usePerspectiveEditor } from "./context/PerspectiveEditorContext";

interface PerspectiveEditorProps {
	readonly perspective: Perspective;
	readonly moduleName: string;
	readonly perspectiveList?: Perspective[];
}

/**
 * PerspectiveEditor component displays detailed information about a perspective
 */
export function PerspectiveEditor({
	perspective,
	moduleName,
	perspectiveList = [],
}: PerspectiveEditorProps) {
	return (
		<PerspectiveEditorProvider 
			perspective={perspective} 
			moduleName={moduleName}
			perspectiveList={perspectiveList}
		>
			<PerspectiveEditorContent />
		</PerspectiveEditorProvider>
	);
}

/**
 * PerspectiveEditorContent renders the editor UI using the context
 */
function PerspectiveEditorContent() {
	const { colors } = usePerspectiveEditor();

	return (
		<Box 
			height="100%"
			width="100%"
			overflow="auto"
			bg={colors.bgColor}
		>
			<PerspectiveHeader />

			{/* Tabs for different sections */}
			<Box px={6} pb={6}>
				<Tabs.Root colorPalette="blue" variant="enclosed" defaultValue="schema" size="lg">
					<Tabs.List borderColor={colors.borderColor} py={2}>
						<Tabs.Trigger value="schema" className="px-5 py-2.5 font-medium">Schema</Tabs.Trigger>
						<Tabs.Trigger value="fields" className="px-5 py-2.5 font-medium">Fields</Tabs.Trigger>
						<Tabs.Trigger value="prompt" className="px-5 py-2.5 font-medium">Prompt</Tabs.Trigger>
						<Tabs.Trigger value="management" className="px-5 py-2.5 font-medium">Management</Tabs.Trigger>
						<Tabs.Indicator />
					</Tabs.List>

					<Box pt={6} pb={8}>
						<Tabs.Content value="schema">
							<SchemaInfoTab />
						</Tabs.Content>

						<Tabs.Content value="fields">
							<FieldsTab />
						</Tabs.Content>

						<Tabs.Content value="prompt">
							<PromptTab />
						</Tabs.Content>

						<Tabs.Content value="management">
							<ManagementTab />
						</Tabs.Content>
					</Box>
				</Tabs.Root>
			</Box>
		</Box>
	);
}
