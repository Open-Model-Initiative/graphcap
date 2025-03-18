// SPDX-License-Identifier: Apache-2.0
/**
 * Perspective Filter Panel
 *
 * This component provides a UI for toggling the visibility of different perspectives.
 */

import { Checkbox } from "@/components/ui/checkbox";
import {
	Box,
	Button,
	Flex,
	HStack,
	Heading,
	Text,
	VStack,
} from "@chakra-ui/react";
import { useMemo } from "react";
import { usePerspectivesData } from "../context/PerspectivesDataContext";

/**
 * Component for filtering which perspectives are visible in the UI
 */
export function PerspectiveFilterPanel() {
	const {
		perspectives,
		hiddenPerspectives,
		togglePerspectiveVisibility,
		isPerspectiveVisible,
		setAllPerspectivesVisible,
	} = usePerspectivesData();

	// Count how many perspectives are visible/hidden
	const counts = useMemo(() => {
		const totalCount = perspectives.length;
		const hiddenCount = hiddenPerspectives.length;
		const visibleCount = totalCount - hiddenCount;

		return { totalCount, hiddenCount, visibleCount };
	}, [perspectives, hiddenPerspectives]);

	return (
		<Box p={4}>
			<VStack gap={4} alignItems="stretch">
				<Flex justifyContent="space-between" alignItems="center">
					<Heading size="sm">Perspective Visibility</Heading>
					<Text fontSize="xs" color="gray.500">
						{counts.visibleCount} of {counts.totalCount} visible
					</Text>
				</Flex>

				<Box borderBottom="1px solid" borderColor="gray.200" />

				<VStack gap={2} alignItems="stretch">
					{perspectives.map((perspective) => (
						<Checkbox
							key={perspective.name}
							checked={isPerspectiveVisible(perspective.name)}
							onChange={() => togglePerspectiveVisibility(perspective.name)}
							colorScheme="blue"
							size="sm"
						>
							<Text
								fontSize="sm"
								fontWeight={
									isPerspectiveVisible(perspective.name) ? "medium" : "normal"
								}
							>
								{perspective.display_name || perspective.name}
							</Text>
						</Checkbox>
					))}
				</VStack>

				<Box borderBottom="1px solid" borderColor="gray.200" />

				<HStack justifyContent="space-between">
					<Button
						size="xs"
						variant="outline"
						colorScheme="blue"
						onClick={setAllPerspectivesVisible}
						disabled={counts.hiddenCount === 0}
					>
						Show All
					</Button>
					<Button
						size="xs"
						variant="outline"
						colorScheme="blue"
						onClick={() => {
							for (const p of perspectives) {
								togglePerspectiveVisibility(p.name);
							}
						}}
					>
						Toggle All
					</Button>
				</HStack>
			</VStack>
		</Box>
	);
}
