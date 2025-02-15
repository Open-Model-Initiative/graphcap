import { useState, type ReactNode } from 'react'
import './App.css'
import 'tailwindcss'

interface AppProps {
  children: ReactNode
}

function App({ children }: AppProps) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check system preference on initial load
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    // Update document class for theme
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      {children}
    </div>
  )
}

export default App
