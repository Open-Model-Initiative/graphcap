import { ReactNode } from "react";

interface SidebarProps {
	children: ReactNode;
	side: "left" | "right";
}

export function Sidebar({ children, side }: SidebarProps) {
	const sideClasses = side === "left" ? "left-0 border-r" : "right-0 border-l";

	return (
		<div
			className={`fixed top-14 bottom-12 w-64 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 ${sideClasses}`}
		>
			<div className="h-full overflow-y-auto p-4">{children}</div>
		</div>
	);
}
