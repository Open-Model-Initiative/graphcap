// SPDX-License-Identifier: Apache-2.0
/**
 * Repetition Penalty Field Component
 *
 * This component renders the repetition_penalty option field.
 */

import { useGenerationOptions } from "../../context";
import { OptionField } from "./OptionField";

/**
 * Repetition penalty control field component
 */
export function RepetitionPenaltyField() {
	const { options, actions, uiState } = useGenerationOptions();
	const { updateOption } = actions;
	const { isGenerating } = uiState;

	const handleChange = (value: number) => {
		updateOption("repetition_penalty", value);
	};

	return (
		<OptionField
			label="Repetition Penalty"
			name="repetition_penalty"
			value={options.repetition_penalty}
			onChange={handleChange}
			disabled={isGenerating}
		/>
	);
}
