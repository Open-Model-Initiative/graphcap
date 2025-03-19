import { PerspectiveDetailPage } from "@/pages/perspectives";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/perspectives/module/$moduleName/perspective/$perspectiveName")({
  component: PerspectiveDetailPageWrapper,
});

function PerspectiveDetailPageWrapper() {
  const { moduleName, perspectiveName } = Route.useParams();
  return <PerspectiveDetailPage moduleName={moduleName} perspectiveName={perspectiveName} />;
} 