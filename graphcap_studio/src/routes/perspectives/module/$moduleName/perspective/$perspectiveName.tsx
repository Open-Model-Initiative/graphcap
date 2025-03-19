import { PerspectiveEditorPage } from "@/pages/perspectives";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/perspectives/module/$moduleName/perspective/$perspectiveName")({
  component: PerspectiveEditorPageWrapper,
});

function PerspectiveEditorPageWrapper() {
  const { moduleName, perspectiveName } = Route.useParams();
  return <PerspectiveEditorPage moduleName={moduleName} perspectiveName={perspectiveName} />;
} 