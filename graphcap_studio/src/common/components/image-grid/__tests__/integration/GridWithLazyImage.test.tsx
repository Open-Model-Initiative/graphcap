// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { GridViewer } from '../../GridViewer';
import { mockImages } from '../setup';

// Don't mock the LazyImage component for integration testing
vi.mock('react-window', () => ({
  FixedSizeGrid: ({ children, columnCount, rowCount, width, height }: any) => {
    const items = [];
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
        items.push(
          children({
            columnIndex,
            rowIndex,
            style: {
              position: 'absolute',
              left: columnIndex * 200,
              top: rowIndex * 200,
              width: 200,
              height: 200,
            },
          })
        );
      }
    }
    return (
      <div data-testid="grid" style={{ width, height }}>
        {items.map((item, index) => (
          <div key={mockImages[index].path}>{item}</div>
        ))}
      </div>
    );
  },
}));

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

describe('GridViewer with LazyImage Integration', () => {
  test('renders grid with LazyImage components using default img elements', () => {
    // GIVEN a GridViewer with images
    render(
      <GridViewer
        images={mockImages.slice(0, 3)}
        onSelectImage={vi.fn()}
        containerWidth={800}
        containerHeight={600}
      />
    );
    
    // THEN it should render the grid
    expect(screen.getByTestId('grid')).toBeInTheDocument();
    
    // AND it should render img elements for each image
    const images = screen.getAllByRole('img');
    expect(images.length).toBe(3);
    
    // AND each img should have the correct src attribute
    images.forEach((img, index) => {
      expect(img).toHaveAttribute('src', mockImages[index].path);
    });
  });

  test('renders grid with LazyImage components using custom ImageComponent', () => {
    // GIVEN a GridViewer with images and a custom ImageComponent
    render(
      <GridViewer
        images={mockImages.slice(0, 3)}
        onSelectImage={vi.fn()}
        containerWidth={800}
        containerHeight={600}
        ImageComponent={MockImageComponent}
      />
    );
    
    // THEN it should render the grid
    expect(screen.getByTestId('grid')).toBeInTheDocument();
    
    // AND it should render the custom image components
    const customImages = screen.getAllByTestId('mock-image-component');
    expect(customImages.length).toBe(3);
    
    // AND the MockImageComponent should have been called with the correct props
    expect(MockImageComponent).toHaveBeenCalledTimes(3);
  });

  test('selects image when clicked', () => {
    // GIVEN a GridViewer with images and an onSelectImage handler
    const onSelectImage = vi.fn();
    render(
      <GridViewer
        images={mockImages.slice(0, 3)}
        onSelectImage={onSelectImage}
        containerWidth={800}
        containerHeight={600}
      />
    );
    
    // WHEN an image is clicked
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]); // Click the second image
    
    // THEN onSelectImage should be called with the clicked image
    expect(onSelectImage).toHaveBeenCalledWith(mockImages[1]);
  });

  test('applies selected styling to the selected image', () => {
    // GIVEN a GridViewer with images and a selected image
    render(
      <GridViewer
        images={mockImages.slice(0, 3)}
        selectedImage={mockImages[1]}
        onSelectImage={vi.fn()}
        containerWidth={800}
        containerHeight={600}
      />
    );
    
    // THEN the selected image should have the selected styling
    const buttons = screen.getAllByRole('button');
    
    // The second button should be selected
    expect(buttons[1]).toHaveClass('border-blue-500');
    expect(buttons[1]).toHaveAttribute('aria-pressed', 'true');
    
    // The other buttons should not be selected
    expect(buttons[0]).toHaveClass('border-transparent');
    expect(buttons[0]).toHaveAttribute('aria-pressed', 'false');
    expect(buttons[2]).toHaveClass('border-transparent');
    expect(buttons[2]).toHaveAttribute('aria-pressed', 'false');
  });
}); 