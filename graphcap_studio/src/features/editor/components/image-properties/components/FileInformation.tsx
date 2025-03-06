// SPDX-License-Identifier: Apache-2.0
import { Image } from '@/services/images';

interface FileInformationProps {
  image: Image;
}

/**
 * Component for displaying file information
 */
export function FileInformation({ image }: FileInformationProps) {
  return (
    <div className="rounded-lg bg-gray-800 p-4 shadow-sm border border-gray-700">
      <h3 className="mb-2 font-medium text-gray-200">File Information</h3>
      <div className="space-y-2">
        <div>
          <span className="text-sm font-medium text-gray-400">Filename:</span>
          <p className="text-sm break-all text-gray-200">{image.name}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-400">Path:</span>
          <p className="text-sm break-all text-gray-200">{image.path}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-400">Directory:</span>
          <p className="text-sm break-all text-gray-200">{image.directory}</p>
        </div>
      </div>
    </div>
  );
} 