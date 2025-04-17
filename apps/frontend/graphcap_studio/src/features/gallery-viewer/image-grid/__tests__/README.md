# Image Grid Component Tests

This directory contains tests for the image grid components:

- `LazyImage.test.tsx`: Unit tests for the LazyImage component
- `GridViewer.test.tsx`: Unit tests for the GridViewer component
- `integration/GridWithLazyImage.test.tsx`: Integration tests for the GridViewer and LazyImage components working together

## Test Structure

Tests follow the GIVEN/WHEN/THEN pattern as specified in the project's test policy:

```typescript
test('descriptive test name', () => {
  // GIVEN a component with specific props or state
  render(<Component prop={value} />);
  
  // WHEN an action is performed (if applicable)
  fireEvent.click(element);
  
  // THEN the expected outcome is observed
  expect(result).toBe(expectedValue);
});
```

## Mocks

The tests use the following mocks:

- `ResizeObserver`: Mocked to avoid errors in the test environment
- `IntersectionObserver`: Mocked to simulate elements coming into view
- `react-window` components: Mocked to simplify testing of virtualized lists
- Image service functions: Mocked to avoid actual network requests

## Running Tests

To run these tests, use the following command:

```bash
npm test -- --dir=src/common/components/image-grid
```

## Test Coverage

These tests cover:

- Default rendering behavior
- Custom image component rendering
- Selection handling
- Loading and error states
- Empty state handling
- Responsive layout behavior (via mocked ResizeObserver)
- Lazy loading behavior (via mocked IntersectionObserver) 