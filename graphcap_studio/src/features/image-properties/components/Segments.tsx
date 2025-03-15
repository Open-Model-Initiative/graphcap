// SPDX-License-Identifier: Apache-2.0
import { Image } from '@/services/images';
import { FeatureStub } from '@/components/ui/status/FeatureStub';

interface SegmentsProps {
  readonly image: Image;
}

/**
 * Component for displaying and managing image segments
 */
export function Segments({ image }: SegmentsProps) {
  const isUnderConstruction = true;
  return (
    <div className="rounded-lg bg-gray-800 p-4 shadow-sm border border-gray-700">
      {isUnderConstruction ? (
        <FeatureStub 
          featureName="Segments Feature" 
          description="This feature is currently under construction. Please check back later."
        />
      ) : (
        <>
          <h3 className="mb-2 font-medium text-gray-200">Segments</h3>
          <img src={image.url} alt={image.name} className="mb-4 rounded" />
          <div className="space-y-4">
            <div className="p-3 bg-gray-700 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-200">Person</h4>
                <span className="inline-flex items-center rounded-full bg-blue-900/50 px-2 py-0.5 text-xs font-medium text-blue-200">
                  Primary
                </span>
              </div>
              <div className="text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Confidence:</span>
                  <span>98%</span>
                </div>
                <div className="flex justify-between">
                  <span>Bounding Box:</span>
                  <span>x: 120, y: 45, w: 200, h: 350</span>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-gray-700 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-200">Background</h4>
                <span className="inline-flex items-center rounded-full bg-gray-600/50 px-2 py-0.5 text-xs font-medium text-gray-300">
                  Secondary
                </span>
              </div>
              <div className="text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Confidence:</span>
                  <span>100%</span>
                </div>
                <div className="flex justify-between">
                  <span>Bounding Box:</span>
                  <span>Full image</span>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-gray-700 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-200">Object</h4>
                <span className="inline-flex items-center rounded-full bg-gray-600/50 px-2 py-0.5 text-xs font-medium text-gray-300">
                  Secondary
                </span>
              </div>
              <div className="text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Confidence:</span>
                  <span>87%</span>
                </div>
                <div className="flex justify-between">
                  <span>Bounding Box:</span>
                  <span>x: 320, y: 145, w: 100, h: 120</span>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-2 rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Generate Segments
            </button>
          </div>
        </>
      )}
    </div>
  );
} 