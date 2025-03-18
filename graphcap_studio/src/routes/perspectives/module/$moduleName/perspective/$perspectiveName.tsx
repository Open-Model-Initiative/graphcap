import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/perspectives/module/$moduleName/perspective/$perspectiveName")({
  component: PerspectiveDetailPage,
});

function PerspectiveDetailPage() {
  const { moduleName, perspectiveName } = Route.useParams();
  
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Perspective: {perspectiveName}</h1>
      <p>Module: {moduleName}</p>
      <div className="mt-4 p-4 border rounded-md">
        <h2 className="text-lg font-medium mb-2">Perspective Details</h2>
        <p>This is where the perspective management UI will be implemented.</p>
      </div>
    </div>
  );
} 