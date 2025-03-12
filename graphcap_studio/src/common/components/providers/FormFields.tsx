// SPDX-License-Identifier: Apache-2.0
import { ChangeEvent } from 'react';
import { Controller } from 'react-hook-form';
import { PROVIDER_ENVIRONMENTS } from '../../../services/providers/constants';
import { 
  FormField, 
  Input, 
  Select, 
  Checkbox 
} from './form/index';
import { useProviderFormContext } from './context';

/**
 * Component for rendering provider form fields
 */
export function FormFields() {
  const { control, errors } = useProviderFormContext();
  
  return (
    <>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <FormField id="name" label="Name" error={errors.name?.message}>
            <Input {...field} error={!!errors.name} />
          </FormField>
        )}
      />
      
      <Controller
        name="kind"
        control={control}
        render={({ field }) => (
          <FormField id="kind" label="Kind" error={errors.kind?.message}>
            <Input {...field} error={!!errors.kind} />
          </FormField>
        )}
      />
      
      <Controller
        name="environment"
        control={control}
        render={({ field }) => (
          <FormField id="environment" label="Environment" error={errors.environment?.message}>
            <Select
              {...field}
              options={PROVIDER_ENVIRONMENTS.map(env => ({
                value: env,
                label: env
              }))}
              error={!!errors.environment}
            />
          </FormField>
        )}
      />
      
      <Controller
        name="baseUrl"
        control={control}
        render={({ field }) => (
          <FormField id="baseUrl" label="Base URL" error={errors.baseUrl?.message}>
            <Input {...field} type="url" error={!!errors.baseUrl} />
          </FormField>
        )}
      />
      
      <Controller
        name="envVar"
        control={control}
        render={({ field }) => (
          <FormField id="envVar" label="Environment Variable" error={errors.envVar?.message}>
            <Input {...field} error={!!errors.envVar} />
          </FormField>
        )}
      />
      
      <Controller
        name="isEnabled"
        control={control}
        render={({ field: { value, onChange, ...field } }) => (
          <Checkbox
            {...field}
            id="isEnabled"
            label="Enabled"
            checked={value}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
          />
        )}
      />
      
      <div>
        <div id="rateLimits" className="block text-xs text-gray-500 mb-1">Rate Limits</div>
        <div className="space-y-2" aria-labelledby="rateLimits">
          <Controller
            name="rateLimits.requestsPerMinute"
            control={control}
            render={({ field: { value, onChange, ...field } }) => (
              <FormField id="requestsPerMinute" label="Requests per minute" error={errors.rateLimits?.requestsPerMinute?.message}>
                <Input
                  {...field}
                  type="number"
                  value={value ?? 0}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(parseInt(e.target.value) ?? 0)}
                  min="0"
                  error={!!errors.rateLimits?.requestsPerMinute}
                />
              </FormField>
            )}
          />
          
          <Controller
            name="rateLimits.tokensPerMinute"
            control={control}
            render={({ field: { value, onChange, ...field } }) => (
              <FormField id="tokensPerMinute" label="Tokens per minute" error={errors.rateLimits?.tokensPerMinute?.message}>
                <Input
                  {...field}
                  type="number"
                  value={value ?? 0}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(parseInt(e.target.value) ?? 0)}
                  min="0"
                  error={!!errors.rateLimits?.tokensPerMinute}
                />
              </FormField>
            )}
          />
        </div>
      </div>
    </>
  );
} 