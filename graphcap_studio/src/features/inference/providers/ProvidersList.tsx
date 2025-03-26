// SPDX-License-Identifier: Apache-2.0
import { ProviderSelect } from "./ProviderConnection/form";
import { useProviderFormContext } from "./context";


/**
 * Component for displaying a list of providers as a dropdown
 */
export default function ProvidersList() {
	const { providers } = useProviderFormContext();

	if (providers.length === 0) {
		return (
			<div className="p-4 text-center">
				<p className="text-sm text-gray-500">No providers available</p>
			</div>
		);
	}
	return (
		<div className="p-4">
			<ProviderSelect className="w-full" />
		</div>
	);
}
