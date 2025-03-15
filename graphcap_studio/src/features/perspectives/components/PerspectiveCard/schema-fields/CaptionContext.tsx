// SPDX-License-Identifier: Apache-2.0
/**
 * Caption Context
 * 
 * Context for sharing caption data and rendering state between caption components.
 */

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { PerspectiveSchema } from '@/features/perspectives/types';

export type CaptionData = Record<string, any> | null;

interface CaptionContextType {
  readonly schema: PerspectiveSchema;
  readonly data: CaptionData;
  readonly isLoading: boolean;
}

const CaptionContext = createContext<CaptionContextType | undefined>(undefined);

interface CaptionProviderProps {
  readonly schema: PerspectiveSchema;
  readonly data: CaptionData;
  readonly isLoading?: boolean;
  readonly children: ReactNode;
}

export function CaptionProvider({
  schema,
  data,
  isLoading = false,
  children
}: CaptionProviderProps) {
  // Process the data to unwrap nested content or result objects
  const processedData = useMemo(() => {
    if (!data) return null;
    
    let displayData = data;
    
    // Check if data is nested within 'content' or 'result' property
    if (data.content && typeof data.content === 'object') {
      displayData = data.content;
    } else if (data.result && typeof data.result === 'object') {
      displayData = data.result;
    }
    
    return displayData;
  }, [data]);

  const value = useMemo(() => ({
    schema,
    data: processedData,
    isLoading
  }), [schema, processedData, isLoading]);

  return (
    <CaptionContext.Provider value={value}>
      {children}
    </CaptionContext.Provider>
  );
}

export function useCaptionContext() {
  const context = useContext(CaptionContext);
  
  if (context === undefined) {
    throw new Error('useCaptionContext must be used within a CaptionProvider');
  }
  
  return context;
} 