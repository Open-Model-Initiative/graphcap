// SPDX-License-Identifier: Apache-2.0
/**
 * Generation Options Button
 *
 * This component provides a button that triggers the generation options dialog.
 */

import { Button } from "@/components/ui";
import type React from "react";
import { useGenerationOptions } from "../context";
import { GenerationOptionsDialog } from "./GenerationOptionsDialog";

interface GenerationOptionsButtonProps {
	readonly label?: React.ReactNode;
	readonly size?: "xs" | "sm" | "md" | "lg";
	readonly variant?: "solid" | "outline" | "ghost";
}

/**
 * Button component for triggering generation options dialog
 */
export function GenerationOptionsButton({
	label = "Options",
	size = "sm",
	variant = "outline",
}: GenerationOptionsButtonProps) {
	const { toggleDialog, isGenerating } = useGenerationOptions();

	return (
		<GenerationOptionsDialog>
			<Button
				onClick={toggleDialog}
				disabled={isGenerating}
				size={size}
				variant={variant}
			>
				{label}
			</Button>
		</GenerationOptionsDialog>
	);
}
