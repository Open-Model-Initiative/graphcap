import { ErrorDisplay, LoadingDisplay, NotFound, PerspectiveDetail } from "@/features/perspectives/components/PerspectiveModules";
import { usePerspectiveModules } from "@/features/perspectives/hooks";
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
  const { getModulePerspectives } = usePerspectiveModules();
  const { module, perspectives, isLoading, error } = getModulePerspectives(moduleName);
  
  // Find the specific perspective
  const perspective = useMemo(() => {
    if (!perspectives || perspectives.length === 0) return null;

    // First try direct match on the perspective name
    let foundPerspective = perspectives.find(p => p.name === perspectiveName);

    // If not found, try to match with module prefix
    if (!foundPerspective) {
      const fullName = `${moduleName}/${perspectiveName}`;
      foundPerspective = perspectives.find(p => p.name === fullName);
    }

    // Also try matching just the last part of the name (for module-prefixed perspectives)
    if (!foundPerspective) {
      foundPerspective = perspectives.find(p => {
        const parts = p.name.split('/');
        return parts[parts.length - 1] === perspectiveName;
      });
    }

    return foundPerspective;
  }, [perspectives, perspectiveName, moduleName]);

  // Handle loading state
  if (isLoading) {
    return <LoadingDisplay message={`Loading perspective information for module "${moduleName}"...`} />;
  }

  // Handle error state
  if (error) {
    return <ErrorDisplay message={error.message} />;
  }

  // Handle case when module data is missing
  if (!module) {
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