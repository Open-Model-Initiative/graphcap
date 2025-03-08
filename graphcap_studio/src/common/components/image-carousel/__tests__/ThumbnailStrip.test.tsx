import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeAll } from 'vitest';
import '@testing-library/jest-dom';
import { ThumbnailStrip } from '../ThumbnailStrip';
import { Image } from '@/services/images';

// Mock the ThumbnailImage component
vi.mock('@/common/components/responsive-image', () => ({
  ThumbnailImage: ({ alt, imagePath, isSelected, onClick }: { 
    alt: string; 
    imagePath: string; 
    isSelected: boolean; 
    onClick: () => void 
  }) => (
    <button 
      data-testid="thumbnail-image"
      data-selected={isSelected}
      onClick={onClick}
    >
      <img 
        src={imagePath} 
        alt={alt} 
      />
    </button>
  ),
}));

// Sample test images
const mockImages: Partial<Image>[] = [
  { path: '/images/image1.jpg', name: 'Image 1', directory: 'test', url: 'test-url' },
  { path: '/images/image2.jpg', name: 'Image 2', directory: 'test', url: 'test-url' },
  { path: '/images/image3.jpg', name: 'Image 3', directory: 'test', url: 'test-url' },
];

describe('ThumbnailStrip', () => {
  // Setup a mock for ResizeObserver since it's used in the component's hooks
  beforeAll(() => {
    // Create a mock implementation of ResizeObserver
    class ResizeObserverMock {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }

    // Assign the mock to the global object
    global.ResizeObserver = ResizeObserverMock as any;
    
    // Mock Element.scrollTo
    Element.prototype.scrollTo = function(_x: number, _y: number) {
      // Mock implementation
    } as any;
  });

  test('renders thumbnails for all images', () => {
    // GIVEN a set of images and a selected index
    const selectedIndex = 0;
    const onSelect = vi.fn();
    
    // WHEN the component is rendered
    render(
      <ThumbnailStrip 
        images={mockImages as Image[]} 
        selectedIndex={selectedIndex} 
        onSelect={onSelect}
      />
    );
    
    // THEN it should render a thumbnail for each image
    const thumbnails = screen.getAllByTestId('thumbnail-image');
    expect(thumbnails).toHaveLength(mockImages.length);
  });

  test('marks the selected thumbnail as selected', () => {
    // GIVEN a set of images and a selected index
    const selectedIndex = 1;
    const onSelect = vi.fn();
    
    // WHEN the component is rendered
    render(
      <ThumbnailStrip 
        images={mockImages as Image[]} 
        selectedIndex={selectedIndex} 
        onSelect={onSelect}
      />
    );
    
    // THEN it should mark the selected thumbnail as selected
    const thumbnails = screen.getAllByTestId('thumbnail-image');
    expect(thumbnails[selectedIndex]).toHaveAttribute('data-selected', 'true');
    expect(thumbnails[0]).toHaveAttribute('data-selected', 'false');
    expect(thumbnails[2]).toHaveAttribute('data-selected', 'false');
  });

  test('calls onSelect when a thumbnail is clicked', () => {
    // GIVEN a set of images and a selected index
    const selectedIndex = 0;
    const onSelect = vi.fn();
    
    // WHEN the component is rendered
    render(
      <ThumbnailStrip 
        images={mockImages as Image[]} 
        selectedIndex={selectedIndex} 
        onSelect={onSelect}
      />
    );
    
    // AND a thumbnail is clicked
    const thumbnails = screen.getAllByTestId('thumbnail-image');
    fireEvent.click(thumbnails[1]);
    
    // THEN it should call onSelect with the index of the clicked thumbnail
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  test('handles keyboard navigation with arrow keys', () => {
    // GIVEN a set of images and a selected index
    const selectedIndex = 1;
    const onSelect = vi.fn();
    
    // Mock document.getElementById to return elements for focus
    const mockElements: Record<string, HTMLElement> = {};
    vi.spyOn(document, 'getElementById').mockImplementation((id) => {
      if (!mockElements[id]) {
        mockElements[id] = document.createElement('div');
        mockElements[id].id = id;
        mockElements[id].focus = vi.fn();
      }
      return mockElements[id];
    });
    
    // WHEN the component is rendered
    const { container } = render(
      <ThumbnailStrip 
        images={mockImages as Image[]} 
        selectedIndex={selectedIndex} 
        onSelect={onSelect}
      />
    );
    
    // Get the selected thumbnail container (the div with role="tab" and aria-selected="true")
    const selectedThumbnail = container.querySelector('[aria-selected="true"]');
    expect(selectedThumbnail).not.toBeNull();
    
    // AND the right arrow key is pressed on the selected thumbnail
    fireEvent.keyDown(selectedThumbnail!, { key: 'ArrowRight' });
    
    // THEN it should call onSelect with the next index
    expect(onSelect).toHaveBeenCalledWith(2);
    
    // AND it should focus the next thumbnail
    expect(document.getElementById('thumbnail-2')!.focus).toHaveBeenCalled();
    
    // Reset the mock
    onSelect.mockReset();
    
    // WHEN the left arrow key is pressed on the selected thumbnail
    fireEvent.keyDown(selectedThumbnail!, { key: 'ArrowLeft' });
    
    // THEN it should call onSelect with the previous index
    expect(onSelect).toHaveBeenCalledWith(0);
    
    // AND it should focus the previous thumbnail
    expect(document.getElementById('thumbnail-0')!.focus).toHaveBeenCalled();
  });

  test('handles Enter key to select a thumbnail', () => {
    // GIVEN a set of images and a selected index
    const selectedIndex = 0;
    const onSelect = vi.fn();
    
    // WHEN the component is rendered
    const { container } = render(
      <ThumbnailStrip 
        images={mockImages as Image[]} 
        selectedIndex={selectedIndex} 
        onSelect={onSelect}
      />
    );
    
    // Get the first thumbnail container (the div with role="tab")
    const thumbnailContainer = container.querySelector('[role="tab"]');
    expect(thumbnailContainer).not.toBeNull();
    
    // AND the Enter key is pressed on the thumbnail
    fireEvent.keyDown(thumbnailContainer!, { key: 'Enter' });
    
    // THEN it should call onSelect with the index of the thumbnail
    expect(onSelect).toHaveBeenCalledWith(0);
  });
}); 