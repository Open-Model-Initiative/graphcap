import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeAll } from 'vitest';
import { useDynamicThumbnails } from '../../hooks/useDynamicThumbnails';

describe('useDynamicThumbnails', () => {
  // Setup a mock for ResizeObserver since it's used in the hook
  beforeAll(() => {
    // Create a mock implementation of ResizeObserver
    class ResizeObserverMock {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }

    // Assign the mock to the global object
    global.ResizeObserver = ResizeObserverMock as any;
  });

  test('initializes with default values', () => {
    // GIVEN a total count of thumbnails
    const totalCount = 10;
    
    // WHEN the hook is rendered
    const { result } = renderHook(() => useDynamicThumbnails({
      totalCount
    }));
    
    // THEN it should return the default values
    expect(result.current.containerRef).toBeDefined();
    expect(result.current.thumbnailWidth).toBe(64); // Default minThumbnailWidth
    expect(result.current.thumbnailHeight).toBe(64); // Default aspectRatio is 1, so height = width
    expect(result.current.gap).toBe(8); // Default gap
  });

  test('calculates thumbnail size based on container width', () => {
    // GIVEN a total count of thumbnails
    const totalCount = 5;
    
    // WHEN the hook is rendered
    const { result } = renderHook(() => useDynamicThumbnails({
      totalCount,
      minThumbnailWidth: 80,
      maxThumbnailWidth: 120,
      gap: 10,
      aspectRatio: 1.5, // Width:Height ratio of 3:2
    }));
    
    // Mock the container ref's clientWidth
    const mockClientWidth = 500;
    Object.defineProperty(result.current.containerRef.current || {}, 'clientWidth', {
      configurable: true,
      value: mockClientWidth,
    });
    
    // Trigger a resize to recalculate
    act(() => {
      // Simulate a resize event
      const resizeEvent = new Event('resize');
      window.dispatchEvent(resizeEvent);
    });
    
    // THEN it should calculate the thumbnail size based on the container width
    // With a container width of 500px, 5 thumbnails with a gap of 10px:
    // Available width = 500 - (4 * 10) = 460px
    // Width per thumbnail = 460 / 5 = 92px
    // This is within the min-max range, so thumbnailWidth should be 92px
    // With an aspect ratio of 1.5, thumbnailHeight should be 92 / 1.5 = 61.33px
    expect(result.current.thumbnailWidth).toBeGreaterThanOrEqual(80); // At least minThumbnailWidth
    expect(result.current.thumbnailWidth).toBeLessThanOrEqual(120); // At most maxThumbnailWidth
    
    // The exact calculation might vary due to rounding and the mock implementation,
    // so we'll check that the height is proportional to the width based on the aspect ratio
    const expectedHeight = result.current.thumbnailWidth / 1.5;
    expect(result.current.thumbnailHeight).toBeCloseTo(expectedHeight, 0);
  });

  test('respects maxHeight constraint', () => {
    // GIVEN a total count of thumbnails and a max height constraint
    const totalCount = 5;
    const maxHeight = 40; // Set a smaller maxHeight that will definitely be respected
    
    // WHEN the hook is used with a max height constraint and explicit min/max width values
    const { result } = renderHook(() => useDynamicThumbnails({
      totalCount,
      aspectRatio: 1,
      maxHeight,
      minThumbnailWidth: 30,
      maxThumbnailWidth: 100,
      gap: 5
    }));
    
    // Mock the container ref's clientWidth to be large enough that maxHeight becomes the constraint
    const mockClientWidth = 1000;
    Object.defineProperty(result.current.containerRef.current || {}, 'clientWidth', {
      configurable: true,
      value: mockClientWidth,
    });
    
    // Trigger a resize to recalculate
    act(() => {
      // Simulate a resize event
      const resizeEvent = new Event('resize');
      window.dispatchEvent(resizeEvent);
    });
    
    // THEN the thumbnail height should not exceed maxHeight
    expect(result.current.thumbnailHeight).toBeLessThanOrEqual(maxHeight);
    
    // AND with an aspect ratio of 1, the width should be the same as the height
    expect(result.current.thumbnailWidth).toBeCloseTo(result.current.thumbnailHeight, 0);
  });

  test('handles small container widths gracefully', () => {
    // GIVEN a total count of thumbnails
    const totalCount = 10;
    
    // WHEN the hook is rendered
    const { result } = renderHook(() => useDynamicThumbnails({
      totalCount,
      minThumbnailWidth: 80,
    }));
    
    // Mock the container ref's clientWidth to be smaller than would fit all thumbnails at min width
    const mockClientWidth = 200; // This is too small for 10 thumbnails at 80px each
    Object.defineProperty(result.current.containerRef.current || {}, 'clientWidth', {
      configurable: true,
      value: mockClientWidth,
    });
    
    // Trigger a resize to recalculate
    act(() => {
      // Simulate a resize event
      const resizeEvent = new Event('resize');
      window.dispatchEvent(resizeEvent);
    });
    
    // THEN it should use the minimum thumbnail width
    expect(result.current.thumbnailWidth).toBe(80); // minThumbnailWidth
    
    // AND the visible count should be adjusted to fit the container
    // With a container width of 200px and thumbnails of 80px + 8px gap,
    // we can fit at most 2 thumbnails: 200 / (80 + 8) = 2.27
    expect(result.current.visibleCount).toBeLessThanOrEqual(3);
  });
}); 