"use client"

import { ChakraProvider } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"
import { graphcapTheme } from "@/components/ui/theme"

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={graphcapTheme}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  )
}
