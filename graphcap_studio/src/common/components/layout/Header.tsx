import { Link } from '@tanstack/react-router'
import { 
  Box, 
  Flex, 
  Stack, 
  Text, 
  Button, 
  IconButton, 
  useDisclosure
} from '@chakra-ui/react'
import { useColorModeValue } from '@/components/ui/color-mode'

export function Header() {
  const { isOpen, onToggle } = useDisclosure()
  const bgColor = useColorModeValue('white', 'gray.900')
  const borderColor = useColorModeValue('gray.200', 'gray.800')
  const textColor = useColorModeValue('gray.900', 'white')
  const navTextColor = useColorModeValue('gray.700', 'gray.200')
  const navHoverBg = useColorModeValue('gray.100', 'gray.800')

  return (
    <Box 
      as="header" 
      h="10" 
      bg={bgColor} 
      borderBottom="1px" 
      borderColor={borderColor} 
      zIndex="10"
    >
      <Flex h="full" px="4" align="center" justify="space-between">
        {/* Logo and brand */}
        <Flex align="center" gap="4">
          <Link to="/">
            <Text fontSize="xs" fontWeight="semibold" color={textColor}>
              graphcap Studio
            </Text>
          </Link>
        </Flex>

        {/* Navigation */}
        <Stack direction="row" display={{ base: 'none', md: 'flex' }} gap="3">
          <Link to="/">
            <Button 
              variant="ghost" 
              size="xs" 
              px="2" 
              py="1" 
              color={navTextColor} 
              _hover={{ bg: navHoverBg }}
            >
              Home
            </Button>
          </Link>
          <Link to="/gallery">
            <Button 
              variant="ghost" 
              size="xs" 
              px="2" 
              py="1" 
              color={navTextColor} 
              _hover={{ bg: navHoverBg }}
            >
              Gallery
            </Button>
          </Link>
          <Button 
            as="a" 
            href="http://localhost:32300" 
            target="_blank" 
            rel="noopener noreferrer" 
            variant="ghost" 
            size="xs" 
            px="2" 
            py="1" 
            color={navTextColor} 
            _hover={{ bg: navHoverBg }}
          >
            Pipelines
          </Button>
          <Link to="/debug">
            <Button 
              variant="ghost" 
              size="xs" 
              px="2" 
              py="1" 
              color={navTextColor} 
              _hover={{ bg: navHoverBg }}
            >
              Debug
            </Button>
          </Link>
        </Stack>

        {/* Mobile menu button */}
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          onClick={onToggle}
          aria-label="Toggle Navigation"
          size="sm"
          color={navTextColor}
          _hover={{ bg: navHoverBg }}
        />
      </Flex>

      {/* Mobile menu */}
      {isOpen && (
        <Box 
          display={{ base: 'block', md: 'none' }}
          position="absolute" 
          zIndex="20" 
          w="full" 
          bg={bgColor} 
          borderBottom="1px" 
          borderColor={borderColor}
        >
          <Stack direction="column" align="stretch" px="2" pt="1" pb="2" gap="0.5">
            <Link to="/">
              <Button 
                w="full" 
                justifyContent="flex-start" 
                variant="ghost" 
                size="xs" 
                px="3" 
                py="1" 
                color={navTextColor} 
                _hover={{ bg: navHoverBg }}
              >
                Home
              </Button>
            </Link>
            <Link to="/gallery">
              <Button 
                w="full" 
                justifyContent="flex-start" 
                variant="ghost" 
                size="xs" 
                px="3" 
                py="1" 
                color={navTextColor} 
                _hover={{ bg: navHoverBg }}
              >
                Gallery
              </Button>
            </Link>
            <Button 
              as="a" 
              href="http://localhost:32300" 
              target="_blank" 
              rel="noopener noreferrer" 
              w="full" 
              justifyContent="flex-start" 
              variant="ghost" 
              size="xs" 
              px="3" 
              py="1" 
              color={navTextColor} 
              _hover={{ bg: navHoverBg }}
            >
              Pipelines
            </Button>
            <Link to="/debug">
              <Button 
                w="full" 
                justifyContent="flex-start" 
                variant="ghost" 
                size="xs" 
                px="3" 
                py="1" 
                color={navTextColor} 
                _hover={{ bg: navHoverBg }}
              >
                Debug
              </Button>
            </Link>
          </Stack>
        </Box>
      )}
    </Box>
  )
} 