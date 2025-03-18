// SPDX-License-Identifier: Apache-2.0
// React import removed as it's not used

interface IconProps {
	className?: string;
}

/**
 * Feature flag icon
 */
export function FlagIcon({ className = "" }: Readonly<IconProps>) {
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
			width="20"
			height="20"
		>
			<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
			<line x1="4" y1="22" x2="4" y2="15"/>
		</svg>
	);
}

/**
 * Filter icon for perspectives
 */
export function FilterIcon({ className = "" }: Readonly<IconProps>) {
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
			width="20"
			height="20"
		>
			<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
		</svg>
	);
}

/**
 * Server connection icon
 */
export function ServerIcon({ className = "" }: Readonly<IconProps>) {
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
			width="20"
			height="20"
		>
			<rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
			<rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
			<line x1="6" y1="6" x2="6.01" y2="6"></line>
			<line x1="6" y1="18" x2="6.01" y2="18"></line>
		</svg>
	);
}

/**
 * File browser icon
 */
export function FolderIcon({ className = "" }: Readonly<IconProps>) {
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
			width="20"
			height="20"
		>
			<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
		</svg>
	);
}

/**
 * Settings icon
 */
export function SettingsIcon({ className = "" }: Readonly<IconProps>) {
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
			width="20"
			height="20"
		>
			<circle cx="12" cy="12" r="3"></circle>
			<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
		</svg>
	);
}

/**
 * Provider icon
 */
export function ProviderIcon({ className = "" }: Readonly<IconProps>) {
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
			width="20"
			height="20"
		>
			<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
			<polyline points="7.5 4.21 12 6.81 16.5 4.21" />
			<polyline points="7.5 19.79 7.5 14.6 3 12" />
			<polyline points="21 12 16.5 14.6 16.5 19.79" />
			<polyline points="3.27 6.96 12 12.01 20.73 6.96" />
			<line x1="12" y1="22.08" x2="12" y2="12" />
		</svg>
	);
}

/**
 * Dataset icon
 */
export function DatasetIcon({ className = "" }: Readonly<IconProps>) {
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
			width="20"
			height="20"
		>
			<path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
			<polyline points="14 2 14 8 20 8" />
			<path d="M2 15h10" />
			<path d="M9 18H2" />
			<path d="M3 12h8" />
		</svg>
	);
}

// Export for PerspectiveLayersIcon
export { PerspectiveLayersIcon } from "./PerspectiveLayersIcon";
