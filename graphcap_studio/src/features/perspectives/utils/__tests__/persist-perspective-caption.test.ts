// SPDX-License-Identifier: Apache-2.0
/**
 * Unit tests for perspective caption persistence utilities
 */

import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { PerspectiveData } from "../../types";
import {
	clearAllPerspectiveCaptions,
	deletePerspectiveCaption,
	generateCaptionKey,
	getAllPerspectiveCaptions,
	loadPerspectiveCaption,
	savePerspectiveCaption,
} from "../persist-perspective-caption";

// Mock localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value;
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		},
		key: (index: number) => Object.keys(store)[index] || null,
		get length() {
			return Object.keys(store).length;
		},
	};
})();

// Mock PerspectiveData object for testing
const mockPerspectiveData: PerspectiveData = {
	config_name: "test-perspective",
	version: "1.0",
	model: "test-model",
	provider: "test-provider",
	content: { text: "This is a test caption" },
	options: { temperature: 0.7 },
};

describe("Perspective Caption Persistence", () => {
	// Save the original localStorage
	const originalLocalStorage = global.localStorage;

	beforeEach(() => {
		// Set up localStorage mock
		Object.defineProperty(global, "localStorage", {
			value: localStorageMock,
			writable: true,
		});

		// Clear mock storage before each test
		localStorageMock.clear();
	});

	afterAll(() => {
		// Restore original localStorage
		Object.defineProperty(global, "localStorage", {
			value: originalLocalStorage,
			writable: true,
		});
	});

	describe("generateCaptionKey", () => {
		it("should generate a key with directory, path, and perspective name", () => {
			const imagePath = "/path/to/image.jpg";
			const perspectiveName = "description";

			const key = generateCaptionKey(imagePath, perspectiveName);

			expect(key).toContain("graphcap:perspective-captions");
			expect(key).toContain("_path_to_");
			expect(key).toContain("_path_to_image.jpg");
			expect(key).toContain("description");
		});

		it("should handle special characters in paths", () => {
			const imagePath = "/path/with?special*chars:and<symbols>.jpg";
			const perspectiveName = "test";

			const key = generateCaptionKey(imagePath, perspectiveName);

			expect(key).not.toContain("?");
			expect(key).not.toContain("*");
			expect(key).not.toContain(":");
			expect(key).not.toContain("<");
		});
	});

	describe("savePerspectiveCaption", () => {
		it("should save a perspective caption to localStorage", () => {
			const imagePath = "/test/image.jpg";
			const perspectiveName = "description";

			savePerspectiveCaption(imagePath, perspectiveName, mockPerspectiveData);

			const key = generateCaptionKey(imagePath, perspectiveName);
			const saved = localStorageMock.getItem(key);

			expect(saved).not.toBeNull();
			expect(JSON.parse(saved!)).toEqual(mockPerspectiveData);
		});
	});

	describe("loadPerspectiveCaption", () => {
		it("should load a saved perspective caption", () => {
			const imagePath = "/test/image.jpg";
			const perspectiveName = "description";

			// Save first
			savePerspectiveCaption(imagePath, perspectiveName, mockPerspectiveData);

			// Then load
			const loadedData = loadPerspectiveCaption(imagePath, perspectiveName);

			expect(loadedData).toEqual(mockPerspectiveData);
		});

		it("should return null for non-existent captions", () => {
			const imagePath = "/test/image.jpg";
			const perspectiveName = "nonexistent";

			const loadedData = loadPerspectiveCaption(imagePath, perspectiveName);

			expect(loadedData).toBeNull();
		});
	});

	describe("deletePerspectiveCaption", () => {
		it("should delete a saved perspective caption", () => {
			const imagePath = "/test/image.jpg";
			const perspectiveName = "description";

			// Save first
			savePerspectiveCaption(imagePath, perspectiveName, mockPerspectiveData);

			// Then delete
			deletePerspectiveCaption(imagePath, perspectiveName);

			// Try to load
			const loadedData = loadPerspectiveCaption(imagePath, perspectiveName);

			expect(loadedData).toBeNull();
		});
	});

	describe("getAllPerspectiveCaptions", () => {
		it("should get all captions for an image", () => {
			const imagePath = "/test/image.jpg";
			const perspectives = ["description", "tags", "metadata"];

			// Save multiple perspectives
			perspectives.forEach((perspective) => {
				savePerspectiveCaption(imagePath, perspective, {
					...mockPerspectiveData,
					config_name: perspective,
				});
			});

			// Save a caption for a different image
			savePerspectiveCaption(
				"/different/image.jpg",
				"description",
				mockPerspectiveData,
			);

			// Get all captions for the first image
			const allCaptions = getAllPerspectiveCaptions(imagePath);

			expect(Object.keys(allCaptions).length).toBe(perspectives.length);
			perspectives.forEach((perspective) => {
				expect(allCaptions[perspective]).toBeDefined();
				expect(allCaptions[perspective].config_name).toBe(perspective);
			});
		});

		it("should return an empty object when no captions exist", () => {
			const imagePath = "/nonexistent/image.jpg";

			const allCaptions = getAllPerspectiveCaptions(imagePath);

			expect(Object.keys(allCaptions).length).toBe(0);
		});
	});

	describe("clearAllPerspectiveCaptions", () => {
		it("should clear all perspective captions", () => {
			const imagePaths = ["/test/image1.jpg", "/test/image2.jpg"];
			const perspectives = ["description", "tags"];

			// Save multiple captions
			imagePaths.forEach((imagePath) => {
				perspectives.forEach((perspective) => {
					savePerspectiveCaption(imagePath, perspective, mockPerspectiveData);
				});
			});

			// Save a different type of data
			localStorage.setItem("other-data", "some value");

			// Clear all captions
			clearAllPerspectiveCaptions();

			// Check that all captions are cleared
			imagePaths.forEach((imagePath) => {
				perspectives.forEach((perspective) => {
					const caption = loadPerspectiveCaption(imagePath, perspective);
					expect(caption).toBeNull();
				});
			});

			// Other data should remain
			expect(localStorage.getItem("other-data")).toBe("some value");
		});
	});
});
