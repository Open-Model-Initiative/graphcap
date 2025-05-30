import { useColorModeValue } from "@/components/ui/theme/color-mode";
import { useFeatureFlag } from "@/features/app-settings/feature-flags";
import { Box, Button, Flex, Link, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "@tanstack/react-router";

export function Header() {
	const bgColor = useColorModeValue("white", "gray.900");
	const borderColor = useColorModeValue("gray.200", "gray.800");
	const textColor = useColorModeValue("gray.900", "white");
	const navTextColor = useColorModeValue("gray.700", "gray.200");
	const navHoverBg = useColorModeValue("gray.100", "gray.800");
	const enableDebugRoute = useFeatureFlag("enableDebugRoute");

	return (
		<Box
			as="header"
			h="6"
			bg={bgColor}
			borderBottom="1px"
			borderColor={borderColor}
			zIndex="10"
		>
			<Flex h="full" px="4" align="center" justify="space-between">
				{/* Logo and brand */}
				<Flex align="center" gap="4">
					<RouterLink to="/">
						<Text fontSize="xs" fontWeight="semibold" color={textColor}>
							graphcap Studio
						</Text>
					</RouterLink>
				</Flex>

				{/* Navigation */}
				<Stack direction="row" gap="3">
					<RouterLink to="/">
						<Button
							variant="ghost"
							size="xs"
							px="2"
							py="1"
							color={navTextColor}
							_hover={{ bg: navHoverBg }}
						>
							Home
						</Button>
					</RouterLink>
					<RouterLink to="/gallery">
						<Button
							variant="ghost"
							size="xs"
							px="2"
							py="1"
							color={navTextColor}
							_hover={{ bg: navHoverBg }}
						>
							Gallery
						</Button>
					</RouterLink>
					{enableDebugRoute && (
						<RouterLink to="/debug">
							<Button
								variant="ghost"
								size="xs"
								px="2"
								py="1"
								color={navTextColor}
								_hover={{ bg: navHoverBg }}
							>
								Debug
							</Button>
						</RouterLink>
					)}
				</Stack>
			</Flex>
		</Box>
	);
}
