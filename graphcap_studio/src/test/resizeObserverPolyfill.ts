// SPDX-License-Identifier: Apache-2.0
/**
 * A minimal ResizeObserver polyfill for testing
 * 
 * This provides a simple implementation that can be used in tests
 * without having to mock ResizeObserver in every test file.
 */

export class TestResizeObserver {
  private callback: ResizeObserverCallback;
  private elements: Set<Element> = new Set();
  
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  
  observe(target: Element): void {
    this.elements.add(target);
    
    // Call the callback immediately with a simple contentRect
    this.simulateResize(target);
  }
  
  unobserve(target: Element): void {
    this.elements.delete(target);
  }
  
  disconnect(): void {
    this.elements.clear();
  }
  
  /**
   * Simulate a resize event for testing
   */
  simulateResize(target: Element, width = 500, height = 300): void {
    const entry: ResizeObserverEntry = {
      target,
      contentRect: {
        x: 0,
        y: 0,
        width,
        height,
        top: 0,
        right: width,
        bottom: height,
        left: 0,
        toJSON: () => ({})
      },
      borderBoxSize: [{
        blockSize: height,
        inlineSize: width
      }],
      contentBoxSize: [{
        blockSize: height,
        inlineSize: width
      }],
      devicePixelContentBoxSize: [{
        blockSize: height,
        inlineSize: width
      }]
    };
    
    this.callback([entry], this as unknown as ResizeObserver);
  }
  
  /**
   * Simulate a resize event for all observed elements
   */
  simulateResizeAll(width = 500, height = 300): void {
    this.elements.forEach(element => {
      this.simulateResize(element, width, height);
    });
  }
}

/**
 * Install the ResizeObserver polyfill for testing
 */
export function installResizeObserverPolyfill(): () => void {
  const originalResizeObserver = window.ResizeObserver;
  window.ResizeObserver = TestResizeObserver as unknown as typeof ResizeObserver;
  
  // Return a function to restore the original
  return () => {
    window.ResizeObserver = originalResizeObserver;
  };
} 