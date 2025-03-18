// SPDX-License-Identifier: Apache-2.0

interface ErrorStateProps {
	readonly message: string;
}

/**
 * Component for displaying error state
 */
export function ErrorState({ message }: ErrorStateProps) {
	return (
		<div className="flex h-full w-full items-center justify-center p-4">
			<div className="text-red-500 text-center">
				<svg
					className="w-12 h-12 mx-auto mb-2"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={1.5}
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
				<p>{message}</p>
			</div>
		</div>
	);
}
