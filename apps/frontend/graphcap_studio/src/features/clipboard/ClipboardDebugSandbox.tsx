// graphcap_studio/src/features/clipboard/ClipboardDebugSandbox.tsx
// SPDX-License-Identifier: Apache-2.0

import { Separator } from "@/features/perspectives/components/PerspectiveCaption/PerspectiveCard/debug-fields/Separator";
import { Heading, SimpleGrid, Textarea, VStack } from "@chakra-ui/react";
import React from "react";
import { ClipboardCopyInput } from "./ClipboardCopyInput"; // Use relative import

/**
 * A sandbox component for testing and demonstrating clipboard components.
 */
export const ClipboardDebugSandbox: React.FC = () => {
	const longText =
		"This is a much longer piece of text to test how the input field handles overflow and if the copy mechanism still works correctly with more substantial content. Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

	return (
		// Use SimpleGrid for a two-column layout
		<SimpleGrid columns={2} /* spacing={10} */ p={4} alignItems="start">
			{/* Column 1: Clipboard Inputs */}
			<VStack align="stretch" /* spacing={4} */> {/* Removed spacing prop */}
				<Heading size="lg">Clipboard Component Sandbox</Heading>

				<Separator />
				<Heading size="md" mt={4}>Basic Usage</Heading> {/* Add margin top */}
				<ClipboardCopyInput value="Simple text to copy" id="test1" />

				<Separator />
				<Heading size="md" mt={4}>Long Text</Heading> {/* Add margin top */}
				<ClipboardCopyInput value={longText} id="test2" />

				<Separator />
				<Heading size="md" mt={4}>Empty Value (Button should be disabled)</Heading> {/* Add margin top */}
				<ClipboardCopyInput value="" id="test3" />

				<Separator />
				<Heading size="md" mt={4}>Disabled Input (Button should be disabled)</Heading> {/* Add margin top */}
				<ClipboardCopyInput
					value="You can't copy this"
					id="test4"
					disabled
				/>

				<Separator />
				<Heading size="md" mt={4}>Custom Labels & Tooltip</Heading> {/* Add margin top */}
				<ClipboardCopyInput
					label="API Key:"
					value="xyz-abcdef1234567890"
					id="test5"
					copyButtonLabel="Copy Key"
					copiedButtonLabel="Key Copied!"
					copyButtonTooltip="Copy the API Key to your clipboard"
				/>
			</VStack>

			{/* Column 2: Paste Area */}
			<VStack align="stretch" /* spacing={4} */> {/* Removed spacing prop */}
				<Heading size="lg">Paste Area</Heading>
				<Textarea
					placeholder="Paste copied text here..."
					size="lg"
					height="400px" // Give it some height
					mt={4} // Add margin top for spacing
				/>
			</VStack>
		</SimpleGrid>
	);
}; 