// SPDX-License-Identifier: Apache-2.0

/**
 * Server connection type representing a connection to a server
 */
export interface ServerConnection {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  url: string;
}

/**
 * Props for the ServerConnectionsPanel component
 */
export interface ServerConnectionsPanelProps {
  className?: string;
} 