import { useColorModeValue } from "@/components/ui/theme/color-mode";
import { ErrorDisplay, LoadingDisplay, NotFound, PerspectiveDetail } from "@/features/perspectives/components/PerspectiveModules";
import { useModulePerspectives } from "@/features/perspectives/hooks";
import {
  Box,
} from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

export const Route = createFileRoute("/perspectives/module/$moduleName/perspective/$perspectiveName")({
  component: PerspectiveDetailPage,
});

function PerspectiveDetailPage() {
  const { moduleName, perspectiveName } = Route.useParams();
  const { data, isLoading, error } = useModulePerspectives(moduleName);
  
  // Color mode values
  const bgColor = useColorModeValue("white", "gray.800");

  // Find the specific perspective
  const perspective = useMemo(() => {
    if (!data || !data.perspectives) return null;

    // First try direct match on the perspective name
    let foundPerspective = data.perspectives.find(p => p.name === perspectiveName);

    // If not found, try to match with module prefix
    if (!foundPerspective) {
      const fullName = `${moduleName}/${perspectiveName}`;
      foundPerspective = data.perspectives.find(p => p.name === fullName);
    }

    // Also try matching just the last part of the name (for module-prefixed perspectives)
    if (!foundPerspective) {
      foundPerspective = data.perspectives.find(p => {
        const parts = p.name.split('/');
        return parts[parts.length - 1] === perspectiveName;
      });
    }

    return foundPerspective;
  }, [data, perspectiveName, moduleName]);

  // Handle loading state
  if (isLoading) {
    return <LoadingDisplay message={`Loading perspective information for module "${moduleName}"...`} />;
  }

  // Handle error state
  if (error) {
    return <ErrorDisplay message={error.message} />;
  }

  // Handle case when module data is missing
  if (!data) {
    return <NotFound type="module" name={moduleName} />;
  }

  // Handle case when perspective is not found
  if (!perspective) {
    return <NotFound type="perspective" name={perspectiveName} moduleName={moduleName} />;
  }

  return (
    <Box height="100%">
      <PerspectiveDetail 
        perspective={perspective} 
        moduleName={moduleName}
      />
    </Box>
  );
} 