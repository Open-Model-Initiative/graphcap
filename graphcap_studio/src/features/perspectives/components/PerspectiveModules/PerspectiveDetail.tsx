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

interface PerspectiveDetailProps {
	perspective: Perspective;
	moduleName: string;
}

/**
 * PerspectiveDetail component displays detailed information about a perspective
 */
export function PerspectiveDetail({
	perspective,
	moduleName,
}: PerspectiveDetailProps) {
	// Color mode values
	const borderColor = useColorModeValue("gray.200", "gray.700");
	const tableHeaderBg = useColorModeValue("gray.50", "gray.700");
	const tableBorderColor = useColorModeValue("gray.200", "gray.600");

	return (
		<Box 
			height="100%"
			width="100%"
			overflow="auto"
		>
			{/* Header */}
			<Flex justifyContent="space-between" alignItems="center" mb={4}>
				<Box>
					<Flex alignItems="center" gap={2} mb={2}>
						<Heading size="lg">
							{perspective.display_name || perspective.name}
						</Heading>
						<Badge colorScheme="blue">{perspective.version}</Badge>
					</Flex>
					<Text color="gray.500">Module: {moduleName}</Text>
				</Box>
				<Link to="/perspectives/module/$moduleName" params={{ moduleName }}>
					<Button colorScheme="blue" variant="outline" size="sm">
						Close
					</Button>
				</Link>
			</Flex>

			<Box borderBottom="1px solid" borderColor={borderColor} mb={6} />

			{/* Description */}
			<Box mb={6}>
				<Heading size="md" mb={2}>
					Description
				</Heading>
				<Text>{perspective.description || "No description available."}</Text>
			</Box>

			{/* Tabs for different sections */}
			<Tabs.Root colorPalette="blue" variant="enclosed" defaultValue="schema">
				<Tabs.List>
					<Tabs.Trigger value="schema">Schema</Tabs.Trigger>
					<Tabs.Trigger value="fields">Fields</Tabs.Trigger>
					<Tabs.Trigger value="prompt">Prompt</Tabs.Trigger>
					<Tabs.Trigger value="management">Management</Tabs.Trigger>
					<Tabs.Indicator />
				</Tabs.List>

				<Box pt={4}>
					<Tabs.Content value="schema">
						{perspective.schema ? (
							<Box>
								<Heading size="sm" mb={3}>
									Schema Information
								</Heading>
								<Stack gap={4}>
									<Box>
										<Text fontWeight="bold">Name:</Text>
										<Text>{perspective.schema.name}</Text>
									</Box>
									<Box>
										<Text fontWeight="bold">Version:</Text>
										<Text>{perspective.schema.version}</Text>
									</Box>

									<Box>
										<Text fontWeight="bold">Context Template:</Text>
										<Code
											p={3}
											borderRadius="md"
											whiteSpace="pre-wrap"
											fontSize="sm"
											display="block"
											mt={2}
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
											<Box as="th" p={2} textAlign="left">
												Name
											</Box>
											<Box as="th" p={2} textAlign="left">
												Type
											</Box>
											<Box as="th" p={2} textAlign="left">
												Description
											</Box>
											<Box as="th" p={2} textAlign="left">
												List
											</Box>
											<Box as="th" p={2} textAlign="left">
												Complex
											</Box>
										</Box>
									</Box>
									<Box as="tbody">
										{perspective.schema.schema_fields.map((field) => (
											<Box as="tr" key={`field-${field.name}`}>
												<Box as="td" p={2} fontWeight="bold">
													{field.name}
												</Box>
												<Box as="td" p={2}>
													{field.type}
												</Box>
												<Box as="td" p={2}>
													{field.description}
												</Box>
												<Box as="td" p={2}>
													{field.is_list ? "Yes" : "No"}
												</Box>
												<Box as="td" p={2}>
													{field.is_complex ? "Yes" : "No"}
												</Box>
											</Box>
										))}
									</Box>
								</Box>
							</Box>
						) : (
							<Text>No fields defined for this perspective.</Text>
						)}
					</Tabs.Content>

					<Tabs.Content value="prompt">
						<Box>
							<Heading size="sm" mb={3}>
								Prompt Template
							</Heading>
							<Box
								p={4}
								borderWidth="1px"
								borderRadius="md"
								borderColor={borderColor}
							>
								<Code
									p={4}
									borderRadius="md"
									whiteSpace="pre-wrap"
									fontSize="sm"
									display="block"
								>
									{perspective.schema?.prompt ??
										"No prompt template available."}
								</Code>
							</Box>
						</Box>
					</Tabs.Content>

					<Tabs.Content value="management">
						<Box>
							<Heading size="sm" mb={3}>
								Perspective Management
							</Heading>
							<Text mb={4}>
								This section will allow you to edit and manage the perspective.
							</Text>

							<Box
								p={4}
								borderWidth="1px"
								borderRadius="md"
								borderColor={borderColor}
								mb={4}
							>
								<Stack gap={4}>
									{perspective.schema?.table_columns &&
										perspective.schema.table_columns.length > 0 && (
											<Box>
												<Text fontWeight="bold" mb={2}>
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
															<Box as="th" p={2} textAlign="left">
																Name
															</Box>
															<Box as="th" p={2} textAlign="left">
																Style
															</Box>
															<Box as="th" p={2} textAlign="left">
																Description
															</Box>
														</Box>
													</Box>
													<Box as="tbody">
														{perspective.schema.table_columns.map((column) => (
															<Box as="tr" key={`column-${column.name}`}>
																<Box as="td" p={2}>
																	{column.name}
																</Box>
																<Box as="td" p={2}>
																	{column.style}
																</Box>
																<Box as="td" p={2}>
																	{column.description || "-"}
																</Box>
															</Box>
														))}
													</Box>
												</Box>
											</Box>
										)}

									<Box>
										<Text fontWeight="bold" mb={2}>
											Metadata
										</Text>
										<Flex gap={2} flexWrap="wrap">
											{perspective.version && (
												<Badge>Version: {perspective.version}</Badge>
											)}
										</Flex>
									</Box>
								</Stack>
							</Box>
						</Box>
					</Tabs.Content>
				</Box>
			</Tabs.Root>
		</Box>
	);
}
