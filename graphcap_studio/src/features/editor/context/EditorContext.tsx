// SPDX-License-Identifier: Apache-2.0
import { createContext, useContext, useState, ReactNode } from 'react';

/**
 * Types of view modes available in the editor
 */
export type ViewMode = 'grid' | 'carousel';

/**
 * Interface for the editor context state
 */
interface EditorContextState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

/**
 * Props for the EditorContextProvider component
 */
interface EditorContextProviderProps {
  children: ReactNode;
}

/**
 * Context for managing editor UI state
 */
const EditorContext = createContext<EditorContextState | undefined>(undefined);

/**
 * Provider component for the EditorContext
 */
export function EditorContextProvider({ children }: EditorContextProviderProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const value = {
    viewMode,
    setViewMode,
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

/**
 * Hook for accessing the EditorContext
 * 
 * @returns The editor context state
 * @throws Error if used outside of EditorContextProvider
 */
export function useEditorContext() {
  const context = useContext(EditorContext);
  
  if (context === undefined) {
    throw new Error('useEditorContext must be used within an EditorContextProvider');
  }
  
  return context;
} 