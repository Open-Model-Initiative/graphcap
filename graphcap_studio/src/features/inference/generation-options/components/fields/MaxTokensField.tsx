// SPDX-License-Identifier: Apache-2.0
/**
 * Max Tokens Field Component
 *
 * This component renders the max_tokens option field.
 */

import { useGenerationOptions } from "../../context";
import { OptionField } from "./OptionField";

/**
 * Max tokens control field component
 */
export function MaxTokensField() {
	const { options, actions, uiState } = useGenerationOptions();
	const { updateOption } = actions;
	const { isGenerating } = uiState;

	const handleChange = (value: number) => {
		updateOption("max_tokens", value);
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
