// SPDX-License-Identifier: Apache-2.0
import { ReactNode } from 'react';
import { EditorContextProvider } from '../context/EditorContext';

interface EditorInitializerProps {
  readonly children: ReactNode;
}

/**
 * A component that initializes the EditorContext
 * 
 * This component initializes the EditorContextProvider with default values.
 * 
 * @param children - The child components to render
 */
export function EditorInitializer({ children }: EditorInitializerProps) {
  return (
    <EditorContextProvider 
      dataset={null}
    >
      {children}
    </EditorContextProvider>
  );
} 