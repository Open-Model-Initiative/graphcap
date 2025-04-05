import { useColorModeValue } from "@/components/ui/theme/color-mode";
import { Tooltip } from "@/components/ui/tooltip";
import { Box, Link as ChakraLink, Flex, Text } from "@chakra-ui/react";
import { LuBookOpen, LuGithub } from "react-icons/lu";
import { version } from "../../../package.json";
import { FooterModelSelector } from "./FooterModelSelector";

export function Footer() {
	const bgColor = useColorModeValue("white", "gray.900");
	const borderColor = useColorModeValue("gray.200", "gray.800");
	const textColor = useColorModeValue("gray.600", "gray.400");
	const hoverColor = useColorModeValue("gray.900", "white");

	return (
		<Box
			as="footer"
			h="10"
			bg={bgColor}
			borderTop="1px"
			borderColor={borderColor}
		>
			<Flex h="full" px="4" align="center" justify="space-between">
				<Flex gap={3} align="center">
					<Text fontSize="xs" color={textColor}>
						{new Date().getFullYear()} graphcap Studio v{version}
					</Text>
					<Tooltip content="GitHub">
						<ChakraLink
							href="https://github.com/Open-Model-Initiative/graphcap"
							color={textColor}
							_hover={{ color: hoverColor }}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="GitHub"
						>
							<LuGithub size={16} />
						</ChakraLink>
					</Tooltip>
					<Tooltip content="Documentation">
						<ChakraLink
							href="https://open-model-initiative.github.io/graphcap/"
							color={textColor}
							_hover={{ color: hoverColor }}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Documentation"
						>
							<LuBookOpen size={16} />
						</ChakraLink>
					</Tooltip>
				</Flex>
				{/* Right side area with model selector */}
				<FooterModelSelector />
			</Flex>
		</Box>
	);
}
