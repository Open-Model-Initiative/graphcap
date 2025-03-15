# Layout System

The layout system provides a consistent structure for all pages in the Graphcap Studio application. It handles proper height calculations for content areas, ensuring that components like image viewers have the correct space to render between the header and footer.

## Components

### MainLayout

The primary layout component that provides:
- A fixed header
- A dynamically sized content area
- A fixed footer
- Optional left and right sidebars

```tsx
import { MainLayout } from '@/app/layout';

function MyPage() {
  return (
    <MainLayout>
      <MyContent />
    </MainLayout>
  );
}
```

With sidebars:

```tsx
import { MainLayout } from '@/app/layout';

function MyPageWithSidebars() {
  return (
    <MainLayout
      leftSidebar={<LeftSidebar />}
      rightSidebar={<RightSidebar />}
    >
      <MyContent />
    </MainLayout>
  );
}
```

### Header

The application header component with navigation links.

### Footer

The application footer component with copyright and links.

### Sidebar

A reusable sidebar component that can be customized.

## Hooks

### useLayoutHeight

A custom hook that calculates and manages layout heights, ensuring proper space allocation between fixed elements.

```tsx
import { useLayoutHeight } from '@/app/layout';

function MyCustomLayout() {
  const { 
    containerRef, 
    headerRef, 
    contentRef, 
    footerRef, 
    contentHeight,
    isCalculating 
  } = useLayoutHeight();
  
  return (
    <div ref={containerRef}>
      <header ref={headerRef}>...</header>
      <main 
        ref={contentRef}
        style={{ height: isCalculating ? 'auto' : `${contentHeight}px` }}
      >
        ...
      </main>
      <footer ref={footerRef}>...</footer>
    </div>
  );
}
```

## CSS Modules

The layout system uses CSS modules to ensure styles are scoped and maintainable:

- `MainLayout.module.css`: Styles for the main layout component
- Additional component-specific modules as needed

## Best Practices

1. **Always use the MainLayout** for page components to ensure consistent structure
2. **Avoid fixed heights** in content components - let the layout system handle height calculations
3. **Use the useLayoutHeight hook** when creating custom layouts that need precise height calculations
4. **Keep the header and footer lightweight** to maximize content space 