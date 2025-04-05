// SPDX-License-Identifier: Apache-2.0
/**
 * Compact Model Selector for Footer
 */

import { useColorModeValue } from "@/components/ui/theme/color-mode";
import { Tooltip } from "@/components/ui/tooltip";
import { useGenerationOptions } from "@/features/inference/generation-options";
import { CompactModelSelector, CompactProviderSelector } from "@/features/inference/generation-options/components/selectors/ModelProviderSelectors";
import { queryKeys } from "@/features/inference/services/providers";
import { Badge, Flex, IconButton } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { LuCpu, LuRefreshCw, LuThermometer } from "react-icons/lu";

export function FooterModelSelector() {
	// Get generation options for temperature display
	const { options } = useGenerationOptions();
	
	// Query client for refetching providers
	const queryClient = useQueryClient();
	
	// State to track refresh operation
	const [isRefreshing, setIsRefreshing] = useState(false);
	
	// Handle refresh button click
	const handleRefreshProviders = async () => {
		setIsRefreshing(true);
		try {
			await queryClient.invalidateQueries({ queryKey: queryKeys.providers });
			// Wait for refetch to complete
			await queryClient.refetchQueries({ queryKey: queryKeys.providers });
		} finally {
			setIsRefreshing(false);
		}
	};
	
	// Color values for theming
	const textColor = useColorModeValue("gray.600", "gray.400");
	const bgColor = useColorModeValue("gray.50", "gray.800");
	const iconColor = useColorModeValue("gray.500", "gray.500");
	const badgeBg = useColorModeValue("gray.100", "gray.700");
	const hoverColor = useColorModeValue("gray.200", "gray.700");
	
	return (
		<Flex gap={2} alignItems="center">
			<LuCpu size={14} color={iconColor} />
			
			{/* Refresh button */}
			<Tooltip content="Refresh providers">
				<IconButton
					aria-label="Refresh providers"
					size="xs"
					variant="ghost"
					loading={isRefreshing}
					onClick={handleRefreshProviders}
					color={iconColor}
					_hover={{ bg: hoverColor }}
				>
					<LuRefreshCw size={12} />
				</IconButton>
			</Tooltip>
			
			{/* Use the reusable Provider Selector */}
			<CompactProviderSelector 
				size="xs" 
				width="120px" 
				bg={bgColor} 
				placeholder="Provider"
			/>

			{/* Use the reusable Model Selector */}
			<CompactModelSelector 
				size="xs" 
				width="120px" 
				bg={bgColor} 
				placeholder="Model"
			/>
			
			{/* Temperature indicator to verify context sharing */}
			<Flex alignItems="center" gap={1}>
				<LuThermometer size={14} color={iconColor} />
				<Badge fontSize="2xs" bg={badgeBg} color={textColor}>
					{options.temperature.toFixed(1)}
				</Badge>
			</Flex>
		</Flex>
	);
} 