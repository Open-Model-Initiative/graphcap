import { useState, type ReactNode } from 'react'
import { Box } from '@chakra-ui/react'
import './App.css'

interface AppProps {
  children: ReactNode
}

function App({ children }: AppProps) {
  

  return (
    <Box minH="100vh" bg="background" color="text.default">
      {children}
    </Box>
  )
}

export default App
