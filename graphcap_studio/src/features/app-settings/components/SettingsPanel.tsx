// SPDX-License-Identifier: Apache-2.0
import { FeatureFlagsPanel } from "../feature-flags/FeatureFlagsPanel";

export function SettingsPanel() {
	return (
		<div className="p-4 space-y-4">
			<h2 className="text-lg font-medium">Settings</h2>
			<div className="mt-4">
				<FeatureFlagsPanel />
			</div>
		</div>
	);
}
