// SPDX-License-Identifier: Apache-2.0
import {
  Tabs,
  Box,
  Card,
} from '@chakra-ui/react';
import { BasicInfoSection, ConnectionSection, RateLimitsSection } from './form';
import styles from './FormFields.module.css';
import { ModelSelectionSection } from './ModelSelectionSection';
import { useInferenceProviderContext } from './context';

/**
 * Component for rendering provider form fields in either view or edit mode
 */
export function FormFields() {
  const { isEditing } = useInferenceProviderContext();

  return (
    <Tabs.Root 
      defaultValue="basic" 
      variant="enclosed" 
      colorPalette="blue"
      style={{
        backgroundColor: 'var(--chakra-colors-gray-800)',
        padding: 'var(--chakra-space-4)',
        borderRadius: 'var(--chakra-radii-lg)',
      }}
    >
      <Tabs.List 
        style={{
          width: '100%',
          backgroundColor: 'var(--chakra-colors-gray-700)',
          borderTopLeftRadius: 'var(--chakra-radii-md)',
          borderTopRightRadius: 'var(--chakra-radii-md)',
        }}
      >
        <Tabs.Trigger value="basic">Basic Info</Tabs.Trigger>
        <Tabs.Trigger value="connection">Connection</Tabs.Trigger>
        <Tabs.Trigger value="limits">Rate Limits</Tabs.Trigger>
        <Tabs.Trigger value="model">Model</Tabs.Trigger>
        <Tabs.Indicator />       
      </Tabs.List>
      <div className={styles.tabContent}>
        <Tabs.Content value="basic">
          <BasicInfoSection />
        </Tabs.Content>

        <Tabs.Content value="connection">
          <ConnectionSection />
        </Tabs.Content>
        <Tabs.Content value="model">
          <ModelSelectionSection />
        </Tabs.Content>
        <Tabs.Content value="limits">
          <RateLimitsSection />
        </Tabs.Content>
      </div>
    </Tabs.Root>
  );
} 