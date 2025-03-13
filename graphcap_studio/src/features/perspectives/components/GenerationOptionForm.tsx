// SPDX-License-Identifier: Apache-2.0
/**
 * Generation Option Form Component
 * 
 * This component displays a form for configuring generation options.
 */

import React from 'react';
import { Button } from '@/common/ui';
import { CaptionOptions } from '@/features/perspectives/types';

// Default options for caption generation
export const DEFAULT_OPTIONS: CaptionOptions = {
  temperature: 0.7,
  max_tokens: 4096,
  top_p: 0.95,
  repetition_penalty: 1.1
};

interface GenerationOptionFormProps {
  options: CaptionOptions;
  onChange: (options: CaptionOptions) => void;
  onClose: () => void;
  isGenerating?: boolean;
}

/**
 * Form component for configuring generation options
 */
export function GenerationOptionForm({
  options,
  onChange,
  onClose,
  isGenerating = false,
}: GenerationOptionFormProps) {
  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    onChange({
      ...options,
      [name]: type === 'number' ? parseFloat(value) : value
    });
  };

  const handleResetDefaults = () => {
    onChange(DEFAULT_OPTIONS);
  };
  
  return (
    <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 rounded-md shadow-lg z-50 p-4 border border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium text-gray-300">Generation Options</h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-200"
          disabled={isGenerating}
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Temperature</label>
          <div className="flex items-center">
            <input
              type="range"
              name="temperature"
              min="0"
              max="1"
              step="0.1"
              value={options.temperature || 0.7}
              onChange={handleOptionChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              disabled={isGenerating}
            />
            <span className="ml-2 text-xs text-gray-400">{options.temperature || 0.7}</span>
          </div>
        </div>
        
        <div>
          <label className="block text-xs text-gray-400 mb-1">Max Tokens</label>
          <input
            type="number"
            name="max_tokens"
            value={options.max_tokens || 4096}
            onChange={handleOptionChange}
            className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded-md text-gray-300"
            disabled={isGenerating}
          />
        </div>
        
        <div>
          <label className="block text-xs text-gray-400 mb-1">Top P</label>
          <div className="flex items-center">
            <input
              type="range"
              name="top_p"
              min="0"
              max="1"
              step="0.05"
              value={options.top_p || 0.95}
              onChange={handleOptionChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              disabled={isGenerating}
            />
            <span className="ml-2 text-xs text-gray-400">{options.top_p || 0.95}</span>
          </div>
        </div>
        
        <div>
          <label className="block text-xs text-gray-400 mb-1">Repetition Penalty</label>
          <div className="flex items-center">
            <input
              type="range"
              name="repetition_penalty"
              min="1"
              max="2"
              step="0.1"
              value={options.repetition_penalty || 1.1}
              onChange={handleOptionChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              disabled={isGenerating}
            />
            <span className="ml-2 text-xs text-gray-400">{options.repetition_penalty || 1.1}</span>
          </div>
        </div>
        
        <div className="pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleResetDefaults}
            className="w-full"
            disabled={isGenerating}
          >
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
} 