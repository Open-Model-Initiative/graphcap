// SPDX-License-Identifier: Apache-2.0
import { useState } from 'react';
import { Image } from '@/services/images';
import { PerspectiveCard } from './perspectives/PerspectiveCard';
import { PerspectiveContent } from './perspectives/PerspectiveContent';

interface PerspectivesProps {
  image: Image;
}

// Define the perspective types based on GraphCap's perspective library
type PerspectiveType = 
  | 'graph_caption'
  | 'art_critic'
  | 'storytelling'
  | 'poetic_metaphor'
  | 'out_of_frame'
  | 'emotional_sentiment';

// Sample perspective data for demonstration
const SAMPLE_PERSPECTIVES: Record<PerspectiveType, {
  title: string;
  description: string;
  type: string;
  isGenerated: boolean;
  content?: Record<string, any>;
}> = {
  graph_caption: {
    title: 'Graph Caption',
    description: 'Structured analysis with categorized tags and descriptions.',
    type: 'Default perspective',
    isGenerated: true,
    content: {
      subjects: [
        { name: 'Person', description: 'A young woman with long brown hair' },
        { name: 'Background', description: 'Urban setting with buildings' }
      ],
      scene: {
        setting: 'City street',
        time: 'Daytime',
        lighting: 'Natural sunlight'
      },
      tags: ['urban', 'portrait', 'street photography', 'candid']
    }
  },
  art_critic: {
    title: 'Art Critic',
    description: 'Artistic analysis focusing on composition, technique, and aesthetic qualities.',
    type: 'Artistic perspective',
    isGenerated: false
  },
  storytelling: {
    title: 'Storytelling',
    description: 'Narrative analysis building a story from scene setting to climax.',
    type: 'Narrative perspective',
    isGenerated: false
  },
  poetic_metaphor: {
    title: 'Poetic Metaphor',
    description: 'Artistic captioning using figurative language and rich imagery.',
    type: 'Poetic perspective',
    isGenerated: false
  },
  out_of_frame: {
    title: 'Out of Frame',
    description: 'Creative analysis speculating on hidden details beyond the image frame.',
    type: 'Creative perspective',
    isGenerated: false
  },
  emotional_sentiment: {
    title: 'Emotional Sentiment',
    description: 'Captioning focused on the emotional tone conveyed by the image.',
    type: 'Emotional perspective',
    isGenerated: false
  }
};

/**
 * Component for displaying and managing image perspectives from GraphCap
 */
export function Perspectives({ image }: PerspectivesProps) {
  const [activePerspective, setActivePerspective] = useState<PerspectiveType>('graph_caption');
  const [generatedPerspectives, setGeneratedPerspectives] = useState<PerspectiveType[]>(['graph_caption']);
  
  // Handler for generating a perspective
  const handleGenerate = (perspectiveType: PerspectiveType) => {
    // In a real implementation, this would call an API to generate the perspective
    console.log(`Generating perspective: ${perspectiveType}`);
    
    // For demo purposes, just mark it as generated
    if (!generatedPerspectives.includes(perspectiveType)) {
      setGeneratedPerspectives([...generatedPerspectives, perspectiveType]);
    }
  };
  
  // Handler for setting a perspective as active
  const handleSetActive = (perspectiveType: PerspectiveType) => {
    setActivePerspective(perspectiveType);
  };
  
  // Handler for generating all perspectives
  const handleGenerateAll = () => {
    // In a real implementation, this would call an API to generate all perspectives
    console.log('Generating all perspectives');
    
    // For demo purposes, mark all as generated
    setGeneratedPerspectives(Object.keys(SAMPLE_PERSPECTIVES) as PerspectiveType[]);
  };

  return (
    <div className="rounded-lg bg-gray-800 p-4 shadow-sm border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-200">Perspectives</h3>
        <button 
          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          onClick={handleGenerateAll}
        >
          Generate All
        </button>
      </div>
      
      <div className="space-y-4">
        {Object.entries(SAMPLE_PERSPECTIVES).map(([key, perspective]) => {
          const perspectiveType = key as PerspectiveType;
          const isGenerated = generatedPerspectives.includes(perspectiveType);
          const isActive = activePerspective === perspectiveType;
          
          return (
            <PerspectiveCard
              key={key}
              title={perspective.title}
              description={perspective.description}
              type={perspective.type}
              isActive={isActive}
              isGenerated={isGenerated}
              onGenerate={() => handleGenerate(perspectiveType)}
              onSetActive={() => handleSetActive(perspectiveType)}
            >
              {isGenerated && perspective.content && (
                <PerspectiveContent 
                  content={perspective.content} 
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