// SPDX-License-Identifier: Apache-2.0
import { useColorModeValue } from "@/components/ui/theme/color-mode";
import {
  Box,
  Card,
  Heading,
  Text,
} from "@chakra-ui/react";

interface ProviderCardProps {
  name: string;
  description: string;
  onClick: () => void;
}

export function ProviderCard({ name, description, onClick }: ProviderCardProps) {
  const bgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Card.Root
      bg={bgColor}
      borderColor={borderColor}
      borderWidth="1px"
      borderRadius="md"
      cursor="pointer"
      onClick={onClick}
      transition="all 0.2s"
      _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
    >
      <Card.Body>
        <Heading size="sm" mb={2}>
          {name}
        </Heading>
        <Text fontSize="sm">{description}</Text>
      </Card.Body>
    </Card.Root>
  );
} 