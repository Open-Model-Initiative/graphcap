import type { ServerConnection } from "@/types/server-connection-types";
// SPDX-License-Identifier: Apache-2.0
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	CONNECTION_STATUS,
	DEFAULT_URLS,
	SERVER_IDS,
	SERVER_NAMES,
} from "./constants";
import {
	checkServerHealthById,
	clearHealthCheckThrottling,
	healthQueryKeys
} from "./services/serverConnections";

// Local storage keys
const STORAGE_KEY = "inference-bridge-connections";
const VERSION_KEY = "inference-bridge-connections-version";
const CURRENT_VERSION = 1;

// Auto-connect configuration
const AUTO_CONNECT_INITIAL_DELAY = 2500;
const AUTO_CONNECT_BETWEEN_SERVERS_DELAY = 2000;
const AUTO_CONNECT_MAX_ATTEMPTS = 2;

const getDefaultConnections = (): ServerConnection[] => {
	return [
		{
			id: SERVER_IDS.MEDIA_SERVER,
			name: SERVER_NAMES[SERVER_IDS.MEDIA_SERVER],
			status: "disconnected",
			url:
				import.meta.env.VITE_MEDIA_SERVER_URL ||
				DEFAULT_URLS[SERVER_IDS.MEDIA_SERVER],
		},
		{
			id: SERVER_IDS.INFERENCE_BRIDGE,
			name: SERVER_NAMES[SERVER_IDS.INFERENCE_BRIDGE],
			status: "disconnected",
			url:
				import.meta.env.VITE_API_URL ||
				DEFAULT_URLS[SERVER_IDS.INFERENCE_BRIDGE],
		},
		{
			id: SERVER_IDS.DATA_SERVICE,
			name: SERVER_NAMES[SERVER_IDS.DATA_SERVICE],
			status: "disconnected",
			url:
				import.meta.env.VITE_DATA_SERVICE_URL ||
				DEFAULT_URLS[SERVER_IDS.DATA_SERVICE],
		},
	];
};

const mergeWithDefaults = (
	existingConnections: ServerConnection[],
): ServerConnection[] => {
	const defaultConnections = getDefaultConnections();
	const mergedConnections: ServerConnection[] = [];

	for (const defaultConn of defaultConnections) {
		const existingConn = existingConnections.find(
			(conn) => conn.id === defaultConn.id,
		);
		if (existingConn) {
			mergedConnections.push({
				...defaultConn,
				url: existingConn.url,
				status: "disconnected",
			});
		} else {
			mergedConnections.push(defaultConn);
		}
	}

	return mergedConnections;
};

const loadConnectionsFromStorage = (): ServerConnection[] => {
	try {
		const savedVersion = localStorage.getItem(VERSION_KEY);
		const currentVersion = CURRENT_VERSION.toString();
		const savedConnections = localStorage.getItem(STORAGE_KEY);

		if (savedConnections) {
			const parsed = JSON.parse(savedConnections) as ServerConnection[];

			if (
				Array.isArray(parsed) &&
				parsed.every(
					(conn) =>
						typeof conn === "object" &&
						"id" in conn &&
						"name" in conn &&
						"status" in conn &&
						"url" in conn,
				)
			) {
				if (savedVersion !== currentVersion) {
					const mergedConnections = mergeWithDefaults(parsed);
					saveConnectionsToStorage(mergedConnections);
					localStorage.setItem(VERSION_KEY, currentVersion);
					return mergedConnections;
				}

				return parsed.map((conn) => ({
					...conn,
					status: "disconnected",
				}));
			}
		}
	} catch (error) {
		console.error("Failed to load connections from local storage:", error);
	}

	const defaultConnections = getDefaultConnections();
	saveConnectionsToStorage(defaultConnections);
	localStorage.setItem(VERSION_KEY, CURRENT_VERSION.toString());
	return defaultConnections;
};

const saveConnectionsToStorage = (connections: ServerConnection[]): void => {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
	} catch (error) {
		console.error("Failed to save connections to local storage:", error);
	}
};

export function useServerConnections() {
	const queryClient = useQueryClient();
	const [connections, setConnections] = useState<ServerConnection[]>(
		loadConnectionsFromStorage,
	);
	const [isAutoConnecting, setIsAutoConnecting] = useState(false);

	const connectionsRef = useRef<ServerConnection[]>(connections);
	const hasAutoConnectedRef = useRef(false);
	const autoConnectAttemptsRef = useRef(0);

	useEffect(() => {
		connectionsRef.current = connections;
	}, [connections]);

	const hasWarnings = useMemo(() => {
		return connections.some(conn => conn.status === CONNECTION_STATUS.ERROR);
	}, [connections]);

	useEffect(() => {
		saveConnectionsToStorage(connections);
	}, [connections]);

	const handleConnect = useCallback(async (id: string) => {
		setConnections((prev) =>
			prev.map((conn) =>
				conn.id === id ? { ...conn, status: "testing" } : conn,
			),
		);

		const serverConnection = connectionsRef.current.find(
			(conn) => conn.id === id,
		);
		if (!serverConnection) {
			console.error(`Server connection with ID ${id} not found`);
			return;
		}

		const serverUrl = serverConnection.url;

		try {
			let queryKey: readonly unknown[];
			switch (id) {
				case SERVER_IDS.MEDIA_SERVER:
					queryKey = healthQueryKeys.mediaServer(serverUrl);
					break;
				case SERVER_IDS.INFERENCE_BRIDGE:
					queryKey = healthQueryKeys.inferenceServer(serverUrl);
					break;
				case SERVER_IDS.DATA_SERVICE:
					queryKey = healthQueryKeys.dataService(serverUrl);
					break;
				default:
					queryKey = healthQueryKeys.serverById(id, serverUrl);
			}
			
			const cachedData = queryClient.getQueryData<boolean>(queryKey);
			
			let isHealthy: boolean;
			
			if (cachedData !== undefined) {
				isHealthy = cachedData;
			} else {
				isHealthy = await queryClient.fetchQuery({
					queryKey,
					queryFn: () => checkServerHealthById(id, serverUrl),
					staleTime: 60 * 1000,
				});
			}

			setConnections((prev) =>
				prev.map((conn) =>
					conn.id === id
						? { ...conn, status: isHealthy ? "connected" : "error" }
						: conn,
				),
			);
			
			return isHealthy;
		} catch (error) {
			console.error(`Error connecting to server ${id}:`, error);
			setConnections((prev) =>
				prev.map((conn) =>
					conn.id === id ? { ...conn, status: "error" } : conn,
				),
			);
			
			return false;
		}
	}, [queryClient]);

	const handleDisconnect = useCallback((id: string) => {
		setConnections((prev) =>
			prev.map((conn) =>
				conn.id === id ? { ...conn, status: "disconnected" } : conn,
			),
		);
	}, []);

	const handleUrlChange = useCallback((id: string, url: string) => {
		clearHealthCheckThrottling();
		
		setConnections((prev) =>
			prev.map((conn) =>
				conn.id === id ? { ...conn, url, status: "disconnected" } : conn,
			),
		);
	}, []);

	const autoConnect = useCallback(async () => {
		if (isAutoConnecting) {
			return;
		}
		
		autoConnectAttemptsRef.current += 1;
		if (autoConnectAttemptsRef.current > AUTO_CONNECT_MAX_ATTEMPTS) {
			return;
		}

		const serversToConnect = connections
			.filter(
				(conn) =>
					conn.url &&
					conn.url.trim() !== "" &&
					conn.status !== CONNECTION_STATUS.CONNECTED &&
					conn.status !== CONNECTION_STATUS.TESTING,
			)
			.map((conn) => conn.id);

		if (serversToConnect.length === 0) {
			return;
		}

		setIsAutoConnecting(true);

		try {
			for (const serverId of serversToConnect) {
				await handleConnect(serverId);
				await new Promise((resolve) => setTimeout(resolve, AUTO_CONNECT_BETWEEN_SERVERS_DELAY));
			}
		} finally {
			setIsAutoConnecting(false);
			hasAutoConnectedRef.current = true;
		}
	}, [handleConnect, connections, isAutoConnecting]);

	useEffect(() => {
		if (!hasAutoConnectedRef.current) {
			const timer = setTimeout(() => {
				autoConnect();
			}, AUTO_CONNECT_INITIAL_DELAY);

			return () => clearTimeout(timer);
		}
	}, [autoConnect]);

	return {
		connections,
		handleConnect,
		handleDisconnect,
		handleUrlChange,
		autoConnect,
		isAutoConnecting,
		hasWarnings,
	};
}
