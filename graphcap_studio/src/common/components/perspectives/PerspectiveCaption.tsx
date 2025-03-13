// SPDX-License-Identifier: Apache-2.0
/**
 * Perspective Caption Component
 * 
 * This component allows users to select a perspective and generate captions for images.
 */

import { useState, useCallback } from 'react';
import { useGeneratePerspectiveCaption, usePerspectives } from '@/services/perspectives/hooks';
import { CaptionOptions, CaptionResponse } from '@/services/perspectives/types';
import { Provider } from '@/services/types/providers';

interface PerspectiveCaptionProps {
  readonly imagePath: string;
  readonly provider: Provider;
}

/**
 * Component for generating and displaying perspective captions
 */
export default function PerspectiveCaption({ imagePath, provider }: PerspectiveCaptionProps) {
  const [selectedPerspective, setSelectedPerspective] = useState<string>('');
  const [caption, setCaption] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Fetch available perspectives
  const { data: perspectivesData, isLoading: perspectivesLoading } = usePerspectives();
  
  // Generate caption mutation
  const generateCaption = useGeneratePerspectiveCaption();
  
  // Handle perspective selection
  const handlePerspectiveChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPerspective(e.target.value);
    setCaption(null);
    setError(null);
  }, []);
  
  // Handle caption generation
  const handleGenerateCaption = useCallback(async () => {
    if (!selectedPerspective || !imagePath) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Define caption options
      const options: CaptionOptions = {
        temperature: 0.7,
        max_tokens: 4096
      };
      
      const result = await generateCaption.mutateAsync({
        imagePath,
        perspective: selectedPerspective,
        provider: provider.name,
        options
      });
      
      setCaption(result.result);
    } catch (err) {
      console.error('Error generating caption:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate caption');
    } finally {
      setLoading(false);
    }
  }, [imagePath, selectedPerspective, provider.name, generateCaption]);
  
  // Render caption content
  const renderCaptionContent = useCallback(() => {
    if (!caption) return null;
    
    return (
      <div className="mt-4 p-3 bg-gray-800 rounded text-sm">
        {Object.entries(caption).map(([key, value]) => (
          <div key={key} className="mb-2">
            <h4 className="text-xs font-medium text-gray-400 mb-1">{key}</h4>
            <p className="whitespace-pre-wrap">{typeof value === 'string' ? value : JSON.stringify(value, null, 2)}</p>
          </div>
        ))}
      </div>
    );
  }, [caption]);
  
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">Generate Perspective Caption</h3>
      
      <div className="flex flex-col space-y-3">
        {/* Perspective selection */}
        <div>
          <label htmlFor="perspective-select" className="block text-xs text-gray-500 mb-1">
            Select Perspective
          </label>
          <select
            id="perspective-select"
            className="w-full bg-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedPerspective}
            onChange={handlePerspectiveChange}
            disabled={perspectivesLoading}
          >
            <option value="">Select a perspective...</option>
            {perspectivesData?.perspectives.map((perspective) => (
              <option key={perspective.name} value={perspective.name}>
                {perspective.display_name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Generate button */}
        <div>
          <button
            className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors duration-150 disabled:bg-gray-600 disabled:cursor-not-allowed"
            onClick={handleGenerateCaption}
            disabled={!selectedPerspective || loading || !imagePath}
          >
            {loading ? 'Generating...' : 'Generate Caption'}
          </button>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="text-red-400 text-xs mt-2">
            {error}
          </div>
        )}
        
        {/* Caption result */}
        {renderCaptionContent()}
      </div>
    </div>
  );
} 