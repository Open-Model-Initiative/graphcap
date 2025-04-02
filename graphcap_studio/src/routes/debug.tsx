import { ClipboardDebugSandbox } from "@/features/clipboard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/debug")({
	component: Debug,
});

function Debug() {
	return <ClipboardDebugSandbox />;
}
