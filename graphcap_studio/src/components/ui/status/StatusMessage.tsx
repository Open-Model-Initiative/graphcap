// SPDX-License-Identifier: Apache-2.0
import { AlertCircle } from 'lucide-react';
import {
  Box,
  Flex,
  Text,
  Spinner,
  FlexProps,
  TextProps,
} from '@chakra-ui/react';
import { Status } from '@/components/ui/status';
import { useColorMode } from '@/components/ui/theme/color-mode';

type StatusType = 'warning' | 'loading' | 'error';

// Status message component for various states
export type StatusMessageProps = Readonly<{
  type: StatusType;
  title?: string;
  message: string;
}>;

type ColorConfig = {
  bg: string;
  border: string;
  text: string;
  icon: string;
};

const getColorConfig = (type: StatusType, isDark: boolean): ColorConfig => {
  const configs: Record<StatusType, ColorConfig> = {
    warning: {
      bg: isDark ? 'gray.800' : 'yellow.50',
      border: isDark ? 'yellow.700' : 'yellow.200',
      text: isDark ? 'yellow.400' : 'yellow.700',
      icon: isDark ? 'yellow.400' : 'yellow.500'
    },
    error: {
      bg: isDark ? 'gray.800' : 'red.50',
      border: isDark ? 'red.700' : 'red.200',
      text: isDark ? 'red.300' : 'red.700',
      icon: isDark ? 'red.400' : 'red.500'
    },
    loading: {
      bg: isDark ? 'gray.800' : 'white',
      border: isDark ? 'gray.700' : 'gray.200',
      text: isDark ? 'gray.300' : 'gray.600',
      icon: isDark ? 'blue.400' : 'blue.500'
    }
  };

  return configs[type];
};

const getFlexStyles = (type: StatusType): Pick<FlexProps, 'alignItems' | 'justifyContent'> => ({
  alignItems: type === 'loading' ? 'center' : 'flex-start',
  justifyContent: type === 'loading' ? 'center' : 'flex-start'
});

const getTextStyles = (hasTitle: boolean, colors: ColorConfig): Pick<TextProps, 'fontSize' | 'color' | 'mt' | 'opacity'> => ({
  fontSize: hasTitle ? "sm" : undefined,
  color: colors.text,
  mt: hasTitle ? 1 : 0,
  opacity: hasTitle ? 0.9 : 1
});

/**
 * Component for displaying status messages with different styles based on type
 */
export function StatusMessage({ type, title, message }: StatusMessageProps) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const colors = getColorConfig(type, isDark);
  const flexStyles = getFlexStyles(type);
  const textStyles = getTextStyles(Boolean(title), colors);
  
  // Map our type to Status component value
  const statusValue = type === 'loading' ? 'info' : type;
  
  return (
    <Box 
      bg={colors.bg}
      borderWidth="1px" 
      borderColor={colors.border}
      borderRadius="md"
      p={4}
    >
      <Flex {...flexStyles}>
        {type === 'loading' ? (
          <Spinner size="sm" mr={3} color={colors.icon} />
        ) : (
          <Status value={statusValue} mr={3}>
            <Box as={AlertCircle} w={5} h={5} />
          </Status>
        )}
        <Box>
          {title && (
            <Text 
              fontWeight="medium" 
              color={colors.text}
            >
              {title}
            </Text>
          )}
          <Text {...textStyles}>
            {message}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
} 