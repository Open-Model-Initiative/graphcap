import { Switch } from "@/components/ui/buttons/Switch";
import { useColorModeValue } from "@/components/ui/theme/color-mode";
import {
  Box,
  Button,
  Field,
  Group,
  Input,
  InputElement,
  Text,
  VStack,
} from "@chakra-ui/react";
// SPDX-License-Identifier: Apache-2.0
import { useState } from "react";
import { Controller } from "react-hook-form";
import { useProviderFormContext } from "../../../context/ProviderFormContext";

/**
 * Component for displaying and editing provider connection settings
 */
export function ConnectionSection() {
  const { control, errors, watch, mode, provider } =
    useProviderFormContext();
  const isEditing = mode === "edit" || mode === "create";
  const [showApiKey, setShowApiKey] = useState(false);
  const labelColor = useColorModeValue("gray.600", "gray.300");
  const textColor = useColorModeValue("gray.700", "gray.200");

  // Watch form values for read-only display
  const baseUrl = watch("baseUrl");
  const isEnabled = watch("isEnabled");

  // Toggle API key visibility
  const toggleShowApiKey = () => setShowApiKey(!showApiKey);

  // Get API key display value
  const getApiKeyDisplayValue = () => {
    if (showApiKey) {
      return provider?.apiKey;
    }
    return provider?.apiKey ? "••••••••••••••••" : "Not set";
  };

  if (!isEditing) {
    return (
      <VStack gap={4} align="stretch" mt={4}>
        <Box>
          <Text fontSize="sm" color={labelColor}>
            Base URL
          </Text>
          <Text color={textColor}>{baseUrl}</Text>
        </Box>

        <Box>
          <Text fontSize="sm" color={labelColor}>
            API Key
          </Text>
          <Group position="relative">
            <Input
              type={showApiKey ? "text" : "password"}
              value={getApiKeyDisplayValue()}
              readOnly
              pe="4.5rem"
            />
            <InputElement placement="end" width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={toggleShowApiKey}>
                {showApiKey ? "Hide" : "Show"}
              </Button>
            </InputElement>
          </Group>
        </Box>

        <Box>
          <Text fontSize="sm" color={labelColor}>
            Status
          </Text>
          <Text color={textColor}>{isEnabled ? "Enabled" : "Disabled"}</Text>
        </Box>
      </VStack>
    );
  }

  return (
    <VStack gap={4} align="stretch" mt={4}>
      <Controller
        name="baseUrl"
        control={control}
        render={({ field }) => (
          <Field.Root invalid={!!errors.baseUrl}>
            <Field.Label color={labelColor}>Base URL</Field.Label>
            <Input {...field} id="baseUrl" type="url" />
            <Field.ErrorText>{errors.baseUrl?.message}</Field.ErrorText>
          </Field.Root>
        )}
      />

      <Controller
        name="apiKey"
        control={control}
        render={({ field }) => {
          // Ensure we always have a defined string value
          const value = field.value ?? "";
          return (
            <Field.Root invalid={!!errors.apiKey}>
              <Field.Label color={labelColor}>API Key</Field.Label>
              <Group position="relative">
                <Input
                  {...field}
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  pe="4.5rem"
                  required
                  placeholder="Enter API key"
                  value={value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                <InputElement placement="end" width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={toggleShowApiKey}>
                    {showApiKey ? "Hide" : "Show"}
                  </Button>
                </InputElement>
              </Group>
              <Field.ErrorText>
                {errors.apiKey?.message ||
                  (value === "" && "API key is required")}
              </Field.ErrorText>
            </Field.Root>
          );
        }}
      />

      <Controller
        name="isEnabled"
        control={control}
        render={({ field: { value, onChange, ...field } }) => (
          <Field.Root>
            <Field.Label color={labelColor}>
              <Switch
                {...field}
                id="isEnabled"
                checked={value}
                onCheckedChange={onChange}
              >
                Enabled
              </Switch>
            </Field.Label>
          </Field.Root>
        )}
      />
    </VStack>
  );
}
