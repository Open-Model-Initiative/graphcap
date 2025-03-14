// SPDX-License-Identifier: Apache-2.0
import * as React from 'react'
import { LogLevel, useLogger } from '@/common/utils/logger'
import { Select, createListCollection } from '@chakra-ui/react'
import { Field } from '@/components/ui/field'

const logLevelOptions = [
  { label: 'Debug', value: LogLevel.DEBUG },
  { label: 'Info', value: LogLevel.INFO },
  { label: 'Warning', value: LogLevel.WARN },
  { label: 'Error', value: LogLevel.ERROR }
]

const collection = createListCollection({
  items: logLevelOptions,
  itemToString: (item) => item.label,
  itemToValue: (item) => item.value,
})

export function SettingsPanel() {
  const { settings, updateSettings } = useLogger()

  const handleLogLevelChange = (details: { value: string[] }) => {
    const newLevel = details.value[0] as LogLevel
    updateSettings({ minLevel: newLevel })
  }

  return (
    <div className="p-4 space-y-4">
      <Field
        label="Log Level"
        helperText="Set the minimum log level for application-wide logging"
      >
        <Select.Root 
          collection={collection}
          value={[settings.minLevel]}
          onValueChange={handleLogLevelChange}
          size="sm"
        >
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Select log level" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Select.Positioner>
            <Select.Content>
              {logLevelOptions.map((option) => (
                <Select.Item key={option.value} item={option}>
                  {option.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </Field>
    </div>
  )
} 