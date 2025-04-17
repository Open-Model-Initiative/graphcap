import React from "react";
// SPDX-License-Identifier: Apache-2.0
import { vi } from "vitest";

/**
 * Sets up common mocks needed for carousel tests
 * Includes mocks for ResizeObserver and Element.scrollTo
 */
export function setupCarouselTestEnvironment(): void {
  // Create a mock implementation of ResizeObserver
  class ResizeObserverMock {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }

  // Assign the mock to the global object
  global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

  // Mock Element.scrollTo using vi.fn()
  const scrollToMock = vi.fn();
  Element.prototype.scrollTo = scrollToMock as unknown as typeof Element.prototype.scrollTo;
}

/**
 * Mock image object structure
 */
export interface MockImage {
  path: string;
  name: string;
  directory: string;
  url: string;
}

/**
 * Create sample test images for carousel tests
 */
export function createMockImages(count = 3): MockImage[] {
  return Array.from({ length: count }, (_, i) => ({
    path: `/images/image${i + 1}.jpg`,
    name: `Image ${i + 1}`,
    directory: "test",
    url: "test-url",
  }));
}

/**
 * Setup component mocks for carousel tests
 * Note: This setup must be called at the top level of the test file
 * before any variables are declared, as vi.mock is hoisted
 */
export const mockComponents = {
  setupImageComponents: () => {
    vi.mock("@/common/components/responsive-image", () => ({
      ResponsiveImage: ({
        alt,
        imagePath,
        onError,
      }: { alt: string; imagePath: string; onError?: () => void }) => {
        const imgProps = {
          src: imagePath,
          alt,
          "data-testid": "responsive-image",
          onError,
        };
        return { type: "img", props: imgProps };
      },
      ThumbnailImage: ({
        alt,
        imagePath,
        isSelected,
        onClick,
      }: {
        alt: string;
        imagePath: string;
        isSelected: boolean;
        onClick: () => void;
      }) => {
        const btnProps = {
          type: "button",
          "data-testid": "thumbnail-image",
          "data-selected": String(isSelected),
          onClick,
          onKeyDown: (e: { key: string }) => {
            if (e.key === "Enter" || e.key === " ") {
              onClick();
            }
          },
          children: { type: "img", props: { src: imagePath, alt } },
        };
        return { type: "button", props: btnProps };
      },
    }));
  },

  setupUploadDropzone: () => {
    vi.mock("@/common/components/image-uploader", () => ({
      UploadDropzone: ({
        datasetName,
        compact,
      }: { datasetName: string; compact?: boolean }) => {
        const divProps = {
          "data-testid": "upload-dropzone",
          "data-dataset": datasetName,
          "data-compact": String(!!compact),
          children: "Upload Dropzone",
        };
        return { type: "div", props: divProps };
      },
    }));
  },

  setupImageCarouselContext: (contextPath: string) => {
    vi.mock(contextPath, () => ({
      ImageCarouselProvider: ({ children }: { children: React.ReactNode }) => ({ 
        type: React.Fragment, 
        props: { children } 
      }),
      useImageCarouselContext: () => ({ datasetName: "test-dataset" }),
    }));
  },
}; 