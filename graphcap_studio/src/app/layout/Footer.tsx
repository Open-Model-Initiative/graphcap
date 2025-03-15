import { 
  Box, 
  Flex, 
  Text, 
  Link as ChakraLink, 
  Stack
} from '@chakra-ui/react'
import { useColorModeValue } from '@/components/ui/theme/color-mode'

export function Footer() {
  const bgColor = useColorModeValue('white', 'gray.900')
  const borderColor = useColorModeValue('gray.200', 'gray.800')
  const textColor = useColorModeValue('gray.600', 'gray.400')
  const hoverColor = useColorModeValue('gray.900', 'white')

  return (
    <Box 
      as="footer" 
      h="8" 
      bg={bgColor} 
      borderTop="1px" 
      borderColor={borderColor}
    >
      <Flex h="full" px="4" align="center" justify="space-between">
        <Text fontSize="xs" color={textColor}>
          {new Date().getFullYear()} graphcap Studio - alpha client
        </Text>
        <Stack direction="row" gap="3">
          <ChakraLink 
            href="https://github.com/fearnworks/graphcap" 
            fontSize="xs"
            color={textColor}
            _hover={{ color: hoverColor }}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </ChakraLink>
          <ChakraLink 
            href="https://fearnworks.github.io/graphcap/" 
            fontSize="xs"
            color={textColor}
            _hover={{ color: hoverColor }}
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </ChakraLink>
        </Stack>
      </Flex>
    </Box>
  )
} 