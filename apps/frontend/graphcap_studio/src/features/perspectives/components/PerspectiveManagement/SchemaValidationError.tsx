import {
    Box,
    Code,
    Flex,
    Heading,
    Text
} from "@chakra-ui/react";

interface SchemaValidationErrorProps {
    error: Error;
}

/**
 * Component to display detailed schema validation errors
 */
export function SchemaValidationError({ error }: SchemaValidationErrorProps) {
    // Check if the error contains validation information
    const isSchemaError = error.message.includes("Invalid enum value") ||
        error.message.includes("schema_fields") ||
        error.message.includes("Expected 'str' | 'float'");

    return (
        <Box
            p={5}
            borderRadius="md"
            border="1px"
            borderColor="red.500"
            bg="red.50"
        >
            <Flex alignItems="center" mb={3}>
                <Heading size="md" color="red.700">Schema Validation Error</Heading>
            </Flex>
            <Box>
                {isSchemaError ? (
                    <>
                        <Text mb={3}>
                            There was an error loading perspectives due to schema validation issues with complex fields.
                            The system is expecting only simple field types ('str' or 'float') but found complex nested objects.
                        </Text>
                        <Text fontWeight="bold" mb={2}>Possible Solutions:</Text>
                        <Box as="ul" pl={5} mb={3}>
                            <Box as="li" mb={2}>Update the server to support complex field structures (recommended)</Box>
                            <Box as="li" mb={2}>Simplify perspective schemas to avoid nested fields</Box>
                        </Box>
                        <Text fontWeight="bold" mb={2}>Technical Details:</Text>
                        <Code p={3} borderRadius="md" display="block" whiteSpace="pre-wrap" fontSize="sm" mb={3}>
                            {error.message}
                        </Code>
                    </>
                ) : (
                    <Text>{error.message}</Text>
                )}
            </Box>
        </Box>
    );
} 