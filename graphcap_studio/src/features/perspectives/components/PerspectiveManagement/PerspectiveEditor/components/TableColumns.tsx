import type { TableColumn } from "@/features/perspectives/types";
import { Box, Text } from "@chakra-ui/react";
import { usePerspectiveEditor } from "../context/PerspectiveEditorContext";

interface TableColumnsProps {
  readonly tableColumns: TableColumn[];
}

/**
 * TableColumns displays a table of column definitions
 */
export function TableColumns({ tableColumns }: TableColumnsProps) {
  const { colors } = usePerspectiveEditor();
  
  return (
    <Box>
      <Text fontWeight="bold" mb={3} fontSize="md">
        Table Columns
      </Text>
      <Box
        as="table"
        width="100%"
        borderWidth="1px"
        borderColor={colors.tableBorderColor}
        borderRadius="md"
      >
        <Box as="thead" bg={colors.tableHeaderBg}>
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
          {tableColumns.map((column) => (
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
  );
} 