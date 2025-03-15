import { renderHook } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCarouselControls } from '../../hooks/useCarouselControls';

describe('useCarouselControls', () => {
  // Setup and teardown
  let addEventListenerSpy: any;
  let removeEventListenerSpy: any;
  
  beforeEach(() => {
    // Spy on addEventListener and removeEventListener
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });
  
  afterEach(() => {
    // Restore the original methods
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
  
  test('adds event listener when enabled', () => {
    // GIVEN a navigateByDelta function
    const navigateByDelta = vi.fn();
    
    // WHEN the hook is rendered with enabled=true
    renderHook(() => useCarouselControls({
      navigateByDelta,
      enabled: true
    }));
    
    // THEN it should add an event listener for keydown
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
  
  test('does not add event listener when disabled', () => {
    // GIVEN a navigateByDelta function
    const navigateByDelta = vi.fn();
    
    // WHEN the hook is rendered with enabled=false
    renderHook(() => useCarouselControls({
      navigateByDelta,
      enabled: false
    }));
    
    // THEN it should not add an event listener for keydown
    expect(addEventListenerSpy).not.toHaveBeenCalledWith('keydown', expect.any(Function));
  });
  
  test('removes event listener on unmount', () => {
    // GIVEN a navigateByDelta function
    const navigateByDelta = vi.fn();
    
    // WHEN the hook is rendered and then unmounted
    const { unmount } = renderHook(() => useCarouselControls({
      navigateByDelta,
      enabled: true
    }));
    
    unmount();
    
    // THEN it should remove the event listener
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
  
  test('calls navigateByDelta(-1) when left arrow key is pressed', () => {
    // GIVEN a navigateByDelta function
    const navigateByDelta = vi.fn();
    
    // WHEN the hook is rendered
    renderHook(() => useCarouselControls({
      navigateByDelta,
      enabled: true
    }));
    
    // AND the left arrow key is pressed
    const keydownEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    window.dispatchEvent(keydownEvent);
    
    // THEN it should call navigateByDelta with -1
    expect(navigateByDelta).toHaveBeenCalledWith(-1);
  });
  
  test('calls navigateByDelta(1) when right arrow key is pressed', () => {
    // GIVEN a navigateByDelta function
    const navigateByDelta = vi.fn();
    
    // WHEN the hook is rendered
    renderHook(() => useCarouselControls({
      navigateByDelta,
      enabled: true
    }));
    
    // AND the right arrow key is pressed
    const keydownEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    window.dispatchEvent(keydownEvent);
    
    // THEN it should call navigateByDelta with 1
    expect(navigateByDelta).toHaveBeenCalledWith(1);
  });
  
  test('calls navigateByDelta(-1) when up arrow key is pressed', () => {
    // GIVEN a navigateByDelta function
    const navigateByDelta = vi.fn();
    
    // WHEN the hook is rendered
    renderHook(() => useCarouselControls({
      navigateByDelta,
      enabled: true
    }));
    
    // AND the up arrow key is pressed
    const keydownEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    window.dispatchEvent(keydownEvent);
    
    // THEN it should call navigateByDelta with -1
    expect(navigateByDelta).toHaveBeenCalledWith(-1);
  });
  
  test('calls navigateByDelta(1) when down arrow key is pressed', () => {
    // GIVEN a navigateByDelta function
    const navigateByDelta = vi.fn();
    
    // WHEN the hook is rendered
    renderHook(() => useCarouselControls({
      navigateByDelta,
      enabled: true
    }));
    
    // AND the down arrow key is pressed
    const keydownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    window.dispatchEvent(keydownEvent);
    
    // THEN it should call navigateByDelta with 1
    expect(navigateByDelta).toHaveBeenCalledWith(1);
  });
}); 