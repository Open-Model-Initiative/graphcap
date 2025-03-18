// SPDX-License-Identifier: Apache-2.0
/**
 * Root Left Action Panel
 *
 * This component displays the left action panel in the root layout with multiple sections.
 */

import {
	DatasetIcon,
	FilterIcon,
	FlagIcon,
	PerspectiveLayersIcon,
	ProviderIcon,
	SettingsIcon,
} from "@/components/icons";
import { SettingsPanel } from "@/features/app-settings";
import { FeatureFlagsPanel } from "@/features/app-settings/feature-flags";
import { DatasetPanel } from "@/features/datasets";
import { ProvidersPanel } from "@/features/inference/providers";
import { PerspectiveFilterPanel } from "@/features/perspectives/components/PerspectiveFilterPanel";
import { PerspectiveManagementPanel } from "@/features/perspectives/components/PerspectiveManagementPanel";
import { ActionPanel } from "./ActionPanel";

/**
 * Left action panel with multiple sections for the root layout
 */
export function RootLeftActionPanel() {
	return (
		<ActionPanel
			side="left"
			defaultExpanded={false}
			expandedWidth={350}
			sections={[
				{
					id: "feature-flags",
					title: "Feature Flags",
					icon: <FlagIcon />,
					content: <FeatureFlagsPanel />,
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
					id: "perspectives",
					title: "Perspectives",
					icon: <FilterIcon />,
					content: <PerspectiveFilterPanel />,
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
