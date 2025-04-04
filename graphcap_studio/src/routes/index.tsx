import { useColorModeValue } from "@/components/ui/theme/color-mode";
import { SetupGuide } from "@/components/setup-guide";
import {
	Box,
	Card,
	Container,
	Heading,
	Text,
	VStack,
} from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	const bgColor = useColorModeValue("gray.50", "gray.800");
	const cardBgColor = useColorModeValue("white", "gray.700");
	const textColor = useColorModeValue("gray.800", "gray.200");
	const headingColor = useColorModeValue("gray.900", "white");

	return (
		<Box p={4} bg={bgColor} color={textColor}>
			<Container maxW="container.lg">
				<VStack gap={6} align="stretch">
					<Heading as="h3" size="lg" mb={2} color={headingColor}>
						Welcome to graphcap Studio!
					</Heading>

					<Text mb={4}>
						Get started with GraphCap by following the steps below.
					</Text>

					<Card.Root bg={cardBgColor} mb={6} shadow="md">
						<Card.Header pb={0}>
							<Heading size="md" color={headingColor}>
								Getting Started
							</Heading>
						</Card.Header>
						<Card.Body>
							<SetupGuide />
						</Card.Body>
					</Card.Root>
				</VStack>
			</Container>
		</Box>
	);
}
