// SPDX-License-Identifier: Apache-2.0
import { memo, ChangeEvent } from 'react';
import { ConnectionUrlInputProps } from '../../types/connectionComponents';

/**
 * ConnectionUrlInput component
 * 
 * Displays an input field for the server URL
 */
export const ConnectionUrlInput = memo(function ConnectionUrlInput({
  url,
  serverName,
  onUrlChange
}: ConnectionUrlInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onUrlChange(e.target.value);
  };
  
  return (
    <input
      type="text"
      value={url}
      onChange={handleChange}
      className="w-full px-2 py-1 text-sm border rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
      aria-label={`${serverName} URL`}
    />
  );
}); 