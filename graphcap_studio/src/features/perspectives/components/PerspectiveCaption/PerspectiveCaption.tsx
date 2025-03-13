// SPDX-License-Identifier: Apache-2.0
/**
 * PerspectiveCaption Component
 * 
 * This component allows users to select a perspective and generate captions for images.
 * It's been refactored to separate UI from logic using custom hooks.
 */

import { useState } from 'react';
import { useGeneratePerspectiveCaption, usePerspectives } from '@/features/perspectives/services/hooks';
import { Provider } from '@/services/types/providers';
import { PERSPECTIVE_CLASSES } from '../../constants';

export interface PerspectiveCaptionProps {
  readonly imagePath: string;
  readonly provider: Provider;
  readonly className?: string;
}

/**
 * Component for generating and displaying perspective captions
 */
export function PerspectiveCaption({ 
  imagePath, 
  provider,
  className = ''
}: PerspectiveCaptionProps) {
  // State
  const [selectedPerspective, setSelectedPerspective] = useState<string>('');
  const [caption, setCaption] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Data fetching
  const { data: perspectivesData, isLoading: perspectivesLoading } = usePerspectives();
  const generateCaption = useGeneratePerspectiveCaption();
  
  // Event handlers
  const handlePerspectiveChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPerspective(e.target.value);
    setCaption(null);
    setError(null);
  };
  
  const handleGenerateCaption = async () => {
    if (!selectedPerspective || !imagePath) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const options = {
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
  };
  
  return (
    <div className={`mt-4 ${className}`}>
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
            className={`px-3 py-2 text-sm rounded transition-colors duration-150 ${PERSPECTIVE_CLASSES.BUTTON.BASE} ${PERSPECTIVE_CLASSES.BUTTON.PRIMARY} ${
              !selectedPerspective || loading || !imagePath ? PERSPECTIVE_CLASSES.BUTTON.DISABLED : ''
            }`}
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
        {caption && (
          <div className="mt-4 p-3 bg-gray-800 rounded text-sm">
            {Object.entries(caption).map(([key, value]) => (
              <div key={key} className="mb-2">
                <h4 className="text-xs font-medium text-gray-400 mb-1">{key}</h4>
                <p className="whitespace-pre-wrap">{typeof value === 'string' ? value : JSON.stringify(value, null, 2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 