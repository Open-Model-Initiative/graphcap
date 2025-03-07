// SPDX-License-Identifier: Apache-2.0
import { ReactNode } from 'react';

export interface PerspectiveContentProps {
  readonly content: Record<string, any>;
  readonly type: string;
  readonly children?: ReactNode;
}

/**
 * Component for displaying the content of a generated perspective
 * Renders different content based on the perspective type
 */
export function PerspectiveContent({ content, type, children }: PerspectiveContentProps) {
  // If there's custom content provided, render that instead
  if (children) {
    return <>{children}</>;
  }

  // Render different content based on perspective type
  switch (type) {
    case 'graph_caption':
      return <GraphCaptionContent content={content} />;
    case 'art_critic':
      return <ArtCriticContent content={content} />;
    case 'storytelling':
      return <StorytellingContent content={content} />;
    case 'poetic_metaphor':
      return <PoeticContent content={content} />;
    case 'emotional_sentiment':
      return <EmotionalContent content={content} />;
    case 'out_of_frame':
      return <OutOfFrameContent content={content} />;
    default:
      return <DefaultContent content={content} />;
  }
}

// Default content display for any perspective
function DefaultContent({ content }: { readonly content: Record<string, any> }) {
  return (
    <div className="space-y-2">
      {Object.entries(content).map(([key, value]) => (
        <div key={key}>
          <h5 className="text-xs font-medium text-gray-300 mb-1 capitalize">{key.replace(/_/g, ' ')}</h5>
          <p className="text-sm text-gray-400 whitespace-pre-wrap">
            {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
          </p>
        </div>
      ))}
    </div>
  );
}

// Graph Caption specific content
function GraphCaptionContent({ content }: { readonly content: Record<string, any> }) {
  const { subjects = [], scene = {}, attributes = {}, tags = [] } = content;

  return (
    <div className="space-y-4">
      {/* Tags */}
      {tags && tags.length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Tags</h5>
          <div className="flex flex-wrap gap-1">
            {tags.map((tag: string, index: number) => (
              <span 
                key={`tag-${tag}-${index}`} 
                className="inline-flex items-center rounded-full bg-blue-900/50 px-2 py-0.5 text-xs font-medium text-blue-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Subjects */}
      {subjects && subjects.length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Subjects</h5>
          <div className="space-y-2">
            {subjects.map((subject: any, index: number) => (
              <div key={`subject-${subject.name || index}-${index}`} className="p-2 bg-gray-700/50 rounded">
                <p className="text-sm text-gray-200">{subject.name || 'Unnamed'}</p>
                {subject.description && (
                  <p className="text-xs text-gray-400 mt-1">{subject.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scene */}
      {scene && Object.keys(scene).length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Scene</h5>
          <div className="p-2 bg-gray-700/50 rounded">
            {scene.setting && (
              <div className="mb-1">
                <span className="text-xs text-gray-400">Setting: </span>
                <span className="text-sm text-gray-200">{scene.setting}</span>
              </div>
            )}
            {scene.time && (
              <div className="mb-1">
                <span className="text-xs text-gray-400">Time: </span>
                <span className="text-sm text-gray-200">{scene.time}</span>
              </div>
            )}
            {scene.lighting && (
              <div>
                <span className="text-xs text-gray-400">Lighting: </span>
                <span className="text-sm text-gray-200">{scene.lighting}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Art Critic specific content
function ArtCriticContent({ content }: { readonly content: Record<string, any> }) {
  const { 
    artistic_style = '', 
    composition = '', 
    color_palette = '', 
    technique = '',
    emotional_impact = '',
    interpretation = ''
  } = content;

  return (
    <div className="space-y-3">
      {artistic_style && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Artistic Style</h5>
          <p className="text-sm text-gray-400">{artistic_style}</p>
        </div>
      )}
      
      {composition && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Composition</h5>
          <p className="text-sm text-gray-400">{composition}</p>
        </div>
      )}
      
      {color_palette && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Color Palette</h5>
          <p className="text-sm text-gray-400">{color_palette}</p>
        </div>
      )}
      
      {technique && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Technique</h5>
          <p className="text-sm text-gray-400">{technique}</p>
        </div>
      )}
      
      {emotional_impact && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Emotional Impact</h5>
          <p className="text-sm text-gray-400">{emotional_impact}</p>
        </div>
      )}
      
      {interpretation && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Interpretation</h5>
          <p className="text-sm text-gray-400">{interpretation}</p>
        </div>
      )}
    </div>
  );
}

// Storytelling specific content
function StorytellingContent({ content }: { readonly content: Record<string, any> }) {
  const { 
    setting = '', 
    characters = [], 
    plot = '', 
    conflict = '',
    resolution = '',
    theme = ''
  } = content;

  return (
    <div className="space-y-3">
      {setting && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Setting</h5>
          <p className="text-sm text-gray-400">{setting}</p>
        </div>
      )}
      
      {characters && characters.length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Characters</h5>
          <div className="space-y-1">
            {characters.map((character: any, index: number) => (
              <div key={`character-${character.name || index}-${index}`} className="p-1.5 bg-gray-700/50 rounded">
                <p className="text-sm text-gray-200">{character.name || 'Character ' + (index + 1)}</p>
                {character.description && (
                  <p className="text-xs text-gray-400">{character.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {plot && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Plot</h5>
          <p className="text-sm text-gray-400">{plot}</p>
        </div>
      )}
      
      {conflict && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Conflict</h5>
          <p className="text-sm text-gray-400">{conflict}</p>
        </div>
      )}
      
      {resolution && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Resolution</h5>
          <p className="text-sm text-gray-400">{resolution}</p>
        </div>
      )}
      
      {theme && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Theme</h5>
          <p className="text-sm text-gray-400">{theme}</p>
        </div>
      )}
    </div>
  );
}

// Poetic Metaphor specific content
function PoeticContent({ content }: { readonly content: Record<string, any> }) {
  const { 
    metaphor = '', 
    imagery = '', 
    symbolism = [], 
    theme = '',
    mood = '',
    verse = ''
  } = content;

  return (
    <div className="space-y-3">
      {metaphor && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Metaphor</h5>
          <p className="text-sm text-gray-400">{metaphor}</p>
        </div>
      )}
      
      {imagery && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Imagery</h5>
          <p className="text-sm text-gray-400">{imagery}</p>
        </div>
      )}
      
      {symbolism && symbolism.length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Symbolism</h5>
          <div className="flex flex-wrap gap-1">
            {symbolism.map((symbol: string, index: number) => (
              <span 
                key={`symbol-${symbol}-${index}`} 
                className="inline-flex items-center rounded-full bg-purple-900/50 px-2 py-0.5 text-xs font-medium text-purple-200"
              >
                {symbol}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {theme && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Theme</h5>
          <p className="text-sm text-gray-400">{theme}</p>
        </div>
      )}
      
      {mood && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Mood</h5>
          <p className="text-sm text-gray-400">{mood}</p>
        </div>
      )}
      
      {verse && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Verse</h5>
          <p className="text-sm text-gray-400 italic whitespace-pre-wrap">{verse}</p>
        </div>
      )}
    </div>
  );
}

// Emotional Sentiment specific content
function EmotionalContent({ content }: { readonly content: Record<string, any> }) {
  const { 
    primary_emotion = '', 
    secondary_emotions = [], 
    emotional_triggers = [], 
    intensity = '',
    emotional_arc = '',
    viewer_response = ''
  } = content;

  return (
    <div className="space-y-3">
      {primary_emotion && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Primary Emotion</h5>
          <p className="text-sm text-gray-400">{primary_emotion}</p>
        </div>
      )}
      
      {secondary_emotions && secondary_emotions.length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Secondary Emotions</h5>
          <div className="flex flex-wrap gap-1">
            {secondary_emotions.map((emotion: string, index: number) => (
              <span 
                key={`emotion-${emotion}-${index}`} 
                className="inline-flex items-center rounded-full bg-red-900/50 px-2 py-0.5 text-xs font-medium text-red-200"
              >
                {emotion}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {emotional_triggers && emotional_triggers.length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Emotional Triggers</h5>
          <div className="space-y-1">
            {emotional_triggers.map((trigger: string, index: number) => (
              <div key={`trigger-${trigger}-${index}`} className="p-1.5 bg-gray-700/50 rounded">
                <p className="text-sm text-gray-400">{trigger}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {intensity && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Intensity</h5>
          <p className="text-sm text-gray-400">{intensity}</p>
        </div>
      )}
      
      {emotional_arc && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Emotional Arc</h5>
          <p className="text-sm text-gray-400">{emotional_arc}</p>
        </div>
      )}
      
      {viewer_response && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Viewer Response</h5>
          <p className="text-sm text-gray-400">{viewer_response}</p>
        </div>
      )}
    </div>
  );
}

// Out of Frame specific content
function OutOfFrameContent({ content }: { readonly content: Record<string, any> }) {
  const { 
    beyond_frame = '', 
    hidden_elements = [], 
    implied_narrative = '', 
    spatial_context = '',
    temporal_context = '',
    sensory_details = ''
  } = content;

  return (
    <div className="space-y-3">
      {beyond_frame && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Beyond the Frame</h5>
          <p className="text-sm text-gray-400">{beyond_frame}</p>
        </div>
      )}
      
      {hidden_elements && hidden_elements.length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Hidden Elements</h5>
          <div className="space-y-1">
            {hidden_elements.map((element: string, index: number) => (
              <div key={`element-${element}-${index}`} className="p-1.5 bg-gray-700/50 rounded">
                <p className="text-sm text-gray-400">{element}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {implied_narrative && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Implied Narrative</h5>
          <p className="text-sm text-gray-400">{implied_narrative}</p>
        </div>
      )}
      
      {spatial_context && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Spatial Context</h5>
          <p className="text-sm text-gray-400">{spatial_context}</p>
        </div>
      )}
      
      {temporal_context && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Temporal Context</h5>
          <p className="text-sm text-gray-400">{temporal_context}</p>
        </div>
      )}
      
      {sensory_details && (
        <div>
          <h5 className="text-xs font-medium text-gray-300 mb-1">Sensory Details</h5>
          <p className="text-sm text-gray-400">{sensory_details}</p>
        </div>
      )}
    </div>
  );
} 