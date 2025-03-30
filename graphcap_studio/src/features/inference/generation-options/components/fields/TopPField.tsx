// SPDX-License-Identifier: Apache-2.0
/**
 * Top P Field Component
 *
 * This component renders the top_p option field.
 */

import { useGenerationOptions } from "../../context";
import { OptionField } from "./OptionField";

/**
 * Top-P (nucleus sampling) control field component
 */
export function TopPField() {
	const { options, actions, uiState } = useGenerationOptions();
	const { updateOption } = actions;
	const { isGenerating } = uiState;

	const handleChange = (value: number) => {
		updateOption("top_p", value);
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
