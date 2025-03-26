// SPDX-License-Identifier: Apache-2.0
import { Box, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { LuCheck, LuCircleAlert, LuSkipForward } from "react-icons/lu";

/**
 * Component that displays connection test steps and their results
 */
interface ConnectionStep {
  step: string;
  status: "success" | "failed" | "skipped" | "pending";
  timestamp: string;
  error?: string;
  message?: string;
}

interface ConnectionStepsProps {
	readonly steps: ConnectionStep[];
	readonly stepLabels?: Record<string, string>;
}

function StepIcon({ status }: { status: ConnectionStep["status"] }) {
  switch (status) {
    case "success":
      return <Icon as={LuCheck} boxSize={5} color="green.500" />;
    case "skipped":
      return <Icon as={LuSkipForward} boxSize={5} color="yellow.500" />;
    case "failed":
      return <Icon as={LuCircleAlert} boxSize={5} color="red.500" />;
    default:
      return null;
  }
}

function ConnectionStepResult({ step, labels }: { step: ConnectionStep; labels?: Record<string, string> }) {
  const stepLabel = labels?.[step.step] || step.step;

  return (
    <HStack gap={3} align="flex-start">
      <Box pt={1}>
        <StepIcon status={step.status} />
      </Box>
      <VStack gap={1} align="flex-start">
        <Text fontWeight="medium">{stepLabel}</Text>
        {step.message && (
          <Text fontSize="sm" color="gray.600">{step.message}</Text>
        )}
        {step.error && (
          <Text fontSize="sm" color="red.500">{step.error}</Text>
        )}
      </VStack>
    </HStack>
  );
}

export function ConnectionSteps({ steps, stepLabels = {} }: ConnectionStepsProps) {
  return (
    <VStack align="stretch" gap={4}>
      <Text fontWeight="medium">Connection Test Results:</Text>
      {steps.map((step) => (
        <ConnectionStepResult 
          key={`${step.step}-${step.timestamp}`} 
          step={step}
          labels={stepLabels}
        />
      ))}
    </VStack>
  );
}

export type { ConnectionStep }; 