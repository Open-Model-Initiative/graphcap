"use client";

import { graphcapTheme } from "@/app/theme";
import { ChakraProvider } from "@chakra-ui/react";
import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode";

export function Provider(props: Readonly<ColorModeProviderProps>) {
	return (
		<ChakraProvider value={graphcapTheme}>
			<ColorModeProvider {...props} />
		</ChakraProvider>
	);
}
