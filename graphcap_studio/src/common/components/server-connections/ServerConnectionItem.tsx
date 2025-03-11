// SPDX-License-Identifier: Apache-2.0
import { CONNECTION_STATUS } from '../../constants';
import { ServerConnection } from '../../types';

/**
 * Props for the ServerConnectionItem component
 */
interface ServerConnectionItemProps {
  connection: ServerConnection;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onUrlChange: (id: string, url: string) => void;
}

/**
 * ServerConnectionItem component
 * 
 * Displays a single server connection with controls for connecting,
 * disconnecting, and changing the URL.
 */
export function ServerConnectionItem({
  connection,
  onConnect,
  onDisconnect,
  onUrlChange
}: ServerConnectionItemProps) {
  /**
   * Handle URL input change
   */
  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUrlChange(connection.id, e.target.value);
  };
  
  /**
   * Handle connect button click
   */
  const handleConnectClick = () => {
    onConnect(connection.id);
  };
  
  /**
   * Handle disconnect button click
   */
  const handleDisconnectClick = () => {
    onDisconnect(connection.id);
  };
  
  /**
   * Get status text with first letter capitalized
   */
  const getStatusText = () => {
    return connection.status.charAt(0).toUpperCase() + connection.status.slice(1);
  };
  
  /**
   * Get status text color class based on connection status
   */
  const getStatusColorClass = () => {
    switch (connection.status) {
      case 'connected':
        return 'text-green-500 dark:text-green-400';
      case 'testing':
        return 'text-yellow-500 dark:text-yellow-400';
      case 'error':
        return 'text-red-500 dark:text-red-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };
  
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {connection.name}
      </h3>
      
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={connection.url}
          onChange={handleUrlInputChange}
          className="flex-1 px-2 py-1 text-sm border rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
          aria-label={`${connection.name} URL`}
        />
        
        {connection.status === 'disconnected' && (
          <button
            onClick={handleConnectClick}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            aria-label={`Connect to ${connection.name}`}
          >
            Connect
          </button>
        )}
        
        {connection.status === 'connected' && (
          <button
            onClick={handleDisconnectClick}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
            aria-label={`Disconnect from ${connection.name}`}
          >
            Disconnect
          </button>
        )}
        
        {connection.status === 'testing' && (
          <span className="px-2 py-1 text-xs bg-yellow-500 text-white rounded">
            Testing...
          </span>
        )}
        
        {connection.status === 'error' && (
          <span className="px-2 py-1 text-xs bg-red-500 text-white rounded">
            Error
          </span>
        )}
      </div>
      
      <div className="text-xs text-gray-700 dark:text-gray-300">
        Status: 
        <span className={`ml-1 font-medium ${getStatusColorClass()}`}>
          {getStatusText()}
        </span>
      </div>
    </div>
  );
} 