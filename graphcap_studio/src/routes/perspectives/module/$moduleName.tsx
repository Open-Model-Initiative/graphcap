import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/perspectives/module/$moduleName")({
  component: ModulePage,
});

function ModulePage() {
  const { moduleName } = Route.useParams();
  
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Module: {moduleName}</h1>
      <p>Select a perspective from this module in the sidebar.</p>
    </div>
  );
} 