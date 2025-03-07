// SPDX-License-Identifier: Apache-2.0
import { renderHook, act } from '@testing-library/react';
import { useLayoutHeight } from './useLayoutHeight';

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('useLayoutHeight', () => {
  // Mock element dimensions
  const mockClientHeight = (element: HTMLElement | null, height: number) => {
    if (element) {
      Object.defineProperty(element, 'clientHeight', {
        configurable: true,
        value: height
      });
    }
  };

  it('should calculate content height correctly', () => {
    // Render the hook
    const { result } = renderHook(() => useLayoutHeight());
    
    // Mock the ref elements
    const containerElement = document.createElement('div');
    const headerElement = document.createElement('div');
    const footerElement = document.createElement('div');
    
    // Set mock heights
    mockClientHeight(containerElement, 1000);
    mockClientHeight(headerElement, 40);
    mockClientHeight(footerElement, 32);
    
    // Assign elements to refs
    Object.defineProperty(result.current.containerRef, 'current', {
      configurable: true,
      value: containerElement
    });
    
    Object.defineProperty(result.current.headerRef, 'current', {
      configurable: true,
      value: headerElement
    });
    
    Object.defineProperty(result.current.footerRef, 'current', {
      configurable: true,
      value: footerElement
    });
    
    // Trigger resize event to recalculate
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    // Expected content height: container - header - footer
    expect(result.current.contentHeight).toBe(928); // 1000 - 40 - 32
  });

  it('should update content height on resize', () => {
    // Render the hook
    const { result } = renderHook(() => useLayoutHeight());
    
    // Mock the ref elements
    const containerElement = document.createElement('div');
    const headerElement = document.createElement('div');
    const footerElement = document.createElement('div');
    
    // Set initial mock heights
    mockClientHeight(containerElement, 1000);
    mockClientHeight(headerElement, 40);
    mockClientHeight(footerElement, 32);
    
    // Assign elements to refs
    Object.defineProperty(result.current.containerRef, 'current', {
      configurable: true,
      value: containerElement
    });
    
    Object.defineProperty(result.current.headerRef, 'current', {
      configurable: true,
      value: headerElement
    });
    
    Object.defineProperty(result.current.footerRef, 'current', {
      configurable: true,
      value: footerElement
    });
    
    // Trigger initial resize event
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    // Check initial calculation
    expect(result.current.contentHeight).toBe(928); // 1000 - 40 - 32
    
    // Change container height to simulate resize
    mockClientHeight(containerElement, 800);
    
    // Trigger resize event
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    // Check updated calculation
    expect(result.current.contentHeight).toBe(728); // 800 - 40 - 32
  });
}); 