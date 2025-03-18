// SPDX-License-Identifier: Apache-2.0
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	invalidateDirectory,
	useBrowseDirectory,
	useBrowseMultipleDirectories,
} from "../../services/fileBrowser";
import { FileItem } from "../components/file-browser/types";

// State interface for the hook
interface FileBrowserState {
	currentPath: string;
	expandedDirs: Set<string>;
	selectedFile: string | null;
}

/**
 * Custom hook for file browser functionality
 *
 * This hook provides functions to browse the workspace directory.
 */
export function useFileBrowser() {
	// Use a single state object for related state
	const [state, setState] = useState<FileBrowserState>({
		currentPath: "/",
		expandedDirs: new Set([""]),
		selectedFile: null,
	});

	const { currentPath, expandedDirs, selectedFile } = state;

	// Use Tanstack Query to fetch directory contents for the current path
	const {
		data: currentDirData,
		isLoading: isCurrentDirLoading,
		error: currentDirError,
		refetch: refetchCurrentDir,
	} = useBrowseDirectory(currentPath);

	// Get array of expanded directory paths (excluding the current path)
	const expandedDirPaths = useMemo(() => {
		return Array.from(expandedDirs).filter(
			(path) => path !== "" && path !== currentPath,
		);
	}, [expandedDirs, currentPath]);

	// Fetch data for all expanded directories
	const expandedDirsQueries = useBrowseMultipleDirectories(expandedDirPaths);

	// Combine current directory data with expanded directories data
	const processedFiles = useMemo(() => {
		// Start with the current directory files
		const baseFiles = currentDirData?.contents || [];

		// Create a map of directory ID to its contents
		const dirContentsMap = new Map<string, FileItem[]>();

		// Add expanded directories data to the map
		expandedDirsQueries.forEach((query) => {
			if (query.data?.success && query.data.path) {
				dirContentsMap.set(query.data.path, query.data.contents);
			}
		});

		// Function to recursively process files and add children
		const processFiles = (files: FileItem[]): FileItem[] => {
			return files.map((file) => {
				// If it's a directory and it's expanded, add its children
				if (file.type === "directory" && expandedDirs.has(file.id)) {
					const children = dirContentsMap.get(file.id) || [];
					return {
						...file,
						children: processFiles(children),
					};
				}

				return file;
			});
		};

		return processFiles(baseFiles);
	}, [currentDirData, expandedDirsQueries, expandedDirs]);

	const isLoading =
		isCurrentDirLoading || expandedDirsQueries.some((query) => query.isLoading);

	const currentDirErrorMessage = currentDirError
		? currentDirError.message
		: null;

	const queryWithError = expandedDirsQueries.find((query) => query.error);
	const expandedDirErrorMessage = queryWithError?.error
		? queryWithError.error.message
		: null;

	const error = currentDirErrorMessage ?? expandedDirErrorMessage;

	/**
	 * Load directory contents
	 */
	const loadDirectory = useCallback(async (path: string = "/") => {
		setState((prev) => ({
			...prev,
			currentPath: path,
		}));

		return true;
	}, []);

	/**
	 * Navigate to a parent directory
	 */
	const navigateUp = useCallback(async () => {
		if (currentPath === "/" || currentPath === "") {
			return false;
		}

		const parentPath = currentPath.split("/").slice(0, -1).join("/") || "/";
		return loadDirectory(parentPath);
	}, [currentPath, loadDirectory]);

	/**
	 * Toggle directory expansion and load its contents if needed
	 */
	const toggleDirectory = useCallback(
		async (id: string) => {
			// Check if directory is already expanded
			const isExpanded = expandedDirs.has(id);

			// Update expanded directories
			setState((prev) => {
				const newExpandedDirs = new Set(prev.expandedDirs);

				if (isExpanded) {
					newExpandedDirs.delete(id);
				} else {
					newExpandedDirs.add(id);
				}

				return {
					...prev,
					expandedDirs: newExpandedDirs,
				};
			});
		},
		[expandedDirs],
	);

	/**
	 * Select a file
	 */
	const selectFile = useCallback((id: string) => {
		setState((prev) => ({
			...prev,
			selectedFile: id,
		}));
	}, []);

	/**
	 * Refresh the current directory
	 */
	const refreshDirectory = useCallback(async () => {
		// Invalidate the cache for the current path
		invalidateDirectory(currentPath);

		// Invalidate the cache for all expanded directories
		expandedDirPaths.forEach((path) => {
			invalidateDirectory(path);
		});

		// Refetch the data
		await refetchCurrentDir();

		return true;
	}, [currentPath, expandedDirPaths, refetchCurrentDir]);

	// Initial load
	useEffect(() => {
		loadDirectory("/");
	}, [loadDirectory]);

	return {
		files: processedFiles,
		isLoading,
		error,
		currentPath,
		expandedDirs,
		selectedFile,
		loadDirectory,
		navigateUp,
		toggleDirectory,
		selectFile,
		refreshDirectory,
	};
}
