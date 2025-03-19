import { useColorModeValue } from "@/components/ui/theme/color-mode";
import type { Perspective } from "@/features/perspectives/types";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface PerspectiveEditorContextType {
  // Data
  perspective: Perspective;
  moduleName: string;
  
  // Navigation
  onNavigateNext: () => void;
  onNavigatePrevious: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  
  // Utility functions
  getPromptContent: () => string;
  getFieldTypeDisplay: (type: string | object) => string;
  
  // Theme values
  colors: {
    borderColor: string;
    bgColor: string;
    headerBgColor: string;
    descriptionBgColor: string;
    tableHeaderBg: string;
    tableBorderColor: string;
  };
}

const PerspectiveEditorContext = createContext<PerspectiveEditorContextType | undefined>(undefined);

interface PerspectiveEditorProviderProps {
  children: React.ReactNode;
  perspective: Perspective;
  moduleName: string;
  perspectiveList?: Perspective[];
}

export function PerspectiveEditorProvider({
  children,
  perspective,
  moduleName,
  perspectiveList = [],
}: PerspectiveEditorProviderProps) {
  // State for current perspective
  const [currentPerspective, setCurrentPerspective] = useState<Perspective>(perspective);
  
  // Update current perspective when prop changes
  useEffect(() => {
    setCurrentPerspective(perspective);
  }, [perspective]);
  
  // Navigation logic
  const currentIndex = useMemo(() => {
    return perspectiveList.findIndex(p => p.name === currentPerspective.name);
  }, [perspectiveList, currentPerspective.name]);
  
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < perspectiveList.length - 1;
  
  const onNavigatePrevious = useCallback(() => {
    if (hasPrevious) {
      setCurrentPerspective(perspectiveList[currentIndex - 1]);
    }
  }, [hasPrevious, perspectiveList, currentIndex]);
  
  const onNavigateNext = useCallback(() => {
    if (hasNext) {
      setCurrentPerspective(perspectiveList[currentIndex + 1]);
    }
  }, [hasNext, perspectiveList, currentIndex]);

  // Color mode values
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const bgColor = useColorModeValue("white", "gray.800");
  const headerBgColor = useColorModeValue("gray.50", "gray.900");
  const descriptionBgColor = useColorModeValue("blue.50", "gray.700");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700");
  const tableBorderColor = useColorModeValue("gray.200", "gray.600");

  const colors = useMemo(() => ({
    borderColor,
    bgColor,
    headerBgColor,
    descriptionBgColor,
    tableHeaderBg,
    tableBorderColor
  }), [borderColor, bgColor, headerBgColor, descriptionBgColor, tableHeaderBg, tableBorderColor]);

  // Format the prompt content to ensure it's a string
  const getPromptContent = useMemo(() => {
    return (): string => {
      const prompt = currentPerspective.schema?.prompt;
      if (prompt === undefined || prompt === null) {
        return "No prompt template available.";
      }
      
      return typeof prompt === 'string' 
        ? prompt 
        : JSON.stringify(prompt, null, 2);
    };
  }, [currentPerspective.schema?.prompt]);

  // Format field type to ensure it's displayed as a string
  const getFieldTypeDisplay = useMemo(() => {
    return (type: string | object): string => {
      if (typeof type === 'string') {
        return type;
      }
      return JSON.stringify(type);
    };
  }, []);

  const value = useMemo(() => ({
    perspective: currentPerspective,
    moduleName,
    onNavigateNext,
    onNavigatePrevious,
    hasPrevious,
    hasNext,
    getPromptContent,
    getFieldTypeDisplay,
    colors
  }), [
    currentPerspective,
    moduleName,
    onNavigateNext,
    onNavigatePrevious,
    hasPrevious,
    hasNext,
    getPromptContent,
    getFieldTypeDisplay,
    colors
  ]);

  return (
    <PerspectiveEditorContext.Provider value={value}>
      {children}
    </PerspectiveEditorContext.Provider>
  );
}

export function usePerspectiveEditor() {
  const context = useContext(PerspectiveEditorContext);
  
  if (context === undefined) {
    throw new Error("usePerspectiveEditor must be used within a PerspectiveEditorProvider");
  }
  
  return context;
} 