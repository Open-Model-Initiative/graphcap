import { Switch } from "@/components/ui/buttons/Switch";
import { useColorModeValue } from "@/components/ui/theme/color-mode";
// SPDX-License-Identifier: Apache-2.0
import { Tooltip } from "@/components/ui/tooltip";
import { Box, Heading, Stack, Text } from "@chakra-ui/react";
import { useFeatureFlags } from "./FeatureFlagProvider";

/**
 * Flag descriptions to provide more context to users
 */
const FLAG_DESCRIPTIONS: Record<string, string> = {
	enableDebugMode: "Enables detailed logging for troubleshooting. Sensitive information like API keys will be automatically redacted.",
	enableReactQueryDevTools: "Shows React Query developer tools for inspecting API requests and cache.",
	enableRouterDevTools: "Shows router developer tools for debugging navigation.",
	enableDebugRoute: "Enables access to debug routes in the application."
};

/**
 * Feature Flags Panel component
 *
 * This component displays all available feature flags with toggle switches
 * and is designed to be used in the left action panel.
 */
export function FeatureFlagsPanel() {
	const { featureFlags, toggleFeatureFlag } = useFeatureFlags();
	const flagEntries = Object.entries(featureFlags) as [
		keyof typeof featureFlags,
		boolean,
	][];

	const textColor = useColorModeValue("gray.800", "gray.200");
	const helpTextColor = useColorModeValue("gray.500", "gray.400");
	const tooltipBgColor = useColorModeValue("gray.700", "gray.700");
	const tooltipTextColor = useColorModeValue("white", "white");

	return (
		<Box p={4}>
			<Heading size="sm" mb={4} color={textColor}>
				Feature Flags
			</Heading>

			<Stack gap={3}>
				{flagEntries.map(([flagName, isEnabled]) => (
					<Box
						key={flagName}
						display="flex"
						alignItems="center"
						justifyContent="space-between"
					>
						<Tooltip 
							content={FLAG_DESCRIPTIONS[flagName] || "No description available"} 
							contentProps={{ 
								bg: tooltipBgColor, 
								color: tooltipTextColor 
							}}
						>
							<Box>
								<Switch
									checked={isEnabled}
									onChange={() => toggleFeatureFlag(flagName)}
									colorScheme="blue"
								>
									<Text fontSize="sm" color={textColor}>
										{formatFlagName(flagName)}
									</Text>
								</Switch>
							</Box>
						</Tooltip>
					</Box>
				))}
			</Stack>

			<Text mt={6} fontSize="xs" color={helpTextColor}>
				These settings are saved in your browser and will persist across
				sessions.
			</Text>
		</Box>
	);
}

/**
 * Format a flag name for display
 *
 * Converts camelCase to Title Case with spaces
 *
 * @param flagName - The flag name to format
 * @returns Formatted flag name
 */
function formatFlagName(flagName: string): string {
	// Convert camelCase to space-separated words
	const words = flagName.replace(/([A-Z])/g, " $1");

	// Capitalize first letter and trim
	return words.charAt(0).toUpperCase() + words.slice(1).trim();
}
