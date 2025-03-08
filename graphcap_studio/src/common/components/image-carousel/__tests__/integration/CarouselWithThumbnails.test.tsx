import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, beforeAll, vi } from 'vitest';
import '@testing-library/jest-dom';
import { CarouselViewer } from '../../CarouselViewer';
import { MockImage, imageServiceMock } from '@/test/mocks/servicesMock';

// Mock declarations must come before any variable declarations
// because vi.mock calls are hoisted to the top of the file
vi.mock('@/common/components/responsive-image', () => ({
  ResponsiveImage: ({ alt, imagePath, onError }: { alt: string; imagePath: string; onError?: () => void }) => (
    <img 
      src={imagePath} 
      alt={alt} 
      data-testid="responsive-image"
      onError={onError}
    />
  ),
  ThumbnailImage: ({ alt, imagePath, isSelected, onClick }: { 
    alt: string; 
    imagePath: string; 
    isSelected: boolean; 
    onClick: () => void 
  }) => (
    <button 
      data-testid="thumbnail-image"
      data-selected={String(isSelected)}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
    >
      <img src={imagePath} alt={alt} />
    </button>
  ),
}));

const preloadImageMock = imageServiceMock.preloadImage;

// Sample test images
const mockImages: MockImage[] = [
  { path: '/images/image1.jpg', name: 'Image 1', directory: 'test', url: 'test-url' },
  { path: '/images/image2.jpg', name: 'Image 2', directory: 'test', url: 'test-url' },
  { path: '/images/image3.jpg', name: 'Image 3', directory: 'test', url: 'test-url' },
  { path: '/images/image4.jpg', name: 'Image 4', directory: 'test', url: 'test-url' },
  { path: '/images/image5.jpg', name: 'Image 5', directory: 'test', url: 'test-url' },
];

describe('CarouselViewer with ThumbnailStrip Integration', () => {
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
    
    // Mock Element.scrollTo with unused parameters renamed to _x and _y
    Element.prototype.scrollTo = function(_x: number, _y: number) {
      // Mock implementation
    } as any;
  });

  test('full navigation flow with thumbnails and buttons', () => {
    const onSelectImage = vi.fn();
    
    render(
      <CarouselViewer 
        images={mockImages} 
        selectedImage={mockImages[0]} 
        onSelectImage={onSelectImage}
      />
    );
    
    // It should display the main image and thumbnails
    expect(screen.getByTestId('responsive-image')).toBeInTheDocument();
    expect(screen.getAllByTestId('thumbnail-image').length).toBeGreaterThan(0);
    
    // Clicking a thumbnail should call onSelectImage with the corresponding image
    const thumbnails = screen.getAllByTestId('thumbnail-image');
    fireEvent.click(thumbnails[2]);
    expect(onSelectImage).toHaveBeenCalledWith(mockImages[2]);
    
    onSelectImage.mockReset();
    
    // Clicking the next button should call onSelectImage with the next image
    const nextButton = screen.getByLabelText('Next image');
    fireEvent.click(nextButton);
    expect(onSelectImage).toHaveBeenCalledWith(mockImages[1]);
    
    onSelectImage.mockReset();
    
    // Clicking the previous button should call onSelectImage with the previous image
    const prevButton = screen.getByLabelText('Previous image');
    fireEvent.click(prevButton);
    expect(onSelectImage).toHaveBeenCalledWith(mockImages[mockImages.length - 1]);
    
    onSelectImage.mockReset();
    
    // Pressing the right arrow key should call onSelectImage with the next image
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(onSelectImage).toHaveBeenCalledWith(mockImages[1]);
  });

  test('updates the displayed image when selectedImage prop changes', () => {
    const onSelectImage = vi.fn();
    
    const { rerender } = render(
      <CarouselViewer 
        images={mockImages} 
        selectedImage={mockImages[0]} 
        onSelectImage={onSelectImage}
      />
    );
    
    // It should initially display the first image
    const mainImage = screen.getByTestId('responsive-image');
    expect(mainImage).toHaveAttribute('src', mockImages[0].path);
    
    // When the selectedImage prop changes, the displayed image updates accordingly
    rerender(
      <CarouselViewer 
        images={mockImages} 
        selectedImage={mockImages[2]} 
        onSelectImage={onSelectImage}
      />
    );
    
    expect(mainImage).toHaveAttribute('src', mockImages[2].path);
    
    // And the corresponding thumbnail should be marked as selected
    const thumbnails = screen.getAllByTestId('thumbnail-image');
    expect(thumbnails[2]).toHaveAttribute('data-selected', 'true');
  });

  test('handles image loading errors and retry', () => {
    const onSelectImage = vi.fn();
    
    render(
      <CarouselViewer 
        images={mockImages} 
        selectedImage={mockImages[0]} 
        onSelectImage={onSelectImage}
      />
    );
    
    // Simulate image load error
    const mainImage = screen.getByTestId('responsive-image');
    fireEvent.error(mainImage);
    
    // It should display an error message and a retry button
    expect(screen.getByText('Failed to load image')).toBeInTheDocument();
    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();
    
    // Clicking retry should call the preloadImage function
    fireEvent.click(retryButton);
    expect(preloadImageMock).toHaveBeenCalledWith(mockImages[0].path, 'full');
  });
});
