// SPDX-License-Identifier: Apache-2.0
/**
 * FormatOptionsPanel Component
 *
 * Panel for configuring the formatting options when copying perspective data.
 * Includes options for including field labels and selecting delimiter format.
 */
import { Checkbox } from "@/components/ui/checkbox";
import { useColorModeValue } from "@/components/ui/theme/color-mode";
import { Box, Flex, Separator, Stack, Text } from "@chakra-ui/react";
import { LuCheck } from "react-icons/lu";
import { FormatType } from "./types";

interface FormatOptionsPanelProps {
  readonly includeLabels: boolean;
  readonly formatType: FormatType;
  readonly onToggleIncludeLabels: () => void;
  readonly onChangeFormatType: (type: FormatType) => void;
}

/**
 * Panel component for configuring format options
 */
export function FormatOptionsPanel({
  includeLabels,
  formatType,
  onToggleIncludeLabels,
  onChangeFormatType
}: FormatOptionsPanelProps) {
  const sectionBg = useColorModeValue("gray.50", "gray.700");
  
  // Format type options
  const formatOptions = [
    { value: 'newline' as FormatType, label: 'Single newline (field: value)' },
    { value: 'double-newline' as FormatType, label: 'Double newline (blank line between fields)' },
    { value: 'csv' as FormatType, label: 'CSV (comma-separated values)' },
    { value: 'xml-tags' as FormatType, label: 'XML tags (<field>value</field>)' }
  ];
  
  return (
    <Stack 
      flex="1"
      gap={2} 
      p={3} 
      bg={sectionBg} 
      borderRadius="md"
      height="100%"
    >
      <Text fontWeight="medium">Format Options</Text>
      
      <Checkbox
        checked={includeLabels}
        onChange={onToggleIncludeLabels}
      >
        Include field labels
      </Checkbox>
      
      <Separator my={2} />
      
      <Text fontSize="sm">Delimiter Format:</Text>
      
      {/* Custom radio implementation */}
      <Stack gap={1}>
        {formatOptions.map(option => (
          <Flex 
            key={option.value} 
            alignItems="center" 
            onClick={() => onChangeFormatType(option.value)}
            cursor="pointer"
            p={1}
            borderRadius="md"
            _hover={{ bg: useColorModeValue("gray.100", "gray.600") }}
          >
            <Box
              width="16px"
              height="16px"
              borderRadius="full"
              border="1px solid"
              borderColor={useColorModeValue("gray.300", "gray.500")}
              display="flex"
              alignItems="center"
              justifyContent="center"
              bg={formatType === option.value ? "blue.500" : "transparent"}
              mr={2}
            >
              {formatType === option.value && (
                <LuCheck size="12px" color="white" />
              )}
            </Box>
            <Text fontSize="sm">{option.label}</Text>
          </Flex>
        ))}
      </Stack>
    </Stack>
  );
} 