// SPDX-License-Identifier: Apache-2.0
/**
 * Perspective Card Component
 * 
 * This component displays a perspective with controls.
 */

import React from 'react';
import { Button } from '@/common/ui';
import { usePerspectiveUI } from './context/PerspectiveUIContext';
import { PERSPECTIVE_CLASSES } from './constants';
import { PerspectiveContent } from './PerspectiveContent';
import { SchemaView } from './components/SchemaView';
import { PerspectiveSchema, Provider } from '@/features/perspectives/services/types';
import { useClipboard } from '@/common/hooks/useClipboard';

interface PerspectiveCardProps {
  schema: PerspectiveSchema;
  data: Record<string, any> | null;
  isActive: boolean;
  isGenerated: boolean;
  onGenerate: (providerId?: number) => void;
  onSetActive: () => void;
  providers?: Provider[];
  isGenerating?: boolean;
}

type TabType = 'prompt' | 'caption' | 'schema';

/**
 * Card component for displaying a perspective with controls
 */
export function PerspectiveCard({
  schema,
  data,
  isActive,
  isGenerated,
  onGenerate,
  onSetActive,
  providers = [],
  isGenerating = false,
}: PerspectiveCardProps) {
  const [selectedProviderId, setSelectedProviderId] = React.useState<number | undefined>();
  const [activeTab, setActiveTab] = React.useState<TabType>('prompt');
  const { copyToClipboard, hasCopied } = useClipboard();

  const handleProviderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedProviderId(value ? Number(value) : undefined);
  };

  const handleGenerate = () => {
    onGenerate(selectedProviderId);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleCopyAll = () => {
    if (!data) return;

    const content = {
      perspective: schema.name,
      prompt: schema.prompt,
      data
    };

    copyToClipboard(JSON.stringify(content, null, 2));
  };
  
  return (
    <div className={`${PERSPECTIVE_CLASSES.CARD.BASE} ${
      isActive ? PERSPECTIVE_CLASSES.CARD.ACTIVE : PERSPECTIVE_CLASSES.CARD.INACTIVE
    }`}>
      {/* Card Header */}
      <div className="p-4 bg-gray-800">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium text-gray-200">{schema.display_name}</h4>
            <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-300">
              {schema.name}
            </span>
          </div>
          
          {/* Status indicator */}
          {isGenerating && (
            <div className={PERSPECTIVE_CLASSES.LOADING.BASE}>
              <svg className="animate-spin h-3 w-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Processing</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Tabs - Always visible */}
      <div className="flex border-b border-gray-700">
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'prompt'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => handleTabChange('prompt')}
        >
          Prompt
        </button>
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'caption'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => handleTabChange('caption')}
        >
          Caption
        </button>
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'schema'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => handleTabChange('schema')}
        >
          Schema
        </button>
      </div>

      {/* Tab Content - Always visible */}
      <div className="p-4 bg-gray-900">
        {activeTab === 'prompt' ? (
          <div className="prose prose-invert max-w-none">
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{schema.prompt}</p>
          </div>
        ) : activeTab === 'caption' ? (
          isGenerated && data ? (
            <PerspectiveContent
              perspectiveKey={schema.name}
              data={data}
              className="perspective-content"
            />
          ) : (
            <div className="text-sm text-gray-400 text-center py-4">
              No caption generated yet
            </div>
          )
        ) : (
          <SchemaView schema={schema} />
        )}
      </div>
      
      {/* Action Bar */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant={isActive ? "primary" : "secondary"}
              size="sm"
              onClick={onSetActive}
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              }
            >
              {isActive ? 'Active' : 'View'}
            </Button>
            {isGenerated && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyAll}
                leftIcon={
                  hasCopied ? (
                    <svg className="h-3 w-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  )
                }
              >
                {hasCopied ? 'Copied!' : 'Copy All'}
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {providers.length > 0 && (
              <select
                className={PERSPECTIVE_CLASSES.SELECT.BASE}
                value={selectedProviderId || ''}
                onChange={handleProviderChange}
                disabled={isGenerating}
              >
                <option value="">Default Provider</option>
                {providers.map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            )}
            
            <Button
              variant={isGenerated ? "success" : "primary"}
              size="sm"
              onClick={handleGenerate}
              isLoading={isGenerating}
              disabled={isGenerating}
              leftIcon={
                isGenerated ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              }
            >
              {isGenerated ? (isGenerating ? 'Regenerating...' : 'Regenerate') : (isGenerating ? 'Generating...' : 'Generate')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 