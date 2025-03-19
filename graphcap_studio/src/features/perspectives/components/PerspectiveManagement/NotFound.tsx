import {
  Box,
  Button,
  Heading,
  Text,
} from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";

interface NotFoundProps {
  type: "module" | "perspective";
  name: string;
  moduleName?: string;
}

/**
 * NotFound component displays a message when a module or perspective is not found
 */
export function NotFound({ type, name, moduleName }: NotFoundProps) {
  const getMessage = () => {
    if (type === "module") {
      return `The module "${name}" could not be found.`;
    }
    return `Perspective "${name}" not found in module "${moduleName}".`;
  };

  const getBackLink = () => {
    if (type === "module") {
      return { to: "/perspectives", params: {} };
    }
    return { 
      to: "/perspectives/module/$moduleName", 
      params: { moduleName: moduleName || "" } 
    };
  };

  return (
    <Box p={6}>
      <Box p={4} bg="orange.100" color="orange.800" borderRadius="md" mb={4}>
        <Heading size="md">Not Found</Heading>
        <Text mt={2}>{getMessage()}</Text>
      </Box>
      <Link {...getBackLink()}>
        <Button
          colorScheme="blue"
          variant="outline"
          size="sm"
          mt={4}
        >
          {type === "module" ? "Back to Perspectives" : "Back to Module"}
        </Button>
      </Link>
    </Box>
  );
} 