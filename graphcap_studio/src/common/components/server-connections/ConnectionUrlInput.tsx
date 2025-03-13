// SPDX-License-Identifier: Apache-2.0
import { memo, ChangeEvent } from 'react';
import { ConnectionUrlInputProps } from '../../types/connectionComponents';
import { Input } from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/color-mode';

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
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.300', 'gray.700');
  const textColor = useColorModeValue('gray.900', 'gray.100');
  
  return (
    <Input
      type="text"
      value={url}
      onChange={handleChange}
      size="sm"
      bg={bgColor}
      borderColor={borderColor}
      color={textColor}
      aria-label={`${serverName} URL`}
    />
  );
}); 