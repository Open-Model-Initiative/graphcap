import { AlertTriangle, Construction } from "lucide-react"
import type { ReactNode } from "react"
import { Box, Flex, Heading, Text } from "@chakra-ui/react"
import { useColorModeValue } from "@/components/ui/theme/color-mode"

interface FeatureStubProps {
  readonly featureName: string
  readonly description?: string
  readonly children?: ReactNode
}

/**
 * A component to indicate that a feature is under construction
 */
export function FeatureStub({ featureName, description, children }: FeatureStubProps) {
  const borderColor = useColorModeValue("yellow.400", "yellow.600")
  const bgColor = useColorModeValue("yellow.50", "yellow.950")
  const titleColor = useColorModeValue("yellow.700", "yellow.300")
  const textColor = useColorModeValue("yellow.600", "yellow.400")

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      borderWidth="2px"
      borderStyle="dashed"
      borderColor={borderColor}
      borderRadius="lg"
      bg={bgColor}
      opacity={useColorModeValue(1, 0.3)}
      p={6}
      textAlign="center"
    >
      <Flex mb={4} gap={2} color={textColor}>
        <Construction style={{ width: "24px", height: "24px" }} />
        <AlertTriangle style={{ width: "24px", height: "24px" }} />
      </Flex>
      <Heading as="h3" size="md" mb={2} color={titleColor}>
        {featureName} - Under Construction
      </Heading>
      {description && (
        <Text mb={4} maxW="md" fontSize="sm" color={textColor}>
          {description}
        </Text>
      )}
      {children}
    </Box>
  )
}

