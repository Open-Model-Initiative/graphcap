import { ModulePage } from "@/pages/perspectives";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/perspectives/module/$moduleName")({
	component: ModulePageWrapper,
});

function ModulePageWrapper() {
	const { moduleName } = Route.useParams();
	return <ModulePage moduleName={moduleName} />;
}
