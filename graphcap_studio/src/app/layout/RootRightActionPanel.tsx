// SPDX-License-Identifier: Apache-2.0
/**
 * Root Right Action Panel
 *
 * This component displays the right action panel in the root layout with multiple sections.
 */

import { FileBrowserPanel } from "@/common/components/file-browser";
import { FolderIcon, ServerIcon } from "@/components/icons";
import { ServerConnectionsPanel } from "@/features/server-connections/components";
import { ActionPanel } from "./ActionPanel";

/**
 * Right action panel with multiple sections for the root layout
 */
export function RootRightActionPanel() {
	return (
		<ActionPanel
			side="right"
			defaultExpanded={false}
			expandedWidth={350}
			sections={[
				{
					id: "server-connections",
					title: "Server Connections",
					icon: <ServerIcon />,
					content: <ServerConnectionsPanel />,
				},
				{
					id: "file-browser",
					title: "File Browser",
					icon: <FolderIcon />,
					content: <FileBrowserPanel />,
				},
			]}
		/>
	);
}
