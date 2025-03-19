import { useColorModeValue } from "@/components/ui/theme/color-mode";
import type { Perspective } from "@/features/perspectives/types";
import {
	Badge,
	Box,
	Button,
	Code,
	Flex,
	Heading,
	Stack,
	Tabs,
	Text,
} from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";

interface PerspectiveEditorProps {
	readonly perspective: Perspective;
	readonly moduleName: string;
}

/**
 * PerspectiveEditor component displays detailed information about a perspective
 */
export function PerspectiveEditor({
	perspective,
	moduleName,
}: PerspectiveEditorProps) {
	// Color mode values
	const borderColor = useColorModeValue("gray.200", "gray.700");
	const bgColor = useColorModeValue("white", "gray.800");
	const headerBgColor = useColorModeValue("gray.50", "gray.900");
	const descriptionBgColor = useColorModeValue("blue.50", "gray.700");
	const tableHeaderBg = useColorModeValue("gray.50", "gray.700");
	const tableBorderColor = useColorModeValue("gray.200", "gray.600");

	// Format the prompt content to ensure it's a string
	const getPromptContent = (): string => {
		const prompt = perspective.schema?.prompt;
		if (prompt === undefined || prompt === null) {
			return "No prompt template available.";
		}
		
		return typeof prompt === 'string' 
			? prompt 
			: JSON.stringify(prompt, null, 2);
	};

	// Format field type to ensure it's displayed as a string
	const getFieldTypeDisplay = (type: string | object): string => {
		if (typeof type === 'string') {
			return type;
		}
		return JSON.stringify(type);
	};

	return (
		<Box 
			height="100%"
			width="100%"
			overflow="auto"
			bg={bgColor}
		>
			{/* Header */}
			<Box 
				py={5} 
				px={6} 
				bg={headerBgColor} 
				borderBottom="1px solid" 
				borderColor={borderColor}
			>
				<Flex justifyContent="space-between" alignItems="center">
					<Box>
						<Flex alignItems="center" gap={2} mb={1}>
							<Heading size="lg">
								{perspective.display_name || perspective.name}
							</Heading>
							<Badge colorScheme="blue" fontSize="sm" px={2} py={1}>{perspective.version}</Badge>
						</Flex>
						<Text color="gray.500">Module: {moduleName}</Text>
					</Box>
					<Link to="/perspectives/module/$moduleName" params={{ moduleName }}>
						<Button colorScheme="blue" variant="outline" size="sm">
							Close
						</Button>
					</Link>
				</Flex>
			</Box>

			{/* Description Panel */}
			<Box 
				p={6} 
				pb={8}
				mb={4} 
				bg={descriptionBgColor}
				borderBottom="1px solid" 
				borderColor={borderColor}
			>
				<Heading size="md" mb={3}>
					Description
				</Heading>
				<Text fontSize="md" lineHeight="1.6">
					{perspective.description || "No description available for this perspective."}
				</Text>
			</Box>

			{/* Tabs for different sections */}
			<Box px={6} pb={6}>
				<Tabs.Root colorPalette="blue" variant="enclosed" defaultValue="schema" size="lg">
					<Tabs.List borderColor={borderColor} py={2}>
						<Tabs.Trigger value="schema" className="px-5 py-2.5 font-medium">Schema</Tabs.Trigger>
						<Tabs.Trigger value="fields" className="px-5 py-2.5 font-medium">Fields</Tabs.Trigger>
						<Tabs.Trigger value="prompt" className="px-5 py-2.5 font-medium">Prompt</Tabs.Trigger>
						<Tabs.Trigger value="management" className="px-5 py-2.5 font-medium">Management</Tabs.Trigger>
						<Tabs.Indicator />
					</Tabs.List>

					<Box pt={6} pb={8}>
						<Tabs.Content value="schema">
							{perspective.schema ? (
								<Box>
									<Heading size="md" mb={4}>
										Schema Information
									</Heading>
									<Stack gap={6} p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
										<Box>
											<Text fontWeight="bold" mb={1}>Name:</Text>
											<Text>{perspective.schema.name}</Text>
										</Box>
										<Box>
											<Text fontWeight="bold" mb={1}>Version:</Text>
											<Text>{perspective.schema.version}</Text>
										</Box>

										<Box>
											<Text fontWeight="bold" mb={2}>Context Template:</Text>
											<Code
												p={4}
												borderRadius="md"
												whiteSpace="pre-wrap"
												fontSize="sm"
												display="block"
												bg="gray.100"
												_dark={{ bg: "gray.700" }}
											>
												{perspective.schema.context_template || "None"}
											</Code>
										</Box>
									</Stack>
								</Box>
							) : (
								<Text>No schema information available for this perspective.</Text>
							)}
						</Tabs.Content>

						<Tabs.Content value="fields">
							{perspective.schema?.schema_fields &&
							perspective.schema.schema_fields.length > 0 ? (
								<Box>
									<Heading size="md" mb={4}>
										Field Definitions
									</Heading>
									<Box overflowX="auto">
										<Box
											as="table"
											width="100%"
											borderWidth="1px"
											borderColor={tableBorderColor}
											borderRadius="md"
										>
											<Box as="thead" bg={tableHeaderBg}>
												<Box as="tr">
													<Box as="th" p={3} textAlign="left">
														Name
													</Box>
													<Box as="th" p={3} textAlign="left">
														Type
													</Box>
													<Box as="th" p={3} textAlign="left">
														Description
													</Box>
													<Box as="th" p={3} textAlign="center">
														List
													</Box>
													<Box as="th" p={3} textAlign="center">
														Complex
													</Box>
												</Box>
											</Box>
											<Box as="tbody">
												{perspective.schema.schema_fields.map((field) => (
													<Box as="tr" key={`field-${field.name}`}>
														<Box as="td" p={3} fontWeight="bold">
															{field.name}
														</Box>
														<Box as="td" p={3}>
															{getFieldTypeDisplay(field.type)}
														</Box>
														<Box as="td" p={3}>
															{field.description}
														</Box>
														<Box as="td" p={3} textAlign="center">
															{field.is_list ? "Yes" : "No"}
														</Box>
														<Box as="td" p={3} textAlign="center">
															{field.is_complex ? "Yes" : "No"}
														</Box>
													</Box>
												))}
											</Box>
										</Box>
									</Box>
								</Box>
							) : (
								<Text>No fields defined for this perspective.</Text>
							)}
						</Tabs.Content>

						<Tabs.Content value="prompt">
							<Box>
								<Heading size="md" mb={4}>
									Prompt Template
								</Heading>
								<Box
									borderWidth="1px"
									borderRadius="md"
									borderColor={borderColor}
								>
									<Code
										p={5}
										borderRadius="md"
										whiteSpace="pre-wrap"
										fontSize="sm"
										display="block"
										bg="gray.100"
										_dark={{ bg: "gray.700" }}
										height="auto"
										minHeight="200px"
									>
										{getPromptContent()}
									</Code>
								</Box>
							</Box>
						</Tabs.Content>

						<Tabs.Content value="management">
							<Box>
								<Heading size="md" mb={4}>
									Perspective Management
								</Heading>
								<Text mb={5} fontSize="md">
									This section allows you to edit and manage the perspective configuration.
								</Text>

								<Box
									p={5}
									borderWidth="1px"
									borderRadius="md"
									borderColor={borderColor}
									mb={6}
								>
									<Stack gap={5}>
										{perspective.schema?.table_columns &&
											perspective.schema.table_columns.length > 0 && (
												<Box>
													<Text fontWeight="bold" mb={3} fontSize="md">
														Table Columns
													</Text>
													<Box
														as="table"
														width="100%"
														borderWidth="1px"
														borderColor={tableBorderColor}
														borderRadius="md"
													>
														<Box as="thead" bg={tableHeaderBg}>
															<Box as="tr">
																<Box as="th" p={3} textAlign="left">
																	Name
																</Box>
																<Box as="th" p={3} textAlign="left">
																	Style
																</Box>
																<Box as="th" p={3} textAlign="left">
																	Description
																</Box>
															</Box>
														</Box>
														<Box as="tbody">
															{perspective.schema.table_columns.map((column) => (
																<Box as="tr" key={`column-${column.name}`}>
																	<Box as="td" p={3}>
																		{column.name}
																	</Box>
																	<Box as="td" p={3}>
																		{column.style}
																	</Box>
																	<Box as="td" p={3}>
																		{column.description ?? "-"}
																	</Box>
																</Box>
															))}
														</Box>
													</Box>
												</Box>
											)}

										<Box mt={4}>
											<Text fontWeight="bold" mb={3} fontSize="md">
												Actions
											</Text>
											<Flex gap={3}>
												<Button colorScheme="blue" size="md" disabled>
													Edit Perspective
												</Button>
												<Button colorScheme="red" variant="outline" size="md" disabled>
													Deprecate
												</Button>
											</Flex>
										</Box>
									</Stack>
								</Box>
							</Box>
						</Tabs.Content>
					</Box>
				</Tabs.Root>
			</Box>
		</Box>
	);
}
