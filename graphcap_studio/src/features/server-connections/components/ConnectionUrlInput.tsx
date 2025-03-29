import { useColorModeValue } from "@/components/ui/theme/color-mode";
import type { ConnectionUrlInputProps } from "@/types/server-connection-types";
import { Input } from "@chakra-ui/react";
// SPDX-License-Identifier: Apache-2.0
import { type ChangeEvent, memo } from "react";

/**
 * ConnectionUrlInput component
 *
 * Displays an input field for the server URL
 */
export const ConnectionUrlInput = memo(function ConnectionUrlInput({
	url,
	serverName,
	onUrlChange,
}: ConnectionUrlInputProps) {
	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		onUrlChange(e.target.value);
	};

	const bgColor = useColorModeValue("white", "gray.800");
	const borderColor = useColorModeValue("gray.300", "gray.700");
	const textColor = useColorModeValue("gray.900", "gray.100");

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
