// SPDX-License-Identifier: Apache-2.0

/**
 * Server connection type representing a connection to a server
 */
export interface ServerConnection {
	id: string;
	name: string;
	status: "connected" | "disconnected" | "error" | "testing";
	url: string;
}

/**
 * Props for the ServerConnectionsPanel component
 */
export interface ServerConnectionsPanelProps {
	className?: string;
}

/**
 * Connection status type
 */
export type ConnectionStatus =
	| "connected"
	| "disconnected"
	| "error"
	| "testing";

/**
 * Props for the ConnectionStatusIndicator component
 */
export interface ConnectionStatusIndicatorProps {
	status: ConnectionStatus;
}

/**
 * Props for the ConnectionActionButton component
 */
export interface ConnectionActionButtonProps {
	status: ConnectionStatus;
	serverName: string;
	onConnect: () => void;
	onDisconnect: () => void;
}

/**
 * Props for the ConnectionUrlInput component
 */
export interface ConnectionUrlInputProps {
	url: string;
	serverName: string;
	onUrlChange: (url: string) => void;
}

/**
 * Props for the ConnectionCard component
 */
export interface ConnectionCardProps {
	title: string;
	urlInput: React.ReactNode;
	actions: React.ReactNode;
	status: React.ReactNode;
}
