// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { LazyImage } from '../LazyImage';
import { mockImages } from './setup';

// Create a mock ImageComponent for testing
const MockImageComponent = vi.fn(({ 
  imagePath, 
  alt, 
  className, 
  onLoad, 
  onError 
}: { 
  imagePath: string; 
  alt?: string; 
  className?: string; 
  onLoad?: () => void; 
  onError?: (error: Error) => void;
}) => (
  <div data-testid="mock-image-component">
    <img 
      src={imagePath} 
      alt={alt ?? ''} 
      className={className}
      data-testid="custom-image"
      onLoad={onLoad}
      onError={() => onError && onError(new Error('Image load error'))}
    />
  </div>
));

describe('LazyImage', () => {
  test('renders with default img element when no ImageComponent is provided', () => {
    // GIVEN a LazyImage with no custom ImageComponent
    render(
      <LazyImage
        image={mockImages[0]}
        isSelected={false}
        onSelect={vi.fn()}
      />
    );
    
    // THEN it should render a standard img element
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', mockImages[0].path);
    expect(img).toHaveAttribute('alt', mockImages[0].name);
  });

  test('renders with custom ImageComponent when provided', () => {
    // GIVEN a LazyImage with a custom ImageComponent
    render(
      <LazyImage
        image={mockImages[0]}
        isSelected={false}
        onSelect={vi.fn()}
        ImageComponent={MockImageComponent}
      />
    );
    
    // THEN it should render the custom component
    expect(screen.getByTestId('mock-image-component')).toBeInTheDocument();
    expect(screen.getByTestId('custom-image')).toBeInTheDocument();
    
    // AND the MockImageComponent should have been called with the correct props
    expect(MockImageComponent).toHaveBeenCalled();
    const mockCall = MockImageComponent.mock.calls[0][0];
    expect(mockCall.imagePath).toBe(mockImages[0].path);
    expect(mockCall.alt).toBe(mockImages[0].name);
    expect(mockCall.className).toBe('h-full w-full object-cover');
    expect(typeof mockCall.onLoad).toBe('function');
    expect(typeof mockCall.onError).toBe('function');
  });

  test('calls onSelect when clicked', () => {
    // GIVEN a LazyImage with an onSelect handler
    const onSelect = vi.fn();
    render(
      <LazyImage
        image={mockImages[0]}
        isSelected={false}
        onSelect={onSelect}
      />
    );
    
    // WHEN the image is clicked
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // THEN onSelect should be called with the image
    expect(onSelect).toHaveBeenCalledWith(mockImages[0]);
  });

  test('applies selected styling when isSelected is true', () => {
    // GIVEN a LazyImage that is selected
    render(
      <LazyImage
        image={mockImages[0]}
        isSelected={true}
        onSelect={vi.fn()}
      />
    );
    
    // THEN it should have the selected styling
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border-blue-500');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  test('applies non-selected styling when isSelected is false', () => {
    // GIVEN a LazyImage that is not selected
    render(
      <LazyImage
        image={mockImages[0]}
        isSelected={false}
        onSelect={vi.fn()}
      />
    );
    
    // THEN it should have the non-selected styling
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border-transparent');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  test('shows loading state before image is loaded', () => {
    // GIVEN a LazyImage that hasn't loaded yet
    render(
      <LazyImage
        image={mockImages[0]}
        isSelected={false}
        onSelect={vi.fn()}
      />
    );
    
    // THEN it should show a loading indicator
    // The image itself doesn't have opacity-0, but its parent container does
    expect(screen.getByRole('img').parentElement).toHaveClass('opacity-0');
  });

  test('transitions to loaded state when image loads', () => {
    // GIVEN a LazyImage
    render(
      <LazyImage
        image={mockImages[0]}
        isSelected={false}
        onSelect={vi.fn()}
      />
    );
    
    // WHEN the image loads
    const img = screen.getByRole('img');
    fireEvent.load(img);
    
    // THEN it should show the loaded image
    expect(img.parentElement).toHaveClass('opacity-100');
  });

  test('handles image load error', () => {
    // GIVEN a LazyImage
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <LazyImage
        image={mockImages[0]}
        isSelected={false}
        onSelect={vi.fn()}
      />
    );
    
    // WHEN the image fails to load
    const img = screen.getByRole('img');
    fireEvent.error(img);
    
    // THEN it should log an error
    expect(consoleSpy).toHaveBeenCalledWith(
      `Failed to load image: ${mockImages[0].path}`,
      expect.anything()
    );
    
    // AND it should still show the image container (now with loaded state)
    expect(img.parentElement).toHaveClass('opacity-100');
    
    consoleSpy.mockRestore();
  });
}); 