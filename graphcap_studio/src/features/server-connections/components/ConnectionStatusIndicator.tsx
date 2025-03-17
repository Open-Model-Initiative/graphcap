import { Status } from "@/components/ui/status";
import { CONNECTION_STATUS } from "@/features/server-connections/constants";
import { ConnectionStatusIndicatorProps } from "@/features/server-connections/types";
// SPDX-License-Identifier: Apache-2.0
import { memo } from "react";

/**
 * ConnectionStatusIndicator component
 *
 * Displays a visual indicator of the connection status using Chakra UI Status component
 */
export const ConnectionStatusIndicator = memo(
	function ConnectionStatusIndicator({
		status,
	}: ConnectionStatusIndicatorProps) {
		switch (status) {
			case CONNECTION_STATUS.CONNECTED:
				return (
					<Status value="success" size="sm">
						Connected
					</Status>
				);
			case CONNECTION_STATUS.TESTING:
				return (
					<Status value="warning" size="sm">
						Testing...
					</Status>
				);
			case CONNECTION_STATUS.ERROR:
				return (
					<Status value="error" size="sm">
						Error
					</Status>
				);
			default:
				return (
					<Status value="info" size="sm">
						Disconnected
					</Status>
				);
		}
	},
);
