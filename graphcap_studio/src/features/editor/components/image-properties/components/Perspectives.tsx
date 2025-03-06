// SPDX-License-Identifier: Apache-2.0
import { Image } from '@/services/images';
import { PerspectiveCard } from './perspectives/PerspectiveCard';
import { PerspectiveContent } from './perspectives/PerspectiveContent';
import { usePerspectives, PerspectiveType } from '../hooks/usePerspectives';

interface PerspectivesProps {
  image: Image;
}

// Perspective display information
const PERSPECTIVE_INFO: Record<string, { title: string; description: string; type: string }> = {
  graph_caption: {
    title: 'Graph Caption',
    description: 'Structured analysis with categorized tags and descriptions.',
    type: 'Default perspective'
  },
  art_critic: {
    title: 'Art Critic',
    description: 'Artistic analysis focusing on composition, technique, and aesthetic qualities.',
    type: 'Artistic perspective'
  },
  storytelling: {
    title: 'Storytelling',
    description: 'Narrative analysis building a story from scene setting to climax.',
    type: 'Narrative perspective'
  },
  poetic_metaphor: {
    title: 'Poetic Metaphor',
    description: 'Artistic captioning using figurative language and rich imagery.',
    type: 'Poetic perspective'
  },
  out_of_frame: {
    title: 'Out of Frame',
    description: 'Creative analysis speculating on hidden details beyond the image frame.',
    type: 'Creative perspective'
  },
  emotional_sentiment: {
    title: 'Emotional Sentiment',
    description: 'Captioning focused on the emotional tone conveyed by the image.',
    type: 'Emotional perspective'
  },
  synthesized_caption: {
    title: 'Synthesized Caption',
    description: 'Combined analysis from multiple perspectives.',
    type: 'Synthesized perspective'
  }
};

/**
 * Component for displaying and managing image perspectives from GraphCap
 */
export function Perspectives({ image }: PerspectivesProps) {
  const {
    isLoading,
    error,
    captions,
    activePerspective,
    generatedPerspectives,
    setActivePerspective,
    generatePerspective,
    generateAllPerspectives
  } = usePerspectives(image);

  // All available perspective types
  const allPerspectiveTypes: PerspectiveType[] = [
    'graph_caption',
    'art_critic',
    'storytelling',
    'poetic_metaphor',
    'out_of_frame',
    'emotional_sentiment',
    'synthesized_caption'
  ];

  return (
    <div className="rounded-lg bg-gray-800 p-4 shadow-sm border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-200">Perspectives</h3>
        <div className="flex items-center space-x-2">
          {isLoading && (
            <span className="text-xs text-gray-400">Loading...</span>
          )}
          <button 
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            onClick={generateAllPerspectives}
            disabled={isLoading}
          >
            Generate All
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-md text-red-200 text-sm">
          {error}
        </div>
      )}
      
      {captions?.metadata && captions.metadata.captioned_at && (
        <div className="mb-4 p-2 bg-gray-700/50 rounded-md">
          <div className="text-xs text-gray-400 flex flex-wrap gap-x-4">
            <span>Generated: {formatDate(captions.metadata.captioned_at)}</span>
            {captions.metadata.model && (
              <span>Model: {captions.metadata.model}</span>
            )}
            {captions.metadata.provider && (
              <span>Provider: {captions.metadata.provider}</span>
            )}
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {allPerspectiveTypes.map((perspectiveType) => {
          const info = PERSPECTIVE_INFO[perspectiveType];
          const isGenerated = generatedPerspectives.includes(perspectiveType);
          const isActive = activePerspective === perspectiveType;
          const perspectiveData = captions?.perspectives[perspectiveType];
          
          return (
            <PerspectiveCard
              key={perspectiveType}
              title={info.title}
              description={info.description}
              type={info.type}
              isActive={isActive}
              isGenerated={isGenerated}
              onGenerate={() => generatePerspective(perspectiveType)}
              onSetActive={() => setActivePerspective(perspectiveType)}
            >
              {isGenerated && perspectiveData && (
                <PerspectiveContent 
                  content={perspectiveData.content} 
                  type={perspectiveType} 
                />
              )}
            </PerspectiveCard>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Format a date string from the format YYYYMMDD_HHMMSS to a more readable format
 */
function formatDate(dateString: string): string {
  // Check if the date is in the expected format
  const match = dateString.match(/^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})$/);
  if (!match) return dateString;
  
  const [, year, month, day, hour, minute, second] = match;
  
  // Create a date object
  const date = new Date(
    parseInt(year),
    parseInt(month) - 1, // Month is 0-indexed in JavaScript
    parseInt(day),
    parseInt(hour),
    parseInt(minute),
    parseInt(second)
  );
  
  // Format the date
  return date.toLocaleString();
} 