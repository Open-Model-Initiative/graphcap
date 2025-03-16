import { createFileRoute } from '@tanstack/react-router'
import { 
  Box, 
  Heading, 
  Text, 
  List, 
  Container,
  Card,
  VStack,
  Icon
} from "@chakra-ui/react"
import { useColorModeValue } from "@/components/ui/theme/color-mode"
import { MdCircle } from "react-icons/md"

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const bgColor = useColorModeValue("gray.50", "gray.800")
  const cardBgColor = useColorModeValue("white", "gray.700")
  const textColor = useColorModeValue("gray.800", "gray.200")
  const headingColor = useColorModeValue("gray.900", "white")

  return (
    <Box p={4} bg={bgColor} color={textColor}>
      <Container maxW="container.lg">
        <VStack gap={6} align="stretch">
          <Heading as="h3" size="lg" mb={2} color={headingColor}>
            Welcome to graphcap Studio!
          </Heading>
          
          <Text mb={4}>
            Dashboard currently under construction. Please go to the Gallery to view the available datasets.
          </Text>
          <Card.Root bg={cardBgColor} mb={6} shadow="md">
            <Card.Header pb={0}>
              <Heading size="md" color={headingColor}>Getting Started</Heading>
            </Card.Header>
            <Card.Body>
              <Text mb={2}>
                Use the side panels to access various tools and settings:
              </Text>
              <List.Root gap={1} mb={2}>
                <List.Item display="flex" alignItems="center">
                  <Icon as={MdCircle} color="blue.500" fontSize="xs" mr={2} />
                  Left panel: Feature flags and application settings
                </List.Item>
                <List.Item display="flex" alignItems="center">
                  <Icon as={MdCircle} color="blue.500" fontSize="xs" mr={2} />
                  Right panel: Server connections and file browser
                </List.Item>
              </List.Root>
              <Text>
                Click the toggle buttons on the edges of the screen to expand or collapse the panels.
              </Text>
            </Card.Body>
          </Card.Root>
        </VStack>
      </Container>
    </Box>
  )
}
