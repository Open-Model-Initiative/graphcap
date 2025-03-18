import { useColorModeValue } from "@/components/ui/theme/color-mode";
import { Box, Button, Flex, Link, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "@tanstack/react-router";

export function Header() {
	const bgColor = useColorModeValue("white", "gray.900");
	const borderColor = useColorModeValue("gray.200", "gray.800");
	const textColor = useColorModeValue("gray.900", "white");
	const navTextColor = useColorModeValue("gray.700", "gray.200");
	const navHoverBg = useColorModeValue("gray.100", "gray.800");

	return (
		<Box
			as="header"
			h="10"
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
					<Link
						href="http://localhost:32300"
						target="_blank"
						rel="noopener noreferrer"
						_hover={{ textDecoration: "none" }}
					>
						<Button
							variant="ghost"
							size="xs"
							px="2"
							py="1"
							color={navTextColor}
							_hover={{ bg: navHoverBg }}
						>
							Pipelines
						</Button>
					</Link>
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
				</Stack>
			</Flex>
		</Box>
	);
}
