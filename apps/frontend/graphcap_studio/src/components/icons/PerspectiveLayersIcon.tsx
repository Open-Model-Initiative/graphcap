// SPDX-License-Identifier: Apache-2.0

/**
 * PerspectiveLayersIcon component
 *
 * An icon representing perspectives with eye and layers
 */
interface IconProps {
	className?: string;
}

export function PerspectiveLayersIcon({ className = "" }: Readonly<IconProps>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<title id="perspectiveLayersIconTitle">Perspectives</title>
			<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
			<circle cx="12" cy="12" r="3" />
			<path d="M4 21v-4" />
			<path d="M4 7V3" />
			<path d="M12 21v-1" />
			<path d="M12 4V3" />
			<path d="M20 21v-4" />
			<path d="M20 7V3" />
		</svg>
	);
}
