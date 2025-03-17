// SPDX-License-Identifier: Apache-2.0
import { vi } from "vitest";

// Mock for the images service
export const imageServiceMock = {
	preloadImage: vi.fn(),
	getImageUrl: vi.fn((path) => path),
	getThumbnailUrl: vi.fn((path) => path),
	listImages: vi.fn(),
	listDatasetImages: vi.fn(),
	processImage: vi.fn(),
	createDataset: vi.fn(),
	uploadImage: vi.fn(),
	addImageToDataset: vi.fn(),
};

// Export a type that matches the Image type from the real service
export interface MockImage {
	path: string;
	name: string;
	directory: string;
	url: string;
}
