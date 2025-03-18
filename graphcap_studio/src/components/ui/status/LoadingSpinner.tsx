// SPDX-License-Identifier: Apache-2.0
import { Spinner, SpinnerProps } from "@chakra-ui/react";

interface LoadingSpinnerProps {
	readonly size?: "xs" | "sm" | "md" | "lg" | "xl";
	readonly className?: string;
}

/**
 * A loading spinner component based on Chakra UI's Spinner
 */
export function LoadingSpinner({
	size = "md",
	className = "",
	...props
}: LoadingSpinnerProps & Omit<SpinnerProps, "size">) {
	return (
		<Spinner
			borderWidth="4px"
			animationDuration="0.65s"
			color="blue.500"
			size={size}
			className={className}
			{...props}
		/>
	);
}
