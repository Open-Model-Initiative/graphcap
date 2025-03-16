// SPDX-License-Identifier: Apache-2.0
/**
 * Top P Field Component
 * 
 * This component renders the top_p option field.
 */

import { OptionField } from './OptionField';
import { useGenerationOptions } from '../../context';

/**
 * Top P control field component
 */
export function TopPField() {
  const { options, updateOption, isGenerating } = useGenerationOptions();
  
  const handleChange = (value: number) => {
    updateOption('top_p', value);
  };
  
  return (
    <OptionField
      label="Top P"
      name="top_p"
      value={options.top_p}
      onChange={handleChange}
      disabled={isGenerating}
    />
  );
} 