import { useColorModeValue } from "@/components/ui/theme/color-mode";
import { ErrorDisplay, LoadingDisplay, NotFound, PerspectiveDetail } from "@/features/perspectives/components/PerspectiveModules";
import { usePerspectives } from "@/features/perspectives/hooks";
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
  const { data: perspectives, isLoading, error } = usePerspectives();
  
  // Color mode values
  const bgColor = useColorModeValue("white", "gray.800");

  // Find the specific perspective
  const perspective = useMemo(() => {
    if (!perspectives) return null;

    // First try direct match
    let foundPerspective = perspectives.find(p => p.name === perspectiveName);

    // If not found, try to match with module prefix
    if (!foundPerspective) {
      const fullName = `${moduleName}/${perspectiveName}`;
      foundPerspective = perspectives.find(p => p.name === fullName);
    }

    return foundPerspective;
  }, [perspectives, perspectiveName, moduleName]);

  // Handle loading state
  if (isLoading) {
    return <LoadingDisplay message="Loading perspective information..." />;
  }

  // Handle error state
  if (error) {
    return <ErrorDisplay message={error.message} />;
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