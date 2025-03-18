import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/perspectives/")({
  component: PerspectivesPage,
});

function PerspectivesPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Perspectives Management</h1>
      <p>Select a module and perspective from the sidebar to manage perspectives.</p>
    </div>
  );
} 