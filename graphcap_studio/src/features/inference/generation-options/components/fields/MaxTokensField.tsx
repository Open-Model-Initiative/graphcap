// SPDX-License-Identifier: Apache-2.0
/**
 * Max Tokens Field Component
 *
 * This component renders the max tokens option field.
 */

import { useGenerationOptions } from "../../context";
import { OptionField } from "./OptionField";

/**
 * Max tokens control field component
 */
export function MaxTokensField() {
	const { options, updateOption, isGenerating } = useGenerationOptions();

	const handleChange = (value: number) => {
		// Ensure we're using an integer
		updateOption("max_tokens", Math.round(value));
	};

	return (
		<OptionField
			label="Max Tokens"
			name="max_tokens"
			value={options.max_tokens}
			onChange={handleChange}
			disabled={isGenerating}
		/>
	);
}
