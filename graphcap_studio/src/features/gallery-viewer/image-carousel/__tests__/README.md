# Image Carousel Component Tests

This directory contains tests for the Image Carousel component and its related parts. The tests follow the project's testing policy, which emphasizes a combination of unit and integration tests with a focus on behavior rather than implementation details.

## Test Structure

The tests are organized as follows:

- **Component Tests**
  - `CarouselViewer.test.tsx`: Tests for the main CarouselViewer component
  - `ThumbnailStrip.test.tsx`: Tests for the ThumbnailStrip component

- **Hook Tests**
  - `hooks/useCarouselNavigation.test.ts`: Tests for the useCarouselNavigation hook
  - `hooks/useCarouselControls.test.ts`: Tests for the useCarouselControls hook
  - `hooks/useDynamicThumbnails.test.ts`: Tests for the useDynamicThumbnails hook

- **Integration Tests**
  - `integration/CarouselWithThumbnails.test.tsx`: Tests for the integration between CarouselViewer and ThumbnailStrip

- **Setup**
  - `setup.ts`: Common setup and mocks for all tests

## Testing Approach

### Reducing Mocking

We've followed these principles to reduce excessive mocking:

1. **Mock Only What's Necessary**: We only mock external dependencies that would cause issues in the test environment, such as:
   - `ResizeObserver` (not available in the test environment)
   - `Element.scrollTo` (to avoid DOM manipulation errors)
   - Image components (to avoid actual image loading)

2. **Use Real Implementations Where Possible**: For internal logic and state management, we use the actual implementations rather than mocking them.

3. **Test Behavior, Not Implementation**: Tests focus on what the component does, not how it does it. This makes tests more resilient to refactoring.

4. **Integration Tests for Component Interactions**: We test how components work together in integration tests, rather than mocking one component when testing another.

### GIVEN/WHEN/THEN Pattern

All tests follow the GIVEN/WHEN/THEN pattern for clarity:

```typescript
test('example test', () => {
  // GIVEN some initial state or setup
  const initialState = ...;
  
  // WHEN an action is performed
  const result = someAction(initialState);
  
  // THEN the expected outcome should occur
  expect(result).toBe(expectedOutcome);
});
```

## Common Test Patterns

### Testing Component Rendering

```typescript
test('renders in a specific state', () => {
  // GIVEN props for the component
  const props = { ... };
  
  // WHEN the component is rendered
  render(<Component {...props} />);
  
  // THEN it should display the expected elements
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

### Testing User Interactions

```typescript
test('responds to user interaction', () => {
  // GIVEN a rendered component with a callback
  const onAction = vi.fn();
  render(<Component onAction={onAction} />);
  
  // WHEN the user interacts with an element
  fireEvent.click(screen.getByRole('button'));
  
  // THEN the callback should be called with expected arguments
  expect(onAction).toHaveBeenCalledWith(expectedArgs);
});
```

### Testing Hooks

```typescript
test('hook behavior', () => {
  // GIVEN parameters for the hook
  const params = { ... };
  
  // WHEN the hook is rendered
  const { result } = renderHook(() => useCustomHook(params));
  
  // THEN it should return the expected values
  expect(result.current.someValue).toBe(expectedValue);
  
  // WHEN an action from the hook is called
  act(() => {
    result.current.someAction();
  });
  
  // THEN the state should update as expected
  expect(result.current.someValue).toBe(newExpectedValue);
});
```

## Best Practices

1. **Co-locate Tests with Components**: Keep tests close to the components they test for better organization.

2. **Use Descriptive Test Names**: Test names should clearly describe what is being tested and the expected outcome.

3. **Test Edge Cases**: Include tests for empty states, loading states, error states, and boundary conditions.

4. **Avoid Testing Implementation Details**: Focus on testing the public API and behavior of components, not their internal implementation.

5. **Keep Tests Independent**: Each test should be independent of others and should not rely on the state from previous tests.

6. **Use Test IDs Sparingly**: Prefer testing by role, text, or other accessible attributes when possible. Use data-testid only when necessary.

7. **Test Accessibility**: Include tests for keyboard navigation, screen reader support, and other accessibility features.

## Running Tests

Tests can be run using the following commands:

```bash
# Run all tests
npm test

# Run tests for a specific file
npm test -- CarouselViewer.test.tsx

# Run tests in watch mode
npm test -- --watch
``` 