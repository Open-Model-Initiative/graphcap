// SPDX-License-Identifier: Apache-2.0
import * as React from 'react'
import { LogLevel, configureLogger } from './logger'

interface LoggerSettings {
  minLevel: LogLevel
}

interface LoggerContextValue {
  settings: LoggerSettings
  updateSettings: (settings: Partial<LoggerSettings>) => void
}

const defaultSettings: LoggerSettings = {
  minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG
}

const STORAGE_KEY = 'graphcap:logger-settings'

const LoggerContext = React.createContext<LoggerContextValue | undefined>(undefined)

export function LoggerProvider({ children }: { children: React.ReactNode }) {
  // Initialize state from localStorage or default settings
  const [settings, setSettings] = React.useState<LoggerSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Validate the stored value is a valid LogLevel
        if (Object.values(LogLevel).includes(parsed.minLevel)) {
          return parsed as LoggerSettings
        }
      }
    } catch (error) {
      console.error('Failed to parse logger settings from localStorage:', error)
    }
    return defaultSettings
  })

  // Update logger config when settings change
  React.useEffect(() => {
    configureLogger(settings)
  }, [settings])

  // Persist settings to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch (error) {
      console.error('Failed to save logger settings to localStorage:', error)
    }
  }, [settings])

  const updateSettings = React.useCallback((newSettings: Partial<LoggerSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  const value = React.useMemo(() => ({
    settings,
    updateSettings
  }), [settings, updateSettings])

  return (
    <LoggerContext.Provider value={value}>
      {children}
    </LoggerContext.Provider>
  )
}

export function useLogger() {
  const context = React.useContext(LoggerContext)
  if (!context) {
    throw new Error('useLogger must be used within a LoggerProvider')
  }
  return context
} 