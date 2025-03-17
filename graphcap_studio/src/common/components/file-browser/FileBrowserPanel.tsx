// SPDX-License-Identifier: Apache-2.0
import { useCallback } from "react";
import { useFileBrowser } from "../../hooks/useFileBrowser";
import { ErrorMessage } from "./ErrorMessage";
import { FilePathBreadcrumb } from "./FilePathBreadcrumb";
import { FileTree } from "./FileTree";
import { FileTreeHeader } from "./FileTreeHeader";
import { FileItem } from "./types";

/**
 * File Browser Panel component
 *
 * This component displays a file browser for the workspace directory.
 */
export function FileBrowserPanel() {
	const {
		files,
		isLoading,
		error,
		currentPath,
		expandedDirs,
		selectedFile,
		toggleDirectory,
		selectFile,
		navigateUp,
		refreshDirectory,
	} = useFileBrowser();

	const handleItemClick = useCallback(
		(item: FileItem) => {
			if (item.type === "directory") {
				toggleDirectory(item.id);
			} else {
				selectFile(item.id);
			}
		},
		[toggleDirectory, selectFile],
	);

	return (
		<div className="text-sm text-gray-900 dark:text-gray-100">
			<FileTreeHeader
				currentPath={currentPath}
				isLoading={isLoading}
				onNavigateUp={navigateUp}
				onRefresh={refreshDirectory}
			/>

			<ErrorMessage message={error} />

			<FilePathBreadcrumb path={currentPath} />

			<FileTree
				files={files}
				isLoading={isLoading}
				expandedDirs={expandedDirs}
				selectedFile={selectedFile}
				onItemClick={handleItemClick}
			/>
		</div>
	);
}
