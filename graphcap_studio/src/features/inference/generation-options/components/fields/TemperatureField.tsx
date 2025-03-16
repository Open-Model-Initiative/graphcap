// SPDX-License-Identifier: Apache-2.0
/**
 * Temperature Field Component
 * 
 * This component renders the temperature option field.
 */

import { OptionField } from './OptionField';
import { useGenerationOptions } from '../../context';

/**
 * Temperature control field component
 */
export function TemperatureField() {
  const { options, updateOption, isGenerating } = useGenerationOptions();
  
  const handleChange = (value: number) => {
    updateOption('temperature', value);
  };
  
  return (
    <OptionField
      label="Temperature"
      name="temperature"
      value={options.temperature}
      onChange={handleChange}
      disabled={isGenerating}
    />
  );
} 