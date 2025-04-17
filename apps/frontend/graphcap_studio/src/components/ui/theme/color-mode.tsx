"use client";

import type { SpanProps } from "@chakra-ui/react";
import { Span } from "@chakra-ui/react";
import { ThemeProvider} from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import * as React from "react";
import { LuMoon } from "react-icons/lu";

export interface ColorModeProviderProps extends ThemeProviderProps {}

export function ColorModeProvider(props: ColorModeProviderProps) {
	return (
		<ThemeProvider
			attribute="class"
			disableTransitionOnChange
			forcedTheme="dark"
			{...props}
		/>
	);
}

export type ColorMode = "light" | "dark";

export interface UseColorModeReturn {
	colorMode: ColorMode;
}

export function useColorMode(): UseColorModeReturn {
	return {
		colorMode: "dark", // Always return dark
	};
}

export function useColorModeValue<T>(light: T, dark: T) {
	// Always return the dark value as we're in forced dark mode
	return dark;
}

export function ColorModeIcon() {
	// Always return the moon icon since we're forcing dark mode
	return <LuMoon />;
}

export const DarkMode = React.forwardRef<HTMLSpanElement, SpanProps>(
	function DarkMode(props: SpanProps, ref: React.ForwardedRef<HTMLSpanElement>) {
		return (
			<Span
				color="fg"
				display="contents"
				className="chakra-theme dark"
				colorPalette="gray"
				colorScheme="dark"
				ref={ref}
				{...props}
			/>
		);
	},
);
