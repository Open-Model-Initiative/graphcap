// SPDX-License-Identifier: Apache-2.0
/**
 * Root Left Action Panel
 *
 * This component displays the left action panel in the root layout with multiple sections.
 */

import {
	DatasetIcon,
	GenerationOptionsIcon,
	PerspectiveLayersIcon,
	ProviderIcon,
	SettingsIcon
} from "@/components/icons";
import { SettingsPanel } from "@/features/app-settings";
import { DatasetPanel } from "@/features/datasets";
import { GenerationOptionsPanel } from "@/features/inference/generation-options/components/GenerationOptionsPanel";
import { ProvidersPanel } from "@/features/inference/providers";
import { PerspectiveManagementPanel } from "@/features/perspectives/components/PerspectiveManagement/PerspectiveManagementPanel";
import { ActionPanel } from "./ActionPanel";

/**
 * Left action panel with multiple sections for the root layout
 */
export function RootLeftActionPanel() {
	return (
		<ActionPanel
			side="left"
			defaultExpanded={false}
			expandedWidth={450}
			sections={[
				{
					id: "generation-options",
					title: "Generation Options",
					icon: <GenerationOptionsIcon />,
					content: <GenerationOptionsPanel />,
				},
				{
					id: "datasets",
					title: "Datasets",
					icon: <DatasetIcon />,
					content: <DatasetPanel />,
				},
				{
					id: "providers",
					title: "Providers",
					icon: <ProviderIcon />,
					content: <ProvidersPanel />,
				},
				{
					id: "perspective-management",
					title: "Perspective Management",
					icon: <PerspectiveLayersIcon />,
					content: <PerspectiveManagementPanel />,
				},
				{
					id: "settings",
					title: "Settings",
					icon: <SettingsIcon />,
					content: <SettingsPanel />,
				},
			]}
		/>
	);
}
