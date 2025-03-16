"use client"

import { ChakraProvider } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"
import { graphcapTheme } from "@/app/theme"

export function Provider(props: Readonly<ColorModeProviderProps>) {
  return (
    <ChakraProvider value={graphcapTheme}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  )
}
